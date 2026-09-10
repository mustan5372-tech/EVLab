import React from 'react';
import { twMerge } from 'tailwind-merge';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  helperText?: string;
  className?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  helperText,
  className,
}: SliderProps) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className={twMerge('w-full space-y-2', className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface-200 border border-border">
          <span className="text-xs font-semibold text-foreground font-tabular">{value}</span>
          {unit && <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{unit}</span>}
        </div>
      </div>

      <div className="relative flex items-center py-2 touch-none">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-3 rounded-full appearance-none cursor-pointer accent-electric-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400/50 touch-manipulation"
          style={{
            background: `linear-gradient(to right, #00D2FF 0%, #00D2FF ${percentage}%, var(--surface-300) ${percentage}%, var(--surface-300) 100%)`,
          }}
        />
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-mono">
        <span>
          {min} {unit}
        </span>
        {helperText && <span className="text-slate-500 dark:text-slate-400">{helperText}</span>}
        <span>
          {max} {unit}
        </span>
      </div>
    </div>
  );
}
