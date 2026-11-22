import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  formatPrayerTime,
  formatPrayerTimeWithSeconds,
  resolveMosqueDay,
  type LocalDate,
} from '@kerala-athaan/engine';
import { useAppStore } from '../store/useAppStore.js';
import { ProvenanceBadge } from '../components/ProvenanceBadge.js';
import { ChevronLeft, ChevronRight, Clock, Sun, Moon } from 'lucide-react';

export const DailyView: React.FC = () => {
  const { t } = useTranslation();
  const {
    activeLocation,
    calcProfile,
    currentDate,
    setCurrentDate,
    roundingPolicy,
    mosqueMode,
    selectedMosque,
    currentTimetableRow,
  } = useAppStore();

  const resolved = useMemo(() => {
    return resolveMosqueDay({
      mode: mosqueMode,
      location: activeLocation,
      date: currentDate,
      userProfile: calcProfile,
      mosque: selectedMosque,
      timetableRow: currentTimetableRow,
    });
  }, [mosqueMode, activeLocation, currentDate, calcProfile, selectedMosque, currentTimetableRow]);

  const prayerTimes = resolved.times;

  const fajr = prayerTimes.find((p) => p.prayer === 'fajr')!;
  const maghrib = prayerTimes.find((p) => p.prayer === 'maghrib')!;

  // Fasting duration in minutes
  const fastingMinutes = Math.round((maghrib.time.getTime() - fajr.time.getTime()) / 60_000);
  const fastingHours = Math.floor(fastingMinutes / 60);
  const fastingRemainingMins = fastingMinutes % 60;

  const navigateDate = (deltaDays: number) => {
    const current = new Date(currentDate.year, currentDate.month - 1, currentDate.day);
    current.setDate(current.getDate() + deltaDays);
    const newDate: LocalDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate(),
    };
    setCurrentDate(newDate);
  };

  const resetToToday = () => {
    const now = new Date();
    setCurrentDate({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    });
  };

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between p-3 bg-white border border-sand-200 rounded-2xl shadow-sm">
        <button
          onClick={() => navigateDate(-1)}
          className="p-2 text-navy-600 hover:text-navy-900 hover:bg-sand-100 rounded-lg min-h-touch min-w-touch flex items-center justify-center transition-colors"
          aria-label="Previous Day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="font-bold text-base text-navy-900">
            {currentDate.year}-{String(currentDate.month).padStart(2, '0')}-
            {String(currentDate.day).padStart(2, '0')}
          </div>
          <button
            onClick={resetToToday}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Today (ഇന്ന്)
          </button>
        </div>

        <button
          onClick={() => navigateDate(1)}
          className="p-2 text-navy-600 hover:text-navy-900 hover:bg-sand-100 rounded-lg min-h-touch min-w-touch flex items-center justify-center transition-colors"
          aria-label="Next Day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Fasting Card Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mb-1">
            <Moon className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t('home.sehriEnds')}</span>
          </div>
          <div className="font-mono text-xl font-extrabold text-emerald-950">
            {formatPrayerTime(fajr.time, activeLocation.tz, roundingPolicy)}
          </div>
          <span className="text-[10px] text-emerald-700 block mt-0.5">
            Fajr Subh Sadiq
          </span>
        </div>

        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 mb-1">
            <Sun className="w-3.5 h-3.5 text-amber-700" />
            <span>{t('home.iftarStarts')}</span>
          </div>
          <div className="font-mono text-xl font-extrabold text-amber-950">
            {formatPrayerTime(maghrib.time, activeLocation.tz, roundingPolicy)}
          </div>
          <span className="text-[10px] text-amber-700 block mt-0.5">
            {fastingHours}h {fastingRemainingMins}m fast duration
          </span>
        </div>
      </div>

      {/* Detailed Prayer Breakdown Table */}
      <div className="bg-white border border-sand-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-3.5 border-b border-sand-200 bg-sand-50/50">
          <h3 className="font-bold text-sm text-navy-900">{t('daily.title')}</h3>
          <p className="text-xs text-navy-500 mt-0.5">{t('daily.subtitle')}</p>
        </div>

        <div className="divide-y divide-sand-200">
          {prayerTimes.map((r) => {
            const rawTimeStr = formatPrayerTimeWithSeconds(r.baseInstant, activeLocation.tz);
            const finalTimeStr = formatPrayerTime(r.time, activeLocation.tz, roundingPolicy);

            return (
              <div key={r.prayer} className="p-3.5 flex items-center justify-between hover:bg-sand-50/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-navy-900">
                      {t(`prayers.${r.prayer}`)}
                    </span>
                    <ProvenanceBadge type={r.provenance} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-navy-400 mt-0.5 font-mono">
                    <span title="Astronomical raw instant">{rawTimeStr}</span>
                    {r.adjustmentMin !== 0 && (
                      <span className="text-amber-600 font-semibold">
                        {r.adjustmentMin > 0 ? `+${r.adjustmentMin}` : r.adjustmentMin}m
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-lg font-bold text-navy-900">
                    {finalTimeStr}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metadata Info */}
      <div className="p-3 text-xs text-navy-500 flex items-center gap-1.5 justify-center">
        <Clock className="w-3.5 h-3.5 text-navy-400" />
        <span>Time Zone: {activeLocation.tz} (UTC+5:30) • Rounding: {roundingPolicy}</span>
      </div>
    </div>
  );
};
