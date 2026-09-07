import { EVConfiguration } from '@/types/ev';
import { RangeResult } from '@/types/simulation';
import { calculateAerodynamicDrag } from '../physics/aerodynamics';
import { calculateRollingResistance } from '../physics/rollingResistance';
import { calculateTotalGearRatio, vehicleSpeedMsToMotorRpm } from '../physics/transmission';
import { getMotorOperatingLimits } from '../physics/motorModel';
import { calculateBatteryPackMetrics } from '../physics/batteryModel';
import { kmhToMs } from '../units/conversions';

export interface RangeCalculationExplanation {
  formula: string;
  substitutedValues: string;
  whPerKm: number;
  usableKwh: number;
  rangeKm: number;
  explanation: string;
}

export function calculateRange(config: EVConfiguration): RangeResult {
  const { vehicle, motor, battery, transmission } = config;
  const totalGearRatio = calculateTotalGearRatio(transmission);
  const pack = calculateBatteryPackMetrics(battery);
  const usableKwh = pack.usableEnergyKwh;

  // Auxiliary electrical base load (HVAC, power steering, ECUs, coolant pumps)
  const auxBaseLoadW = 750;

  const calculateSteadyConsumption = (vKmh: number): number => {
    const vMs = kmhToMs(vKmh);
    const rpm = vehicleSpeedMsToMotorRpm(vMs, vehicle.wheelRadiusM, totalGearRatio);
    const motorLimits = getMotorOperatingLimits(rpm, motor);

    const fAero = calculateAerodynamicDrag(vMs, vehicle.cd, vehicle.frontalAreaM2);
    const fRolling = calculateRollingResistance(vehicle.massKg, vehicle.crr);
    const fTotal = fAero + fRolling;

    const mechanicalPowerW = fTotal * vMs;
    const combinedDrivetrainEff =
      transmission.drivetrainEfficiency *
      motorLimits.operatingEfficiency *
      0.97 * // Inverter efficiency
      battery.dischargeEfficiency;

    const electricalTractionPowerW = combinedDrivetrainEff > 0 ? mechanicalPowerW / combinedDrivetrainEff : mechanicalPowerW;
    const totalElectricalPowerW = electricalTractionPowerW + auxBaseLoadW;

    // Wh/km = Power (W) / Speed (km/h)
    return totalElectricalPowerW / vKmh;
  };

  const whKm60 = calculateSteadyConsumption(60);
  const whKm90 = calculateSteadyConsumption(90);
  const whKm120 = calculateSteadyConsumption(120);

  const range60 = (usableKwh * 1000) / whKm60;
  const range90 = (usableKwh * 1000) / whKm90;
  const range120 = (usableKwh * 1000) / whKm120;

  return {
    steadyState60Kmh: Math.round(range60 * 10) / 10,
    steadyState90Kmh: Math.round(range90 * 10) / 10,
    steadyState120Kmh: Math.round(range120 * 10) / 10,
    consumptionWhPerKmAt90: Math.round(whKm90 * 10) / 10,
    usableBatteryKwh: usableKwh,
  };
}

export function explainRangeCalculation(
  config: EVConfiguration,
  speedKmh: number = 90
): RangeCalculationExplanation {
  const { vehicle, motor, battery, transmission } = config;
  const totalGearRatio = calculateTotalGearRatio(transmission);
  const pack = calculateBatteryPackMetrics(battery);
  const usableKwh = pack.usableEnergyKwh;

  const vMs = kmhToMs(speedKmh);
  const rpm = vehicleSpeedMsToMotorRpm(vMs, vehicle.wheelRadiusM, totalGearRatio);
  const motorLimits = getMotorOperatingLimits(rpm, motor);

  const fAero = calculateAerodynamicDrag(vMs, vehicle.cd, vehicle.frontalAreaM2);
  const fRolling = calculateRollingResistance(vehicle.massKg, vehicle.crr);
  const fTotal = fAero + fRolling;

  const mechanicalPowerW = fTotal * vMs;
  const combinedEta = transmission.drivetrainEfficiency * motorLimits.operatingEfficiency * 0.97 * battery.dischargeEfficiency;
  const totalPowerW = mechanicalPowerW / combinedEta + 750;
  const whPerKm = totalPowerW / speedKmh;
  const rangeKm = (usableKwh * 1000) / whPerKm;

  return {
    formula: "\\text{Range} = \\frac{E_{\\text{usable}} \\times 1000}{\\text{Wh/km}}, \\quad \\text{where } \\text{Wh/km} = \\frac{P_{\\text{traction}} + P_{\\text{aux}}}{v_{\\text{km/h}}}",
    substitutedValues: `(${usableKwh.toFixed(1)} kWh × 1000) ÷ (${totalPowerW.toFixed(0)} W / ${speedKmh} km/h) = ${whPerKm.toFixed(1)} Wh/km`,
    whPerKm: Math.round(whPerKm * 10) / 10,
    usableKwh,
    rangeKm: Math.round(rangeKm * 10) / 10,
    explanation:
      "Vehicle range is governed by usable battery capacity divided by specific energy consumption. At highway speeds (90+ km/h), aerodynamic drag is the single largest energy sink, causing range to drop noticeably compared to moderate urban cruising.",
  };
}
