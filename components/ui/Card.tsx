import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  highlight?: boolean;
  padded?: boolean;
}

export function Card({
  className,
  elevated = true,
  highlight = false,
  padded = true,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={twMerge(
        'rounded-3xl border transition-all duration-200',
        elevated ? 'bg-surface-100/90 backdrop-blur-md shadow-soft' : 'bg-surface-50/70',
        highlight ? 'border-electric-500/40 shadow-glow' : 'border-border/80 hover:border-border',
        padded && 'p-5 md:p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge('flex items-center justify-between gap-4 mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={twMerge('text-lg font-semibold text-foreground tracking-tight flex items-center gap-2', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={twMerge('text-xs text-slate-400 leading-relaxed', className)} {...props}>
      {children}
    </p>
  );
}
