import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../db/index.js';
import { performAppSync, getLastSyncTime, registerPeriodicSync } from '../db/sync.js';

describe('PWA Background & Foreground Sync', () => {
  beforeEach(async () => {
    await db.syncState.clear();
  });

  it('records last sync timestamp in IndexedDB syncState table', async () => {
    const initial = await getLastSyncTime();
    expect(initial).toBeNull();

    const result = await performAppSync();
    expect(result.success).toBe(true);
    expect(result.timestamp).toBeDefined();

    const recorded = await getLastSyncTime();
    expect(recorded).toBe(result.timestamp);
  });

  it('gracefully handles unsupported periodicSync in standard browser/test context', async () => {
    const supported = await registerPeriodicSync();
    expect(typeof supported).toBe('boolean');
    expect(supported).toBe(false);
  });
});
