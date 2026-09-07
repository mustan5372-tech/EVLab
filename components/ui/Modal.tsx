import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Dialog Surface */}
      <div
        className={twMerge(
          'relative w-full bg-surface-100 border border-border rounded-4xl shadow-2xl p-6 sm:p-8 z-10 animate-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] flex flex-col',
          maxWidthClasses[maxWidth]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <h3 className="text-xl font-bold text-foreground tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            pill
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content body */}
        <div className="py-4 overflow-y-auto flex-1 pr-1">{children}</div>
      </div>
    </div>
  );
}
