import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  pill?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', pill = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400 focus-visible:ring-offset-2 select-none cursor-pointer';

    const variants = {
      primary:
        'bg-electric-500 text-slate-950 font-semibold hover:bg-electric-400 shadow-sm hover:shadow-glow',
      secondary:
        'bg-surface-200 text-foreground hover:bg-surface-300 border border-border/80',
      outline:
        'bg-transparent text-foreground border border-border hover:bg-surface-100 hover:border-slate-600',
      ghost:
        'bg-transparent text-slate-300 hover:text-foreground hover:bg-surface-200/60',
      danger:
        'bg-rose-500 text-white hover:bg-rose-600 shadow-sm',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-6 py-3 gap-2.5 font-semibold',
      icon: 'p-2.5',
    };

    const radius = pill ? 'rounded-full' : 'rounded-2xl';

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], radius, className))}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
