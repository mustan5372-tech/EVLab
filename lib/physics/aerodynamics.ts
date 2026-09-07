/**
 * Aerodynamic Drag Calculation
 * Fd = 0.5 * rho * Cd * A * v^2
 */

export interface AerodynamicCalculationExplanation {
  formula: string;
  substitutedValues: string;
  resultN: number;
  resultKw: number;
  explanation: string;
}

/**
 * Calculates instantaneous aerodynamic drag force in Newtons
 * @param speedMs Velocity in m/s
 * @param cd Drag coefficient (dimensionless, typically 0.20 - 0.35 for modern EVs)
 * @param frontalAreaM2 Vehicle projected frontal cross-section area in m² (typically 2.0 - 2.5 m²)
 * @param airDensity Air density in kg/m³ (default: 1.225 kg/m³ at 15°C)
 */
export function calculateAerodynamicDrag(
  speedMs: number,
  cd: number,
  frontalAreaM2: number,
  airDensity: number = 1.225
): number {
  if (speedMs <= 0 || cd <= 0 || frontalAreaM2 <= 0) return 0;
  return 0.5 * airDensity * cd * frontalAreaM2 * Math.pow(speedMs, 2);
}

/**
 * Calculates aerodynamic resistive power loss in Watts (P = Fd * v)
 */
export function calculateAerodynamicPowerLossW(
  speedMs: number,
  cd: number,
  frontalAreaM2: number,
  airDensity: number = 1.225
): number {
  const forceN = calculateAerodynamicDrag(speedMs, cd, frontalAreaM2, airDensity);
  return forceN * speedMs;
}

/**
 * Produces structured mathematical derivation and explanation for educational modals
 */
export function explainAerodynamicCalculation(
  speedKmh: number,
  cd: number,
  frontalAreaM2: number,
  airDensity: number = 1.225
): AerodynamicCalculationExplanation {
  const speedMs = speedKmh / 3.6;
  const forceN = calculateAerodynamicDrag(speedMs, cd, frontalAreaM2, airDensity);
  const powerKw = (forceN * speedMs) / 1000;

  return {
    formula: "F_d = \\frac{1}{2} \\cdot \\rho \\cdot C_d \\cdot A \\cdot v^2",
    substitutedValues: `0.5 × ${airDensity.toFixed(3)} kg/m³ × ${cd.toFixed(2)} × ${frontalAreaM2.toFixed(2)} m² × (${speedMs.toFixed(2)} m/s)²`,
    resultN: Math.round(forceN * 10) / 10,
    resultKw: Math.round(powerKw * 100) / 100,
    explanation:
      "Aerodynamic drag increases quadratically with vehicle velocity. Doubling your speed quadruples the aerodynamic resistance force and octuples (8x) the power required to overcome it, making aerodynamic efficiency paramount at highway speeds.",
  };
}
