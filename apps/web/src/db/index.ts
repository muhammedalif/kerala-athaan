import Dexie, { type Table } from 'dexie';
import type {
  SavedLocation,
  HijriMonthStartRecord,
  UserHijriOverride,
  MosqueRecord,
  TimetableEntry,
} from '@kerala-athaan/engine';

export interface DbSetting {
  key: string;
  value: string | number | boolean | object;
}

export interface DbSyncState {
  key: string;
  lastSyncedAt: string;
  version: number;
}

export class KeralaAthaanDatabase extends Dexie {
  settings!: Table<DbSetting, string>;
  savedLocations!: Table<SavedLocation, string>;
  mosques!: Table<MosqueRecord, string>;
  timetableEntries!: Table<TimetableEntry, [string, string]>; // Compound PK: [mosqueId, date]
  hijriOverrides!: Table<UserHijriOverride & { id?: string }, string>;
  hijriSightings!: Table<HijriMonthStartRecord, string>;
  syncState!: Table<DbSyncState, string>;

  constructor() {
    super('KeralaAthaanDB');

    this.version(1).stores({
      settings: 'key',
      savedLocations: 'id, isDefault, name, district',
      mosques: 'id, district, nameEn, verificationStatus',
      timetableEntries: '[mosqueId+date], mosqueId, date',
      hijriOverrides: 'id, [hijriYear+hijriMonth]',
      hijriSightings: 'id, [hijriYear+hijriMonth], gregorianStartDate, scope',
      syncState: 'key',
    });
  }
}

export const db = new KeralaAthaanDatabase();

/**
 * Requests persistent storage from browser to prevent IndexedDB eviction under disk pressure.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      return isPersisted;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Initializes database with default Kerala locations if empty.
 */
export async function initializeDatabase(
  defaultLocations: SavedLocation[],
): Promise<SavedLocation[]> {
  const count = await db.savedLocations.count();
  if (count === 0) {
    await db.savedLocations.bulkAdd(defaultLocations);
    return defaultLocations;
  }
  return db.savedLocations.toArray();
}
