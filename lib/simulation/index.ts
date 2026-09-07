import { EVConfiguration } from '@/types/ev';
import { SimulationOverview } from '@/types/simulation';
import { simulateAcceleration } from './accelerationSimulator';
import { calculateTopSpeed } from './topSpeedCalculator';
import { calculateGradeability } from './gradeabilityCalculator';
import { calculateRange } from './rangeCalculator';

export function runFullSimulation(config: EVConfiguration): SimulationOverview {
  const acceleration = simulateAcceleration(config);
  const topSpeed = calculateTopSpeed(config);
  const gradeability = calculateGradeability(config);
  const range = calculateRange(config);

  return {
    acceleration,
    topSpeed,
    gradeability,
    range,
    computedAt: new Date().toISOString(),
  };
}

export * from './accelerationSimulator';
export * from './topSpeedCalculator';
export * from './gradeabilityCalculator';
export * from './rangeCalculator';
export * from './driveCycleSimulator';
export * from './driveCyclesData';
