export interface TimeStepResult {
  timeS: number;               // Elapsed time (s)
  speedKmh: number;            // Speed (km/h)
  speedMs: number;             // Speed (m/s)
  distanceM: number;           // Cumulative distance traveled (m)
  accelerationMs2: number;     // Instantaneous acceleration (m/s²)
  accelerationG: number;       // Acceleration in g's
  motorRpm: number;            // Motor rotational speed (RPM)
  motorTorqueNm: number;       // Motor torque delivered (Nm)
  motorPowerKw: number;        // Motor mechanical power (kW)
  wheelTorqueNm: number;       // Wheel torque delivered (Nm)
  tractiveForceN: number;      // Net tractive force applied at contact patch (N)
  aeroDragForceN: number;      // Aerodynamic resistance (N)
  rollingResistForceN: number; // Rolling resistance (N)
  gradeResistForceN: number;   // Grade incline resistance (N)
  batteryPowerKw: number;      // Electrical power drawn/fed into pack (kW)
  batteryCurrentA: number;     // Battery pack current (A)
  batterySocPercent: number;   // Remaining pack SOC (%)
  energyConsumedWh: number;    // Cumulative electrical energy consumed (Wh)
}

export interface AccelerationResults {
  timeTo40Kmh: number | null;
  timeTo60Kmh: number | null;
  timeTo80Kmh: number | null;
  timeTo100Kmh: number | null;
  timeTo120Kmh: number | null;
  quarterMileTimeS: number | null;
  quarterMileSpeedKmh: number | null;
  peakAccelerationG: number;
  maxTractiveForceN: number;
  timeSeries: TimeStepResult[];
}

export type AccelerationSimulationResult = AccelerationResults;

export interface TopSpeedEquilibriumPoint {
  speedKmh: number;
  availableForceN: number;
  totalRoadLoadN: number;
  aeroDragN: number;
  rollingResistN: number;
  gradeResistN: number;
}

export interface TopSpeedResult {
  topSpeedKmh: number;
  topSpeedRpm: number;
  rpmLimited: boolean;
  powerLimited: boolean;
  limitingFactor: 'motor_rpm' | 'power_equilibrium';
  equilibriumPoints: TopSpeedEquilibriumPoint[];
}

export interface GradeabilityItem {
  gradePercent: number;
  maxSpeedKmh: number;
  requiredTorqueNm: number;
  requiredPowerKw: number;
  feasible: boolean;
}

export interface GradeabilityResult {
  grades: GradeabilityItem[];
  maxGradeAt20Kmh: number;
  maxGradeAt50Kmh: number;
}

export interface RangeResult {
  steadyState60Kmh: number;     // km at steady 60 km/h
  steadyState90Kmh: number;     // km at steady 90 km/h
  steadyState120Kmh: number;    // km at steady 120 km/h
  consumptionWhPerKmAt90: number; // Wh/km at 90 km/h
  usableBatteryKwh: number;
}

export interface SimulationOverview {
  acceleration: AccelerationResults;
  topSpeed: TopSpeedResult;
  gradeability: GradeabilityResult;
  range: RangeResult;
  computedAt: string;
}
