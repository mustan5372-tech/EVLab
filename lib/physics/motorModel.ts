import { MotorParameters } from '@/types/ev';

export interface MotorOperatingPoint {
  rpm: number;
  availablePeakTorqueNm: number;
  availablePeakPowerKw: number;
  availableContinuousTorqueNm: number;
  availableContinuousPowerKw: number;
  operatingEfficiency: number;
  isFieldWeakening: boolean;
  isRedlineExceeded: boolean;
}

export interface MotorCurvePoint {
  rpm: number;
  speedKmh?: number;
  peakTorqueNm: number;
  peakPowerKw: number;
  continuousTorqueNm: number;
  continuousPowerKw: number;
  efficiencyPercent: number;
}

/**
 * Calculates base (corner) speed in RPM where constant torque transitions to constant power
 * omega_base = (PeakPower * 1000) / PeakTorque
 * Rpm_base = omega_base * 60 / (2 * pi)
 */
export function calculateMotorBaseRpm(peakPowerKw: number, peakTorqueNm: number): number {
  if (peakTorqueNm <= 0 || peakPowerKw <= 0) return 0;
  const omegaBaseRadS = (peakPowerKw * 1000) / peakTorqueNm;
  return (omegaBaseRadS * 60) / (2 * Math.PI);
}

/**
 * Calculates continuous base speed in RPM
 */
export function calculateContinuousBaseRpm(contPowerKw: number, contTorqueNm: number): number {
  if (contTorqueNm <= 0 || contPowerKw <= 0) return 0;
  const omegaBaseRadS = (contPowerKw * 1000) / contTorqueNm;
  return (omegaBaseRadS * 60) / (2 * Math.PI);
}

/**
 * Evaluates the motor's operating capability at an instantaneous RPM
 */
export function getMotorOperatingLimits(
  rpm: number,
  motor: MotorParameters,
  actualDemandedTorqueNm?: number
): MotorOperatingPoint {
  const currentRpm = Math.max(0, rpm);
  const baseRpm = calculateMotorBaseRpm(motor.peakPowerKw, motor.peakTorqueNm);
  const contBaseRpm = calculateContinuousBaseRpm(motor.continuousPowerKw, motor.continuousTorqueNm);

  if (currentRpm > motor.maxRpm) {
    return {
      rpm: currentRpm,
      availablePeakTorqueNm: 0,
      availablePeakPowerKw: 0,
      availableContinuousTorqueNm: 0,
      availableContinuousPowerKw: 0,
      operatingEfficiency: 0,
      isFieldWeakening: false,
      isRedlineExceeded: true,
    };
  }

  const omegaRadS = (currentRpm * 2 * Math.PI) / 60;

  // 1. Peak torque & power
  let availablePeakTorqueNm = motor.peakTorqueNm;
  let availablePeakPowerKw = (motor.peakTorqueNm * omegaRadS) / 1000;
  const isFieldWeakening = currentRpm > baseRpm;

  if (isFieldWeakening && omegaRadS > 0) {
    availablePeakPowerKw = motor.peakPowerKw;
    availablePeakTorqueNm = (motor.peakPowerKw * 1000) / omegaRadS;
  }

  // 2. Continuous torque & power
  let availableContTorqueNm = motor.continuousTorqueNm;
  let availableContPowerKw = (motor.continuousTorqueNm * omegaRadS) / 1000;
  if (currentRpm > contBaseRpm && omegaRadS > 0) {
    availableContPowerKw = motor.continuousPowerKw;
    availableContTorqueNm = (motor.continuousPowerKw * 1000) / omegaRadS;
  }

  // 3. Efficiency calculation based on operating point
  // High torque at near-zero RPM has lower efficiency (I^2 * R copper heating)
  // Very high RPM has iron core eddy & hysteresis losses
  const loadRatio = actualDemandedTorqueNm !== undefined
    ? Math.min(1, Math.max(0.05, actualDemandedTorqueNm / Math.max(1, availablePeakTorqueNm)))
    : 0.75;
  const speedRatio = Math.min(1, currentRpm / Math.max(1, motor.maxRpm));

  // Empirical efficiency contour model for modern automotive traction motors
  const efficiencyPenalty =
    0.08 * Math.pow(1 - loadRatio, 2) +
    0.06 * Math.pow(speedRatio - 0.45, 2) +
    (currentRpm < 500 ? 0.05 * (1 - currentRpm / 500) : 0);

  const operatingEfficiency = Math.max(0.70, Math.min(0.97, motor.baseEfficiency - efficiencyPenalty));

  return {
    rpm: currentRpm,
    availablePeakTorqueNm: Math.max(0, availablePeakTorqueNm),
    availablePeakPowerKw: Math.max(0, availablePeakPowerKw),
    availableContinuousTorqueNm: Math.max(0, availableContTorqueNm),
    availableContinuousPowerKw: Math.max(0, availableContPowerKw),
    operatingEfficiency,
    isFieldWeakening,
    isRedlineExceeded: false,
  };
}

/**
 * Generates an array of points for plotting the complete Torque vs RPM and Power vs RPM curves
 */
export function generateMotorCurves(
  motor: MotorParameters,
  steps: number = 60
): MotorCurvePoint[] {
  const points: MotorCurvePoint[] = [];
  const maxRpm = motor.maxRpm;
  const baseRpm = calculateMotorBaseRpm(motor.peakPowerKw, motor.peakTorqueNm);

  // Guarantee base RPM is one of the plotted nodes for a crisp corner transition
  const rpmSet = new Set<number>();
  for (let i = 0; i <= steps; i++) {
    rpmSet.add(Math.round((i / steps) * maxRpm));
  }
  rpmSet.add(Math.round(baseRpm));

  const sortedRpms = Array.from(rpmSet).sort((a, b) => a - b);

  for (const rpm of sortedRpms) {
    const limits = getMotorOperatingLimits(rpm, motor);
    points.push({
      rpm,
      peakTorqueNm: Math.round(limits.availablePeakTorqueNm * 10) / 10,
      peakPowerKw: Math.round(limits.availablePeakPowerKw * 10) / 10,
      continuousTorqueNm: Math.round(limits.availableContinuousTorqueNm * 10) / 10,
      continuousPowerKw: Math.round(limits.availableContinuousPowerKw * 10) / 10,
      efficiencyPercent: Math.round(limits.operatingEfficiency * 1000) / 10,
    });
  }

  return points;
}
