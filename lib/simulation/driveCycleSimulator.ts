import { EVConfiguration, RegenMode } from '@/types/ev';
import { DriveCycleDefinition, DriveCycleSimulationSummary, DriveCycleTimeStep } from '@/types/driveCycle';
import { calculateAerodynamicDrag } from '../physics/aerodynamics';
import { calculateRollingResistance } from '../physics/rollingResistance';
import { calculateGradeResistance } from '../physics/gradeResistance';
import { calculateTotalGearRatio, vehicleSpeedMsToMotorRpm, motorTorqueToWheelTorque, wheelTorqueToTractiveForce } from '../physics/transmission';
import { getMotorOperatingLimits } from '../physics/motorModel';
import { calculateBatteryPackMetrics } from '../physics/batteryModel';
import { kmhToMs } from '../units/conversions';
import { STANDARD_GRAVITY } from '../physics/constants';

function getRegenMaxDecelG(mode: RegenMode): number {
  switch (mode) {
    case 'off':
      return 0;
    case 'low':
      return 0.06;
    case 'medium':
      return 0.14;
    case 'high':
      return 0.24;
  }
}

function getRegenTorqueFraction(mode: RegenMode): number {
  switch (mode) {
    case 'off':
      return 0;
    case 'low':
      return 0.30;
    case 'medium':
      return 0.60;
    case 'high':
      return 0.85;
  }
}

