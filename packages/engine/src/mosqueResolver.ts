import {
  computeDay,
  DEFAULT_CALC_PROFILE,
} from './calculator.js';
import {
  formatPrayerTime,
  parseZonedTimeStringToDate,
  DEFAULT_KERALA_TZ,
} from './timezone.js';
import type {
  LocalDate,
  LocationCoordinates,
  CalcProfile,
  MosqueRecord,
  TimetableEntry,
  MosqueMode,
  PrayerTimeResult,
  ResolvedDayResult,
  PrayerName,
  MosqueComparisonSummary,
  MosqueComparisonItem,
} from './types.js';

export interface MosqueResolutionOptions {
  mode: MosqueMode;
  location: LocationCoordinates;
  date: LocalDate;
  userProfile?: CalcProfile;
  mosque?: MosqueRecord | null;
  timetableRow?: TimetableEntry | null;
}

/**
 * Resolves prayer times for a given day according to the user's selected mode:
 * 1. 'astronomical': Pure astronomical calculation using location & calculation profile.
 * 2. 'verified_timetable': Verified published mosque timetable row. If row is missing,
 *    gracefully falls back to astronomical calculation with isFallback: true and provenance: 'calculated'.
 * 3. 'mosque_adjusted_astronomical': Astronomical calculation using the mosque's profile,
 *    coordinates, Asr madhhab, and per-prayer minute adjustments.
 */
export function resolveMosqueDay(options: MosqueResolutionOptions): ResolvedDayResult {
  const {
    mode,
    location,
    date,
    userProfile = DEFAULT_CALC_PROFILE,
    mosque,
    timetableRow,
  } = options;

  // 1. Pure Astronomical Mode (or no mosque specified)
  if (mode === 'astronomical' || !mosque) {
    const times = computeDay(location, date, userProfile);
    return {
      times,
      mode: 'astronomical',
      isFallback: false,
    };
  }

  // 2. Verified Mosque Timetable Mode
  if (mode === 'verified_timetable') {
    // If a verified timetable row exists for this date
    if (
      timetableRow &&
      timetableRow.fajr &&
      timetableRow.dhuhr &&
      timetableRow.asr &&
      timetableRow.maghrib &&
      timetableRow.isha
    ) {
      const prayers: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
      const baselineTimes = computeDay(location, date, userProfile);
      const resolvedTimes: PrayerTimeResult[] = [];

      for (const p of prayers) {
        const timeStr = timetableRow[p];
        const basePrayer = baselineTimes.find((b) => b.prayer === p);
        const baseInstant = basePrayer?.baseInstant ?? new Date();

        if (timeStr) {
          const finalInstant = parseZonedTimeStringToDate(timeStr, date, location.tz);
          const diffMs = finalInstant.getTime() - baseInstant.getTime();
          const adjustmentMin = Math.round(diffMs / 60_000);

          resolvedTimes.push({
            prayer: p,
            baseInstant,
            time: finalInstant,
            adjustmentMin,
            provenance: 'mosque-verified',
          });
        } else if (basePrayer) {
          // If a specific prayer (e.g. sunrise) is missing from the mosque timetable, fall back to calculated
          resolvedTimes.push({
            ...basePrayer,
            provenance: 'calculated',
          });
        }
      }

      return {
        times: resolvedTimes,
        mode: 'verified_timetable',
        isFallback: false,
        mosqueName: mosque.nameEn,
        sourceAttribution: timetableRow.sourceNote || mosque.sourceAttribution,
      };
    }

    // FALLBACK: User chose verified_timetable, but no verified row exists for today's date
    // Fall back to calculated and explicitly flag isFallback: true!
    const fallbackTimes = computeDay(location, date, userProfile);
    return {
      times: fallbackTimes,
      mode: 'verified_timetable',
      isFallback: true,
      fallbackReason: 'no_verified_row',
      mosqueName: mosque.nameEn,
      sourceAttribution: mosque.sourceAttribution,
    };
  }

  // 3. Mosque-Adjusted Astronomical Mode
  const mosqueProfile: CalcProfile = {
    id: `mosque-${mosque.id}`,
    name: `${mosque.nameEn} Profile`,
    method: mosque.calcMethod,
    asrMadhhab: mosque.asrMadhhab,
    adjustments: mosque.adjustments,
    isKeralaStandard: false,
    sourceCitation: mosque.sourceAttribution,
  };

  const mosqueLoc: LocationCoordinates = {
    lat: mosque.latitude,
    lon: mosque.longitude,
    elevationM: mosque.elevationM,
    tz: location.tz || DEFAULT_KERALA_TZ,
  };

  const times = computeDay(mosqueLoc, date, mosqueProfile);

  return {
    times,
    mode: 'mosque_adjusted_astronomical',
    isFallback: false,
    mosqueName: mosque.nameEn,
    sourceAttribution: mosque.sourceAttribution,
  };
}

/**
 * Compares mosque timetable entries (or mosque profile times) with calculated astronomical times,
 * computing discrepancies in minutes and flagging differences above the threshold.
 */
export function compareMosqueWithCalculated(
  location: LocationCoordinates,
  date: LocalDate,
  userProfile: CalcProfile,
  mosque: MosqueRecord,
  timetableRow?: TimetableEntry | null,
  thresholdMinutes: number = 5,
): MosqueComparisonSummary {
  const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
  const calculatedTimes = computeDay(location, date, userProfile);

  const mosqueTimes = resolveMosqueDay({
    mode: timetableRow ? 'verified_timetable' : 'mosque_adjusted_astronomical',
    location,
    date,
    userProfile,
    mosque,
    timetableRow,
  });

  const prayers: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const items: MosqueComparisonItem[] = [];
  let maxDiffMinutes = 0;
  let hasDiscrepancies = false;

  for (const p of prayers) {
    const calc = calculatedTimes.find((c) => c.prayer === p);
    const msq = mosqueTimes.times.find((m) => m.prayer === p);

    if (!calc || !msq) continue;

    const calcStr = formatPrayerTime(calc.time, location.tz);
    const msqStr = formatPrayerTime(msq.time, location.tz);

    const diffMinutes = Math.round((msq.time.getTime() - calc.time.getTime()) / 60_000);
    const absDiff = Math.abs(diffMinutes);
    const exceedsThreshold = absDiff > thresholdMinutes;

    if (absDiff > maxDiffMinutes) {
      maxDiffMinutes = absDiff;
    }
    if (exceedsThreshold) {
      hasDiscrepancies = true;
    }

    items.push({
      prayer: p,
      calculatedTime: calcStr,
      mosqueTime: msqStr,
      diffMinutes,
      exceedsThreshold,
    });
  }

  return {
    mosqueId: mosque.id,
    mosqueName: mosque.nameEn,
    date: dateStr,
    thresholdMinutes,
    hasDiscrepancies,
    maxDiffMinutes,
    items,
  };
}
