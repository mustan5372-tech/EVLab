'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap,
  Sliders,
  Gauge,
  Activity,
  GitCompare,
  BookOpen,
  Settings,
  Sun,
  Moon,
  Home,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useEVStore } from '@/hooks/useEVStore';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: Home },
  { href: '/designer', label: 'EV Designer', icon: Sliders },
  { href: '/simulation', label: 'Simulation', icon: Gauge },
  { href: '/drive-cycles', label: 'Drive Cycles', icon: Activity },
  { href: '/comparison', label: 'Compare EVs', icon: GitCompare },
  { href: '/learn', label: 'Engineering Learn', icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const { preferences, setTheme, currentVehicle } = useEVStore();

  const isDark = preferences.theme === 'dark';

  return (
    <aside className="hidden lg:flex flex-col justify-between w-64 h-screen sticky top-0 bg-surface-50/90 border-r border-border/80 p-5 backdrop-blur-xl z-30 select-none">
      {/* Brand Header */}
      <div className="space-y-6">
        <Link href="/" className="flex items-center gap-3 px-2 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-electric-600 to-electric-400 flex items-center justify-center text-slate-950 font-black shadow-glow group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-foreground">EVLAB</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-electric-500/15 text-electric-400 border border-electric-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">Design. Simulate. Optimize.</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={twMerge(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-electric-500/15 text-electric-400 font-semibold shadow-sm border border-electric-500/20'
                    : 'text-slate-400 hover:text-foreground hover:bg-surface-200/70'
                )}
              >
                <Icon
                  className={twMerge(
                    'w-5 h-5 transition-colors',
                    isActive ? 'text-electric-400' : 'text-slate-400 group-hover:text-foreground'
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Theme Control */}
      <div className="space-y-4 pt-4 border-t border-border/60">
        {/* Active Vehicle Pill */}
        <div className="p-3 rounded-2xl bg-surface-100 border border-border/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Active Vehicle</span>
            <span className="text-[10px] font-mono text-electric-400">{(currentVehicle.motor.peakPowerKw)} kW</span>
          </div>
          <p className="text-xs font-semibold text-foreground truncate mt-0.5">{currentVehicle.name}</p>
        </div>

        {/* Theme Toggle & Version */}
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-foreground px-2 py-1 rounded-xl hover:bg-surface-200 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <span className="text-[11px] font-mono text-slate-500">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
