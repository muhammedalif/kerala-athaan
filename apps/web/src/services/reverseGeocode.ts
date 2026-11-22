import { findNearestKeralaTown } from '../data/keralaTownsGlossary.js';

export interface ReverseGeocodeResult {
  name: string;
  district?: string;
  source: 'online' | 'offline_gazetteer' | 'coordinates';
  distanceKm?: number;
}

// Client-side cache to avoid repeated network lookups
const clientCache = new Map<string, ReverseGeocodeResult>();

/**
 * Resolves geographic coordinates into a human-readable location name.
 * Priority:
 * 1. Online Edge Function (OpenStreetMap Nominatim with server caching)
 * 2. Offline fallback: nearest town from bundled Kerala open-data gazetteer
 * 3. Fallback: exact coordinates string
 *
 * Never guesses or fabricates a place name.
 */
export async function reverseGeocode(
  lat: number,
  lon: number,
  language: 'en' | 'ml' = 'en',
): Promise<ReverseGeocodeResult> {
  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)},${language}`;
  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey)!;
  }

  // 1. Try online reverse geocoding if online
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout

      // Query OpenStreetMap Nominatim directly or via edge function
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`;
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept-Language': language === 'ml' ? 'ml,en;q=0.8' : 'en',
          'User-Agent': 'KeralaAthaanPWA/1.0 (https://keralaathaan.org)',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        const locality =
          address.suburb ||
          address.town ||
          address.village ||
          address.city ||
          address.county ||
          '';
        const district = address.state_district || address.county || '';

        if (locality) {
          const result: ReverseGeocodeResult = {
            name: district ? `${locality}, ${district}` : locality,
            district,
            source: 'online',
          };
          clientCache.set(cacheKey, result);
          return result;
        }
      }
    } catch {
      // Network failure or timeout -> proceed cleanly to offline gazetteer fallback
    }
  }

  // 2. Offline fallback: find nearest town from bundled open-data gazetteer
  const nearest = findNearestKeralaTown(lat, lon);

  // If within 100km of a known Kerala town, use it with explicit distance attribution
  if (nearest.distanceKm <= 100) {
    const townName = language === 'ml' ? nearest.town.nameMl : nearest.town.nameEn;
    const districtName = language === 'ml' ? nearest.town.districtMl : nearest.town.districtEn;

    const name =
      nearest.distanceKm < 1
        ? `${townName} (${districtName})`
        : `${townName} (~${nearest.distanceKm} km)`;

    const result: ReverseGeocodeResult = {
      name,
      district: nearest.town.districtEn,
      source: 'offline_gazetteer',
      distanceKm: nearest.distanceKm,
    };
    clientCache.set(cacheKey, result);
    return result;
  }

  // 3. Fallback to exact coordinates if outside Kerala or no town nearby
  const fallbackResult: ReverseGeocodeResult = {
    name: `${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`,
    source: 'coordinates',
  };
  clientCache.set(cacheKey, fallbackResult);
  return fallbackResult;
}
