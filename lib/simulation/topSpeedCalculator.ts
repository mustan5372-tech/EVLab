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

  // Find aero-power equilibrium speed using fine interval scanning
  let topSpeedMs = 0;
  let rpmLimited = false;
  let powerLimited = false;

  const stepMs = 0.5; // scan every ~1.8 km/h
  for (let v = 1; v <= maxSpeedAtRedlineMs; v += stepMs) {
    const rpm = vehicleSpeedMsToMotorRpm(v, vehicle.wheelRadiusM, totalGearRatio);
    if (rpm > motor.maxRpm) {
      topSpeedMs = v - stepMs;
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
      topSpeedMs = v;
      powerLimited = true;
      break;
    }

    topSpeedMs = v;
  }

  if (!powerLimited && topSpeedMs >= maxSpeedAtRedlineMs - 1) {
    rpmLimited = true;
  }

  const topSpeedKmh = Math.round(msToKmh(topSpeedMs) * 10) / 10;
  const topSpeedRpm = Math.round(vehicleSpeedMsToMotorRpm(topSpeedMs, vehicle.wheelRadiusM, totalGearRatio));

  // Generate 25 points for the tractive force vs road load equilibrium chart
  const equilibriumPoints: TopSpeedEquilibriumPoint[] = [];
  const maxPlotSpeedKmh = Math.max(160, Math.min(320, Math.ceil((topSpeedKmh * 1.25) / 10) * 10));
  const numPlotPoints = 30;

  for (let i = 1; i <= numPlotPoints; i++) {
    const vKmh = (i / numPlotPoints) * maxPlotSpeedKmh;
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

    equilibriumPoints.push({
      speedKmh: Math.round(vKmh * 10) / 10,
      availableForceN: Math.round(availForceN),
      totalRoadLoadN: Math.round(fAero + fRolling + fGrade),
      aeroDragN: Math.round(fAero),
      rollingResistN: Math.round(fRolling),
      gradeResistN: Math.round(fGrade),
    });
  }

  return {
    topSpeedKmh,
    topSpeedRpm,
    rpmLimited,
    powerLimited,
    limitingFactor: rpmLimited ? 'motor_rpm' : 'power_equilibrium',
    equilibriumPoints,
  };
}
