import { computeDay } from './calculator.js';
import {
  resolveHijriDate,
  parseIsoDate,
  gregorianToJdn,
  jdnToGregorian,
  hijriToJdn,
  RAMADAN_NOTICE,
  RAMADAN_NOTICE_ML,
  type HijriResolverContext,
} from './hijri.js';
import type {
  CalcProfile,
  HijriDate,
  LocalDate,
  UserHijriOverride,
  HijriMonthStartRecord,
} from './types.js';

export interface RamadanDayInfo {
  date: LocalDate;
  hijri: HijriDate;
  imsakTime: Date; // Sehri / Imsak cutoff
  fajrTime: Date;
  sunriseTime: Date;
  dhuhrTime: Date;
  asrTime: Date;
  maghribTime: Date; // Iftar
  ishaTime: Date;
  fastingDurationMs: number; // maghribTime - imsakTime
  isSeparateSehriCutoff: boolean;
  sehriCutoffMinutes?: number;
}

export interface FastingCountdownState {
  state: 'fasting' | 'eating_allowed';
  targetPrayer: 'maghrib' | 'fajr' | 'imsak';
  targetInstant: Date;
  remainingMs: number;
  formattedTime: string;
}

export interface RamadanMonthTimetable {
  hijriYear: number;
  gregorianStartDate: LocalDate;
  lengthDays: 29 | 30;
  isProvisional: boolean;
  days: RamadanDayInfo[];
  noticeEn: string;
  noticeMl: string;
}

/**
 * Computes single day Ramadan fasting and prayer metrics.
 * Local mosque's Sehri cutoff is calculated separately from Fajr when provided.
 */
export function computeRamadanDay(params: {
  location: { lat: number; lon: number; elevationM?: number; tz: string };
  date: LocalDate;
  profile: CalcProfile;
  hijriContext?: HijriResolverContext;
  mosqueSehriCutoffMinutes?: number;
}): RamadanDayInfo {
  const { location, date, profile, hijriContext = {}, mosqueSehriCutoffMinutes } = params;

  const times = computeDay(location, date, profile);
  const fajr = times.find((p) => p.prayer === 'fajr')!;
  const sunrise = times.find((p) => p.prayer === 'sunrise')!;
  const dhuhr = times.find((p) => p.prayer === 'dhuhr')!;
  const asr = times.find((p) => p.prayer === 'asr')!;
  const maghrib = times.find((p) => p.prayer === 'maghrib')!;
  const isha = times.find((p) => p.prayer === 'isha')!;

  const isSeparateSehriCutoff =
    typeof mosqueSehriCutoffMinutes === 'number' && mosqueSehriCutoffMinutes > 0;

  // If mosque specifies Sehri cutoff (e.g. 10m before Fajr), subtract that from Fajr.
  // Otherwise, standard Imsak matches Fajr.
  const imsakTime = isSeparateSehriCutoff
    ? new Date(fajr.time.getTime() - mosqueSehriCutoffMinutes * 60 * 1000)
    : new Date(fajr.time.getTime());

  const fastingDurationMs = Math.max(0, maghrib.time.getTime() - imsakTime.getTime());
  const hijri = resolveHijriDate(date, hijriContext);

  return {
    date,
    hijri,
    imsakTime,
    fajrTime: fajr.time,
    sunriseTime: sunrise.time,
    dhuhrTime: dhuhr.time,
    asrTime: asr.time,
    maghribTime: maghrib.time,
    ishaTime: isha.time,
    fastingDurationMs,
    isSeparateSehriCutoff,
    sehriCutoffMinutes: isSeparateSehriCutoff ? mosqueSehriCutoffMinutes : undefined,
  };
}

/**
 * Calculates current fasting status and countdown to next event (Iftar or Sehri/Imsak end).
 */
export function getFastingCountdownState(params: {
  now: Date;
  todayImsak: Date;
  todayMaghrib: Date;
  tomorrowImsak: Date;
  isSeparateSehriCutoff?: boolean;
}): FastingCountdownState {
  const { now, todayImsak, todayMaghrib, tomorrowImsak, isSeparateSehriCutoff } = params;
  const nowMs = now.getTime();

  let state: 'fasting' | 'eating_allowed';
  let targetPrayer: 'maghrib' | 'fajr' | 'imsak';
  let targetInstant: Date;

  if (nowMs < todayImsak.getTime()) {
    // Before today's Sehri cutoff -> eating allowed, counting down to Sehri end
    state = 'eating_allowed';
    targetPrayer = isSeparateSehriCutoff ? 'imsak' : 'fajr';
    targetInstant = todayImsak;
  } else if (nowMs >= todayImsak.getTime() && nowMs < todayMaghrib.getTime()) {
    // Between Sehri cutoff and Maghrib -> fasting! Counting down to Iftar
    state = 'fasting';
    targetPrayer = 'maghrib';
    targetInstant = todayMaghrib;
  } else {
    // After Maghrib -> fast is broken! Eating allowed, counting down to tomorrow's Sehri cutoff
    state = 'eating_allowed';
    targetPrayer = isSeparateSehriCutoff ? 'imsak' : 'fajr';
    targetInstant = tomorrowImsak;
  }

  const remainingMs = Math.max(0, targetInstant.getTime() - nowMs);
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    state,
    targetPrayer,
    targetInstant,
    remainingMs,
    formattedTime,
  };
}

