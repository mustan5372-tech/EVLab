import React from 'react';
import { twMerge } from 'tailwind-merge';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function Tabs({ tabs, activeTab, onChange, className, size = 'md' }: TabsProps) {
  return (
    <div
      className={twMerge(
        'inline-flex items-center p-1.5 rounded-2xl bg-surface-200/80 border border-border/80 overflow-x-auto max-w-full scrollbar-none',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={twMerge(
              'flex items-center gap-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap select-none cursor-pointer',
              size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
              isActive
                ? 'bg-surface-elevated text-foreground shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-300/40'
            )}
          >
            {tab.icon && <span className="text-current">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={twMerge(
                  'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                  isActive ? 'bg-electric-500/20 text-electric-400' : 'bg-surface-300 text-slate-400'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
