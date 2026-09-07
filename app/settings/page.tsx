'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Trash2,
  FolderOpen,
  Sliders,
  Shield,
  Github,
} from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useEVStore } from '@/hooks/useEVStore';
import { exportAllDataToJson, importDataFromJson } from '@/lib/storage/localStorage';
import { PRESET_VEHICLES } from '@/lib/storage/defaultPresets';

export default function SettingsPage() {
  const {
    projects,
    activeProjectId,
    loadProject,
    deleteProject,
    preferences,
    updatePreferences,
    resetToDefault,
  } = useEVStore();

  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExportBackup = () => {
    const jsonStr = exportAllDataToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EVLAB_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const success = importDataFromJson(text);
      if (success) {
        setImportStatus('Backup successfully imported! Reloading...');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setImportStatus('Failed to parse backup JSON. Please check file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-electric-400 uppercase tracking-wider">
              <SettingsIcon className="w-4 h-4" />
              <span>System & Workspace Configuration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
              Platform Settings & Data Management
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure engineering units, appearance, backup workspaces, and manage saved EV vehicle projects.
            </p>
          </div>

          <a
            href="https://github.com/mustan5372-tech/EVLab"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" pill className="gap-2 text-xs font-semibold">
              <Github className="w-4 h-4" />
              <span>GitHub Repository</span>
            </Button>
          </a>
        </div>

        {/* Preferences Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Engineering Units & Theme */}
          <Card elevated className="space-y-4">
            <CardHeader>
              <CardTitle>Display & Measurement Standards</CardTitle>
              <CardDescription>
                Customize measurement unit standards and visual interface theme.
              </CardDescription>
            </CardHeader>

            <div className="space-y-4 text-xs">
              {/* Unit System */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-200 border border-border">
                <div>
                  <div className="font-bold text-foreground">Unit System</div>
                  <div className="text-slate-400 text-[11px]">Velocity in km/h vs mph, torque in Nm vs lb-ft</div>
                </div>
                <div className="flex items-center gap-1 bg-surface-300 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => updatePreferences({ unitSystem: 'metric' })}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      preferences.unitSystem === 'metric'
                        ? 'bg-electric-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Metric
                  </button>
                  <button
                    type="button"
                    onClick={() => updatePreferences({ unitSystem: 'imperial' })}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      preferences.unitSystem === 'imperial'
                        ? 'bg-electric-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Imperial
                  </button>
                </div>
              </div>

              {/* Theme */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-200 border border-border">
                <div>
                  <div className="font-bold text-foreground">Theme Mode</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">Toggle between Dark OLED and Clean Light UI</div>
                </div>
                <div className="flex items-center gap-1 bg-surface-200 border border-border p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => updatePreferences({ theme: 'dark' })}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      preferences.theme === 'dark'
                        ? 'bg-electric-500 text-slate-950 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-foreground'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dark</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updatePreferences({ theme: 'light' })}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      preferences.theme === 'light'
                        ? 'bg-electric-500 text-slate-950 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-foreground'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Light</span>
                  </button>
                </div>
              </div>

              {/* Auto Run Simulation */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-200 border border-border">
                <div>
                  <div className="font-bold text-foreground">Real-Time Continuous Simulation</div>
                  <div className="text-slate-400 text-[11px]">Re-run numerical solvers on parameter slider changes</div>
                </div>
                <button
                  type="button"
                  onClick={() => updatePreferences({ autoRunSimulation: !preferences.autoRunSimulation })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    preferences.autoRunSimulation ? 'bg-electric-500' : 'bg-surface-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      preferences.autoRunSimulation ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* Backup & Data Sync */}
          <Card elevated className="space-y-4">
            <CardHeader>
              <CardTitle>Workspace Backup & Data Portability</CardTitle>
              <CardDescription>
                Export all custom configurations, vehicle presets, and telemetry logs as standard JSON.
              </CardDescription>
            </CardHeader>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  pill
                  onClick={handleExportBackup}
                  className="gap-2 text-xs font-semibold flex-1"
                >
                  <Download className="w-4 h-4" />
                  <span>Export JSON Backup</span>
                </Button>

                <label className="flex-1">
                  <span className="sr-only">Import JSON Backup</span>
                  <div className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-2xl border border-border bg-surface-200 hover:bg-surface-300 text-slate-200 cursor-pointer font-semibold transition-all">
                    <Upload className="w-4 h-4 text-electric-400" />
                    <span>Import Backup</span>
                  </div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>

              {importStatus && (
                <div className="p-3 rounded-xl bg-electric-500/10 border border-electric-500/30 text-electric-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{importStatus}</span>
                </div>
              )}

              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-foreground">Reset Workspace</div>
                  <div className="text-slate-400 text-[11px]">Revert to factory default presets and clear local cache</div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  pill
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all vehicle configurations to factory defaults?')) {
                      resetToDefault();
                    }
                  }}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Saved Projects Library */}
        <Card elevated className="space-y-4">
          <CardHeader>
            <div>
              <CardTitle>Vehicle Project Library ({projects.length})</CardTitle>
              <CardDescription>
                Manage your saved custom powertrain designs and preloaded OEM models.
              </CardDescription>
            </div>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className={`p-4 rounded-2xl border transition-all ${
                  proj.id === activeProjectId
                    ? 'bg-electric-500/10 border-electric-500/60 shadow-soft'
                    : 'bg-surface-200 border-border/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-sm text-foreground truncate">{proj.name}</div>
                  {proj.id === activeProjectId && (
                    <Badge variant="electric" className="text-[10px]">Active</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{proj.description}</p>

                <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => loadProject(proj.id)}
                    className="text-electric-400 hover:text-electric-300 font-semibold flex items-center gap-1"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Open in Designer</span>
                  </button>

                  {projects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteProject(proj.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
