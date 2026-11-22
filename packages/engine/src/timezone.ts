import type { LocalDate, RoundingPolicy } from './types.js';

/**
 * Standard timezone for Kerala & India
 */
export const DEFAULT_KERALA_TZ = 'Asia/Kolkata';
export const KERALA_STANDARD_OFFSET_MIN = 330; // +05:30 in minutes

/**
 * Applies rounding policy to a UTC Date instant.
 * - 'nearest': Rounds to nearest minute (30s threshold).
 * - 'floor': Truncates seconds and milliseconds to 00:000.
 * - 'ceiling': Rounds up to next whole minute if seconds/ms > 0.
 * - 'none': Returns copy of instant without rounding.
 */
export function applyRounding(instant: Date, policy: RoundingPolicy): Date {
  if (policy === 'none') {
    return new Date(instant.getTime());
  }

  const ms = instant.getTime();
  const seconds = instant.getUTCSeconds();
  const milliseconds = instant.getUTCMilliseconds();
  const excessMs = seconds * 1000 + milliseconds;

  if (excessMs === 0) {
    return new Date(ms);
  }

  const baseMs = ms - excessMs;

  switch (policy) {
    case 'floor':
      return new Date(baseMs);
    case 'ceiling':
      return new Date(baseMs + 60_000);
    case 'nearest':
      return excessMs >= 30_000 ? new Date(baseMs + 60_000) : new Date(baseMs);
  }
}

/**
 * Formats a Date instant in the specified IANA time zone into 24-hour HH:MM format.
 */
export function formatPrayerTime(
  instant: Date,
  tz: string = DEFAULT_KERALA_TZ,
  rounding: RoundingPolicy = 'nearest',
): string {
  const rounded = applyRounding(instant, rounding);

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return formatter.format(rounded);
}

/**
 * Formats a Date instant in the specified IANA time zone into 24-hour HH:MM:SS format.
 */
export function formatPrayerTimeWithSeconds(
  instant: Date,
  tz: string = DEFAULT_KERALA_TZ,
): string {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return formatter.format(instant);
}

/**
 * Extracts civil date components in the target time zone.
 */
export function getZonedDateParts(
  instant: Date,
  tz: string = DEFAULT_KERALA_TZ,
): { year: number; month: number; day: number; hour: number; minute: number; second: number } {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(instant);
  const findPart = (type: string) => {
    const val = parts.find((p) => p.type === type)?.value;
    return val ? parseInt(val, 10) : 0;
  };

  return {
    year: findPart('year'),
    month: findPart('month'),
    day: findPart('day'),
    hour: findPart('hour') === 24 ? 0 : findPart('hour'),
    minute: findPart('minute'),
    second: findPart('second'),
  };
}

/**
 * Checks if the client device's current clock offset matches the target location time zone.
 * Emits a warning if device clock differs (e.g. device is not on +05:30 while viewing Kerala).
 */
export function checkDeviceTzMatch(locationTz: string = DEFAULT_KERALA_TZ): {
  matches: boolean;
  deviceOffsetMin: number;
  expectedOffsetMin: number;
  warning?: string;
} {
  const now = new Date();
  // Device offset: Date.getTimezoneOffset() returns minutes west of UTC (e.g. IST is -330)
  const deviceOffsetMin = -now.getTimezoneOffset();

  // Get offset of location timezone
  let expectedOffsetMin = KERALA_STANDARD_OFFSET_MIN;
  try {
    const utcStr = now.toLocaleString('en-US', { timeZone: 'UTC' });
    const locStr = now.toLocaleString('en-US', { timeZone: locationTz });
    const diffMs = new Date(locStr).getTime() - new Date(utcStr).getTime();
    expectedOffsetMin = Math.round(diffMs / 60_000);
  } catch {
    expectedOffsetMin = KERALA_STANDARD_OFFSET_MIN;
  }

  const matches = deviceOffsetMin === expectedOffsetMin;
  const warning = !matches
    ? `Device offset (${deviceOffsetMin >= 0 ? '+' : ''}${Math.floor(deviceOffsetMin / 60)}:${Math.abs(deviceOffsetMin % 60).toString().padStart(2, '0')}) differs from location timezone ${locationTz} (${expectedOffsetMin >= 0 ? '+' : ''}${Math.floor(expectedOffsetMin / 60)}:${Math.abs(expectedOffsetMin % 60).toString().padStart(2, '0')}). Times are presented in local ${locationTz} time.`
    : undefined;

  return {
    matches,
    deviceOffsetMin,
    expectedOffsetMin,
    warning,
  };
}

/**
 * Resolves a LocalDate to a JS Date representing noon (12:00) UTC on that date
 * to safely avoid boundary rollover during astronomical calculations.
 */
export function localDateToUtcDate(date: LocalDate): Date {
  return new Date(Date.UTC(date.year, date.month - 1, date.day, 12, 0, 0));
}

/**
 * Parses a civil time string (HH:mm or HH:mm:ss) on a given LocalDate and Timezone
 * into a precise UTC Date instant.
 */
export function parseZonedTimeStringToDate(
  timeStr: string,
  date: LocalDate,
  tz: string = DEFAULT_KERALA_TZ,
): Date {
  const parts = timeStr.trim().split(':').map((s) => parseInt(s, 10));
  const hour = parts[0] ?? 0;
  const minute = parts[1] ?? 0;
  const second = parts[2] ?? 0;

  const testUtc = new Date(Date.UTC(date.year, date.month - 1, date.day, 12, 0, 0));
  const tzParts = getZonedDateParts(testUtc, tz);
  const tzNoonMs = Date.UTC(
    tzParts.year,
    tzParts.month - 1,
    tzParts.day,
    tzParts.hour,
    tzParts.minute,
    tzParts.second,
  );
  const offsetMs = tzNoonMs - testUtc.getTime();

  const targetLocalMs = Date.UTC(date.year, date.month - 1, date.day, hour, minute, second);
  return new Date(targetLocalMs - offsetMs);
}

