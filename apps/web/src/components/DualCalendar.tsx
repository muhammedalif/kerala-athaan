import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore.js';
import {
  getGregorianMonthCalendar,
  getHijriMonthCalendar,
  HIJRI_MONTH_NAMES_EN,
  HIJRI_MONTH_NAMES_ML,
  formatIsoDate,
  type CalendarDayInfo,
} from '@kerala-athaan/engine';
import {
  ChevronLeft,
  ChevronRight,
  Sliders,
  Calendar as CalendarIcon,
  Moon,
  Info,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge.js';
import { HijriAdjustmentsModal } from './HijriAdjustmentsModal.js';

export type CalendarMode = 'combined' | 'hijri_first' | 'gregorian_first';

export const DualCalendar: React.FC = () => {
  const { t } = useTranslation();
  const {
    currentDate,
    language,
    getHijriContext,
    addUserHijriOverride,
  } = useAppStore();

  const [mode, setMode] = useState<CalendarMode>('combined');
  const [selectedGregorianYear, setSelectedGregorianYear] = useState<number>(currentDate.year);
  const [selectedGregorianMonth, setSelectedGregorianMonth] = useState<number>(currentDate.month);
  const [selectedHijriYear, setSelectedHijriYear] = useState<number>(1447);
  const [selectedHijriMonth, setSelectedHijriMonth] = useState<number>(9); // Ramadan default
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [activeCell, setActiveCell] = useState<CalendarDayInfo | null>(null);
  const [overrideHijriMonth, setOverrideHijriMonth] = useState<number>(1);
  const [overrideSavedToast, setOverrideSavedToast] = useState(false);

  const hijriContext = getHijriContext();

  // Weekday abbreviations
  const weekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekdaysMl = ['ഞായർ', 'തിങ്കൾ', 'ചൊവ്വ', 'ബുധൻ', 'വ്യാഴം', 'വെള്ളി', 'ശനി'];
  const weekdays = language === 'ml' ? weekdaysMl : weekdaysEn;

  // Gregorian calendar days
  const gregorianDays = useMemo(() => {
    return getGregorianMonthCalendar(
      selectedGregorianYear,
      selectedGregorianMonth,
      hijriContext,
      currentDate,
    );
  }, [selectedGregorianYear, selectedGregorianMonth, hijriContext, currentDate]);

  // Hijri calendar month data
  const hijriMonthData = useMemo(() => {
    return getHijriMonthCalendar(
      selectedHijriYear,
      selectedHijriMonth,
      hijriContext,
      currentDate,
    );
  }, [selectedHijriYear, selectedHijriMonth, hijriContext, currentDate]);

  const changeGregorianMonth = (delta: number) => {
    let m = selectedGregorianMonth + delta;
    let y = selectedGregorianYear;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setSelectedGregorianMonth(m);
    setSelectedGregorianYear(y);
  };

  const changeHijriMonth = (delta: number) => {
    let m = selectedHijriMonth + delta;
    let y = selectedHijriYear;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setSelectedHijriMonth(m);
    setSelectedHijriYear(y);
  };

  const jumpToToday = () => {
    setSelectedGregorianYear(currentDate.year);
    setSelectedGregorianMonth(currentDate.month);
  };

  const handleSetOverride = async (cell: CalendarDayInfo) => {
    const isoDate = formatIsoDate(cell.gregorianDate);
    await addUserHijriOverride({
      hijriYear: cell.hijri.year,
      hijriMonth: overrideHijriMonth,
      gregorianStartDate: isoDate,
      offsetDays: 0,
      updatedAt: new Date().toISOString(),
    });
    setOverrideSavedToast(true);
    setTimeout(() => setOverrideSavedToast(false), 3000);
  };

  const gregorianMonthNamesEn = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const gregorianMonthNamesMl = [
    '', 'ജനുവരി', 'ഫെബ്രുവരി', 'മാർച്ച്', 'ഏപ്രിൽ', 'മേയ്', 'ജൂൺ',
    'ജൂലൈ', 'ഓഗസ്റ്റ്', 'സെപ്റ്റംബർ', 'ഒക്ടോബർ', 'നവംബർ', 'ഡിസംബർ',
  ];

  return (
    <div className="space-y-4">
      {/* Top View Mode & Adjustments Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-sand-200/80 rounded-2xl">
        <div className="flex bg-white/80 p-0.5 rounded-xl border border-sand-300 shadow-xs">
          <button
            onClick={() => setMode('combined')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-touch ${
              mode === 'combined'
                ? 'bg-emerald-DEFAULT text-white shadow-xs'
                : 'text-navy-700 hover:text-navy-950'
            }`}
          >
            {t('calendar.viewCombined')}
          </button>
          <button
            onClick={() => setMode('hijri_first')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-touch ${
              mode === 'hijri_first'
                ? 'bg-emerald-DEFAULT text-white shadow-xs'
                : 'text-navy-700 hover:text-navy-950'
            }`}
          >
            {t('calendar.viewHijri')}
          </button>
          <button
            onClick={() => setMode('gregorian_first')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-touch ${
              mode === 'gregorian_first'
                ? 'bg-emerald-DEFAULT text-white shadow-xs'
                : 'text-navy-700 hover:text-navy-950'
            }`}
          >
            {t('calendar.viewGregorian')}
          </button>
        </div>

        <button
          onClick={() => setIsAdjustModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-sand-300 text-xs font-bold text-navy-800 hover:bg-sand-50 transition-all shadow-xs min-h-touch"
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-800" />
          <span>{t('calendar.myAdjustments')}</span>
        </button>
      </div>

      {/* Month Navigation Header */}
      <div className="bg-white border border-sand-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <button
          onClick={() => (mode === 'hijri_first' ? changeHijriMonth(-1) : changeGregorianMonth(-1))}
          className="w-9 h-9 rounded-xl bg-sand-100 hover:bg-sand-200 text-navy-800 flex items-center justify-center min-h-touch min-w-touch transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          {mode === 'hijri_first' ? (
            <div>
              <div className="font-extrabold text-base text-navy-900 flex items-center justify-center gap-1.5">
                <Moon className="w-4 h-4 text-emerald-800" />
                <span>
                  {language === 'ml' ? hijriMonthData.monthNameMl : hijriMonthData.monthNameEn}{' '}
                  {hijriMonthData.hijriYear} AH
                </span>
              </div>
              <div className="text-xs text-navy-500 mt-0.5">
                Starts {hijriMonthData.gregorianStartDate.year}-
                {String(hijriMonthData.gregorianStartDate.month).padStart(2, '0')}-
                {String(hijriMonthData.gregorianStartDate.day).padStart(2, '0')} (
                {hijriMonthData.lengthDays} days
                {hijriMonthData.isProvisional ? ' - provisional' : ''})
              </div>
            </div>
          ) : (
            <div>
              <div className="font-extrabold text-base text-navy-900 flex items-center justify-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-emerald-800" />
                <span>
                  {language === 'ml'
                    ? gregorianMonthNamesMl[selectedGregorianMonth]
                    : gregorianMonthNamesEn[selectedGregorianMonth]}{' '}
                  {selectedGregorianYear}
                </span>
              </div>
              <button
                onClick={jumpToToday}
                className="text-[11px] font-semibold text-emerald-800 hover:underline mt-0.5"
              >
                Today
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => (mode === 'hijri_first' ? changeHijriMonth(1) : changeGregorianMonth(1))}
          className="w-9 h-9 rounded-xl bg-sand-100 hover:bg-sand-200 text-navy-800 flex items-center justify-center min-h-touch min-w-touch transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-sand-200 rounded-3xl p-3 shadow-sm">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-navy-500 pb-2 border-b border-sand-200">
          {weekdays.map((w, idx) => (
            <div key={idx} className={idx === 5 ? 'text-emerald-800 font-extrabold' : ''}>
              {w}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 gap-1 pt-2">
          {mode === 'hijri_first'
            ? hijriMonthData.days.map((cell, idx) => {
                const isSelected =
                  activeCell?.gregorianDate.day === cell.gregorianDate.day &&
                  activeCell?.gregorianDate.month === cell.gregorianDate.month;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveCell(cell)}
                    className={`p-1.5 rounded-2xl border text-center cursor-pointer min-h-[72px] flex flex-col justify-between transition-all ${
                      cell.isToday
                        ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-500'
                        : isSelected
                          ? 'border-navy-800 bg-sand-100'
                          : 'border-sand-200/80 bg-sand-50/30 hover:bg-sand-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-extrabold text-sm text-navy-900 font-mono">
                        {cell.hijri.day}
                      </span>
                      <span className="text-[10px] text-navy-400 font-mono">
                        {cell.gregorianDate.day}
                      </span>
                    </div>

                    {cell.event && (
                      <div className="w-full truncate text-[9px] font-bold text-emerald-800 bg-emerald-100/80 px-1 py-0.5 rounded-md mt-0.5">
                        {language === 'ml' ? cell.event.nameMl : cell.event.nameEn}
                      </div>
                    )}

                    <div className="flex items-center justify-between w-full pt-1">
                      <ProvenanceBadge type={cell.hijri.provenance} size="sm" />
                      {cell.hijri.isProvisional && (
                        <span
                          className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1 rounded-sm"
                          title="Pending moon sighting (29/30)"
                        >
                          29/30?
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            : gregorianDays.map((cell, idx) => {
                const isSelected =
                  activeCell?.gregorianDate.day === cell.gregorianDate.day &&
                  activeCell?.gregorianDate.month === cell.gregorianDate.month;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveCell(cell)}
                    className={`p-1.5 rounded-2xl border text-center cursor-pointer min-h-[72px] flex flex-col justify-between transition-all ${
                      !cell.isCurrentMonth
                        ? 'opacity-40 bg-sand-50/20 border-transparent'
                        : cell.isToday
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-500'
                          : isSelected
                            ? 'border-navy-800 bg-sand-100'
                            : 'border-sand-200/80 bg-white hover:bg-sand-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-extrabold text-sm text-navy-900 font-mono">
                        {cell.gregorianDate.day}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800">
                        {cell.hijri.day}
                      </span>
                    </div>

                    {cell.event ? (
                      <div className="w-full truncate text-[9px] font-bold text-emerald-800 bg-emerald-100/80 px-1 py-0.5 rounded-md mt-0.5">
                        {language === 'ml' ? cell.event.nameMl : cell.event.nameEn}
                      </div>
                    ) : (
                      <div className="text-[9px] text-navy-500 truncate">
                        {language === 'ml' ? cell.hijri.monthNameMl : cell.hijri.monthNameEn}
                      </div>
                    )}

                    <div className="flex items-center justify-between w-full pt-1">
                      <ProvenanceBadge type={cell.hijri.provenance} size="sm" />
                      {cell.hijri.isProvisional && (
                        <span
                          className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1 rounded-sm"
                          title="Pending moon sighting (29/30)"
                        >
                          29/30?
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

      {/* Date Detail & User Override Action Card */}
      {activeCell && (
        <div className="p-4 bg-white border border-sand-300 rounded-3xl shadow-sm space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-800" />
              <h4 className="font-bold text-sm text-navy-900">
                {activeCell.gregorianDate.year}-
                {String(activeCell.gregorianDate.month).padStart(2, '0')}-
                {String(activeCell.gregorianDate.day).padStart(2, '0')}
              </h4>
            </div>
            <ProvenanceBadge type={activeCell.hijri.provenance} />
          </div>

          <div className="p-3 bg-sand-50 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-navy-900">
                {activeCell.hijri.day}{' '}
                {language === 'ml'
                  ? activeCell.hijri.monthNameMl
                  : activeCell.hijri.monthNameEn}{' '}
                {activeCell.hijri.year} AH
              </div>
              <div className="text-[11px] text-navy-500 mt-0.5">
                {activeCell.hijri.sourceNote ?? 'Resolved via precedence chain'}
              </div>
            </div>

            {activeCell.hijri.isProvisional && (
              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                Pending Sighting
              </span>
            )}
          </div>

          {activeCell.event && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-950 flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                {language === 'ml' ? activeCell.event.nameMl : activeCell.event.nameEn}
                {activeCell.event.isSubjectToSighting && ' (മാസപ്പിറവിക്ക് വിധേയം)'}
              </span>
            </div>
          )}

          {/* Set as 1st of Month Control */}
          <div className="border-t border-sand-200 pt-3 space-y-2">
            <div className="font-bold text-xs text-navy-900">
              {t('calendar.markAsFirst')}
            </div>
            <p className="text-[11px] text-navy-600">
              {t('calendar.markAsFirstDesc')}
            </p>

            <div className="flex items-center gap-2">
              <select
                value={overrideHijriMonth}
                onChange={(e) => setOverrideHijriMonth(parseInt(e.target.value, 10))}
                className="flex-1 p-2 bg-sand-50 border border-sand-300 rounded-xl text-xs font-semibold text-navy-900 min-h-touch"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    1 {language === 'ml' ? HIJRI_MONTH_NAMES_ML[m] : HIJRI_MONTH_NAMES_EN[m]}
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleSetOverride(activeCell)}
                className="px-4 py-2 bg-emerald-DEFAULT hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs min-h-touch transition-colors"
              >
                {t('calendar.saveOverride')}
              </button>
            </div>

            {overrideSavedToast && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold mt-1">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
                <span>Adjustment saved and recomputed across calendars!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Adjustments Modal */}
      <HijriAdjustmentsModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
      />
    </div>
  );
};
