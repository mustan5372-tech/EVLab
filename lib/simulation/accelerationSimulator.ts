import { EVConfiguration } from '@/types/ev';
import { AccelerationResults, TimeStepResult } from '@/types/simulation';
import { calculateAerodynamicDrag } from '../physics/aerodynamics';
import { calculateRollingResistance } from '../physics/rollingResistance';
import { calculateGradeResistance } from '../physics/gradeResistance';
import { calculateTotalGearRatio, vehicleSpeedMsToMotorRpm, motorTorqueToWheelTorque, wheelTorqueToTractiveForce } from '../physics/transmission';
import { getMotorOperatingLimits } from '../physics/motorModel';
import { calculateBatteryPackMetrics } from '../physics/batteryModel';
import { calculateTireTractionLimit } from '../physics/tractiveForce';
import { kmhToMs, msToKmh } from '../units/conversions';
import { STANDARD_GRAVITY } from '../physics/constants';

export function simulateAcceleration(
  config: EVConfiguration,
  targetSpeedKmh: number = 140,
  dt: number = 0.05
): AccelerationResults {
  const { vehicle, motor, battery, transmission } = config;
  const totalGearRatio = calculateTotalGearRatio(transmission);
  const pack = calculateBatteryPackMetrics(battery);

  // Rotational mass factor (accounts for inertia of wheels, rotors, and gears)
  const rotationalInertiaFactor = 1.06;
  const effectiveInertialMassKg = vehicle.massKg * rotationalInertiaFactor;

  // Maximum tire adhesion limit at launch
  const tireGripLimitN = calculateTireTractionLimit(vehicle.massKg, vehicle.drivenWheels);

  // Maximum electrical power battery pack can output to motor
  const batteryMaxMechanicalPowerKw = pack.maxPeakDischargePowerKw * 0.96 * motor.baseEfficiency;
  const effectivePeakMotorPowerKw = Math.min(motor.peakPowerKw, batteryMaxMechanicalPowerKw);

  const timeSeries: TimeStepResult[] = [];

  let t = 0;
  let v = 0; // m/s
  let x = 0; // meters
  let socPercent = battery.initialSocPercent;
  let cumulativeEnergyWh = 0;

  let timeTo40: number | null = null;
  let timeTo60: number | null = null;
  let timeTo80: number | null = null;
  let timeTo100: number | null = null;
  let timeTo120: number | null = null;
  let quarterMileTime: number | null = null;
  let quarterMileSpeedKmh: number | null = null;
  let peakAccelerationG = 0;
  let maxTractiveForceN = 0;

  const targetSpeedMs = kmhToMs(targetSpeedKmh);
  const maxSimulationTimeS = 25.0; // safety ceiling

  while (t <= maxSimulationTimeS && (v < targetSpeedMs || (x < 402.336 && t < 18.0))) {
    const vKmh = msToKmh(v);
    const rpm = vehicleSpeedMsToMotorRpm(v, vehicle.wheelRadiusM, totalGearRatio);

    // Motor operating limits
    const motorLimits = getMotorOperatingLimits(rpm, {
      ...motor,
      peakPowerKw: effectivePeakMotorPowerKw,
    });

    // Torque transmitted to wheels
    const idealWheelTorqueNm = motorTorqueToWheelTorque(
      motorLimits.availablePeakTorqueNm,
      totalGearRatio,
      transmission.drivetrainEfficiency
    );

    const propulsiveForceN = wheelTorqueToTractiveForce(idealWheelTorqueNm, vehicle.wheelRadiusM);

    // Enforce tire traction limit (traction control prevents spin beyond road adhesion)
    const effectiveTractiveForceN = Math.min(propulsiveForceN, tireGripLimitN);
    maxTractiveForceN = Math.max(maxTractiveForceN, effectiveTractiveForceN);

    // Delivered wheel and motor torque under traction limitation
    const deliveredWheelTorqueNm = effectiveTractiveForceN * vehicle.wheelRadiusM;
    const deliveredMotorTorqueNm = deliveredWheelTorqueNm / (totalGearRatio * transmission.drivetrainEfficiency);
    const deliveredMotorPowerKw = (deliveredMotorTorqueNm * ((rpm * 2 * Math.PI) / 60)) / 1000;

    // Resistive forces
    const fAero = calculateAerodynamicDrag(v, vehicle.cd, vehicle.frontalAreaM2);
    const fRolling = calculateRollingResistance(vehicle.massKg, vehicle.crr);
    const fGrade = calculateGradeResistance(vehicle.massKg, vehicle.roadGradePercent);
    const totalResistanceN = fAero + fRolling + fGrade;

    // Net accelerating force and acceleration
    const fNet = Math.max(0, effectiveTractiveForceN - totalResistanceN);
    const accelMs2 = fNet / effectiveInertialMassKg;
    const accelG = accelMs2 / STANDARD_GRAVITY;
    peakAccelerationG = Math.max(peakAccelerationG, accelG);

    // Electrical battery draw
    const motorEff = motorLimits.operatingEfficiency;
    const inverterEff = 0.97;
    const batteryDischargeEff = battery.dischargeEfficiency;
    const electricalPowerKw = deliveredMotorPowerKw > 0
      ? deliveredMotorPowerKw / (motorEff * inverterEff * batteryDischargeEff)
      : 0;

    const batteryCurrentA = (electricalPowerKw * 1000) / Math.max(1, pack.packNominalVoltageV);
    const energyStepWh = (electricalPowerKw * 1000 * dt) / 3600;
    cumulativeEnergyWh += energyStepWh;

    // Battery SOC depletion
    const socDropPercent = (energyStepWh / (pack.totalEnergyKwh * 1000)) * 100;
    socPercent = Math.max(0, socPercent - socDropPercent);

    // Record time-step (sample every 0.1s for UI chart efficiency)
    if (Math.round(t / dt) % Math.round(0.1 / dt) === 0 || v >= targetSpeedMs || t === 0) {
      timeSeries.push({
        timeS: Math.round(t * 100) / 100,
        speedKmh: Math.round(vKmh * 10) / 10,
        speedMs: Math.round(v * 100) / 100,
        distanceM: Math.round(x * 10) / 10,
        accelerationMs2: Math.round(accelMs2 * 100) / 100,
        accelerationG: Math.round(accelG * 100) / 100,
        motorRpm: Math.round(rpm),
        motorTorqueNm: Math.round(deliveredMotorTorqueNm * 10) / 10,
        motorPowerKw: Math.round(deliveredMotorPowerKw * 10) / 10,
        wheelTorqueNm: Math.round(deliveredWheelTorqueNm * 10) / 10,
        tractiveForceN: Math.round(effectiveTractiveForceN),
        aeroDragForceN: Math.round(fAero),
        rollingResistForceN: Math.round(fRolling),
        gradeResistForceN: Math.round(fGrade),
        batteryPowerKw: Math.round(electricalPowerKw * 10) / 10,
        batteryCurrentA: Math.round(batteryCurrentA * 10) / 10,
        batterySocPercent: Math.round(socPercent * 100) / 100,
        energyConsumedWh: Math.round(cumulativeEnergyWh * 10) / 10,
      });
    }

    // Split checkpoints
    if (timeTo40 === null && vKmh >= 40) timeTo40 = Math.round(t * 10) / 10;
    if (timeTo60 === null && vKmh >= 60) timeTo60 = Math.round(t * 10) / 10;
    if (timeTo80 === null && vKmh >= 80) timeTo80 = Math.round(t * 10) / 10;
    if (timeTo100 === null && vKmh >= 100) timeTo100 = Math.round(t * 10) / 10;
    if (timeTo120 === null && vKmh >= 120) timeTo120 = Math.round(t * 10) / 10;

    // Quarter-mile checkpoint (402.336m)
    if (quarterMileTime === null && x >= 402.336) {
      quarterMileTime = Math.round(t * 10) / 10;
      quarterMileSpeedKmh = Math.round(vKmh * 10) / 10;
    }

    // Advance state
    v += accelMs2 * dt;
    x += v * dt;
    t += dt;

    if (accelMs2 < 0.05 && vKmh > 30) {
      // Vehicle has reached terminal speed
      break;
    }
  }

  return {
    timeTo40Kmh: timeTo40,
    timeTo60Kmh: timeTo60,
    timeTo80Kmh: timeTo80,
    timeTo100Kmh: timeTo100,
    timeTo120Kmh: timeTo120,
    quarterMileTimeS: quarterMileTime,
    quarterMileSpeedKmh: quarterMileSpeedKmh,
    peakAccelerationG: Math.round(peakAccelerationG * 100) / 100,
    maxTractiveForceN: Math.round(maxTractiveForceN),
    timeSeries,
  };
}
