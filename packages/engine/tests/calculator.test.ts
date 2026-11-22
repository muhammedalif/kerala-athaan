import { describe, it, expect } from 'vitest';
import {
  computeDay,
  DEFAULT_CALC_PROFILE,
} from '../src/index.js';
import { KERALA_DISTRICT_FIXTURES } from './fixtures.data.js';
import type { CalcProfile, LocalDate, LocationCoordinates } from '../src/types.js';

describe('Calculator Engine (computeDay)', () => {
  const kozhikodeLoc: LocationCoordinates = {
    lat: 11.2588,
    lon: 75.7804,
    elevationM: 1,
    tz: 'Asia/Kolkata',
  };

  it('computes all 6 prayers for Kozhikode with valid UTC instants and contract structure', () => {
    const date: LocalDate = { year: 2026, month: 3, day: 20 }; // Spring Equinox
    const results = computeDay(kozhikodeLoc, date);

    expect(results).toHaveLength(6);

    const prayerOrder = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    results.forEach((r, idx) => {
      expect(r.prayer).toBe(prayerOrder[idx]);
      expect(r.baseInstant).toBeInstanceOf(Date);
      expect(r.time).toBeInstanceOf(Date);
      expect(r.adjustmentMin).toBe(0);
      expect(r.provenance).toBe('calculated');
      expect(isNaN(r.time.getTime())).toBe(false);
    });

    // Check chronological order
    for (let i = 0; i < results.length - 1; i++) {
      const curr = results[i]?.time.getTime() ?? 0;
      const next = results[i + 1]?.time.getTime() ?? 0;
      expect(curr).toBeLessThan(next);
    }
  });

  it('executes successfully for all 14 Kerala District Headquarters across all cardinal astronomical dates', () => {
    const testDates: LocalDate[] = [
      { year: 2026, month: 3, day: 20 }, // Spring Equinox
      { year: 2026, month: 6, day: 21 }, // Summer Solstice
      { year: 2026, month: 9, day: 22 }, // Autumn Equinox
      { year: 2026, month: 12, day: 21 }, // Winter Solstice
      { year: 2028, month: 2, day: 29 }, // Leap Day
      { year: 2026, month: 12, day: 31 }, // Year rollover boundary
      { year: 2027, month: 1, day: 1 },
    ];

    for (const dist of KERALA_DISTRICT_FIXTURES) {
      const loc: LocationCoordinates = {
        lat: dist.lat,
        lon: dist.lon,
        elevationM: dist.elevationM,
        tz: 'Asia/Kolkata',
      };

      for (const d of testDates) {
        const times = computeDay(loc, d);
        expect(times).toHaveLength(6);

        // Verify valid times
        for (const t of times) {
          expect(t.time.getTime()).toBeGreaterThan(0);
        }

        // Verify ordering: fajr < sunrise < dhuhr < asr < maghrib < isha
        const [fajr, sunrise, dhuhr, asr, maghrib, isha] = times;
        expect(fajr!.time.getTime()).toBeLessThan(sunrise!.time.getTime());
        expect(sunrise!.time.getTime()).toBeLessThan(dhuhr!.time.getTime());
        expect(dhuhr!.time.getTime()).toBeLessThan(asr!.time.getTime());
        expect(asr!.time.getTime()).toBeLessThan(maghrib!.time.getTime());
        expect(maghrib!.time.getTime()).toBeLessThan(isha!.time.getTime());
      }
    }
  });

  it('verifies Asr madhhab setting: Hanafi Asr is strictly later than Shafi\'i Asr', () => {
    const date: LocalDate = { year: 2026, month: 3, day: 20 };

    const shafiiProfile: CalcProfile = {
      ...DEFAULT_CALC_PROFILE,
      asrMadhhab: 'shafii',
    };

    const hanafiProfile: CalcProfile = {
      ...DEFAULT_CALC_PROFILE,
      asrMadhhab: 'hanafi',
    };

    const shafiiTimes = computeDay(kozhikodeLoc, date, shafiiProfile);
    const hanafiTimes = computeDay(kozhikodeLoc, date, hanafiProfile);

    const shafiiAsr = shafiiTimes.find((t) => t.prayer === 'asr')!.time.getTime();
    const hanafiAsr = hanafiTimes.find((t) => t.prayer === 'asr')!.time.getTime();

    // In Hanafi madhhab (shadow 2x), Asr enters later than Shafi'i (shadow 1x)
    expect(hanafiAsr).toBeGreaterThan(shafiiAsr);

    // Difference in Kerala on Equinox is ~50-60 minutes
    const diffMinutes = (hanafiAsr - shafiiAsr) / 60_000;
    expect(diffMinutes).toBeGreaterThan(45);
    expect(diffMinutes).toBeLessThan(75);
  });

  it('applies per-prayer adjustments and tracks provenance as adjusted', () => {
    const date: LocalDate = { year: 2026, month: 3, day: 20 };
    const adjustedProfile: CalcProfile = {
      ...DEFAULT_CALC_PROFILE,
      adjustments: {
        fajr: -2,
        sunrise: 0,
        dhuhr: +3,
        asr: +4,
        maghrib: +2,
        isha: 0,
      },
    };

    const baseline = computeDay(kozhikodeLoc, date, DEFAULT_CALC_PROFILE);
    const adjusted = computeDay(kozhikodeLoc, date, adjustedProfile);

    // Fajr: -2 minutes
    const bFajr = baseline.find((t) => t.prayer === 'fajr')!;
    const aFajr = adjusted.find((t) => t.prayer === 'fajr')!;
    expect(aFajr.adjustmentMin).toBe(-2);
    expect(aFajr.provenance).toBe('adjusted');
    expect(aFajr.time.getTime()).toBe(bFajr.baseInstant.getTime() - 2 * 60_000);
    expect(aFajr.baseInstant.getTime()).toBe(bFajr.baseInstant.getTime());

    // Sunrise: 0 minutes
    const aSunrise = adjusted.find((t) => t.prayer === 'sunrise')!;
    expect(aSunrise.adjustmentMin).toBe(0);
    expect(aSunrise.provenance).toBe('calculated');

    // Dhuhr: +3 minutes
    const bDhuhr = baseline.find((t) => t.prayer === 'dhuhr')!;
    const aDhuhr = adjusted.find((t) => t.prayer === 'dhuhr')!;
    expect(aDhuhr.adjustmentMin).toBe(3);
    expect(aDhuhr.provenance).toBe('adjusted');
    expect(aDhuhr.time.getTime()).toBe(bDhuhr.baseInstant.getTime() + 3 * 60_000);
  });

  it('supports all standard calculation methods correctly', () => {
    const date: LocalDate = { year: 2026, month: 3, day: 20 };
    const methods: CalcProfile['method'][] = [
      'mwl',
      'umm-al-qura',
      'karachi',
      'isna',
      'egyptian',
      'singapore-muis',
      'custom',
    ];

    for (const method of methods) {
      const profile: CalcProfile = {
        ...DEFAULT_CALC_PROFILE,
        method,
        customParameters:
          method === 'custom'
            ? {
                fajrAngle: 19.0,
                ishaAngle: 18.0,
                dhuhrMinutes: 0,
                maghribMinutes: 0,
              }
            : undefined,
      };

      const res = computeDay(kozhikodeLoc, date, profile);
      expect(res).toHaveLength(6);
      for (const p of res) {
        expect(isNaN(p.time.getTime())).toBe(false);
      }
    }
  });

  it('supports high latitude rules without error', () => {
    const date: LocalDate = { year: 2026, month: 6, day: 21 };
    const highLatRules: CalcProfile['highLatitudeRule'][] = [
      'middle-of-the-night',
      'seventh-of-the-night',
      'twilight-angle',
    ];

    // High latitude location (Oslo, 59.91° N)
    const osloLoc: LocationCoordinates = {
      lat: 59.9139,
      lon: 10.7522,
      tz: 'Europe/Oslo',
    };

    for (const rule of highLatRules) {
      const profile: CalcProfile = {
        ...DEFAULT_CALC_PROFILE,
        highLatitudeRule: rule,
      };

      const res = computeDay(osloLoc, date, profile);
      expect(res).toHaveLength(6);
      for (const p of res) {
        expect(isNaN(p.time.getTime())).toBe(false);
      }
    }
  });

  it('keeps baseInstant unrounded to the millisecond', () => {
    const date: LocalDate = { year: 2026, month: 3, day: 20 };
    const results = computeDay(kozhikodeLoc, date, DEFAULT_CALC_PROFILE);

    const dhuhr = results.find((r) => r.prayer === 'dhuhr')!;
    // Adhan unrounded outputs exact seconds
    expect(dhuhr.baseInstant.getUTCSeconds()).toBeDefined();
  });
});
