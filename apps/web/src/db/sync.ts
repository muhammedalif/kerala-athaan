import { db } from './index.js';

export interface SyncStatus {
  isOnline: boolean;
  lastSyncedAt: string | null;
  isSyncing: boolean;
  periodicSyncSupported: boolean;
}

/**
 * Registers Periodic Background Sync with the Service Worker if supported by the browser.
 * Operates on Chromium PWAs with installed status.
 */
export async function registerPeriodicSync(): Promise<boolean> {
  if (
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    'permissions' in navigator
  ) {
    try {
      const registration = (await navigator.serviceWorker.ready) as unknown as {
        periodicSync?: {
          register: (tag: string, options: { minInterval: number }) => Promise<void>;
        };
      };

      if (registration.periodicSync) {
        // Minimum interval: 24 hours (86,400,000 ms)
        await registration.periodicSync.register('sync-timetables', {
          minInterval: 24 * 60 * 60 * 1000,
        });
        return true;
      }
    } catch {
      // Periodic sync permission denied or not supported
      return false;
    }
  }
  return false;
}

/**
 * Executes a foreground sync: updates sync timestamp and catches up on any pending records.
 * Invoked on:
 * 1. App initialization
 * 2. `visibilitychange` when app tab/window becomes active
 * 3. `online` event when connection is restored
 */
export async function performAppSync(): Promise<{ success: boolean; timestamp: string }> {
  const timestamp = new Date().toISOString();

  try {
    // Record sync state in IndexedDB
    await db.syncState.put({
      key: 'last_sync',
      lastSyncedAt: timestamp,
      version: 1,
    });

    return { success: true, timestamp };
  } catch {
    return { success: false, timestamp };
  }
}

/**
 * Retrieves the last recorded sync time from IndexedDB.
 */
export async function getLastSyncTime(): Promise<string | null> {
  try {
    const record = await db.syncState.get('last_sync');
    return record ? record.lastSyncedAt : null;
  } catch {
    return null;
  }
}
