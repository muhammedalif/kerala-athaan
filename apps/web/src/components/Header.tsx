import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Globe, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore.js';
import { resolveHijriDate, checkDeviceTzMatch } from '@kerala-athaan/engine';
import { ProvenanceBadge } from './ProvenanceBadge.js';

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const {
    activeLocation,
    currentDate,
    language,
    setLanguage,
    setActiveView,
  } = useAppStore();

  const hijriDate = resolveHijriDate(currentDate);
  const tzCheck = checkDeviceTzMatch(activeLocation.tz);

  const toggleLanguage = () => {
    setLanguage(language === 'ml' ? 'en' : 'ml');
  };

  return (
    <header className="sticky top-0 z-40 bg-navy-500 text-ivory shadow-md border-b border-navy-600">
      {/* Timezone mismatch alert banner */}
      {!tzCheck.matches && (
        <div className="bg-amber-600 px-3 py-1.5 text-xs text-white flex items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-200" />
            <span>{t('warnings.deviceTzMismatch')}</span>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* App Title & Location Pill */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-lg font-bold tracking-tight text-white">
              {t('appName')}
            </h1>
          </div>

          <button
            onClick={() => setActiveView('locations')}
            className="flex items-center gap-1 text-xs text-sand-300 hover:text-white transition-colors mt-0.5 min-h-[32px] text-left"
            title="Change Location"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-medium truncate max-w-[200px]">{activeLocation.name}</span>
          </button>
        </div>

        {/* Hijri Date & Language Switcher */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:flex flex-col items-end">
            <div className="text-xs font-semibold text-sand-200 flex items-center gap-1.5">
              <span>
                {hijriDate.day} {language === 'ml' ? hijriDate.monthNameMl : hijriDate.monthNameEn}{' '}
                {hijriDate.year} AH
              </span>
              <ProvenanceBadge type={hijriDate.provenance} size="sm" />
            </div>
            {hijriDate.isProvisional && (
              <span className="text-[10px] text-amber-300 font-normal">
                {t('hijri.provisionalNotice')}
              </span>
            )}
          </div>

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-navy-600 hover:bg-navy-700 text-xs font-semibold text-sand-200 border border-navy-400 min-h-touch min-w-touch justify-center transition-colors"
            title="Switch Language (മലയാളം / English)"
            aria-label="Language Toggle"
          >
            <Globe className="w-3.5 h-3.5 text-gold-400" />
            <span>{language === 'ml' ? 'ENG' : 'മല'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
