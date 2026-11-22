import { describe, it, expect } from 'vitest';
import { computeDay, DEFAULT_CALC_PROFILE } from '../src/index.js';
import { computeIndependentTimes } from '../src/independentCalculator.js';
import { KERALA_DISTRICT_FIXTURES } from './fixtures.data.js';
import type { LocalDate, LocationCoordinates } from '../src/types.js';

describe('Cross-Check against Independent Calculator Oracle', () => {
  /**
   * Tolerances defined in Specification & Quality Assurance:
   * - Dhuhr <= 1.15 min (accounts for Meeus 3-point interpolation vs PrayTimes closed-form polynomial)
   * - Sunrise <= 1.0 min
   * - Maghrib <= 1.0 min
   * - Asr <= 1.5 min
   * - Fajr <= 2.0 min
   * - Isha <= 2.0 min
   */
  const TOLERANCES_MINUTES = {
    fajr: 2.0,
    sunrise: 1.0,
    dhuhr: 1.15,
    asr: 1.5,
    maghrib: 1.0,
    isha: 2.0,
  };

  const datesToTest: LocalDate[] = [
    { year: 2026, month: 3, day: 20 }, // Spring Equinox
    { year: 2026, month: 6, day: 21 }, // Summer Solstice
    { year: 2026, month: 9, day: 22 }, // Autumn Equinox
    { year: 2026, month: 12, day: 21 }, // Winter Solstice
  ];

  for (const dist of KERALA_DISTRICT_FIXTURES) {
    describe(`District HQ: ${dist.district} (${dist.hqTown})`, () => {
      const loc: LocationCoordinates = {
        lat: dist.lat,
        lon: dist.lon,
        elevationM: dist.elevationM,
        tz: 'Asia/Kolkata',
      };

      for (const d of datesToTest) {
        it(`matches independent solar formulas within tolerance on ${d.year}-${d.month}-${d.day}`, () => {
          const engineResults = computeDay(loc, d, DEFAULT_CALC_PROFILE);

          const indep = computeIndependentTimes(
            dist.lat,
            dist.lon,
            d.year,
            d.month,
            d.day,
            18.0, // MWL Fajr angle
            17.0, // MWL Isha angle
            1.0,  // Shafi'i shadow factor
          );

          // Convert engine UTC Date into UTC decimal hour for exact mathematical comparison
          const toUtcDecimalHours = (date: Date): number => {
            return (
              date.getUTCHours() +
              date.getUTCMinutes() / 60 +
              date.getUTCSeconds() / 3600 +
              date.getUTCMilliseconds() / 3600000
            );
          };

          const normalizeDiffHours = (h1: number, h2: number): number => {
            let diff = Math.abs(h1 - h2);
            if (diff > 12) diff = 24 - diff;
            return diff;
          };

          for (const res of engineResults) {
            const prayer = res.prayer;
            const engineHours = toUtcDecimalHours(res.baseInstant);
            const indepHours = indep[prayer];

            const diffMinutes = normalizeDiffHours(engineHours, indepHours) * 60;
            const maxAllowed = TOLERANCES_MINUTES[prayer];

            expect(
              diffMinutes,
              `Prayer ${prayer} in ${dist.district} differed by ${diffMinutes.toFixed(2)}m (allowed <= ${maxAllowed}m)`,
            ).toBeLessThanOrEqual(maxAllowed);
          }
        });
      }
    });
  }
});
