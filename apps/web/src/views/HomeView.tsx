import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  computeDay,
  resolveHijriDate,
  formatPrayerTime,
  resolveMosqueDay,
  checkDeviceTzMatch,
  type PrayerTimeResult,
} from '@kerala-athaan/engine';
import { useAppStore } from '../store/useAppStore.js';
import { CountdownTimer } from '../components/CountdownTimer.js';
import { PrayerRow } from '../components/PrayerRow.js';
import { Moon, Calendar, Info, AlertCircle } from 'lucide-react';
import { ProvenanceBadge } from '../components/ProvenanceBadge.js';

export const HomeView: React.FC = () => {
  const { t } = useTranslation();
  const {
    activeLocation,
    calcProfile,
    currentDate,
    roundingPolicy,
    language,
    preferredMosqueName,
    mosqueMode,
    selectedMosque,
    currentTimetableRow,
    setActiveView,
    getHijriContext,
  } = useAppStore();

  // Resolve today's prayer times (astronomical, verified mosque row, or mosque-adjusted)
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

  // Determine current & next prayer
  const { upcomingPrayer, upcomingInstant } = useMemo(() => {
    const nowMs = Date.now();
    let next: PrayerTimeResult | null = null;

    for (const p of prayerTimes) {
      if (p.time.getTime() > nowMs) {
        next = p;
        break;
      }
    }

    if (!next) {
      // All prayers today have passed -> tomorrow's Fajr
      const tomorrowDate = {
        year: currentDate.year,
        month: currentDate.month,
        day: currentDate.day + 1,
      };
      const tomorrowTimes = computeDay(activeLocation, tomorrowDate, calcProfile);
      const tomorrowFajr = tomorrowTimes.find((p) => p.prayer === 'fajr')!;
      return { upcomingPrayer: tomorrowFajr, upcomingInstant: tomorrowFajr.time };
    }

    return { upcomingPrayer: next, upcomingInstant: next.time };
  }, [prayerTimes, activeLocation, currentDate, calcProfile]);

  const hijri = resolveHijriDate(currentDate, getHijriContext());

  // Check client device timezone against location timezone (+05:30 IST)
  const tzCheck = useMemo(() => {
    return checkDeviceTzMatch(activeLocation.tz);
  }, [activeLocation.tz]);

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* Device Timezone Mismatch Warning (Mandatory Rule) */}
      {!tzCheck.matches && (
        <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 shadow-xs">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-900">Time Zone Notice</div>
            <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
              {t('warnings.deviceTzMismatch')}
            </p>
          </div>
        </div>
      )}

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-navy-900 text-white p-5 shadow-md">
        {/* Subtle geometric pattern overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'><g fill='none' stroke='%23FAF7F0' stroke-width='0.75'><rect x='10' y='10' width='20' height='20'/><rect x='10' y='10' width='20' height='20' transform='rotate(45 20 20)'/></g></svg>")`,
          }}
        />

        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-sand-300">
                {t('home.nextPrayer')}
              </span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mt-0.5">
                {t(`prayers.${upcomingPrayer.prayer}`)}
              </h2>
              <span className="text-sm font-medium text-emerald-200">
                {formatPrayerTime(upcomingPrayer.time, activeLocation.tz, roundingPolicy)}
              </span>
            </div>

            <div className="text-right">
              <CountdownTimer targetDate={upcomingInstant} />
            </div>
          </div>

          {/* Date & Hijri Badge Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-emerald-600/40 pt-3 text-xs text-sand-200">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sand-300" />
              <span>
                {currentDate.year}-{String(currentDate.month).padStart(2, '0')}-
                {String(currentDate.day).padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-gold-400" />
              <span>
                {hijri.day} {language === 'ml' ? hijri.monthNameMl : hijri.monthNameEn}{' '}
                {hijri.year} AH
              </span>
              <ProvenanceBadge type={hijri.provenance} size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Ramadan / Moon Sighting Notice (Mandatory honesty text) */}
      <div className="flex items-center gap-2 p-3 bg-sand-100 border border-sand-300 rounded-xl text-xs text-navy-800">
        <Info className="w-4 h-4 text-emerald-700 shrink-0" />
        <span className="leading-snug">
          {hijri.provenance === 'sighting-confirmed' && hijri.sourceNote
            ? `Sighting Confirmed: ${hijri.sourceNote}`
            : t('home.ramadanSubjectToSighting')}
        </span>
      </div>

      {/* Fallback Badge/Notice if Mosque Timetable row is missing */}
      {resolved.isFallback && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 shadow-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="leading-snug">{t('mosques.fallbackNotice')}</span>
        </div>
      )}

      {/* Preferred Mosque or Calculation Method Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-navy-800 tracking-tight">
          {preferredMosqueName
            ? `${t('home.preferredMosque')}: ${preferredMosqueName}`
            : t('home.astronomical')}
        </h3>
        <button
          onClick={() => setActiveView('settings')}
          className="text-xs text-emerald-700 hover:text-emerald-800 font-medium min-h-[36px] flex items-center"
        >
          {calcProfile.name.split('(')[0]?.trim()}
        </button>
      </div>

      {/* Daily Prayer List */}
      <div className="space-y-2">
        {prayerTimes.map((result) => (
          <PrayerRow
            key={result.prayer}
            result={result}
            isUpcoming={result.prayer === upcomingPrayer.prayer}
            timezone={activeLocation.tz}
            roundingPolicy={roundingPolicy}
          />
        ))}
      </div>

      {/* Footer Provenance Note */}
      <div className="p-3 bg-white border border-sand-200 rounded-xl text-xs text-navy-600 space-y-1">
        <div className="font-semibold text-navy-800 flex items-center justify-between">
          <span>{calcProfile.name}</span>
          <span className="text-[10px] bg-sand-200 text-navy-700 px-1.5 py-0.5 rounded">
            {calcProfile.asrMadhhab === 'shafii' ? 'Shafi\'i Asr' : 'Hanafi Asr'}
          </span>
        </div>
        <p className="text-[11px] text-navy-500">
          {calcProfile.sourceCitation}
        </p>
      </div>
    </div>
  );
};
