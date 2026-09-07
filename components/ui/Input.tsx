import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  unit?: string;
  helperText?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, unit, helperText, error, id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <div className="flex items-center justify-between text-xs font-medium text-slate-300">
            <label htmlFor={inputId}>{label}</label>
            {unit && <span className="text-slate-500 font-mono text-[11px]">{unit}</span>}
          </div>
        )}
        <div className="relative flex items-center">
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={twMerge(
              'w-full bg-surface-200/80 hover:bg-surface-200 focus:bg-surface-200 text-foreground text-sm font-medium rounded-2xl px-3.5 py-2.5 border transition-all duration-150 outline-none',
              error
                ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                : 'border-border/80 focus:border-electric-400/80 focus:ring-1 focus:ring-electric-400/30',
              unit ? 'pr-12' : '',
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
            {...props}
          />
          {unit && (
            <div className="absolute right-3.5 pointer-events-none text-xs font-medium text-slate-400 select-none">
              {unit}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-rose-400 mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-slate-400 mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
