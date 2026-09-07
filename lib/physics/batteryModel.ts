import { BatteryParameters, CalculatedBatteryPack } from '@/types/ev';

export function calculateBatteryPackMetrics(battery: BatteryParameters): CalculatedBatteryPack {
  const packNominalVoltageV = battery.cellsInSeries * battery.cellNominalVoltage;
  const packCapacityAh = battery.cellsInParallel * battery.cellCapacityAh;
  const totalEnergyKwh = (packNominalVoltageV * packCapacityAh) / 1000;
  const usableFraction = Math.max(0, (battery.usableSocMaxPercent - battery.usableSocMinPercent) / 100);
  const usableEnergyKwh = totalEnergyKwh * usableFraction;

  const maxDischargeCurrentA = packCapacityAh * battery.maxDischargeC;
  const maxChargeCurrentA = packCapacityAh * battery.maxChargeC;

  // Electrical power available: P = V * I / 1000
  const maxPeakDischargePowerKw = (packNominalVoltageV * maxDischargeCurrentA) / 1000;
  // Continuous power rated around 1C to 1.5C thermal limit
  const continuousC = Math.min(1.5, battery.maxDischargeC * 0.4);
  const maxContinuousDischargePowerKw = (packNominalVoltageV * packCapacityAh * continuousC) / 1000;

  return {
    packNominalVoltageV: Math.round(packNominalVoltageV * 10) / 10,
    packCapacityAh: Math.round(packCapacityAh * 10) / 10,
    totalEnergyKwh: Math.round(totalEnergyKwh * 100) / 100,
    usableEnergyKwh: Math.round(usableEnergyKwh * 100) / 100,
    totalCellCount: battery.cellsInSeries * battery.cellsInParallel,
    maxDischargeCurrentA: Math.round(maxDischargeCurrentA * 10) / 10,
    maxChargeCurrentA: Math.round(maxChargeCurrentA * 10) / 10,
    maxPeakDischargePowerKw: Math.round(maxPeakDischargePowerKw * 10) / 10,
    maxContinuousDischargePowerKw: Math.round(maxContinuousDischargePowerKw * 10) / 10,
  };
}

/**
 * Calculates battery power drawn from pack given motor mechanical power demand
 * P_batt = P_motor / (eta_motor * eta_inverter * eta_battery_discharge)
 */
export function calculateBatteryPowerDrawKw(
  mechanicalPowerKw: number,
  motorEfficiency: number,
  dischargeEfficiency: number,
  inverterEfficiency: number = 0.97
): number {
  if (mechanicalPowerKw <= 0) return 0;
  const combinedEta = motorEfficiency * inverterEfficiency * dischargeEfficiency;
  return combinedEta > 0 ? mechanicalPowerKw / combinedEta : mechanicalPowerKw;
}

/**
 * Calculates battery power absorbed during regenerative braking
 * P_batt_regen = P_mechanical * eta_motor * eta_inverter * eta_battery_charge
 */
export function calculateBatteryRegenPowerKw(
  mechanicalRegenPowerKw: number,
  motorEfficiency: number,
  chargingEfficiency: number,
  maxPackChargePowerKw: number,
  inverterEfficiency: number = 0.97
): number {
  if (mechanicalRegenPowerKw <= 0) return 0;
  const combinedEta = motorEfficiency * inverterEfficiency * chargingEfficiency;
  const rawRegenKw = mechanicalRegenPowerKw * combinedEta;
  return Math.min(rawRegenKw, maxPackChargePowerKw);
}
