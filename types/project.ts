import { EVConfiguration } from './ev';
import { SimulationOverview } from './simulation';

export interface UserPreferences {
  theme: 'dark' | 'light';
  unitSystem: 'metric' | 'imperial';
  simulationTimestepS: number;
  ambientTempC: number;
  autoRunSimulation: boolean;
}

export interface EVProject {
  id: string;
  name: string;
  description: string;
  configuration: EVConfiguration;
  lastSimulation?: SimulationOverview;
  createdAt: string;
  updatedAt: string;
}
