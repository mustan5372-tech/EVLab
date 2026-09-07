'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Play,
  RotateCcw,
  Save,
  ChevronDown,
  Zap,
  FolderOpen,
  Plus,
  Check,
  Sun,
  Moon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEVStore } from '@/hooks/useEVStore';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { PRESET_VEHICLES } from '@/lib/storage/defaultPresets';

export function AppHeader() {
  const router = useRouter();
  const {
    currentVehicle,
    projects,
    activeProjectId,
    loadProject,
    loadPreset,
    saveCurrentAsProject,
    resetCurrentVehicle,
    runSimulation,
    isSimulating,
    preferences,
    setTheme,
  } = useEVStore();

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState(currentVehicle.name);
  const [saveDesc, setSaveDesc] = useState(currentVehicle.description);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const handleRunSimulation = () => {
    runSimulation();
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.1, x: 0.8 },
        colors: ['#00D2FF', '#10B981', '#38BDF8'],
      });
    } catch {
      // Ignore if canvas confetti is unavailable
    }
  };

  const handleSaveProject = () => {
    saveCurrentAsProject(saveName, saveDesc);
    setIsSaveModalOpen(false);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  const isDark = preferences.theme === 'dark';

  return (
    <>
      <header className="sticky top-0 z-20 w-full h-16 bg-surface-50/80 backdrop-blur-xl border-b border-border/80 px-4 sm:px-6 flex items-center justify-between gap-4 select-none">
        {/* Mobile Brand & Project Picker */}
        <div className="flex items-center gap-3">
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-electric-600 to-electric-400 flex items-center justify-center text-slate-950 font-black">
              <Zap className="w-4 h-4 fill-slate-950" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-foreground">EVLAB</span>
          </Link>

          {/* Project Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-surface-200 hover:bg-surface-300 border border-border/80 text-xs font-semibold text-foreground transition-all duration-150 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-electric-400" />
              <span className="max-w-[140px] sm:max-w-[200px] truncate">{currentVehicle.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isProjectDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsProjectDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-72 bg-surface-100 border border-border rounded-3xl shadow-xl p-2 z-40 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-border/60 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Select EV Configuration
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProjectDropdownOpen(false);
                        setIsSaveModalOpen(true);
                        setSaveName(`${currentVehicle.name} Copy`);
                      }}
                      className="text-[11px] text-electric-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Plus className="w-3 h-3" /> Save New
                    </button>
                  </div>

                  {/* Standard Presets */}
                  <div className="py-1">
                    <span className="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Engineering Presets
                    </span>
                    {PRESET_VEHICLES.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          loadPreset(preset.id);
                          setIsProjectDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-surface-200 text-left transition-colors"
                      >
                        <span className="font-medium text-slate-200">{preset.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {preset.motor.peakPowerKw} kW • {preset.battery.cellsInSeries * 3.7 > 400 ? '800V' : '400V'}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Saved User Projects */}
                  {projects.length > 0 && (
                    <div className="py-1 border-t border-border/60">
                      <span className="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Your Saved Projects
                      </span>
                      {projects.map((proj) => (
                        <button
                          key={proj.id}
                          type="button"
                          onClick={() => {
                            loadProject(proj.id);
                            setIsProjectDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-surface-200 text-left transition-colors"
                        >
                          <span className="font-medium text-slate-200 truncate">{proj.name}</span>
                          {activeProjectId === proj.id && (
                            <Check className="w-3.5 h-3.5 text-electric-400 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {saveSuccessNotice && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-400 font-medium animate-in fade-in">
              <Check className="w-3.5 h-3.5" /> Project saved
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Reset Defaults */}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetCurrentVehicle}
            title="Reset configuration to default City EV"
            className="hidden sm:inline-flex text-slate-400 hover:text-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>

          {/* Save Project */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSaveName(currentVehicle.name);
              setSaveDesc(currentVehicle.description);
              setIsSaveModalOpen(true);
            }}
            className="text-xs"
          >
            <Save className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Save</span>
          </Button>

          {/* Theme Switcher */}
          <Button
            variant="ghost"
            size="icon"
            pill
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            title="Toggle theme"
            className="text-slate-400"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
          </Button>

          {/* Run Simulation CTA */}
          <Button
            variant="primary"
            size="sm"
            pill
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="shadow-glow font-bold text-xs sm:text-sm px-3.5 sm:px-4"
          >
            <Play className={`w-3.5 h-3.5 fill-slate-950 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating...' : 'Run Simulation'}</span>
          </Button>
        </div>
      </header>

      {/* Save Project Modal */}
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Save EV Configuration"
        subtitle="Persist your vehicle parameters to local browser memory"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <Input
            label="Project Name"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="e.g., Performance GT Mk II"
          />
          <Input
            label="Description / Engineering Notes"
            value={saveDesc}
            onChange={(e) => setSaveDesc(e.target.value)}
            placeholder="e.g., Optimized for track day cooling and high torque"
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
            <Button variant="ghost" size="sm" onClick={() => setIsSaveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveProject}>
              Save Project
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
