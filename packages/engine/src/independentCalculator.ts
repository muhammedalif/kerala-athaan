/**
 * Independent Astronomical Prayer Time Implementation
 * Based on the classical PrayTimes.org / Jean Meeus astronomical formulations.
 *
 * This implementation is completely separate from Adhan.js and serves as an
 * independent mathematical reference oracle for unit and property testing.
 */

export interface IndependentTimes {
  fajr: number;    // UTC fractional hours (0..24)
  sunrise: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

function d2r(d: number): number {
  return (d * Math.PI) / 180.0;
}

function r2d(r: number): number {
  return (r * 180.0) / Math.PI;
}

function fixHour(a: number): number {
  const res = a - 24.0 * Math.floor(a / 24.0);
  return res < 0 ? res + 24.0 : res;
}

function fixAngle(a: number): number {
  const res = a - 360.0 * Math.floor(a / 360.0);
  return res < 0 ? res + 360.0 : res;
}

/**
 * Computes solar coordinates: declination (delta) and equation of time (eqt)
 * for a given Julian Day using Jean Meeus standard equations (Chapters 25 & 28).
 */
function sunPosition(jd: number): { declination: number; equationOfTime: number } {
  const T = (jd - 2451545.0) / 36525.0;

  // Mean longitude of the Sun (degrees)
  const L0 = fixAngle(280.46646 + 36000.76983 * T);

  // Mean anomaly of the Sun (degrees)
  const M = fixAngle(357.52911 + 35999.05029 * T);

  // Eccentricity of Earth's orbit
  const e = 0.016708634 - 0.000042037 * T;

  // Obliquity of the ecliptic (degrees)
  const eps = 23.439291 - 0.0130042 * T;

  // Sun's Equation of the Center C (degrees)
  const C =
    (1.914602 - 0.004817 * T) * Math.sin(d2r(M)) +
    (0.019993 - 0.000101 * T) * Math.sin(d2r(2 * M)) +
    0.000289 * Math.sin(d2r(3 * M));

  // Sun's true longitude (degrees)
  const sunTrueLon = L0 + C;

  // Declination (degrees)
  const declination = r2d(
    Math.asin(Math.sin(d2r(eps)) * Math.sin(d2r(sunTrueLon))),
  );

  // Equation of Time using Smart/Meeus expansion (radians -> hours)
  const y = Math.pow(Math.tan(d2r(eps / 2.0)), 2);
  const E =
    y * Math.sin(2.0 * d2r(L0)) -
    2.0 * e * Math.sin(d2r(M)) +
    4.0 * e * y * Math.sin(d2r(M)) * Math.cos(2.0 * d2r(L0)) -
    0.5 * y * y * Math.sin(4.0 * d2r(L0)) -
    1.25 * e * e * Math.sin(2.0 * d2r(M));

  // Convert radians to hours (24 hours = 2*PI radians => E * (12 / PI))
  const equationOfTime = (E * 180.0) / Math.PI / 15.0;

  return { declination, equationOfTime };
}

/**
 * Calculates the hour angle for a given solar altitude angle.
 */
function computeHourAngle(altitudeAngle: number, lat: number, declination: number): number {
  const cosHA =
    (Math.sin(d2r(altitudeAngle)) - Math.sin(d2r(lat)) * Math.sin(d2r(declination))) /
    (Math.cos(d2r(lat)) * Math.cos(d2r(declination)));

  if (cosHA > 1 || cosHA < -1) {
    return NaN; // Sun does not reach this altitude
  }

  return r2d(Math.acos(cosHA)) / 15.0;
}

/**
 * Computes independent prayer times in UTC fractional hours.
 */
export function computeIndependentTimes(
  lat: number,
  lon: number,
  year: number,
  month: number,
  day: number,
  fajrAngle: number = 18.0,
  ishaAngle: number = 17.0,
  asrShadowFactor: number = 1.0, // 1 for Shafi'i, 2 for Hanafi
): IndependentTimes {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd0 =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    b -
    1524.5;

  // Approximate transit time in fraction of a day (UTC)
  const approxTransitFraction = (12 - lon / 15.0) / 24.0;
  const jd = jd0 + approxTransitFraction;

  const { declination, equationOfTime } = sunPosition(jd);

  // Solar noon (Dhuhr) in UTC hours
  const dhuhr = fixHour(12 - lon / 15.0 - equationOfTime);

  // Sunrise and Sunset (standard -0.8333 degrees altitude)
  const sunriseHA = computeHourAngle(-0.8333, lat, declination);
  const sunrise = fixHour(dhuhr - sunriseHA);
  const maghrib = fixHour(dhuhr + sunriseHA);

  // Fajr (morning twilight at -fajrAngle)
  const fajrHA = computeHourAngle(-fajrAngle, lat, declination);
  const fajr = fixHour(dhuhr - fajrHA);

  // Isha (evening twilight at -ishaAngle)
  const ishaHA = computeHourAngle(-ishaAngle, lat, declination);
  const isha = fixHour(dhuhr + ishaHA);

  // Asr: shadow length = tan(abs(lat - declination)) + asrShadowFactor
  const noonZenith = Math.abs(lat - declination);
  const asrAltitude = r2d(Math.atan(1.0 / (asrShadowFactor + Math.tan(d2r(noonZenith)))));
  const asrHA = computeHourAngle(asrAltitude, lat, declination);
  const asr = fixHour(dhuhr + asrHA);

  return { fajr, sunrise, dhuhr, asr, maghrib, isha };
}
