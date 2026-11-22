import type {
  HijriDate,
  HijriMonthStartRecord,
  HijriProvenance,
  IslamicEvent,
  LocalDate,
  UserHijriOverride,
} from './types.js';

export const HIJRI_MONTH_NAMES_EN = [
  '',
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
] as const;

export const HIJRI_MONTH_NAMES_ML = [
  '',
  'മുഹറം',
  'സഫർ',
  'റബീഉൽ അവ്വൽ',
  'റബീഉൽ ആഖിർ',
  'ജമാദുൽ അവ്വൽ',
  'ജമാദുൽ ആഖിർ',
  'റജബ്',
  'ശഅ്ബാൻ',
  'റമദാൻ',
  'ശവ്വാൽ',
  'ദുൽഖഅ്ദ്',
  'ദുൽഹിജ്ജ',
] as const;

export const RAMADAN_NOTICE = 'Ramadan dates are subject to moon sighting.';
export const RAMADAN_NOTICE_ML = 'മാസപ്പിറവി കാണുന്നതിനനുസരിച്ച് റമദാൻ തീയതികളിൽ മാറ്റമുണ്ടാകാം.';

/**
 * Converts a Gregorian date to Julian Day Number (JDN).
 */
export function gregorianToJdn(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    b -
    1524.5
  );
}

/**
 * Converts a Julian Day Number (JDN) to Gregorian date.
 */
export function jdnToGregorian(jdn: number): LocalDate {
  const z = Math.floor(jdn + 0.5);
  const a = Math.floor((z - 1867216.25) / 36524.25);
  const b = z + 1 + a - Math.floor(a / 4);
  const c = b + 1524;
  const d = Math.floor((c - 122.1) / 365.25);
  const e = Math.floor(365.25 * d);
  const g = Math.floor((c - e) / 30.6001);
  const day = c - e - Math.floor(30.6001 * g);
  const month = g < 14 ? g - 1 : g - 13;
  const year = month > 2 ? d - 4716 : d - 4715;
  return { year, month, day };
}

/**
 * Converts Hijri year, month, day to Julian Day Number (civil/tabular baseline).
 */
export function hijriToJdn(year: number, month: number, day: number): number {
  return (
    Math.floor((11 * year + 3) / 30) +
    354 * year +
    30 * month -
    Math.floor((month - 1) / 2) +
    day +
    1948440 -
    385
  );
}

/**
 * Converts a Julian Day Number (JDN) to baseline civil Hijri date.
 */
export function jdnToHijriBaseline(jdn: number): { year: number; month: number; day: number } {
  const jd = Math.floor(jdn) + 0.5;
  const l = Math.floor(jd - 1948439.5) + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 =
    l2 -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const m = Math.floor((24 * l3) / 709);
  const d = l3 - Math.floor((709 * m) / 24);
  const y = 30 * n + j - 30;
  return { year: y, month: m, day: d };
}

/**
 * Parse YYYY-MM-DD string to LocalDate
 */
export function parseIsoDate(iso: string): LocalDate {
  const [y, m, d] = iso.split('-').map((v) => parseInt(v, 10));
  return { year: y ?? 2026, month: m ?? 1, day: d ?? 1 };
}

/**
 * Format LocalDate to YYYY-MM-DD
 */
