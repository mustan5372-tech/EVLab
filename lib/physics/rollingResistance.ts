import { STANDARD_GRAVITY } from './constants';

export interface RollingResistanceExplanation {
  formula: string;
  substitutedValues: string;
  resultN: number;
  resultKw: number;
  explanation: string;
}

/**
 * Calculates rolling resistance force in Newtons
 * @param massKg Vehicle total mass in kg
 * @param crr Rolling resistance coefficient (typically 0.008 - 0.015 for low-rolling-resistance EV tires)
 * @param gradeAngleRad Road inclination angle in radians (default: 0)
 * @param gravity Acceleration due to gravity in m/s² (default: 9.80665)
 */
export function calculateRollingResistance(
  massKg: number,
  crr: number,
  gradeAngleRad: number = 0,
  gravity: number = STANDARD_GRAVITY
): number {
  if (massKg <= 0 || crr <= 0) return 0;
  // Frr = Crr * m * g * cos(theta)
  return crr * massKg * gravity * Math.cos(gradeAngleRad);
}

/**
 * Calculates rolling resistance power loss in Watts
 */
export function calculateRollingPowerLossW(
  speedMs: number,
  massKg: number,
  crr: number,
  gradeAngleRad: number = 0,
  gravity: number = STANDARD_GRAVITY
): number {
  const forceN = calculateRollingResistance(massKg, crr, gradeAngleRad, gravity);
  return forceN * speedMs;
}

/**
 * Produces structured mathematical derivation and explanation
 */
export function explainRollingResistance(
  massKg: number,
  crr: number,
  speedKmh: number = 90
): RollingResistanceExplanation {
  const speedMs = speedKmh / 3.6;
  const forceN = calculateRollingResistance(massKg, crr);
  const powerKw = (forceN * speedMs) / 1000;

  return {
    formula: "F_{rr} = C_{rr} \\cdot m \\cdot g \\cdot \\cos(\\theta)",
    substitutedValues: `${crr.toFixed(4)} × ${massKg.toFixed(0)} kg × ${STANDARD_GRAVITY.toFixed(3)} m/s² × cos(0°)`,
    resultN: Math.round(forceN * 10) / 10,
    resultKw: Math.round(powerKw * 100) / 100,
    explanation:
      "Rolling resistance stems primarily from viscoelastic hysteresis losses in the tire rubber as it continually deforms and recovers against the road surface. Unlike aerodynamic drag, rolling resistance is roughly linear with vehicle mass and remains dominant at low and urban speeds.",
  };
}
