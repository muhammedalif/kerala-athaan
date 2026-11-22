import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore.js';
import { Header } from './components/Header.js';
import { Navigation } from './components/Navigation.js';
import { InstallPrompt } from './components/InstallPrompt.js';
import { HomeView } from './views/HomeView.js';
import { DailyView } from './views/DailyView.js';
import { MonthlyView } from './views/MonthlyView.js';
import { LocationsView } from './views/LocationsView.js';
import { SettingsView } from './views/SettingsView.js';
import { registerPeriodicSync, performAppSync } from './db/sync.js';

export const App: React.FC = () => {
  const { activeView, initStorage } = useAppStore();

  useEffect(() => {
    initStorage();
    registerPeriodicSync().catch(() => {});
    performAppSync().catch(() => {});

    const handleVisibilityOrOnline = () => {
      if (document.visibilityState === 'visible' || navigator.onLine) {
        performAppSync().catch(() => {});
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityOrOnline);
    window.addEventListener('online', handleVisibilityOrOnline);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityOrOnline);
      window.removeEventListener('online', handleVisibilityOrOnline);
    };
  }, [initStorage]);

  return (
    <div className="min-h-screen bg-ivory text-navy flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4">
        {activeView === 'home' && <HomeView />}
        {activeView === 'daily' && <DailyView />}
        {activeView === 'monthly' && <MonthlyView />}
        {activeView === 'locations' && <LocationsView />}
        {activeView === 'settings' && <SettingsView />}
      </main>

      <InstallPrompt />
      <Navigation />
    </div>
  );
};
