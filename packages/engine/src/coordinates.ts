import type { CoordinateParseResult } from './types.js';

/**
 * Parses DMS (Degrees Minutes Seconds) string into decimal degrees.
 * Example: `11° 15' 31.68" N` -> 11.2588
 */
export function parseDmsComponent(dmsStr: string): number | null {
  const clean = dmsStr.trim();
  // Regex supporting: deg[°d\s] min['m\s] sec["s\s] [NSEW]
  const match = clean.match(
    /^(\d+(?:\.\d+)?)[°\s_d]?\s*(?:(\d+(?:\.\d+)?)['\s_m]?\s*)?(?:(\d+(?:\.\d+)?)["\s_s]?)?\s*([NSEWnsew])?$/,
  );

  if (!match) return null;

  const degrees = parseFloat(match[1] ?? '0');
  const minutes = match[2] ? parseFloat(match[2]) : 0;
  const seconds = match[3] ? parseFloat(match[3]) : 0;
  const direction = match[4]?.toUpperCase();

  let decimal = degrees + minutes / 60 + seconds / 3600;
  if (direction === 'S' || direction === 'W') {
    decimal = -decimal;
  }

  return decimal;
}

/**
 * Extracts coordinates from map URLs (Google Maps, OpenStreetMap, Apple Maps).
 */
export function extractFromMapUrl(url: string): { lat: number; lon: number } | null {
  try {
    // Google Maps ?q=lat,lon or ll=lat,lon
    const qMatch = url.match(/[?&](?:q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch && qMatch[1] && qMatch[2]) {
      return { lat: parseFloat(qMatch[1]), lon: parseFloat(qMatch[2]) };
    }

    // Google Maps /@lat,lon,zoom
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch && atMatch[1] && atMatch[2]) {
      return { lat: parseFloat(atMatch[1]), lon: parseFloat(atMatch[2]) };
    }

    // OpenStreetMap #map=zoom/lat/lon
    const osmMatch = url.match(/#map=\d+\/(-?\d+\.\d+)\/(-?\d+\.\d+)/);
    if (osmMatch && osmMatch[1] && osmMatch[2]) {
      return { lat: parseFloat(osmMatch[1]), lon: parseFloat(osmMatch[2]) };
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Parses coordinate input in various formats:
 * - Decimal pair: "11.2588, 75.7804" or "11.2588 75.7804" or "(11.2588, 75.7804)"
 * - Directional decimal: "11.2588 N, 75.7804 E"
 * - DMS: "11° 15' 31.68\" N, 75° 46' 49.44\" E"
 * - Map URLs (Google Maps, OpenStreetMap, Apple Maps)
 */
export function parseCoordinates(input: string): CoordinateParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { success: false, error: 'Empty coordinate input' };
  }

  const warnings: string[] = [];

  // Check if map URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const urlCoords = extractFromMapUrl(trimmed);
    if (urlCoords) {
      return validateAndCheckSwapped(urlCoords.lat, urlCoords.lon, warnings);
    }
    return { success: false, error: 'Unrecognized map URL format' };
  }

  // Clean surrounding parentheses or brackets
  const stripped = trimmed.replace(/^[([<{]+|[)\]>}]+$/g, '').trim();

  // Try splitting by comma or semicolon first, else split by whitespace between parts
  let rawLat = '';
  let rawLon = '';

  if (stripped.includes(',') || stripped.includes(';')) {
    const parts = stripped.split(/[,;]/);
    if (parts.length === 2 && parts[0] && parts[1]) {
      rawLat = parts[0].trim();
      rawLon = parts[1].trim();
    }
  } else {
    // Check if contains direction indicators (N/S and E/W)
    const dirMatch = stripped.match(/(.+?[NSns])\s+(.+?[EWew])/);
    if (dirMatch && dirMatch[1] && dirMatch[2]) {
      rawLat = dirMatch[1].trim();
      rawLon = dirMatch[2].trim();
    } else {
      // Split by whitespace
      const parts = stripped.split(/\s+/);
      if (parts.length === 2 && parts[0] && parts[1]) {
        rawLat = parts[0].trim();
        rawLon = parts[1].trim();
      }
    }
  }

  if (!rawLat || !rawLon) {
    return {
      success: false,
      error: 'Could not distinguish latitude and longitude. Use format "lat, lon" or "DMS".',
    };
  }

  // Parse Latitude
  let lat: number | null = null;
  if (/^[+-]?\d+(?:\.\d+)?$/.test(rawLat)) {
    lat = parseFloat(rawLat);
  } else {
    lat = parseDmsComponent(rawLat);
  }

  // Parse Longitude
  let lon: number | null = null;
  if (/^[+-]?\d+(?:\.\d+)?$/.test(rawLon)) {
    lon = parseFloat(rawLon);
  } else {
    lon = parseDmsComponent(rawLon);
  }

  if (lat === null || isNaN(lat)) {
    return { success: false, error: `Invalid latitude component: "${rawLat}"` };
  }
  if (lon === null || isNaN(lon)) {
    return { success: false, error: `Invalid longitude component: "${rawLon}"` };
  }

  return validateAndCheckSwapped(lat, lon, warnings);
}

/**
 * Validates coordinate ranges and emits warnings if coordinates appear swapped.
 */
function validateAndCheckSwapped(
  lat: number,
  lon: number,
  warnings: string[],
): CoordinateParseResult {
  // If lat > 90 or lat < -90, it's invalid as latitude.
  // But if lon is within [-90, 90] and lat is within [-180, 180], user probably swapped them!
  if ((lat > 90 || lat < -90) && lon >= -90 && lon <= 90) {
    return {
      success: false,
      error: `Latitude ${lat} is out of bounds [-90, 90]. Did you mean latitude ${lon}, longitude ${lat}?`,
    };
  }

  if (lat < -90 || lat > 90) {
    return { success: false, error: `Latitude ${lat} out of range [-90, 90]` };
  }
  if (lon < -180 || lon > 180) {
    return { success: false, error: `Longitude ${lon} out of range [-180, 180]` };
  }

  // Swapped coordinates heuristic for India / Kerala:
  // In India, Latitude is roughly 8° to 38° N, and Longitude is roughly 68° to 98° E.
  // If lat > 50 and lon < 40 (e.g. lat=75.78, lon=11.25), it's almost certainly inverted coordinates.
  if (lat >= 50 && lat <= 98 && lon >= 6 && lon <= 38) {
    warnings.push(
      `Latitude (${lat}) and Longitude (${lon}) appear to be swapped for an Indian location. Expected latitude ~8°-38° N and longitude ~68°-98° E.`,
    );
  }

  return {
    success: true,
    lat,
    lon,
    warnings,
  };
}
