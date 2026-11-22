import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  computeDay,
  formatPrayerTime,
  resolveHijriDate,
  type LocalDate,
} from '@kerala-athaan/engine';
import { useAppStore } from '../store/useAppStore.js';
import { Printer, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Moon, Clock } from 'lucide-react';
import { DualCalendar } from '../components/DualCalendar.js';
import { RamadanModule } from '../components/RamadanModule.js';

export const MonthlyView: React.FC = () => {
  const { t } = useTranslation();
  const {
    activeLocation,
    calcProfile,
    currentDate,
    roundingPolicy,
    language,
    getHijriContext,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'timetable' | 'dual_calendar' | 'ramadan'>('timetable');
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.month);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.year);

  const hijriContext = getHijriContext();

  // Generate all days for selected year & month
  const monthDays = useMemo(() => {
    // Days in month
    const totalDays = new Date(selectedYear, selectedMonth, 0).getDate();
    const days: {
      date: LocalDate;
      fajr: string;
      sunrise: string;
      dhuhr: string;
      asr: string;
      maghrib: string;
      isha: string;
      hijriDay: number;
      hijriMonthName: string;
      provenance: string;
    }[] = [];

    for (let day = 1; day <= totalDays; day++) {
      const locDate: LocalDate = { year: selectedYear, month: selectedMonth, day };
      const times = computeDay(activeLocation, locDate, calcProfile);
      const hijri = resolveHijriDate(locDate, hijriContext);

      const getTime = (pName: string) => {
        const found = times.find((p) => p.prayer === pName);
        return found ? formatPrayerTime(found.time, activeLocation.tz, roundingPolicy) : '--:--';
      };

      days.push({
        date: locDate,
        fajr: getTime('fajr'),
        sunrise: getTime('sunrise'),
        dhuhr: getTime('dhuhr'),
        asr: getTime('asr'),
        maghrib: getTime('maghrib'),
        isha: getTime('isha'),
        hijriDay: hijri.day,
        hijriMonthName: language === 'ml' ? hijri.monthNameMl : hijri.monthNameEn,
        provenance: hijri.provenance,
      });
    }

    return days;
  }, [selectedYear, selectedMonth, activeLocation, calcProfile, roundingPolicy, language, hijriContext]);

  const changeMonth = (delta: number) => {
    let nextM = selectedMonth + delta;
    let nextY = selectedYear;
    if (nextM < 1) {
      nextM = 12;
      nextY -= 1;
    } else if (nextM > 12) {
      nextM = 1;
      nextY += 1;
    }
    setSelectedMonth(nextM);
    setSelectedYear(nextY);
  };

  const handlePrint = () => {
    window.print();
  };

  const monthNamesEn = [
    '',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* Sub-tab Navigation (Hidden in Print) */}
      <div className="print:hidden flex bg-sand-200/80 p-1 rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all min-h-touch ${
            activeTab === 'timetable'
              ? 'bg-white text-navy-900 shadow-sm'
              : 'text-navy-600 hover:text-navy-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-emerald-800" />
          <span>{t('calendar.timetableTab')}</span>
        </button>

        <button
          onClick={() => setActiveTab('dual_calendar')}
          className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all min-h-touch ${
            activeTab === 'dual_calendar'
              ? 'bg-white text-navy-900 shadow-sm'
              : 'text-navy-600 hover:text-navy-900'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5 text-emerald-800" />
          <span>{t('calendar.dualCalendarTab')}</span>
        </button>

        <button
          onClick={() => setActiveTab('ramadan')}
          className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all min-h-touch ${
            activeTab === 'ramadan'
              ? 'bg-white text-navy-900 shadow-sm'
              : 'text-navy-600 hover:text-navy-900'
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-emerald-800" />
          <span>{t('calendar.ramadanTab')}</span>
        </button>
      </div>

      {activeTab === 'dual_calendar' && <DualCalendar />}

      {activeTab === 'ramadan' && <RamadanModule />}

      {activeTab === 'timetable' && (
        <>
          {/* Month Navigation & Print Control (Hidden in print) */}
          <div className="print:hidden flex items-center justify-between p-3 bg-white border border-sand-200 rounded-2xl shadow-sm">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 text-navy-600 hover:text-navy-900 rounded-lg min-h-touch min-w-touch flex items-center justify-center transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h2 className="font-bold text-base text-navy-900">
                {monthNamesEn[selectedMonth]} {selectedYear}
              </h2>
              <span className="text-xs text-navy-500 font-medium">
                {activeLocation.name}
              </span>
            </div>

            <button
              onClick={() => changeMonth(1)}
              className="p-2 text-navy-600 hover:text-navy-900 rounded-lg min-h-touch min-w-touch flex items-center justify-center transition-colors"
              aria-label="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Print Action Button */}
          <div className="print:hidden flex justify-end">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-DEFAULT hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm min-h-touch transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{t('monthly.printButton')}</span>
            </button>
          </div>

          {/* Printable Timetable Document */}
          <div className="bg-white border border-sand-200 rounded-2xl shadow-sm overflow-hidden print:border-none print:shadow-none">
            {/* Header visible when printed */}
            <div className="p-4 border-b border-sand-200 bg-sand-50/50 print:bg-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold text-navy-900">{t('monthly.title')}</h1>
                  <p className="text-xs text-navy-600">
                    {activeLocation.name} ({activeLocation.lat.toFixed(4)}° N, {activeLocation.lon.toFixed(4)}° E)
                  </p>
                </div>
                <div className="text-right text-xs text-navy-600">
                  <div className="font-semibold">{monthNamesEn[selectedMonth]} {selectedYear}</div>
                  <div className="text-[10px] text-navy-500">Method: {calcProfile.name.split('(')[0]?.trim()}</div>
                </div>
              </div>
            </div>

            {/* Calendar Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-sand-100 text-navy-800 uppercase font-semibold text-[10px] tracking-wider border-b border-sand-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-2">Hijri</th>
                    <th className="py-2.5 px-2">{t('prayers.fajr')}</th>
                    <th className="py-2.5 px-2">{t('prayers.sunrise')}</th>
                    <th className="py-2.5 px-2">{t('prayers.dhuhr')}</th>
                    <th className="py-2.5 px-2">{t('prayers.asr')}</th>
                    <th className="py-2.5 px-2">{t('prayers.maghrib')}</th>
                    <th className="py-2.5 px-2">{t('prayers.isha')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200">
                  {monthDays.map((row) => {
                    const isToday =
                      row.date.year === currentDate.year &&
                      row.date.month === currentDate.month &&
                      row.date.day === currentDate.day;

                    return (
                      <tr
                        key={row.date.day}
                        className={`transition-colors ${
                          isToday
                            ? 'bg-emerald-50 font-semibold text-emerald-950'
                            : 'hover:bg-sand-50'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono font-medium">
                          {String(row.date.day).padStart(2, '0')}{' '}
                          <span className="text-[10px] text-navy-500">
                            {new Date(row.date.year, row.date.month - 1, row.date.day).toLocaleDateString(
                              language === 'ml' ? 'ml-IN' : 'en-US',
                              { weekday: 'short' }
                            )}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-navy-600 text-[11px] whitespace-nowrap">
                          {row.hijriDay} {row.hijriMonthName}
                        </td>
                        <td className="py-2.5 px-2 font-mono">{row.fajr}</td>
                        <td className="py-2.5 px-2 font-mono text-navy-500">{row.sunrise}</td>
                        <td className="py-2.5 px-2 font-mono">{row.dhuhr}</td>
                        <td className="py-2.5 px-2 font-mono">{row.asr}</td>
                        <td className="py-2.5 px-2 font-mono">{row.maghrib}</td>
                        <td className="py-2.5 px-2 font-mono">{row.isha}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Notes for Printouts */}
            <div className="p-3 bg-sand-50 border-t border-sand-200 text-[10px] text-navy-500 flex flex-wrap items-center justify-between gap-2">
              <span>Time Zone: {activeLocation.tz} (UTC+05:30)</span>
              <span>Generated by Kerala Athaan PWA</span>
              <span>Adhan.js Astrometry | Shafi'i Asr</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
