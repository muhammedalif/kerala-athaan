import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  db,
  initializeDatabase,
  requestPersistentStorage,
} from '../db/index.js';
import type { SavedLocation, TimetableEntry } from '@kerala-athaan/engine';

describe('Dexie IndexedDB (KeralaAthaanDB)', () => {
  beforeEach(async () => {
    await db.savedLocations.clear();
    await db.settings.clear();
    await db.timetableEntries.clear();
    await db.hijriOverrides.clear();
    await db.hijriSightings.clear();
  });

  it('initializes and seeds default locations if database is empty', async () => {
    const defaults: SavedLocation[] = [
      {
        id: 'loc-1',
        name: 'Kozhikode',
        district: 'Kozhikode',
        lat: 11.2588,
        lon: 75.7804,
        tz: 'Asia/Kolkata',
      },
    ];

    const result = await initializeDatabase(defaults);
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Kozhikode');

    const inDb = await db.savedLocations.toArray();
    expect(inDb).toHaveLength(1);
  });

  it('performs CRUD operations on savedLocations table', async () => {
    const loc: SavedLocation = {
      id: 'loc-tvm',
      name: 'Thiruvananthapuram',
      district: 'Thiruvananthapuram',
      lat: 8.5241,
      lon: 76.9366,
      tz: 'Asia/Kolkata',
    };

    // Create
    await db.savedLocations.put(loc);
    let retrieved = await db.savedLocations.get('loc-tvm');
    expect(retrieved?.name).toBe('Thiruvananthapuram');

    // Update
    await db.savedLocations.put({ ...loc, name: 'Trivandrum Central' });
    retrieved = await db.savedLocations.get('loc-tvm');
    expect(retrieved?.name).toBe('Trivandrum Central');

    // Delete
    await db.savedLocations.delete('loc-tvm');
    retrieved = await db.savedLocations.get('loc-tvm');
    expect(retrieved).toBeUndefined();
  });

  it('persists and retrieves key-value settings', async () => {
    await db.settings.put({ key: 'language', value: 'ml' });
    await db.settings.put({ key: 'roundingPolicy', value: 'floor' });

    const lang = await db.settings.get('language');
    expect(lang?.value).toBe('ml');

    const rounding = await db.settings.get('roundingPolicy');
    expect(rounding?.value).toBe('floor');
  });

  it('stores and retrieves timetable entries by compound primary key [mosqueId+date]', async () => {
    const entry: TimetableEntry = {
      mosqueId: 'mosque-cheraman-1',
      date: '2026-03-20',
      fajr: '05:18',
      sunrise: '06:24',
      dhuhr: '12:35',
      asr: '15:56',
      maghrib: '18:38',
      isha: '19:48',
      sehriCutoff: '05:13',
      sourceNote: 'Cheraman Mahallu published calendar',
    };

    await db.timetableEntries.put(entry);

    // Retrieve using compound PK
    const found = await db.timetableEntries.get(['mosque-cheraman-1', '2026-03-20']);
    expect(found).toBeDefined();
    expect(found?.fajr).toBe('05:18');
    expect(found?.sehriCutoff).toBe('05:13');

    // Query non-existent date returns undefined
    const notFound = await db.timetableEntries.get(['mosque-cheraman-1', '2026-03-21']);
    expect(notFound).toBeUndefined();
  });

  it('handles persistent storage request gracefully', async () => {
    const isPersisted = await requestPersistentStorage();
    expect(typeof isPersisted).toBe('boolean');
  });
});
