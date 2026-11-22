import React from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Clock, Calendar, MapPin, Settings } from 'lucide-react';
import { useAppStore, type AppView } from '../store/useAppStore.js';

export const Navigation: React.FC = () => {
  const { t } = useTranslation();
  const { activeView, setActiveView } = useAppStore();

  const navItems: { id: AppView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: t('nav.home'), icon: Home },
    { id: 'daily', label: t('nav.daily'), icon: Clock },
    { id: 'monthly', label: t('nav.monthly'), icon: Calendar },
    { id: 'locations', label: t('nav.locations'), icon: MapPin },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-sand-300 shadow-lg pb-safe"
      aria-label="Main Navigation"
    >
      <div className="max-w-2xl mx-auto flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-2 min-h-touch min-w-touch transition-colors select-none ${
                isActive
                  ? 'text-emerald-DEFAULT font-semibold'
                  : 'text-navy-400 hover:text-navy-700'
              }`}
              aria-selected={isActive}
              role="tab"
            >
              <Icon
                className={`w-5 h-5 mb-0.5 transition-transform ${
                  isActive ? 'scale-110 text-emerald-DEFAULT' : 'text-navy-400'
                }`}
              />
              <span className="text-[11px] tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-DEFAULT mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