export function simulateDriveCycle(
  config: EVConfiguration,
  cycle: DriveCycleDefinition
): DriveCycleSimulationSummary {
  const { vehicle, motor, battery, transmission, regenMode } = config;
  const totalGearRatio = calculateTotalGearRatio(transmission);
  const pack = calculateBatteryPackMetrics(battery);

  const effectiveInertialMassKg = vehicle.massKg * 1.05;
  const maxPackChargePowerKw = (pack.packNominalVoltageV * pack.maxChargeCurrentA) / 1000;
  const maxRegenDecelMs2 = getRegenMaxDecelG(regenMode) * STANDARD_GRAVITY;
  const maxRegenTorqueNm = motor.peakTorqueNm * getRegenTorqueFraction(regenMode);

  const timeSeries: DriveCycleTimeStep[] = [];

  let currentSpeedMs = kmhToMs(cycle.points[0]?.speedKmh || 0);
  let socPercent = battery.initialSocPercent;
  let grossEnergyConsumedWh = 0;
  let energyRegeneratedWh = 0;
  let cumulativeDistanceM = 0;

  // Auxiliary base electrical load (cabin climate, electronics, steering, cooling)
  const auxLoadKw = 0.55;

  for (let i = 0; i < cycle.points.length - 1; i++) {
    const pCurrent = cycle.points[i];
    const pNext = cycle.points[i + 1];
    const dt = Math.max(0.1, pNext.timeS - pCurrent.timeS);

    const targetSpeedMs = kmhToMs(pNext.speedKmh);
    const targetAccelMs2 = (targetSpeedMs - currentSpeedMs) / dt;

    // Incline grade for this step
    const grade = pCurrent.gradePercent || vehicle.roadGradePercent || 0;

    // Environmental resistance at current speed
    const fAero = calculateAerodynamicDrag(currentSpeedMs, vehicle.cd, vehicle.frontalAreaM2);
    const fRolling = calculateRollingResistance(vehicle.massKg, vehicle.crr);
    const fGrade = calculateGradeResistance(vehicle.massKg, grade);
    const fResistance = fAero + fRolling + fGrade;

    let deliveredMotorPowerKw = 0;
    let deliveredMotorTorqueNm = 0;
    let batteryPowerKw = 0;
    let regenActive = false;

    const rpm = vehicleSpeedMsToMotorRpm(currentSpeedMs, vehicle.wheelRadiusM, totalGearRatio);

    if (targetAccelMs2 >= 0) {
      // 1. Propulsion Phase
      const fInertial = effectiveInertialMassKg * targetAccelMs2;
      const fTractiveReq = fResistance + fInertial;

      if (fTractiveReq > 0 && currentSpeedMs > 0.1) {
        const wheelTorqueReqNm = fTractiveReq * vehicle.wheelRadiusM;
        const motorTorqueReqNm = wheelTorqueReqNm / (totalGearRatio * transmission.drivetrainEfficiency);

        const motorLimits = getMotorOperatingLimits(rpm, motor, motorTorqueReqNm);
        deliveredMotorTorqueNm = Math.min(motorTorqueReqNm, motorLimits.availablePeakTorqueNm);

        deliveredMotorPowerKw = (deliveredMotorTorqueNm * ((rpm * 2 * Math.PI) / 60)) / 1000;
        const motorEff = motorLimits.operatingEfficiency;
        const inverterEff = 0.97;
        const batteryDischargeEff = battery.dischargeEfficiency;

        const electricalTractionKw = deliveredMotorPowerKw / (motorEff * inverterEff * batteryDischargeEff);
        batteryPowerKw = electricalTractionKw + auxLoadKw;

        const stepEnergyWh = (batteryPowerKw * 1000 * dt) / 3600;
        grossEnergyConsumedWh += stepEnergyWh;
      } else {
        // Idling or coasting
        batteryPowerKw = auxLoadKw;
        grossEnergyConsumedWh += (batteryPowerKw * 1000 * dt) / 3600;
      }
    } else {
      // 2. Deceleration / Braking Phase (Regenerative braking opportunity)
      const decelMagnitude = Math.abs(targetAccelMs2);

      if (regenMode !== 'off' && currentSpeedMs > 1.5 && decelMagnitude > 0.05) {
        // Regenerative portion of deceleration
        const regenDecelMs2 = Math.min(decelMagnitude, maxRegenDecelMs2);
        const fRegenBrakingN = effectiveInertialMassKg * regenDecelMs2;

        const wheelRegenTorqueNm = fRegenBrakingN * vehicle.wheelRadiusM;
        const motorRegenTorqueNm = Math.min(
          maxRegenTorqueNm,
          (wheelRegenTorqueNm * transmission.drivetrainEfficiency) / totalGearRatio
        );

        const mechRegenPowerKw = (motorRegenTorqueNm * ((rpm * 2 * Math.PI) / 60)) / 1000;

        const motorEff = 0.92;
        const inverterEff = 0.97;
        const battChargeEff = battery.chargingEfficiency;

        const rawRegenElecKw = mechRegenPowerKw * motorEff * inverterEff * battChargeEff;
        const actualRegenElecKw = Math.min(rawRegenElecKw, maxPackChargePowerKw);

        batteryPowerKw = -actualRegenElecKw + auxLoadKw;
        deliveredMotorTorqueNm = -motorRegenTorqueNm;
        deliveredMotorPowerKw = -mechRegenPowerKw;

        if (actualRegenElecKw > auxLoadKw) {
          regenActive = true;
          const recoveredWh = ((actualRegenElecKw - auxLoadKw) * 1000 * dt) / 3600;
          energyRegeneratedWh += recoveredWh;
        } else {
          grossEnergyConsumedWh += (batteryPowerKw * 1000 * dt) / 3600;
        }
      } else {
        // Pure friction braking / below regen cutoff speed
        batteryPowerKw = auxLoadKw;
        grossEnergyConsumedWh += (batteryPowerKw * 1000 * dt) / 3600;
      }
    }

    // Update battery SOC
    const netStepEnergyWh = (batteryPowerKw * 1000 * dt) / 3600;
    const socDeltaPercent = (netStepEnergyWh / (pack.totalEnergyKwh * 1000)) * 100;
    socPercent = Math.max(0, Math.min(100, socPercent - socDeltaPercent));

    // Distance step
    const avgStepSpeedMs = (currentSpeedMs + targetSpeedMs) / 2;
    cumulativeDistanceM += avgStepSpeedMs * dt;
    currentSpeedMs = targetSpeedMs;

    // Record time series for plotting (sample down if dense to keep UI ultra responsive)
    if (i % 2 === 0 || i === cycle.points.length - 2) {
      timeSeries.push({
        timeS: pCurrent.timeS,
        targetSpeedKmh: pCurrent.speedKmh,
        actualSpeedKmh: Math.round(currentSpeedMs * 3.6 * 10) / 10,
        accelerationMs2: Math.round(targetAccelMs2 * 100) / 100,
        motorRpm: Math.round(rpm),
        motorTorqueNm: Math.round(deliveredMotorTorqueNm * 10) / 10,
        motorPowerKw: Math.round(deliveredMotorPowerKw * 10) / 10,
        batteryPowerKw: Math.round(batteryPowerKw * 10) / 10,
        batterySocPercent: Math.round(socPercent * 100) / 100,
        cumulativeEnergyWh: Math.round((grossEnergyConsumedWh - energyRegeneratedWh) * 10) / 10,
        energyRecoveredWh: Math.round(energyRegeneratedWh * 10) / 10,
        regenActive,
      });
    }
  }

  const totalDistanceKm = Math.round((cumulativeDistanceM / 1000) * 100) / 100;
  const netEnergyWh = Math.max(0, grossEnergyConsumedWh - energyRegeneratedWh);
  const netEnergyKwh = Math.round((netEnergyWh / 1000) * 100) / 100;
  const grossEnergyKwh = Math.round((grossEnergyConsumedWh / 1000) * 100) / 100;
  const regenEnergyKwh = Math.round((energyRegeneratedWh / 1000) * 100) / 100;

  const averageConsumptionWhPerKm = totalDistanceKm > 0
    ? Math.round((netEnergyWh / totalDistanceKm) * 10) / 10
    : 0;

  const estimatedFullCycleRangeKm = averageConsumptionWhPerKm > 0
    ? Math.round(((pack.usableEnergyKwh * 1000) / averageConsumptionWhPerKm) * 10) / 10
    : 0;

  const regenEnergyPercentage = grossEnergyConsumedWh > 0
    ? Math.round((energyRegeneratedWh / grossEnergyConsumedWh) * 1000) / 10
    : 0;

  return {
    cycleId: cycle.id,
    cycleName: cycle.name,
    totalDistanceKm,
    durationS: cycle.durationS,
    grossEnergyConsumedKwh: grossEnergyKwh,
    energyRegeneratedKwh: regenEnergyKwh,
    netEnergyConsumedKwh: netEnergyKwh,
    averageConsumptionWhPerKm,
    estimatedFullCycleRangeKm,
    initialSocPercent: battery.initialSocPercent,
    finalSocPercent: Math.round(socPercent * 100) / 100,
    regenEnergyPercentage,
    timeSeries,
  };
}
