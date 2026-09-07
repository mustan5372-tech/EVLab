import { DrivetrainLayout } from '@/types/ev';
import { STANDARD_GRAVITY, TIRE_FRICTION_COEFFICIENTS } from './constants';

export interface TractiveForceBreakdown {
  aeroDragN: number;
  rollingResistN: number;
  gradeResistN: number;
  inertialAccelN: number;
  totalTractiveForceN: number;
  tireTractionLimitN: number;
  isTractionLimited: boolean;
}

/**
 * Gets approximate fraction of vehicle weight resting on driven wheels under acceleration
 */
export function getDrivenAxleWeightFraction(layout: DrivetrainLayout): number {
  switch (layout) {
    case 'awd':
      return 1.0; // 100% of vehicle normal force available
    case 'rwd':
      return 0.60; // Includes dynamic rearward weight transfer under acceleration
    case 'fwd':
      return 0.50; // Reduced front axle weight under acceleration pitch
    default:
      return 0.60;
  }
}

/**
 * Calculates maximum tractive force the tires can transmit to the pavement without spinning
 * F_max = mu * m * g * weight_fraction
 */
export function calculateTireTractionLimit(
  massKg: number,
  layout: DrivetrainLayout,
  tireMu: number = TIRE_FRICTION_COEFFICIENTS.dryAsphalt,
  gravity: number = STANDARD_GRAVITY
): number {
  const weightFraction = getDrivenAxleWeightFraction(layout);
  return tireMu * massKg * gravity * weightFraction;
}

/**
 * Calculates total tractive force required to propel vehicle
 * Ft = Fd + Frr + Fg + m * a
 */
export function calculateTotalTractiveForce(
  aeroDragN: number,
  rollingResistN: number,
  gradeResistN: number,
  massKg: number,
  accelerationMs2: number,
  layout: DrivetrainLayout = 'rwd',
  tireMu: number = TIRE_FRICTION_COEFFICIENTS.dryAsphalt
): TractiveForceBreakdown {
  const inertialAccelN = massKg * accelerationMs2;
  const totalTractiveForceN = aeroDragN + rollingResistN + gradeResistN + inertialAccelN;
  const tireTractionLimitN = calculateTireTractionLimit(massKg, layout, tireMu);
  const isTractionLimited = totalTractiveForceN > tireTractionLimitN;

  return {
    aeroDragN,
    rollingResistN,
    gradeResistN,
    inertialAccelN,
    totalTractiveForceN,
    tireTractionLimitN,
    isTractionLimited,
  };
}
