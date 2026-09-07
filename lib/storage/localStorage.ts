import { EVConfiguration } from '@/types/ev';
import { EVProject, UserPreferences } from '@/types/project';
import { DEFAULT_CITY_EV, PRESET_VEHICLES } from './defaultPresets';

const STORAGE_KEYS = {
  CURRENT_CONFIG: 'evlab_current_config',
  PROJECTS: 'evlab_projects',
  PREFERENCES: 'evlab_preferences',
  COMPARISON: 'evlab_comparison_ids',
} as const;

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  unitSystem: 'metric',
  simulationTimestepS: 0.05,
  ambientTempC: 20,
  autoRunSimulation: true,
};

export function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function loadCurrentConfiguration(): EVConfiguration {
  if (!isClient()) return DEFAULT_CITY_EV;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_CONFIG);
    if (!raw) return DEFAULT_CITY_EV;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load current EV configuration from localStorage', err);
    return DEFAULT_CITY_EV;
  }
}

export function saveCurrentConfiguration(config: EVConfiguration): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save EV configuration to localStorage', err);
  }
}

export function loadSavedProjects(): EVProject[] {
  if (!isClient()) {
    return PRESET_VEHICLES.map(v => ({
      id: v.id,
      name: v.name,
      description: v.description,
      configuration: v,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      // Seed with standard presets on first load
      const initialProjects: EVProject[] = PRESET_VEHICLES.map(v => ({
        id: v.id,
        name: v.name,
        description: v.description,
        configuration: v,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      }));
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(initialProjects));
      return initialProjects;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load saved projects', err);
    return [];
  }
}

export function saveProjects(projects: EVProject[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to localStorage', err);
  }
}

export function loadUserPreferences(): UserPreferences {
  if (!isClient()) return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: UserPreferences): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch (err) {
    console.error('Failed to save user preferences', err);
  }
}

export function exportAllDataToJson(): string {
  if (!isClient()) return '{}';
  return JSON.stringify({
    version: '1.0',
    exportedAt: new Date().toISOString(),
    currentConfig: loadCurrentConfiguration(),
    projects: loadSavedProjects(),
    preferences: loadUserPreferences(),
  }, null, 2);
}

export function importDataFromJson(jsonStr: string): boolean {
  if (!isClient()) return false;
  try {
    const data = JSON.parse(jsonStr);
    if (data.currentConfig) saveCurrentConfiguration(data.currentConfig);
    if (Array.isArray(data.projects)) saveProjects(data.projects);
    if (data.preferences) saveUserPreferences(data.preferences);
    return true;
  } catch (err) {
    console.error('Failed to parse backup JSON:', err);
    return false;
  }
}
