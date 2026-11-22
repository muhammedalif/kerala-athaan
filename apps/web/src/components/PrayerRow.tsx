import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  formatPrayerTime,
  type PrayerTimeResult,
  type RoundingPolicy,
} from '@kerala-athaan/engine';
import { ProvenanceBadge } from './ProvenanceBadge.js';

interface PrayerRowProps {
  result: PrayerTimeResult;
  isUpcoming: boolean;
  timezone: string;
  roundingPolicy: RoundingPolicy;
}

export const PrayerRow: React.FC<PrayerRowProps> = ({
  result,
  isUpcoming,
  timezone,
  roundingPolicy,
}) => {
  const { t } = useTranslation();

  const formattedTime = formatPrayerTime(result.time, timezone, roundingPolicy);

  // Prayer display labels
  const prayerKey = result.prayer;
  const primaryName = t(`prayers.${prayerKey}`);

  return (
    <div
      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
        isUpcoming
          ? 'bg-gold-50/70 border-gold-DEFAULT shadow-sm ring-1 ring-gold-DEFAULT/50'
          : 'bg-white border-sand-200 hover:border-sand-300 shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Active / upcoming indicator */}
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            isUpcoming ? 'bg-gold-DEFAULT animate-ping' : 'bg-sand-300'
          }`}
        />

        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-base font-semibold ${
                isUpcoming ? 'text-gold-900 font-bold' : 'text-navy-900'
              }`}
            >
              {primaryName}
            </span>
            {isUpcoming && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold-700 bg-gold-200/80 px-1.5 py-0.5 rounded">
                {t('home.nextPrayer')}
              </span>
            )}
          </div>
          {prayerKey === 'fajr' && (
            <span className="text-[11px] text-navy-400 block">
              {t('home.sehriEnds')}
            </span>
          )}
          {prayerKey === 'maghrib' && (
            <span className="text-[11px] text-emerald-600 block">
              {t('home.iftarStarts')}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <ProvenanceBadge type={result.provenance} size="sm" />
        <span
          className={`font-mono text-xl font-bold tracking-tight ${
            isUpcoming ? 'text-gold-800' : 'text-navy-800'
          }`}
        >
          {formattedTime}
        </span>
      </div>
    </div>
  );
};
