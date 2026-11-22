import { describe, it, expect } from 'vitest';
import {
  searchKeralaGazetteer,
  findNearestKeralaTown,
  KERALA_TOWNS,
} from '../data/keralaTownsGlossary.js';

describe('Kerala Towns Offline Gazetteer', () => {
  it('contains entries covering all 14 districts', () => {
    const districts = new Set(KERALA_TOWNS.map((t) => t.districtEn));
    expect(districts.size).toBe(14);
  });

  it('searches towns by English and Malayalam queries', () => {
    const searchEng = searchKeralaGazetteer('Kozhikode');
    expect(searchEng.length).toBeGreaterThan(0);
    expect(searchEng[0]?.districtEn).toBe('Kozhikode');

    const searchMl = searchKeralaGazetteer('ആലുവ');
    expect(searchMl.length).toBeGreaterThan(0);
    expect(searchMl[0]?.nameEn).toBe('Aluva');
  });

  it('finds the nearest Kerala town accurately using Haversine calculation', () => {
    // Kozhikode Central coords: 11.2588, 75.7804
    const nearestKozhikode = findNearestKeralaTown(11.2588, 75.7804);
    expect(nearestKozhikode.town.id).toBe('kkd-central');
    expect(nearestKozhikode.distanceKm).toBe(0);

    // Munnar high-altitude coords: 10.0889, 77.0595
    const nearestMunnar = findNearestKeralaTown(10.0889, 77.0595);
    expect(nearestMunnar.town.id).toBe('idk-munnar');
    expect(nearestMunnar.distanceKm).toBe(0);

    // Point 5km outside Aluva
    const nearAluva = findNearestKeralaTown(10.13, 76.36);
    expect(nearAluva.town.id).toBe('ekm-aluva');
    expect(nearAluva.distanceKm).toBeLessThan(5);
  });
});
