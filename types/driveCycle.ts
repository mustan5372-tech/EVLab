export interface DriveCyclePoint {
  timeS: number;
  speedKmh: number;
  gradePercent?: number;
}

export type DriveCycleCategory = 'wltp' | 'nedc' | 'urban' | 'highway' | 'constant' | 'custom';

export interface DriveCycleDefinition {
  id: string;
  name: string;
  description: string;
  category: DriveCycleCategory;
  durationS: number;
  distanceKm: number;
  maxSpeedKmh: number;
  avgSpeedKmh: number;
  points: DriveCyclePoint[];
}

export interface DriveCycleTimeStep {
  timeS: number;
  targetSpeedKmh: number;
  actualSpeedKmh: number;
  accelerationMs2: number;
  motorRpm: number;
  motorTorqueNm: number;
  motorPowerKw: number;
  batteryPowerKw: number;
  batterySocPercent: number;
  cumulativeEnergyWh: number;
  energyRecoveredWh: number;
  regenActive: boolean;
}

export interface DriveCycleSimulationSummary {
  cycleId: string;
  cycleName: string;
  totalDistanceKm: number;
  durationS: number;
  grossEnergyConsumedKwh: number;
  energyRegeneratedKwh: number;
  netEnergyConsumedKwh: number;
  averageConsumptionWhPerKm: number;
  estimatedFullCycleRangeKm: number;
  initialSocPercent: number;
  finalSocPercent: number;
  regenEnergyPercentage: number;
  timeSeries: DriveCycleTimeStep[];
}
