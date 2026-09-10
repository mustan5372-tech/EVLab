import { EVConfiguration } from '@/types/ev';
import { TopSpeedResult, TopSpeedEquilibriumPoint } from '@/types/simulation';
import { calculateAerodynamicDrag } from '../physics/aerodynamics';
import { calculateRollingResistance } from '../physics/rollingResistance';
import { calculateGradeResistance } from '../physics/gradeResistance';
import { calculateTotalGearRatio, motorRpmToVehicleSpeedMs, vehicleSpeedMsToMotorRpm, motorTorqueToWheelTorque, wheelTorqueToTractiveForce } from '../physics/transmission';
import { getMotorOperatingLimits } from '../physics/motorModel';
import { calculateBatteryPackMetrics } from '../physics/batteryModel';
import { kmhToMs, msToKmh } from '../units/conversions';

export function calculateTopSpeed(config: EVConfiguration): TopSpeedResult {
  const { vehicle, motor, battery, transmission } = config;
  const totalGearRatio = calculateTotalGearRatio(transmission);
  const pack = calculateBatteryPackMetrics(battery);

  // Gearing limit: absolute maximum speed imposed by motor redline RPM
  const maxSpeedAtRedlineMs = motorRpmToVehicleSpeedMs(motor.maxRpm, vehicle.wheelRadiusM, totalGearRatio);
  const maxSpeedAtRedlineKmh = msToKmh(maxSpeedAtRedlineMs);

  // Battery peak mechanical power ceiling
  const batteryPeakMechPowerKw = pack.maxPeakDischargePowerKw * 0.96 * motor.baseEfficiency;
  const effectiveMotorPeakKw = Math.min(motor.peakPowerKw, batteryPeakMechPowerKw);

  // High precision aero-power equilibrium speed finder
  let topSpeedMs = 0;
  let rpmLimited = false;
  let powerLimited = false;

  const coarseStepMs = 0.5;
  let lowerBoundMs = 1;
  let upperBoundMs = maxSpeedAtRedlineMs;

  for (let v = 1; v <= maxSpeedAtRedlineMs; v += coarseStepMs) {
    const rpm = vehicleSpeedMsToMotorRpm(v, vehicle.wheelRadiusM, totalGearRatio);
    if (rpm > motor.maxRpm) {
      topSpeedMs = v - coarseStepMs;
      rpmLimited = true;
      break;
    }

    const motorLimits = getMotorOperatingLimits(rpm, { ...motor, peakPowerKw: effectiveMotorPeakKw });
    const wheelTorque = motorTorqueToWheelTorque(motorLimits.availablePeakTorqueNm, totalGearRatio, transmission.drivetrainEfficiency);
    const availableForceN = wheelTorqueToTractiveForce(wheelTorque, vehicle.wheelRadiusM);

    const fAero = calculateAerodynamicDrag(v, vehicle.cd, vehicle.frontalAreaM2);
    const fRolling = calculateRollingResistance(vehicle.massKg, vehicle.crr);
    const fGrade = calculateGradeResistance(vehicle.massKg, vehicle.roadGradePercent);
    const totalRoadLoadN = fAero + fRolling + fGrade;

    if (availableForceN <= totalRoadLoadN) {
      lowerBoundMs = Math.max(1, v - coarseStepMs);
      upperBoundMs = v;
      powerLimited = true;
      break;
    }

    topSpeedMs = v;
  }

  // If power-limited, execute binary search bisection for sub-0.01 km/h exact equilibrium
  if (powerLimited) {
    let low = lowerBoundMs;
    let high = upperBoundMs;
    for (let iter = 0; iter < 24; iter++) {
      const mid = (low + high) / 2;
      const rpm = vehicleSpeedMsToMotorRpm(mid, vehicle.wheelRadiusM, totalGearRatio);
      const motorLimits = getMotorOperatingLimits(rpm, { ...motor, peakPowerKw: effectiveMotorPeakKw });
      const wheelTorque = motorTorqueToWheelTorque(motorLimits.availablePeakTorqueNm, totalGearRatio, transmission.drivetrainEfficiency);
      const availForce = wheelTorqueToTractiveForce(wheelTorque, vehicle.wheelRadiusM);

      const fAero = calculateAerodynamicDrag(mid, vehicle.cd, vehicle.frontalAreaM2);
      const fRolling = calculateRollingResistance(vehicle.massKg, vehicle.crr);
      const fGrade = calculateGradeResistance(vehicle.massKg, vehicle.roadGradePercent);
      const totalLoad = fAero + fRolling + fGrade;

      if (availForce < totalLoad) {
        high = mid;
      } else {
        low = mid;
      }
    }
    topSpeedMs = (low + high) / 2;
  }

  if (!powerLimited && topSpeedMs >= maxSpeedAtRedlineMs - 0.5) {
    rpmLimited = true;
    topSpeedMs = maxSpeedAtRedlineMs;
  }

  const topSpeedKmh = Math.round(msToKmh(topSpeedMs) * 10) / 10;
  const topSpeedRpm = Math.round(vehicleSpeedMsToMotorRpm(topSpeedMs, vehicle.wheelRadiusM, totalGearRatio));

  // Generate high-resolution points for tractive force vs road load equilibrium chart
  const equilibriumPointsMap = new Map<number, TopSpeedEquilibriumPoint>();
  const maxPlotSpeedKmh = Math.max(160, Math.min(350, Math.ceil((topSpeedKmh * 1.25) / 10) * 10));
  const numPlotPoints = 50;

  const computePoint = (vKmh: number): TopSpeedEquilibriumPoint => {
    const vMs = kmhToMs(vKmh);
    const rpm = vehicleSpeedMsToMotorRpm(vMs, vehicle.wheelRadiusM, totalGearRatio);

    let availForceN = 0;
    if (rpm <= motor.maxRpm) {
      const motorLimits = getMotorOperatingLimits(rpm, { ...motor, peakPowerKw: effectiveMotorPeakKw });
      const wheelTorque = motorTorqueToWheelTorque(motorLimits.availablePeakTorqueNm, totalGearRatio, transmission.drivetrainEfficiency);
      availForceN = wheelTorqueToTractiveForce(wheelTorque, vehicle.wheelRadiusM);
    }

    const fAero = calculateAerodynamicDrag(vMs, vehicle.cd, vehicle.frontalAreaM2);
    const fRolling = calculateRollingResistance(vehicle.massKg, vehicle.crr);
    const fGrade = calculateGradeResistance(vehicle.massKg, vehicle.roadGradePercent);

    return {
      speedKmh: Math.round(vKmh * 10) / 10,
      availableForceN: Math.round(availForceN),
      totalRoadLoadN: Math.round(fAero + fRolling + fGrade),
      aeroDragN: Math.round(fAero),
      rollingResistN: Math.round(fRolling),
      gradeResistN: Math.round(fGrade),
    };
  };

  for (let i = 1; i <= numPlotPoints; i++) {
    const vKmh = Math.round(((i / numPlotPoints) * maxPlotSpeedKmh) * 10) / 10;
    equilibriumPointsMap.set(vKmh, computePoint(vKmh));
  }

  // Ensure EXACT equilibrium top speed point is present for precise intersection visualization
  equilibriumPointsMap.set(topSpeedKmh, computePoint(topSpeedKmh));

  const equilibriumPoints = Array.from(equilibriumPointsMap.values()).sort(
    (a, b) => a.speedKmh - b.speedKmh
  );

  return {
    topSpeedKmh,
    topSpeedRpm,
    rpmLimited,
    powerLimited,
    limitingFactor: rpmLimited ? 'motor_rpm' : 'power_equilibrium',
    equilibriumPoints,
  };
}
