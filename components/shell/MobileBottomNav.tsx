'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sliders,
  Gauge,
  Activity,
  GitCompare,
  BookOpen,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const MOBILE_NAV_ITEMS = [
  { href: '/designer', label: 'Designer', icon: Sliders },
  { href: '/simulation', label: 'Simulate', icon: Gauge },
  { href: '/drive-cycles', label: 'Cycles', icon: Activity },
  { href: '/comparison', label: 'Compare', icon: GitCompare },
  { href: '/learn', label: 'Learn', icon: BookOpen },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-50/95 backdrop-blur-xl border-t border-border/80 px-2 py-2 flex items-center justify-around select-none">
      {MOBILE_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={twMerge(
              'flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-150',
              isActive
                ? 'text-electric-400 font-semibold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
