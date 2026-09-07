import { create } from 'zustand';
import { EVConfiguration, VehicleParameters, MotorParameters, BatteryParameters, TransmissionParameters, RegenMode } from '@/types/ev';
import { EVProject, UserPreferences } from '@/types/project';
import { SimulationOverview } from '@/types/simulation';
import { DEFAULT_CITY_EV, PRESET_VEHICLES } from '@/lib/storage/defaultPresets';
import {
  loadCurrentConfiguration,
  saveCurrentConfiguration,
  loadSavedProjects,
  saveProjects,
  loadUserPreferences,
  saveUserPreferences,
  DEFAULT_PREFERENCES,
} from '@/lib/storage/localStorage';
import { runFullSimulation } from '@/lib/simulation';

interface EVStoreState {
  currentVehicle: EVConfiguration;
  projects: EVProject[];
  activeProjectId: string;
  preferences: UserPreferences;
  activeSimulation: SimulationOverview | null;
  simulation: SimulationOverview | null;
  isSimulating: boolean;
  comparisonVehicles: EVConfiguration[];
  isHydrated: boolean;

  // Actions
  hydrate: () => void;
  updateVehicleParams: (params: Partial<VehicleParameters>) => void;
  updateMotorParams: (params: Partial<MotorParameters>) => void;
  updateBatteryParams: (params: Partial<BatteryParameters>) => void;
  updateTransmissionParams: (params: Partial<TransmissionParameters>) => void;
  setRegenMode: (mode: RegenMode) => void;
  loadPreset: (presetId: string) => void;
  saveCurrentAsProject: (name?: string, description?: string) => void;
  loadProject: (projectId: string) => void;
  renameProject: (projectId: string, newName: string) => void;
  duplicateProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  resetCurrentVehicle: () => void;
  resetToDefault: () => void;
  runSimulation: () => SimulationOverview;
  addToComparison: (vehicle: EVConfiguration) => void;
  removeFromComparison: (vehicleId: string) => void;
  clearComparison: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setUnitSystem: (system: 'metric' | 'imperial') => void;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
}

