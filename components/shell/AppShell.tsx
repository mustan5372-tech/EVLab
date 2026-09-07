'use client';

import React, { useEffect } from 'react';
import { useEVStore } from '@/hooks/useEVStore';
import { DesktopSidebar } from './DesktopSidebar';
import { AppHeader } from './AppHeader';
import { MobileBottomNav } from './MobileBottomNav';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { hydrate } = useEVStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="min-h-screen flex bg-background text-foreground selection:bg-electric-500/20 selection:text-electric-400">
      {/* Desktop Persistent Sidebar */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
