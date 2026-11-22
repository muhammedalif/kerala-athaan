import { describe, it, expect } from 'vitest';
import {
  resolveHijriDate,
  computeIslamicEvents,
  RAMADAN_NOTICE,
  formatIsoDate,
} from '../src/index.js';
import type {
  HijriMonthStartRecord,
  LocalDate,
  UserHijriOverride,
} from '../src/types.js';

describe('Hijri Calendar Resolver & Precedence Engine', () => {
  it('resolves baseline calculated date with provenance "calculated"', () => {
    // 2026-03-20 is baseline 1 Shawwal 1447
    const date: LocalDate = { year: 2026, month: 3, day: 20 };
    const res = resolveHijriDate(date);

    expect(res.provenance).toBe('calculated');
    expect(res.year).toBe(1447);
    expect(res.month).toBe(10);
    expect(res.day).toBe(1);
    expect(res.monthNameEn).toBe('Shawwal');
    expect(res.monthNameMl).toBe('ശവ്വാൽ');
  });

  it('published moon sighting overrides calculated baseline with provenance "sighting-confirmed"', () => {
    // Suppose baseline had Ramadan starting on 2026-02-18,
    // but Kerala Hilal Committee published sighting confirming Ramadan 1 is on 2026-02-19.
    const sighting: HijriMonthStartRecord = {
      hijriYear: 1447,
      hijriMonth: 9, // Ramadan
      gregorianStartDate: '2026-02-19',
      scope: 'kerala',
      sourceNote: 'Kerala Hilal Committee visual sighting confirmation',
      publishedAt: '2026-02-18T19:00:00Z',
    };

    // On 2026-02-19: Should be 1 Ramadan 1447 with "sighting-confirmed"
    const day1 = resolveHijriDate({ year: 2026, month: 2, day: 19 }, {
      publishedSightings: [sighting],
    });

    expect(day1.provenance).toBe('sighting-confirmed');
    expect(day1.year).toBe(1447);
    expect(day1.month).toBe(9);
    expect(day1.day).toBe(1);
    expect(day1.monthNameEn).toBe('Ramadan');
    expect(day1.monthNameMl).toBe('റമദാൻ');
    expect(day1.sourceNote).toBe(sighting.sourceNote);

    // Day 15 of Ramadan: 2026-03-05
    const day15 = resolveHijriDate({ year: 2026, month: 3, day: 5 }, {
      publishedSightings: [sighting],
    });
    expect(day15.provenance).toBe('sighting-confirmed');
    expect(day15.month).toBe(9);
    expect(day15.day).toBe(15);
  });

  it('user personal override overrides BOTH published sighting and calculated baseline', () => {
    const sighting: HijriMonthStartRecord = {
      hijriYear: 1447,
      hijriMonth: 9,
      gregorianStartDate: '2026-02-19',
      scope: 'kerala',
      sourceNote: 'Official committee',
    };

    const userOverride: UserHijriOverride = {
      hijriYear: 1447,
      hijriMonth: 9,
      gregorianStartDate: '2026-02-20', // User local decision
      offsetDays: 0,
      updatedAt: '2026-02-19T20:00:00Z',
    };

    // On 2026-02-20: user override sets this as Day 1
    const res = resolveHijriDate({ year: 2026, month: 2, day: 20 }, {
      publishedSightings: [sighting],
      userOverrides: [userOverride],
    });

    expect(res.provenance).toBe('edited-by-you');
    expect(res.month).toBe(9);
    expect(res.day).toBe(1);
    expect(res.monthNameEn).toBe('Ramadan');
  });

  it('marks 30th day as provisional when next month sighting is pending', () => {
    // Ramadan starts on 2026-02-19
    const sighting: HijriMonthStartRecord = {
      hijriYear: 1447,
      hijriMonth: 9,
      gregorianStartDate: '2026-02-19',
      scope: 'kerala',
      sourceNote: 'Sighting confirmed',
    };

    // Day 29 of Ramadan: 2026-03-19 (not provisional)
    const day29 = resolveHijriDate({ year: 2026, month: 3, day: 19 }, {
      publishedSightings: [sighting],
    });
    expect(day29.day).toBe(29);
    expect(day29.isProvisional).toBe(false);

    // Day 30 of Ramadan: 2026-03-20 (Shawwal sighting not yet confirmed -> provisional)
    const day30Pending = resolveHijriDate({ year: 2026, month: 3, day: 20 }, {
      publishedSightings: [sighting],
    });
    expect(day30Pending.day).toBe(30);
    expect(day30Pending.isProvisional).toBe(true);

    // Once Shawwal sighting IS published, day 30 is no longer provisional
    const shawwalSighting: HijriMonthStartRecord = {
      hijriYear: 1447,
      hijriMonth: 10,
      gregorianStartDate: '2026-03-21', // Shawwal starts March 21
      scope: 'kerala',
      sourceNote: 'Shawwal crescent sighted',
    };

    const day30Confirmed = resolveHijriDate({ year: 2026, month: 3, day: 20 }, {
      publishedSightings: [sighting, shawwalSighting],
    });
    expect(day30Confirmed.day).toBe(30);
    expect(day30Confirmed.isProvisional).toBe(false);
  });

  it('recomputes Islamic events dynamically based on resolved month starts', () => {
    // Baseline events
    const baselineEvents = computeIslamicEvents(1447);
    const baselineRamadan = baselineEvents.find((e) => e.id === 'ramadan-start')!;
    const baselineEidFitr = baselineEvents.find((e) => e.id === 'eid-al-fitr')!;

    expect(baselineRamadan.isSubjectToSighting).toBe(true);
    expect(baselineEidFitr.isSubjectToSighting).toBe(true);

    // With sighting shifting Ramadan by +1 day
    const sighting: HijriMonthStartRecord = {
      hijriYear: 1447,
      hijriMonth: 9,
      gregorianStartDate: '2026-02-19',
      scope: 'kerala',
      sourceNote: 'Confirmed Sighting',
    };

    const updatedEvents = computeIslamicEvents(1447, {
      publishedSightings: [sighting],
    });

    const shiftedRamadan = updatedEvents.find((e) => e.id === 'ramadan-start')!;
    expect(formatIsoDate(shiftedRamadan.gregorianDate)).toBe('2026-02-19');

    // Laylat al-Qadr (27th of Ramadan) shifts to 26 days after day 1 = 2026-03-17
    const shiftedLaylat = updatedEvents.find((e) => e.id === 'laylat-al-qadr')!;
    expect(formatIsoDate(shiftedLaylat.gregorianDate)).toBe('2026-03-17');
  });

  it('contains the mandatory subject to moon sighting disclaimer', () => {
    expect(RAMADAN_NOTICE).toBe('Ramadan dates are subject to moon sighting.');
  });
});