export const useEVStore = create<EVStoreState>((set, get) => ({
  currentVehicle: DEFAULT_CITY_EV,
  projects: [],
  activeProjectId: DEFAULT_CITY_EV.id,
  preferences: DEFAULT_PREFERENCES,
  activeSimulation: null,
  simulation: null,
  isSimulating: false,
  comparisonVehicles: [DEFAULT_CITY_EV, PRESET_VEHICLES[1], PRESET_VEHICLES[3]],
  isHydrated: false,

  hydrate: () => {
    if (get().isHydrated) return;
    const config = loadCurrentConfiguration();
    const projects = loadSavedProjects();
    const prefs = loadUserPreferences();
    const sim = runFullSimulation(config);

    set({
      currentVehicle: config,
      projects,
      activeProjectId: config.id,
      preferences: prefs,
      activeSimulation: sim,
      simulation: sim,
      isHydrated: true,
    });
  },

  updateVehicleParams: (params) => {
    const updated: EVConfiguration = {
      ...get().currentVehicle,
      vehicle: { ...get().currentVehicle.vehicle, ...params },
      updatedAt: new Date().toISOString(),
    };
    saveCurrentConfiguration(updated);
    set({ currentVehicle: updated });
    if (get().preferences.autoRunSimulation) {
      get().runSimulation();
    }
  },

  updateMotorParams: (params) => {
    const updated: EVConfiguration = {
      ...get().currentVehicle,
      motor: { ...get().currentVehicle.motor, ...params },
      updatedAt: new Date().toISOString(),
    };
    saveCurrentConfiguration(updated);
    set({ currentVehicle: updated });
    if (get().preferences.autoRunSimulation) {
      get().runSimulation();
    }
  },

  updateBatteryParams: (params) => {
    const updated: EVConfiguration = {
      ...get().currentVehicle,
      battery: { ...get().currentVehicle.battery, ...params },
      updatedAt: new Date().toISOString(),
    };
    saveCurrentConfiguration(updated);
    set({ currentVehicle: updated });
    if (get().preferences.autoRunSimulation) {
      get().runSimulation();
    }
  },

  updateTransmissionParams: (params) => {
    const updated: EVConfiguration = {
      ...get().currentVehicle,
      transmission: { ...get().currentVehicle.transmission, ...params },
      updatedAt: new Date().toISOString(),
    };
    saveCurrentConfiguration(updated);
    set({ currentVehicle: updated });
    if (get().preferences.autoRunSimulation) {
      get().runSimulation();
    }
  },

  setRegenMode: (mode) => {
    const updated: EVConfiguration = {
      ...get().currentVehicle,
      regenMode: mode,
      updatedAt: new Date().toISOString(),
    };
    saveCurrentConfiguration(updated);
    set({ currentVehicle: updated });
    if (get().preferences.autoRunSimulation) {
      get().runSimulation();
    }
  },

  loadPreset: (presetId) => {
    const preset = PRESET_VEHICLES.find((p) => p.id === presetId) || DEFAULT_CITY_EV;
    const cloned: EVConfiguration = {
      ...preset,
      id: `custom-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    saveCurrentConfiguration(cloned);
    set({ currentVehicle: cloned, activeProjectId: cloned.id });
    get().runSimulation();
  },

  saveCurrentAsProject: (name, description) => {
    const current = get().currentVehicle;
    const projectName = name || current.name;
    const projectDesc = description || current.description;
    const projectId = current.id.startsWith('custom-') ? current.id : `project-${Date.now()}`;

    const updatedConfig: EVConfiguration = {
      ...current,
      id: projectId,
      name: projectName,
      description: projectDesc,
      updatedAt: new Date().toISOString(),
    };

    const existingIndex = get().projects.findIndex((p) => p.id === projectId);
    let newProjects: EVProject[];

    if (existingIndex >= 0) {
      newProjects = get().projects.map((p, idx) =>
        idx === existingIndex
          ? {
              ...p,
              name: projectName,
              description: projectDesc,
              configuration: updatedConfig,
              updatedAt: new Date().toISOString(),
            }
          : p
      );
    } else {
      const newProj: EVProject = {
        id: projectId,
        name: projectName,
        description: projectDesc,
        configuration: updatedConfig,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      newProjects = [newProj, ...get().projects];
    }

    saveProjects(newProjects);
    saveCurrentConfiguration(updatedConfig);
    set({
      projects: newProjects,
      currentVehicle: updatedConfig,
      activeProjectId: projectId,
    });
  },

  loadProject: (projectId) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (!project) return;
    saveCurrentConfiguration(project.configuration);
    set({
      currentVehicle: project.configuration,
      activeProjectId: project.id,
    });
    get().runSimulation();
  },

  renameProject: (projectId, newName) => {
    const newProjects = get().projects.map((p) =>
      p.id === projectId
        ? {
            ...p,
            name: newName,
            configuration: { ...p.configuration, name: newName },
            updatedAt: new Date().toISOString(),
          }
        : p
    );
    saveProjects(newProjects);
    if (get().activeProjectId === projectId) {
      const updatedCurr = { ...get().currentVehicle, name: newName };
      saveCurrentConfiguration(updatedCurr);
      set({ currentVehicle: updatedCurr, projects: newProjects });
    } else {
      set({ projects: newProjects });
    }
  },

  duplicateProject: (projectId) => {
    const source = get().projects.find((p) => p.id === projectId);
    if (!source) return;
    const newId = `project-${Date.now()}`;
    const duplicatedConfig: EVConfiguration = {
      ...source.configuration,
      id: newId,
      name: `${source.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const newProj: EVProject = {
      id: newId,
      name: `${source.name} (Copy)`,
      description: source.description,
      configuration: duplicatedConfig,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const newProjects = [newProj, ...get().projects];
    saveProjects(newProjects);
    set({ projects: newProjects });
  },

  deleteProject: (projectId) => {
    const newProjects = get().projects.filter((p) => p.id !== projectId);
    saveProjects(newProjects);
    set({ projects: newProjects });
  },

  resetCurrentVehicle: () => {
    saveCurrentConfiguration(DEFAULT_CITY_EV);
    set({
      currentVehicle: DEFAULT_CITY_EV,
      activeProjectId: DEFAULT_CITY_EV.id,
    });
    get().runSimulation();
  },

  resetToDefault: () => {
    get().resetCurrentVehicle();
  },

  runSimulation: () => {
    set({ isSimulating: true });
    const current = get().currentVehicle;
    try {
      const results = runFullSimulation(current);
      set({ activeSimulation: results, simulation: results, isSimulating: false });
      return results;
    } catch (err) {
      console.error('Simulation execution failed:', err);
      set({ isSimulating: false });
      const fallback = runFullSimulation(DEFAULT_CITY_EV);
      return fallback;
    }
  },

  addToComparison: (vehicle) => {
    const currentList = get().comparisonVehicles;
    if (currentList.some((v) => v.id === vehicle.id)) return;
    if (currentList.length >= 4) return;
    set({ comparisonVehicles: [...currentList, vehicle] });
  },

  removeFromComparison: (vehicleId) => {
    set({
      comparisonVehicles: get().comparisonVehicles.filter((v) => v.id !== vehicleId),
    });
  },

  clearComparison: () => {
    set({ comparisonVehicles: [] });
  },

  setTheme: (theme) => {
    const newPrefs = { ...get().preferences, theme };
    saveUserPreferences(newPrefs);
    set({ preferences: newPrefs });
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },

  setUnitSystem: (unitSystem) => {
    const newPrefs = { ...get().preferences, unitSystem };
    saveUserPreferences(newPrefs);
    set({ preferences: newPrefs });
  },

  setPreferences: (partial) => {
    const newPrefs = { ...get().preferences, ...partial };
    saveUserPreferences(newPrefs);
    set({ preferences: newPrefs });
  },

  updatePreferences: (partial) => {
    get().setPreferences(partial);
  },
}));
