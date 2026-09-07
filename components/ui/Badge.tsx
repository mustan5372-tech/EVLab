import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'optimal' | 'good' | 'attention' | 'critical' | 'neutral' | 'electric';
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className,
  ...props
}: BadgeProps) {
  const variantStyles = {
    optimal: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    good: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
    attention: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    critical: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    neutral: 'bg-surface-200/80 text-slate-300 border border-border',
    electric: 'bg-electric-500/15 text-electric-400 border border-electric-500/30',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 rounded-full font-medium',
    md: 'text-xs px-3 py-1 rounded-full font-medium',
  };

  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1.5 transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
