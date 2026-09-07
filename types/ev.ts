export type MotorType = 'pmsm' | 'bldc' | 'induction' | 'srm' | 'axial-flux';
export type DrivetrainLayout = 'fwd' | 'rwd' | 'awd';
export type DrivenWheels = DrivetrainLayout;
export type RegenMode = 'off' | 'low' | 'medium' | 'high';

export interface VehicleParameters {
  massKg: number;              // Total curb + payload mass (kg)
  frontalAreaM2: number;       // Frontal cross-sectional area (m²)
  cd: number;                  // Aerodynamic drag coefficient
  crr: number;                 // Rolling resistance coefficient
  wheelRadiusM: number;        // Dynamic rolling radius of tire (m)
  drivenWheels: DrivetrainLayout; // FWD, RWD, or AWD
  ambientTempC: number;        // Ambient air temperature (°C)
  roadGradePercent: number;    // Road incline grade (%)
}

export interface MotorParameters {
  type: MotorType;             // PMSM, BLDC, Induction, SRM, Axial Flux
  peakPowerKw: number;         // Maximum transient motor power (kW)
  continuousPowerKw: number;   // Continuous thermal rated power (kW)
  peakTorqueNm: number;        // Maximum torque output (Nm)
  continuousTorqueNm: number;  // Continuous torque output (Nm)
  maxRpm: number;              // Redline speed limit (RPM)
  baseEfficiency: number;      // Peak efficiency ratio (0.80 - 0.98)
}

export interface BatteryParameters {
  cellNominalVoltage: number;  // Single cell nominal voltage (V), e.g. 3.7V for NMC/LCO, 3.2V for LFP
  cellsInSeries: number;       // Series count (S) -> dictates pack voltage
  cellsInParallel: number;     // Parallel strings (P) -> dictates pack Ah capacity
  cellCapacityAh: number;      // Capacity of individual cell (Ah)
  usableSocMinPercent: number; // Minimum depth of discharge limit (%)
  usableSocMaxPercent: number; // Maximum charge cutoff limit (%)
  maxDischargeC: number;       // Maximum discharge C-rate (e.g. 3C or 5C peak)
  maxChargeC: number;          // Maximum regenerative charge C-rate (e.g. 1.5C)
  internalResistanceMohm: number; // Estimated pack internal resistance (mΩ)
  chargingEfficiency: number;  // Efficiency ratio during regen charging (0.85 - 0.98)
  dischargeEfficiency: number; // Efficiency ratio during discharge (0.90 - 0.98)
  initialSocPercent: number;   // Starting State of Charge (%)
}

export interface CalculatedBatteryPack {
  packNominalVoltageV: number;
  packCapacityAh: number;
  totalEnergyKwh: number;
  usableEnergyKwh: number;
  totalCellCount: number;
  maxDischargeCurrentA: number;
  maxChargeCurrentA: number;
  maxPeakDischargePowerKw: number;
  maxContinuousDischargePowerKw: number;
}

export interface TransmissionParameters {
  gearRatio: number;           // Single reduction gear ratio (e.g. 8.5 : 1)
  differentialRatio: number;   // Differential final drive ratio (e.g. 1.0 or separate)
  drivetrainEfficiency: number;// Mechanical transmission efficiency (0.90 - 0.98)
}

export interface EVConfiguration {
  id: string;
  name: string;
  description: string;
  vehicle: VehicleParameters;
  motor: MotorParameters;
  battery: BatteryParameters;
  transmission: TransmissionParameters;
  regenMode: RegenMode;
  createdAt: string;
  updatedAt: string;
}
