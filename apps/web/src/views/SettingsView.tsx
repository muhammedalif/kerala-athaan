import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore.js';
import type { CalcMethod, RoundingPolicy, PrayerName } from '@kerala-athaan/engine';
import { Sliders, Compass, AlertCircle, RotateCcw, Mountain, Clock, Bell } from 'lucide-react';
import { NotificationSettings } from '../components/NotificationSettings.js';

export const SettingsView: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'calc' | 'athaan'>('calc');
  const {
    calcProfile,
    updateCalcProfile,
    setPrayerAdjustment,
    language,
    setLanguage,
    roundingPolicy,
    setRoundingPolicy,
  } = useAppStore();

  const methods: { id: CalcMethod; name: string; note: string }[] = [
    {
      id: 'mwl',
      name: 'Muslim World League (MWL)',
      note: t('settings.mwlNotice'),
    },
    {
      id: 'umm-al-qura',
      name: 'Umm al-Qura (Makkah)',
      note: 'Fajr 18.5°, Isha +90m (+120m in Ramadan)',
    },
    {
      id: 'karachi',
      name: 'University of Islamic Sciences, Karachi',
      note: 'Fajr 18.0°, Isha 18.0°',
    },
    {
      id: 'isna',
      name: 'Islamic Society of North America (ISNA)',
      note: 'Fajr 15.0°, Isha 15.0°',
    },
    {
      id: 'egyptian',
      name: 'Egyptian General Authority',
      note: 'Fajr 19.5°, Isha 17.5°',
    },
    {
      id: 'singapore-muis',
      name: 'MUIS Singapore',
      note: 'Fajr 20.0°, Isha 18.0°',
    },
  ];

  const prayers: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

  const resetAdjustments = () => {
    for (const p of prayers) {
      setPrayerAdjustment(p, 0);
    }
  };

  return (
    <div className="space-y-5 pb-24 pt-2">
      {/* Sub-tab Switcher: Calculation Settings vs Athaan & Notifications */}
      <div className="flex bg-sand-200/80 p-1 rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab('calc')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'calc'
              ? 'bg-white text-navy-900 shadow-sm'
              : 'text-navy-600 hover:text-navy-900'
          }`}
        >
          <Sliders className="w-4 h-4 text-emerald-800" />
          <span>{t('settings.title')}</span>
        </button>

        <button
          onClick={() => setActiveTab('athaan')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'athaan'
              ? 'bg-white text-navy-900 shadow-sm'
              : 'text-navy-600 hover:text-navy-900'
          }`}
        >
          <Bell className="w-4 h-4 text-emerald-800" />
          <span>{t('notifications.title')}</span>
        </button>
      </div>

      {activeTab === 'athaan' ? (
        <NotificationSettings />
      ) : (
        <>
          {/* Language Switcher Card */}
          <div className="bg-white border border-sand-200 rounded-2xl shadow-sm p-4 space-y-3">
            <h3 className="font-bold text-sm text-navy-900">{t('settings.languageTitle')}</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLanguage('ml')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center min-h-touch transition-all ${
                  language === 'ml'
                    ? 'bg-emerald-DEFAULT text-white border-emerald-DEFAULT shadow-sm'
                    : 'bg-sand-50 text-navy-800 border-sand-200 hover:bg-sand-100'
                }`}
              >
                മലയാളം (Malayalam)
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center min-h-touch transition-all ${
                  language === 'en'
                    ? 'bg-emerald-DEFAULT text-white border-emerald-DEFAULT shadow-sm'
                    : 'bg-sand-50 text-navy-800 border-sand-200 hover:bg-sand-100'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Calculation Method Selection */}
          <div className="bg-white border border-sand-200 rounded-2xl shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-sm text-navy-900">{t('settings.methodTitle')}</h3>
            </div>

            <div className="space-y-2">
              {methods.map((m) => {
                const isSelected = calcProfile.method === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => updateCalcProfile({ method: m.id, name: m.name })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-sm'
                        : 'bg-sand-50/40 border-sand-200 hover:border-sand-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-navy-900">{m.name}</div>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-sand-400'
                        }`}
                      />
                    </div>
                    <p className="text-[11px] text-navy-600 mt-1 leading-relaxed">{m.note}</p>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-sand-100 border border-sand-200 rounded-xl text-[11px] text-navy-600 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                Kerala-specific organisation calculation standards (e.g. Samastha, KNM) will be added strictly as verified named profiles with published source documentation.
              </span>
            </div>
          </div>

          {/* Asr Madhhab */}
          <div className="bg-white border border-sand-200 rounded-2xl shadow-sm p-4 space-y-3">
            <h3 className="font-bold text-sm text-navy-900">{t('settings.asrTitle')}</h3>

            <div className="grid grid-cols-1 gap-2">
              <div
                onClick={() => updateCalcProfile({ asrMadhhab: 'shafii' })}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  calcProfile.asrMadhhab === 'shafii'
                    ? 'bg-emerald-50/70 border-emerald-500 shadow-sm'
                    : 'bg-sand-50/40 border-sand-200'
                }`}
              >
                <div className="font-bold text-xs text-navy-900">{t('settings.shafii')}</div>
                <div className="text-[11px] text-navy-500 mt-0.5">
                  Shadow length = noon shadow + 1x object height
                </div>
              </div>

              <div
                onClick={() => updateCalcProfile({ asrMadhhab: 'hanafi' })}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  calcProfile.asrMadhhab === 'hanafi'
                    ? 'bg-emerald-50/70 border-emerald-500 shadow-sm'
                    : 'bg-sand-50/40 border-sand-200'
                }`}
              >
                <div className="font-bold text-xs text-navy-900">{t('settings.hanafi')}</div>
                <div className="text-[11px] text-navy-500 mt-0.5">
                  Shadow length = noon shadow + 2x object height
                </div>
              </div>
            </div>
          </div>

          {/* Per-Prayer Adjustments */}
          <div className="bg-white border border-sand-200 rounded-2xl shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-sm text-navy-900">
                  {t('settings.adjustmentsTitle')}
                </h3>
              </div>
              <button
                onClick={resetAdjustments}
                className="flex items-center gap-1 text-[11px] text-navy-500 hover:text-navy-800 font-semibold min-h-touch px-2"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset (0m)</span>
              </button>
            </div>

            <div className="space-y-3 divide-y divide-sand-200">
              {prayers.map((p) => {
                const currentAdj = calcProfile.adjustments[p] ?? 0;
                return (
                  <div key={p} className="pt-2.5 first:pt-0 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-navy-900 capitalize">
                        {t(`prayers.${p}`)}
                      </div>
                      <div className="text-[10px] text-navy-400 font-mono">
                        {currentAdj !== 0 ? `${currentAdj > 0 ? '+' : ''}${currentAdj} min` : '0 min (pure astronomical)'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPrayerAdjustment(p, currentAdj - 1)}
                        className="w-8 h-8 rounded-lg bg-sand-100 hover:bg-sand-200 text-navy-800 font-bold flex items-center justify-center text-sm min-h-touch min-w-touch"
                        aria-label={`Decrease ${p} adjustment`}
                      >
                        -
                      </button>
                      <span className="font-mono text-xs font-bold w-7 text-center">
                        {currentAdj}
                      </span>
                      <button
                        onClick={() => setPrayerAdjustment(p, currentAdj + 1)}
                        className="w-8 h-8 rounded-lg bg-sand-100 hover:bg-sand-200 text-navy-800 font-bold flex items-center justify-center text-sm min-h-touch min-w-touch"
                        aria-label={`Increase ${p} adjustment`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rounding Policy */}
          <div className="bg-white border border-sand-200 rounded-2xl shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-sm text-navy-900">Display Rounding Policy</h3>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['nearest', 'floor', 'ceiling'] as RoundingPolicy[]).map((pol) => {
                const isSel = roundingPolicy === pol;
                return (
                  <button
                    key={pol}
                    onClick={() => setRoundingPolicy(pol)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold capitalize min-h-touch transition-all ${
                      isSel
                        ? 'bg-emerald-DEFAULT text-white border-emerald-DEFAULT shadow-sm'
                        : 'bg-sand-50 text-navy-800 border-sand-200 hover:bg-sand-100'
                    }`}
                  >
                    {pol}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-navy-500">
              • <strong>Nearest</strong>: Standard (rounds at 30s).<br />
              • <strong>Floor</strong>: Truncates seconds.<br />
              • <strong>Ceiling</strong>: Precautionary buffer (Ihtiyat).
            </p>
          </div>

          {/* Elevation Limitation Transparency Card */}
          <div className="bg-white border border-sand-200 rounded-2xl shadow-sm p-4 space-y-2">
            <div className="flex items-center gap-1.5">
              <Mountain className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-sm text-navy-900">{t('settings.elevationTitle')}</h3>
            </div>
            <p className="text-xs text-navy-600 leading-relaxed">
              {t('settings.elevationNotice')}
            </p>
            <div className="text-[11px] font-mono text-navy-400 bg-sand-50 p-2 rounded-lg border border-sand-200">
              Status: Elevation dip unadjusted in baseline engine (sea-level calculation).
            </div>
          </div>
        </>
      )}
    </div>
  );
};