export function formatIsoDate(date: LocalDate): string {
  const y = date.year.toString().padStart(4, '0');
  const m = date.month.toString().padStart(2, '0');
  const d = date.day.toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export interface HijriResolverContext {
  publishedSightings?: HijriMonthStartRecord[];
  userOverrides?: UserHijriOverride[];
  userGlobalOffsetDays?: number; // e.g. -1, 0, +1
  district?: string;
}

export interface CalendarDayInfo {
  gregorianDate: LocalDate;
  hijri: HijriDate;
  isToday: boolean;
  isCurrentMonth: boolean;
  event?: IslamicEvent;
}

export interface HijriMonthCalendar {
  hijriYear: number;
  hijriMonth: number;
  monthNameEn: string;
  monthNameMl: string;
  gregorianStartDate: LocalDate;
  lengthDays: 29 | 30;
  isProvisional: boolean;
  days: CalendarDayInfo[];
}

/**
 * Resolves a Gregorian date to its corresponding Hijri date based on the strict precedence:
 * User Personal Override -> Published Moon Sighting -> Calculated Baseline
 *
 * Month length is derived from next month's start:
 * - If next month start is known, month length is exactly 29 or 30 days.
 * - If next month start is not published or overridden, month length is 30 provisional
 *   with the 30th day flagged as pending sighting.
 */
export function resolveHijriDate(
  date: LocalDate,
  context: HijriResolverContext = {},
): HijriDate {
  const jdn = gregorianToJdn(date.year, date.month, date.day);

  // 1. Check for exact user override on this month
  if (context.userOverrides && context.userOverrides.length > 0) {
    for (const override of context.userOverrides) {
      const overrideStart = parseIsoDate(override.gregorianStartDate);
      const startJdn = gregorianToJdn(overrideStart.year, overrideStart.month, overrideStart.day);
      const diffDays = Math.floor(jdn - startJdn);

      // Check if next month's start is also overridden
      const nextMonth = override.hijriMonth === 12 ? 1 : override.hijriMonth + 1;
      const nextYear = override.hijriMonth === 12 ? override.hijriYear + 1 : override.hijriYear;
      const nextOverride = context.userOverrides.find(
        (o) => o.hijriYear === nextYear && o.hijriMonth === nextMonth,
      );

      let monthLength = 30;
      let isProvisional = true;

      if (nextOverride) {
        const nextStart = parseIsoDate(nextOverride.gregorianStartDate);
        const nextStartJdn = gregorianToJdn(nextStart.year, nextStart.month, nextStart.day);
        const derivedLength = Math.floor(nextStartJdn - startJdn);
        if (derivedLength === 29 || derivedLength === 30) {
          monthLength = derivedLength;
          isProvisional = false;
        }
      }

      if (diffDays >= 0 && diffDays < monthLength) {
        const hijriDay = diffDays + 1;
        return {
          year: override.hijriYear,
          month: override.hijriMonth,
          day: hijriDay,
          monthNameEn: HIJRI_MONTH_NAMES_EN[override.hijriMonth] ?? '',
          monthNameMl: HIJRI_MONTH_NAMES_ML[override.hijriMonth] ?? '',
          provenance: 'edited-by-you',
          isProvisional: isProvisional && hijriDay === 30,
          sourceNote: 'User manual override',
        };
      }
    }
  }

  // 2. Check for published moon sighting records
  if (context.publishedSightings && context.publishedSightings.length > 0) {
    // Sort records descending: district-specific first, then kerala-wide, newest start first
    const relevantSightings = context.publishedSightings
      .filter((s) => {
        if (s.scope === 'district') {
          return !context.district || s.district?.toLowerCase() === context.district.toLowerCase();
        }
        return true;
      })
      .sort((a, b) => b.gregorianStartDate.localeCompare(a.gregorianStartDate));

    for (const sighting of relevantSightings) {
      const sStart = parseIsoDate(sighting.gregorianStartDate);
      const startJdn = gregorianToJdn(sStart.year, sStart.month, sStart.day);
      const diffDays = Math.floor(jdn - startJdn);

      // Check if next month's sighting is already published to derive exact month length
      const nextMonth = sighting.hijriMonth === 12 ? 1 : sighting.hijriMonth + 1;
      const nextYear = sighting.hijriMonth === 12 ? sighting.hijriYear + 1 : sighting.hijriYear;
      const nextSighting = relevantSightings.find(
        (r) => r.hijriYear === nextYear && r.hijriMonth === nextMonth,
      );

      let monthLength = 30;
      let isProvisional = true;

      if (nextSighting) {
        const nextStart = parseIsoDate(nextSighting.gregorianStartDate);
        const nextStartJdn = gregorianToJdn(nextStart.year, nextStart.month, nextStart.day);
        const derivedLength = Math.floor(nextStartJdn - startJdn);
        if (derivedLength === 29 || derivedLength === 30) {
          monthLength = derivedLength;
          isProvisional = false;
        }
      }

      if (diffDays >= 0 && diffDays < monthLength) {
        const hijriDay = diffDays + 1;
        return {
          year: sighting.hijriYear,
          month: sighting.hijriMonth,
          day: hijriDay,
          monthNameEn: HIJRI_MONTH_NAMES_EN[sighting.hijriMonth] ?? '',
          monthNameMl: HIJRI_MONTH_NAMES_ML[sighting.hijriMonth] ?? '',
          provenance: 'sighting-confirmed',
          isProvisional: isProvisional && hijriDay === 30,
          sourceNote: sighting.sourceNote,
        };
      }
    }
  }

  // 3. Calculated baseline (with optional user global offset e.g. +-1/+-2 days)
  const adjustedJdn = jdn + (context.userGlobalOffsetDays ?? 0);
  const baseline = jdnToHijriBaseline(adjustedJdn);
  const provenance: HijriProvenance =
    (context.userGlobalOffsetDays ?? 0) !== 0 ? 'edited-by-you' : 'calculated';

  return {
    year: baseline.year,
    month: baseline.month,
    day: baseline.day,
    monthNameEn: HIJRI_MONTH_NAMES_EN[baseline.month] ?? '',
    monthNameMl: HIJRI_MONTH_NAMES_ML[baseline.month] ?? '',
    provenance,
    isProvisional: baseline.day === 30,
    sourceNote:
      provenance === 'edited-by-you'
        ? `User global offset: ${context.userGlobalOffsetDays} day(s)`
        : 'Astronomical / civil tabular baseline',
  };
}

/**
 * Computes major Islamic events for a given Hijri year, resolving their Gregorian dates
 * based on the resolved month starts.
 */
export function computeIslamicEvents(
  hijriYear: number,
  context: HijriResolverContext = {},
): IslamicEvent[] {
  const events = [
    {
      id: 'muharram-1',
      nameEn: 'Islamic New Year',
      nameMl: 'ഹിജ്റ പുതുവർഷം',
      hijriMonth: 1,
      hijriDay: 1,
      isSubjectToSighting: true,
    },
    {
      id: 'ashura',
      nameEn: 'Day of Ashura',
      nameMl: 'ആശൂറാഅ് ദിനം',
      hijriMonth: 1,
      hijriDay: 10,
      isSubjectToSighting: false,
    },
    {
      id: 'mawlid',
      nameEn: 'Mawlid an-Nabi',
      nameMl: 'നബിദിനം',
      hijriMonth: 3,
      hijriDay: 12,
      isSubjectToSighting: false,
    },
    {
      id: 'isra-miraj',
      nameEn: "Isra' and Mi'raj",
      nameMl: 'ഇസ്റാഅ് മിഅ്റാജ്',
      hijriMonth: 7,
      hijriDay: 27,
      isSubjectToSighting: false,
    },
    {
      id: 'nisf-shaban',
      nameEn: "Nisf Sha'ban",
      nameMl: 'ബറാഅത്ത് രാവ്',
      hijriMonth: 8,
      hijriDay: 15,
      isSubjectToSighting: false,
    },
    {
      id: 'ramadan-start',
      nameEn: 'First Day of Ramadan',
      nameMl: 'റമദാൻ ആരംഭം',
      hijriMonth: 9,
      hijriDay: 1,
      isSubjectToSighting: true,
    },
    {
      id: 'laylat-al-qadr',
      nameEn: 'Laylat al-Qadr (27th Night)',
      nameMl: 'ലൈലത്തുൽ ഖദ്ർ (27-ാം രാവ്)',
      hijriMonth: 9,
      hijriDay: 27,
      isSubjectToSighting: false,
    },
    {
      id: 'eid-al-fitr',
      nameEn: 'Eid al-Fitr (Cheriya Perunnal)',
      nameMl: 'ഈദുൽ ഫിത്വർ (ചെറിയ പെരുന്നാൾ)',
      hijriMonth: 10,
      hijriDay: 1,
      isSubjectToSighting: true,
    },
    {
      id: 'day-of-arafah',
      nameEn: 'Day of Arafah',
      nameMl: 'അറഫാ ദിനം',
      hijriMonth: 12,
      hijriDay: 9,
      isSubjectToSighting: false,
    },
    {
      id: 'eid-al-adha',
      nameEn: 'Eid al-Adha (Valiya Perunnal)',
      nameMl: 'ഈദുൽ അദ്ഹ (ബലിപെരുന്നാൾ)',
      hijriMonth: 12,
      hijriDay: 10,
      isSubjectToSighting: true,
    },
  ];

  return events.map((ev) => {
    // Resolve Gregorian date by checking if a sighting/override exists for this month
    let startJdn: number | null = null;

    if (context.userOverrides) {
      const match = context.userOverrides.find(
        (o) => o.hijriYear === hijriYear && o.hijriMonth === ev.hijriMonth,
      );
      if (match) {
        const start = parseIsoDate(match.gregorianStartDate);
        startJdn = gregorianToJdn(start.year, start.month, start.day);
      }
    }

    if (startJdn === null && context.publishedSightings) {
      const match = context.publishedSightings.find(
        (s) => s.hijriYear === hijriYear && s.hijriMonth === ev.hijriMonth,
      );
      if (match) {
        const start = parseIsoDate(match.gregorianStartDate);
        startJdn = gregorianToJdn(start.year, start.month, start.day);
      }
    }

    if (startJdn === null) {
      startJdn = hijriToJdn(hijriYear, ev.hijriMonth, 1) - (context.userGlobalOffsetDays ?? 0);
    }

    const eventJdn = startJdn + (ev.hijriDay - 1);
    const gregorianDate = jdnToGregorian(eventJdn);

    return {
      id: ev.id,
      nameEn: ev.nameEn,
      nameMl: ev.nameMl,
      hijriMonth: ev.hijriMonth,
      hijriDay: ev.hijriDay,
      gregorianDate,
      isSubjectToSighting: ev.isSubjectToSighting,
    };
  });
}

/**
 * Finds an Islamic event matching a specific Gregorian date.
 */
export function findIslamicEventForDate(
  date: LocalDate,
  context: HijriResolverContext = {},
): IslamicEvent | undefined {
  const hijri = resolveHijriDate(date, context);
  const events = computeIslamicEvents(hijri.year, context);
  return events.find(
    (ev) =>
      ev.gregorianDate.year === date.year &&
      ev.gregorianDate.month === date.month &&
      ev.gregorianDate.day === date.day,
  );
}

/**
 * Generates all calendar cells for a given Gregorian month (including leading and trailing grid padding).
 */
export function getGregorianMonthCalendar(
  year: number,
  month: number,
  context: HijriResolverContext = {},
  today?: LocalDate,
): CalendarDayInfo[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayWeekday = new Date(year, month - 1, 1).getDay(); // 0 = Sun

  const cells: CalendarDayInfo[] = [];

  // Previous month padding days
  const prevMonthDays = new Date(year, month - 1, 0).getDate();
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const pDay = prevMonthDays - i;
    const pMonth = month === 1 ? 12 : month - 1;
    const pYear = month === 1 ? year - 1 : year;
    const gDate: LocalDate = { year: pYear, month: pMonth, day: pDay };
    const hijri = resolveHijriDate(gDate, context);
    cells.push({
      gregorianDate: gDate,
      hijri,
      isToday: Boolean(
        today &&
          today.year === gDate.year &&
          today.month === gDate.month &&
          today.day === gDate.day,
      ),
      isCurrentMonth: false,
      event: findIslamicEventForDate(gDate, context),
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const gDate: LocalDate = { year, month, day: d };
    const hijri = resolveHijriDate(gDate, context);
    cells.push({
      gregorianDate: gDate,
      hijri,
      isToday: Boolean(
        today &&
          today.year === gDate.year &&
          today.month === gDate.month &&
          today.day === gDate.day,
      ),
      isCurrentMonth: true,
      event: findIslamicEventForDate(gDate, context),
    });
  }

  // Next month padding to complete 35 or 42 grid cells
  const remainingCells = (7 - (cells.length % 7)) % 7;
  for (let nextD = 1; nextD <= remainingCells; nextD++) {
    const nMonth = month === 12 ? 1 : month + 1;
    const nYear = month === 12 ? year + 1 : year;
    const gDate: LocalDate = { year: nYear, month: nMonth, day: nextD };
    const hijri = resolveHijriDate(gDate, context);
    cells.push({
      gregorianDate: gDate,
      hijri,
      isToday: Boolean(
        today &&
          today.year === gDate.year &&
          today.month === gDate.month &&
          today.day === gDate.day,
      ),
      isCurrentMonth: false,
      event: findIslamicEventForDate(gDate, context),
    });
  }

  return cells;
}

/**
 * Generates calendar information for a given Hijri month.
 * Month length (29 or 30) is dynamically derived from the next month's start.
 */
export function getHijriMonthCalendar(
  hijriYear: number,
  hijriMonth: number,
  context: HijriResolverContext = {},
  today?: LocalDate,
): HijriMonthCalendar {
  // 1. Resolve month start JDN
  let startJdn: number | null = null;

  if (context.userOverrides) {
    const match = context.userOverrides.find(
      (o) => o.hijriYear === hijriYear && o.hijriMonth === hijriMonth,
    );
    if (match) {
      const d = parseIsoDate(match.gregorianStartDate);
      startJdn = gregorianToJdn(d.year, d.month, d.day);
    }
  }

  if (startJdn === null && context.publishedSightings) {
    const match = context.publishedSightings.find(
      (s) => s.hijriYear === hijriYear && s.hijriMonth === hijriMonth,
    );
    if (match) {
      const d = parseIsoDate(match.gregorianStartDate);
      startJdn = gregorianToJdn(d.year, d.month, d.day);
    }
  }

  if (startJdn === null) {
    startJdn = hijriToJdn(hijriYear, hijriMonth, 1) - (context.userGlobalOffsetDays ?? 0);
  }

  // 2. Resolve next month start JDN to determine length
  const nextMonth = hijriMonth === 12 ? 1 : hijriMonth + 1;
  const nextYear = hijriMonth === 12 ? hijriYear + 1 : hijriYear;
  let nextStartJdn: number | null = null;

  if (context.userOverrides) {
    const match = context.userOverrides.find(
      (o) => o.hijriYear === nextYear && o.hijriMonth === nextMonth,
    );
    if (match) {
      const d = parseIsoDate(match.gregorianStartDate);
      nextStartJdn = gregorianToJdn(d.year, d.month, d.day);
    }
  }

  if (nextStartJdn === null && context.publishedSightings) {
    const match = context.publishedSightings.find(
      (s) => s.hijriYear === nextYear && s.hijriMonth === nextMonth,
    );
    if (match) {
      const d = parseIsoDate(match.gregorianStartDate);
      nextStartJdn = gregorianToJdn(d.year, d.month, d.day);
    }
  }

  let lengthDays: 29 | 30 = 30;
  let isProvisional = true;

  if (nextStartJdn !== null) {
    const derived = Math.floor(nextStartJdn - startJdn);
    if (derived === 29 || derived === 30) {
      lengthDays = derived;
      isProvisional = false;
    }
  }

  const gregorianStartDate = jdnToGregorian(startJdn);
  const days: CalendarDayInfo[] = [];

  for (let i = 0; i < lengthDays; i++) {
    const currentJdn = startJdn + i;
    const gDate = jdnToGregorian(currentJdn);
    const hijri = resolveHijriDate(gDate, context);
    days.push({
      gregorianDate: gDate,
      hijri,
      isToday: Boolean(
        today &&
          today.year === gDate.year &&
          today.month === gDate.month &&
          today.day === gDate.day,
      ),
      isCurrentMonth: true,
      event: findIslamicEventForDate(gDate, context),
    });
  }

  return {
    hijriYear,
    hijriMonth,
    monthNameEn: HIJRI_MONTH_NAMES_EN[hijriMonth] ?? '',
    monthNameMl: HIJRI_MONTH_NAMES_ML[hijriMonth] ?? '',
    gregorianStartDate,
    lengthDays,
    isProvisional,
    days,
  };
}
