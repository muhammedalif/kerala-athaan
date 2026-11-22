import { describe, it, expect } from 'vitest';
import { parseCoordinates, parseDmsComponent } from '../src/index.js';

describe('Coordinate Parser & Validator', () => {
  it('parses decimal pairs with various delimiters and whitespace', () => {
    const inputs = [
      '11.2588, 75.7804',
      '11.2588,75.7804',
      '11.2588 75.7804',
      '(11.2588, 75.7804)',
      '[11.2588, 75.7804]',
      '11.2588; 75.7804',
    ];

    for (const input of inputs) {
      const res = parseCoordinates(input);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.lat).toBeCloseTo(11.2588, 4);
        expect(res.lon).toBeCloseTo(75.7804, 4);
        expect(res.warnings).toHaveLength(0);
      }
    }
  });

  it('parses directional decimal coordinates', () => {
    const res = parseCoordinates('11.2588 N, 75.7804 E');
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.lat).toBeCloseTo(11.2588, 4);
      expect(res.lon).toBeCloseTo(75.7804, 4);
    }

    const southern = parseCoordinates('33.8688 S, 151.2093 E');
    expect(southern.success).toBe(true);
    if (southern.success) {
      expect(southern.lat).toBeCloseTo(-33.8688, 4);
      expect(southern.lon).toBeCloseTo(151.2093, 4);
    }
  });

  it('parses Degrees Minutes Seconds (DMS) accurately', () => {
    // 11° 15' 31.68" N = 11 + 15/60 + 31.68/3600 = 11 + 0.25 + 0.0088 = 11.2588
    // 75° 46' 49.44" E = 75 + 46/60 + 49.44/3600 = 75 + 0.766667 + 0.013733 = 75.7804
    const dmsInput = `11° 15' 31.68" N, 75° 46' 49.44" E`;
    const res = parseCoordinates(dmsInput);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.lat).toBeCloseTo(11.2588, 4);
      expect(res.lon).toBeCloseTo(75.7804, 4);
    }
  });

  it('parses single DMS components correctly', () => {
    expect(parseDmsComponent(`11° 15' 31.68" N`)).toBeCloseTo(11.2588, 4);
    expect(parseDmsComponent(`75° 46' 49.44" E`)).toBeCloseTo(75.7804, 4);
    expect(parseDmsComponent(`10° 30' 00" S`)).toBeCloseTo(-10.5, 4);
    expect(parseDmsComponent(`70° 15' 00" W`)).toBeCloseTo(-70.25, 4);
  });

  it('extracts coordinates from Google Maps and OpenStreetMap URLs', () => {
    const urls = [
      'https://www.google.com/maps?q=11.2588,75.7804',
      'https://maps.google.com/?q=11.2588,75.7804',
      'https://www.google.com/maps/@11.2588,75.7804,15z',
      'https://www.openstreetmap.org/#map=16/11.2588/75.7804',
    ];

    for (const url of urls) {
      const res = parseCoordinates(url);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.lat).toBeCloseTo(11.2588, 4);
        expect(res.lon).toBeCloseTo(75.7804, 4);
      }
    }
  });

  it('detects and warns on swapped latitude and longitude for Indian coordinates', () => {
    // User accidentally entered lon as lat, and lat as lon: 75.7804, 11.2588
    const swapped = parseCoordinates('75.7804, 11.2588');
    expect(swapped.success).toBe(true);
    if (swapped.success) {
      expect(swapped.warnings.length).toBeGreaterThan(0);
      expect(swapped.warnings[0]).toContain('appear to be swapped');
    }
  });

  it('rejects coordinates strictly out of bounds', () => {
    // Latitude > 90
    const outLat = parseCoordinates('95.1234, 75.7804');
    expect(outLat.success).toBe(false);
    if (!outLat.success) {
      expect(outLat.error).toContain('out of bounds');
    }

    // Longitude > 180
    const outLon = parseCoordinates('11.2588, 195.0000');
    expect(outLon.success).toBe(false);
    if (!outLon.success) {
      expect(outLon.error).toContain('out of range');
    }
  });
});
