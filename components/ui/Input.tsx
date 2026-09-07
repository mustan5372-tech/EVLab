import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  unit?: string;
  helperText?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, unit, helperText, error, id, disabled, style, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
            <label htmlFor={inputId}>{label}</label>
            {unit && <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{unit}</span>}
          </div>
        )}
        <div className="relative flex items-center">
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={twMerge(
              'w-full bg-surface-200 hover:bg-surface-300/60 focus:bg-surface-200 text-foreground text-sm font-semibold rounded-2xl px-3.5 py-2.5 border transition-all duration-150 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500',
              error
                ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-border focus:border-electric-400 focus:ring-2 focus:ring-electric-400/25',
              unit ? 'pr-12' : '',
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
            style={{
              backgroundColor: 'var(--surface-200)',
              color: 'var(--foreground)',
              borderColor: error ? undefined : 'var(--border-color)',
              ...style,
            }}
            {...props}
          />
          {unit && (
            <div className="absolute right-3.5 pointer-events-none text-xs font-semibold text-slate-500 dark:text-slate-400 select-none">
              {unit}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
