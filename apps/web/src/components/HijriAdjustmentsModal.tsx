import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore.js';
import {
  HIJRI_MONTH_NAMES_EN,
  HIJRI_MONTH_NAMES_ML,
} from '@kerala-athaan/engine';
import { X, RotateCcw, Sliders, Calendar, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const HijriAdjustmentsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const {
    hijriOverrides,
    removeUserHijriOverride,
    clearUserHijriOverrides,
    hijriGlobalOffset,
    setHijriGlobalOffset,
    language,
  } = useAppStore();

  if (!isOpen) return null;

  const offsets = [-2, -1, 0, 1, 2];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-sand-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-sand-200 bg-sand-50/70">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-800" />
            <h3 className="font-bold text-base text-navy-900">{t('calendar.myAdjustments')}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-sand-200/80 hover:bg-sand-300 flex items-center justify-center text-navy-700 min-h-touch min-w-touch transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Global Offset Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-xs text-navy-900 uppercase tracking-wider">
                {t('calendar.globalOffset')}
              </label>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-sand-100 text-emerald-900">
                {hijriGlobalOffset > 0 ? `+${hijriGlobalOffset}` : hijriGlobalOffset} days
              </span>
            </div>
            <p className="text-xs text-navy-600 leading-relaxed">
              Shift the baseline Hijri calendar uniformly by ±1 or ±2 days if your regional sighting differs.
            </p>

            <div className="grid grid-cols-5 gap-1.5">
              {offsets.map((off) => {
                const isSelected = hijriGlobalOffset === off;
                return (
                  <button
                    key={off}
                    onClick={() => setHijriGlobalOffset(off)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all min-h-touch ${
                      isSelected
                        ? 'bg-emerald-DEFAULT text-white shadow-sm'
                        : 'bg-sand-100 text-navy-800 hover:bg-sand-200'
                    }`}
                  >
                    {off > 0 ? `+${off}` : off}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Personal Adjustments List */}
          <div className="space-y-3 border-t border-sand-200 pt-5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-xs text-navy-900 uppercase tracking-wider">
                Active Month Overrides ({hijriOverrides.length})
              </label>
              {hijriOverrides.length > 0 && (
                <button
                  onClick={clearUserHijriOverrides}
                  className="flex items-center gap-1 text-[11px] text-amber-800 hover:text-amber-950 font-semibold min-h-touch"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t('calendar.resetAll')}</span>
                </button>
              )}
            </div>

            {hijriOverrides.length === 0 ? (
              <div className="p-4 bg-sand-50 rounded-2xl border border-sand-200 text-center text-xs text-navy-500">
                {t('calendar.noActiveAdjustments')}
              </div>
            ) : (
              <div className="space-y-2">
                {hijriOverrides.map((override) => {
                  const mName =
                    language === 'ml'
                      ? HIJRI_MONTH_NAMES_ML[override.hijriMonth]
                      : HIJRI_MONTH_NAMES_EN[override.hijriMonth];
                  return (
                    <div
                      key={override.id}
                      className="p-3 bg-white border border-sand-300 rounded-2xl flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-emerald-800" />
                        <div>
                          <div className="font-bold text-xs text-navy-900">
                            1 {mName} {override.hijriYear} AH
                          </div>
                          <div className="text-[11px] text-navy-500 font-mono">
                            Starts on {override.gregorianStartDate}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          removeUserHijriOverride(override.hijriYear, override.hijriMonth)
                        }
                        className="px-3 py-1.5 rounded-xl bg-sand-100 hover:bg-sand-200 text-xs font-semibold text-navy-800 min-h-touch transition-colors"
                      >
                        {t('calendar.revert')}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reversibility Notice */}
          <div className="p-3 bg-sand-100 rounded-xl text-[11px] text-navy-600 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
            <span>
              All adjustments are stored purely on your device and can be reverted at any time without affecting astronomical prayer calculations.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
