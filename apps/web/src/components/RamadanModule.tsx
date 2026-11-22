import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore.js';
import {
  computeRamadanDay,
  getFastingCountdownState,
  getRamadanMonthTimetable,
  formatPrayerTime,
  type FastingCountdownState,
} from '@kerala-athaan/engine';
import {
  Moon,
  Clock,
  Printer,
  Info,
  Utensils,
  Sunrise,
  Sunset,
  Calendar,
} from 'lucide-react';

export const RamadanModule: React.FC = () => {
  const { t } = useTranslation();
  const {
    activeLocation,
    calcProfile,
    currentDate,
    selectedMosque,
    roundingPolicy,
    getHijriContext,
  } = useAppStore();

  const hijriContext = getHijriContext();
  const mosqueSehriCutoff = selectedMosque?.sehriCutoffMinutes;

  // 1. Compute today and tomorrow's Ramadan metrics
  const todayRamadan = useMemo(() => {
    return computeRamadanDay({
      location: activeLocation,
      date: currentDate,
      profile: calcProfile,
      hijriContext,
      mosqueSehriCutoffMinutes: mosqueSehriCutoff,
    });
  }, [activeLocation, currentDate, calcProfile, hijriContext, mosqueSehriCutoff]);

  const tomorrowDate = useMemo(() => {
    const d = new Date(currentDate.year, currentDate.month - 1, currentDate.day + 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }, [currentDate]);

  const tomorrowRamadan = useMemo(() => {
    return computeRamadanDay({
      location: activeLocation,
      date: tomorrowDate,
      profile: calcProfile,
      hijriContext,
      mosqueSehriCutoffMinutes: mosqueSehriCutoff,
    });
  }, [activeLocation, tomorrowDate, calcProfile, hijriContext, mosqueSehriCutoff]);

  // 2. Live Fasting Countdown
  const [countdown, setCountdown] = useState<FastingCountdownState>(() =>
    getFastingCountdownState({
      now: new Date(),
      todayImsak: todayRamadan.imsakTime,
      todayMaghrib: todayRamadan.maghribTime,
      tomorrowImsak: tomorrowRamadan.imsakTime,
      isSeparateSehriCutoff: todayRamadan.isSeparateSehriCutoff,
    }),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(
        getFastingCountdownState({
          now: new Date(),
          todayImsak: todayRamadan.imsakTime,
          todayMaghrib: todayRamadan.maghribTime,
          tomorrowImsak: tomorrowRamadan.imsakTime,
          isSeparateSehriCutoff: todayRamadan.isSeparateSehriCutoff,
        }),
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [todayRamadan, tomorrowRamadan]);

  // 3. 30-Day Ramadan Timetable
  const timetable = useMemo(() => {
    return getRamadanMonthTimetable({
      location: activeLocation,
      profile: calcProfile,
      hijriYear: todayRamadan.hijri.year,
      hijriContext,
      mosqueSehriCutoffMinutes: mosqueSehriCutoff,
    });
  }, [activeLocation, calcProfile, todayRamadan.hijri.year, hijriContext, mosqueSehriCutoff]);

  const fastingDurationHours = Math.floor(todayRamadan.fastingDurationMs / (1000 * 3600));
  const fastingDurationMins = Math.floor(
    (todayRamadan.fastingDurationMs % (1000 * 3600)) / (1000 * 60),
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Fasting Countdown Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-navy-950 text-white p-5 shadow-md">
        <div className="relative z-10 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-gold-400" />
              <span className="font-extrabold text-sm uppercase tracking-wide text-sand-200">
                {t('ramadan.fastingCountdownTitle')}
              </span>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                countdown.state === 'fasting'
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                  : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
              }`}
            >
              {countdown.state === 'fasting'
                ? t('ramadan.fastingNow')
                : t('ramadan.eatingAllowed')}
            </span>
          </div>

          <div className="text-center py-2">
            <div className="text-xs text-sand-300 font-medium mb-1">
              {countdown.state === 'fasting'
                ? t('ramadan.timeRemainingUntilIftar')
                : t('ramadan.timeRemainingUntilSehri')}
            </div>
            <div className="text-4xl md:text-5xl font-black font-mono tracking-tight text-white drop-shadow-sm">
              {countdown.formattedTime}
            </div>
          </div>

          {/* Today's Key Timings Row */}
          <div className="grid grid-cols-3 gap-2 border-t border-emerald-700/50 pt-3 text-center">
            <div className="bg-emerald-950/40 p-2 rounded-2xl border border-emerald-600/30">
              <div className="flex items-center justify-center gap-1 text-[11px] text-sand-300">
                <Utensils className="w-3.5 h-3.5" />
                <span>{t('ramadan.sehriCutoff')}</span>
              </div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">
                {formatPrayerTime(todayRamadan.imsakTime, activeLocation.tz, roundingPolicy)}
              </div>
            </div>

            <div className="bg-emerald-950/40 p-2 rounded-2xl border border-emerald-600/30">
              <div className="flex items-center justify-center gap-1 text-[11px] text-sand-300">
                <Sunrise className="w-3.5 h-3.5" />
                <span>{t('ramadan.fajrPrayer')}</span>
              </div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">
                {formatPrayerTime(todayRamadan.fajrTime, activeLocation.tz, roundingPolicy)}
              </div>
            </div>

            <div className="bg-emerald-950/40 p-2 rounded-2xl border border-emerald-600/30">
              <div className="flex items-center justify-center gap-1 text-[11px] text-sand-300">
                <Sunset className="w-3.5 h-3.5" />
                <span>{t('ramadan.maghribIftar')}</span>
              </div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">
                {formatPrayerTime(todayRamadan.maghribTime, activeLocation.tz, roundingPolicy)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mosque Sehri Cutoff Transparency Notice */}
      {todayRamadan.isSeparateSehriCutoff ? (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-navy-900 shadow-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-800 shrink-0" />
            <div>
              <span className="font-bold">
                {t('ramadan.mosqueSehriCutoff', { minutes: todayRamadan.sehriCutoffMinutes })}
              </span>
              <div className="text-[11px] text-navy-600">
                Preferred Mosque: {selectedMosque?.nameEn} ({selectedMosque?.locality})
              </div>
            </div>
          </div>
          <span className="font-mono font-bold text-emerald-900 bg-white px-2 py-1 rounded-lg border border-emerald-300">
            {formatPrayerTime(todayRamadan.imsakTime, activeLocation.tz, roundingPolicy)}
          </span>
        </div>
      ) : (
        <div className="p-3 bg-sand-100 border border-sand-300 rounded-2xl text-xs text-navy-700 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-800 shrink-0" />
          <span>
            Standard Imsak cutoff aligns with astronomical Fajr prayer time (05:00 buffer). Select a preferred mosque to apply its published Sehri cutoff.
          </span>
        </div>
      )}

      {/* Mandatory Honesty Notice (NON-NEGOTIABLE) */}
      <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 flex items-center gap-2">
        <Info className="w-4 h-4 text-amber-700 shrink-0" />
        <span className="font-semibold">{t('ramadan.subjectToSightingNotice')}</span>
      </div>

      {/* Fasting Duration Summary Card */}
      <div className="bg-white border border-sand-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <div className="font-bold text-xs text-navy-900 uppercase tracking-wider">
            {t('ramadan.fastingDuration')}
          </div>
          <div className="text-base font-extrabold text-navy-900 mt-0.5">
            {fastingDurationHours} hours {fastingDurationMins} minutes
          </div>
          <div className="text-[11px] text-navy-500">
            Calculated from Sehri End ({formatPrayerTime(todayRamadan.imsakTime, activeLocation.tz, roundingPolicy)}) to Maghrib ({formatPrayerTime(todayRamadan.maghribTime, activeLocation.tz, roundingPolicy)})
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="print:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-DEFAULT hover:bg-emerald-600 text-white text-xs font-bold shadow-xs min-h-touch transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>{t('ramadan.printA4')}</span>
        </button>
      </div>

      {/* 30-Day Ramadan Timetable */}
      <div className="bg-white border border-sand-200 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-sand-200 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-800" />
            <h3 className="font-bold text-sm text-navy-900">
              {t('ramadan.printableTimetable')} ({timetable.hijriYear} AH)
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            {timetable.lengthDays} Days {timetable.isProvisional ? '(Provisional)' : '(Verified)'}
          </span>
        </div>

        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-sand-100 text-navy-800 border-b border-sand-300">
                <th className="py-2.5 px-2 font-bold">{t('ramadan.ramadanDay')}</th>
                <th className="py-2.5 px-2 font-bold">{t('ramadan.gregorianDate')}</th>
                <th className="py-2.5 px-2 font-bold text-emerald-900 bg-emerald-50/70">
                  {t('ramadan.sehriCutoff')}
                </th>
                <th className="py-2.5 px-2 font-bold">{t('prayers.fajr')}</th>
                <th className="py-2.5 px-2 font-bold">{t('prayers.sunrise')}</th>
                <th className="py-2.5 px-2 font-bold">{t('prayers.dhuhr')}</th>
                <th className="py-2.5 px-2 font-bold">{t('prayers.asr')}</th>
                <th className="py-2.5 px-2 font-bold text-emerald-900 bg-emerald-50/70">
                  {t('ramadan.maghribIftar')}
                </th>
                <th className="py-2.5 px-2 font-bold">{t('prayers.isha')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200">
              {timetable.days.map((d, index) => {
                const isToday =
                  d.date.year === currentDate.year &&
                  d.date.month === currentDate.month &&
                  d.date.day === currentDate.day;

                return (
                  <tr
                    key={index}
                    className={`transition-colors ${
                      isToday ? 'bg-emerald-50/90 font-semibold' : 'hover:bg-sand-50/50'
                    }`}
                  >
                    <td className="py-2 px-2 font-bold text-navy-900">
                      {index + 1}
                      {d.hijri.isProvisional && (
                        <span className="text-[10px] text-amber-700 ml-1 font-normal">
                          (29/30?)
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2 font-mono text-[11px] text-navy-700 whitespace-nowrap">
                      {d.date.year}-{String(d.date.month).padStart(2, '0')}-
                      {String(d.date.day).padStart(2, '0')}
                    </td>
                    <td className="py-2 px-2 font-mono font-bold text-emerald-950 bg-emerald-50/40">
                      {formatPrayerTime(d.imsakTime, activeLocation.tz, roundingPolicy)}
                    </td>
                    <td className="py-2 px-2 font-mono text-navy-800">
                      {formatPrayerTime(d.fajrTime, activeLocation.tz, roundingPolicy)}
                    </td>
                    <td className="py-2 px-2 font-mono text-navy-500">
                      {formatPrayerTime(d.sunriseTime, activeLocation.tz, roundingPolicy)}
                    </td>
                    <td className="py-2 px-2 font-mono text-navy-800">
                      {formatPrayerTime(d.dhuhrTime, activeLocation.tz, roundingPolicy)}
                    </td>
                    <td className="py-2 px-2 font-mono text-navy-800">
                      {formatPrayerTime(d.asrTime, activeLocation.tz, roundingPolicy)}
                    </td>
                    <td className="py-2 px-2 font-mono font-bold text-emerald-950 bg-emerald-50/40">
                      {formatPrayerTime(d.maghribTime, activeLocation.tz, roundingPolicy)}
                    </td>
                    <td className="py-2 px-2 font-mono text-navy-800">
                      {formatPrayerTime(d.ishaTime, activeLocation.tz, roundingPolicy)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
