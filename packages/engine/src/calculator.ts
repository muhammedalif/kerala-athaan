import {
  Coordinates,
  CalculationMethod,
  CalculationParameters,
  Madhab,
  HighLatitudeRule,
  Rounding,
  PrayerTimes,
} from 'adhan';
import type {
  CalcProfile,
  LocalDate,
  LocationCoordinates,
  PrayerName,
  PrayerTimeResult,
} from './types.js';

/**
 * Creates Adhan CalculationParameters based on the CalcProfile specification.
 */
export function buildAdhanParameters(profile: CalcProfile): CalculationParameters {
  let params: CalculationParameters;

  switch (profile.method) {
    case 'mwl':
      params = CalculationMethod.MuslimWorldLeague();
      break;
    case 'umm-al-qura':
      params = CalculationMethod.UmmAlQura();
      break;
    case 'karachi':
      params = CalculationMethod.Karachi();
      break;
    case 'isna':
      params = CalculationMethod.NorthAmerica();
      break;
    case 'egyptian':
      params = CalculationMethod.Egyptian();
      break;
    case 'singapore-muis':
      params = CalculationMethod.Singapore();
      break;
    case 'custom': {
      const custom = profile.customParameters;
      params = new CalculationParameters(
        'Other',
        custom?.fajrAngle ?? 18.0,
        custom?.ishaAngle ?? 17.0,
        custom?.ishaInterval ?? 0,
        custom?.maghribAngle,
      );
      break;
    }
    default:
      params = CalculationMethod.MuslimWorldLeague();
  }

  // Madhab (Asr shadow factor)
  params.madhab = profile.asrMadhhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;

  // High Latitude Rule
  if (profile.highLatitudeRule) {
    switch (profile.highLatitudeRule) {
      case 'middle-of-the-night':
        params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
        break;
      case 'seventh-of-the-night':
        params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;
        break;
      case 'twilight-angle':
        params.highLatitudeRule = HighLatitudeRule.TwilightAngle;
        break;
    }
  }

  // CRITICAL: We preserve unrounded UTC instants from the astronomical engine.
  // Display rounding (nearest/floor/ceiling) is applied downstream at display time.
  params.rounding = Rounding.None;

  // Note: We do NOT set params.adjustments inside Adhan.
  // Per architectural requirements, adjustments are applied explicitly by Kerala Athaan
  // so that baseInstant and adjustmentMin are tracked independently with provenance.
  params.adjustments = {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  };

  return params;
}

/**
 * Default calculation profile for Kerala Athaan.
 * Default is Muslim World League (MWL), Shafi'i Asr, zero adjustments.
 * Note: Clearly labelled as not a Kerala-specific standard per ADR 002.
 */
export const DEFAULT_CALC_PROFILE: CalcProfile = {
  id: 'standard-mwl',
  name: 'Muslim World League (Standard astronomical baseline - not a Kerala-specific standard)',
  method: 'mwl',
  asrMadhhab: 'shafii',
  adjustments: {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  },
  isKeralaStandard: false,
  sourceCitation: 'Muslim World League, Makkah al-Mukarramah. Standard 18° Fajr, 17° Isha.',
};

/**
 * Main contract:
 * Computes prayer times for a given location, civil date, and calculation profile.
 *
 * @param loc Location coordinates and timezone
 * @param date Civil local date in location's timezone
 * @param profile Calculation profile configuration
 * @returns Array of prayer times with baseInstant, adjusted time, adjustmentMin, and provenance
 */
export function computeDay(
  loc: LocationCoordinates,
  date: LocalDate,
  profile: CalcProfile = DEFAULT_CALC_PROFILE,
): PrayerTimeResult[] {
  const coordinates = new Coordinates(loc.lat, loc.lon);
  const params = buildAdhanParameters(profile);

  // JS Date using local year, monthIndex (0-11), and day.
  // Adhan uses getFullYear(), getMonth(), and getDate() from this Date object.
  const calcDate = new Date(date.year, date.month - 1, date.day);
  const pt = new PrayerTimes(coordinates, calcDate, params);

  const prayers: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

  return prayers.map((prayer) => {
    const rawInstant: Date = pt[prayer];
    const adjustmentMin = profile.adjustments[prayer] ?? 0;
    const adjustedTime = new Date(rawInstant.getTime() + adjustmentMin * 60_000);

    return {
      prayer,
      baseInstant: rawInstant,
      time: adjustedTime,
      adjustmentMin,
      provenance: adjustmentMin !== 0 ? 'adjusted' : 'calculated',
    };
  });
}
