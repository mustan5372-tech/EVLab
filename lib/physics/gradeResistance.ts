import { STANDARD_GRAVITY } from './constants';

export interface GradeResistanceExplanation {
  formula: string;
  substitutedValues: string;
  resultN: number;
  gradeAngleDeg: number;
  explanation: string;
}

/**
 * Converts grade percentage to incline angle in radians
 * gradePercent = 100 * tan(theta) => theta = atan(gradePercent / 100)
 */
export function gradePercentToRadians(gradePercent: number): number {
  return Math.atan(gradePercent / 100);
}

/**
 * Calculates gravitational grade resistance force in Newtons
 * Fg = m * g * sin(theta)
 * Positive when climbing an incline (resisting motion), negative when descending (propelling)
 */
export function calculateGradeResistance(
  massKg: number,
  gradePercent: number,
  gravity: number = STANDARD_GRAVITY
): number {
  if (massKg <= 0 || gradePercent === 0) return 0;
  const thetaRad = gradePercentToRadians(gradePercent);
  return massKg * gravity * Math.sin(thetaRad);
}

/**
 * Produces structured mathematical derivation and explanation
 */
export function explainGradeResistance(
  massKg: number,
  gradePercent: number
): GradeResistanceExplanation {
  const thetaRad = gradePercentToRadians(gradePercent);
  const thetaDeg = (thetaRad * 180) / Math.PI;
  const forceN = calculateGradeResistance(massKg, gradePercent);

  return {
    formula: "F_g = m \\cdot g \\cdot \\sin(\\arctan(\\frac{\\%\\text{grade}}{100}))",
    substitutedValues: `${massKg.toFixed(0)} kg × ${STANDARD_GRAVITY.toFixed(3)} m/s² × sin(${thetaDeg.toFixed(2)}°)`,
    resultN: Math.round(forceN * 10) / 10,
    gradeAngleDeg: Math.round(thetaDeg * 100) / 100,
    explanation:
      "Grade resistance represents the gravitational vector component opposing vehicle motion along the incline plane. On steep mountain climbs (e.g., 15-20%), grade resistance can exceed aerodynamic and rolling resistance combined, requiring high motor torque.",
  };
}