/**
 * Resolves the full Ramadan timetable for a given Hijri year.
 * Month length is derived from next month's (Shawwal) start:
 * - If Shawwal start is published/overridden: length is exact (29 or 30).
 * - Otherwise: length is 30 provisional with the 30th flagged as pending sighting.
 */
export function getRamadanMonthTimetable(params: {
  location: { lat: number; lon: number; elevationM?: number; tz: string };
  profile: CalcProfile;
  hijriYear: number;
  hijriContext?: HijriResolverContext;
  mosqueSehriCutoffMinutes?: number;
}): RamadanMonthTimetable {
  const { location, profile, hijriYear, hijriContext = {}, mosqueSehriCutoffMinutes } = params;

  // 1. Resolve Ramadan (Month 9) Start Date
  let ramadanStartJdn: number | null = null;

  if (hijriContext.userOverrides) {
    const match = hijriContext.userOverrides.find(
      (o: UserHijriOverride) => o.hijriYear === hijriYear && o.hijriMonth === 9,
    );
    if (match) {
      const d = parseIsoDate(match.gregorianStartDate);
      ramadanStartJdn = gregorianToJdn(d.year, d.month, d.day);
    }
  }

  if (ramadanStartJdn === null && hijriContext.publishedSightings) {
    const match = hijriContext.publishedSightings.find(
      (s: HijriMonthStartRecord) => s.hijriYear === hijriYear && s.hijriMonth === 9,
    );
    if (match) {
      const d = parseIsoDate(match.gregorianStartDate);
      ramadanStartJdn = gregorianToJdn(d.year, d.month, d.day);
    }
  }

  if (ramadanStartJdn === null) {
    ramadanStartJdn =
      hijriToJdn(hijriYear, 9, 1) - (hijriContext.userGlobalOffsetDays ?? 0);
  }

  // 2. Resolve Shawwal (Month 10) Start Date to derive exact month length
  let shawwalStartJdn: number | null = null;

  if (hijriContext.userOverrides) {
    const match = hijriContext.userOverrides.find(
      (o: UserHijriOverride) => o.hijriYear === hijriYear && o.hijriMonth === 10,
    );
    if (match) {
      const d = parseIsoDate(match.gregorianStartDate);
      shawwalStartJdn = gregorianToJdn(d.year, d.month, d.day);
    }
  }

  if (shawwalStartJdn === null && hijriContext.publishedSightings) {
    const match = hijriContext.publishedSightings.find(
      (s: HijriMonthStartRecord) => s.hijriYear === hijriYear && s.hijriMonth === 10,
    );
    if (match) {
      const d = parseIsoDate(match.gregorianStartDate);
      shawwalStartJdn = gregorianToJdn(d.year, d.month, d.day);
    }
  }

  let lengthDays: 29 | 30 = 30;
  let isProvisional = true;

  if (shawwalStartJdn !== null) {
    const diff = Math.floor(shawwalStartJdn - ramadanStartJdn);
    if (diff === 29 || diff === 30) {
      lengthDays = diff;
      isProvisional = false;
    }
  }

  const gregorianStartDate = jdnToGregorian(ramadanStartJdn);
  const days: RamadanDayInfo[] = [];

  for (let i = 0; i < lengthDays; i++) {
    const dayJdn = ramadanStartJdn + i;
    const gDate = jdnToGregorian(dayJdn);
    const dayInfo = computeRamadanDay({
      location,
      date: gDate,
      profile,
      hijriContext,
      mosqueSehriCutoffMinutes,
    });
    days.push(dayInfo);
  }

  return {
    hijriYear,
    gregorianStartDate,
    lengthDays,
    isProvisional,
    days,
    noticeEn: RAMADAN_NOTICE,
    noticeMl: RAMADAN_NOTICE_ML,
  };
}
