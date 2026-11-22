import { describe, it, expect } from 'vitest';
import { useAppStore } from '../store/useAppStore.js';
import type { SavedLocation } from '@kerala-athaan/engine';

describe('App Zustand Store', () => {
  it('manages active location and saved locations', () => {
    const store = useAppStore.getState();
    expect(store.activeLocation.name).toContain('Kozhikode');

    // Add new location
    const newLoc: SavedLocation = {
      id: 'test-loc-1',
      name: 'Ponnani (പൊന്നാനി)',
      district: 'Malappuram',
      lat: 10.7732,
      lon: 75.9255,
      tz: 'Asia/Kolkata',
      isDefault: false,
    };

    store.addSavedLocation(newLoc);
    expect(useAppStore.getState().savedLocations.some((s) => s.id === 'test-loc-1')).toBe(true);

    // Switch active location
    store.setActiveLocation(newLoc);
    expect(useAppStore.getState().activeLocation.id).toBe('test-loc-1');

    // Rename saved location
    store.renameSavedLocation('test-loc-1', 'Ponnani Harbor');
    expect(useAppStore.getState().activeLocation.name).toBe('Ponnani Harbor');

    // Remove saved location
    store.removeSavedLocation('test-loc-1');
    expect(useAppStore.getState().savedLocations.some((s) => s.id === 'test-loc-1')).toBe(false);
  });

  it('updates calculation profile and prayer adjustments', () => {
    const store = useAppStore.getState();

    store.setPrayerAdjustment('fajr', -3);
    expect(useAppStore.getState().calcProfile.adjustments.fajr).toBe(-3);

    store.updateCalcProfile({ asrMadhhab: 'hanafi' });
    expect(useAppStore.getState().calcProfile.asrMadhhab).toBe('hanafi');

    // Revert
    store.updateCalcProfile({ asrMadhhab: 'shafii' });
    store.setPrayerAdjustment('fajr', 0);
  });

  it('toggles language and view state', () => {
    const store = useAppStore.getState();

    store.setLanguage('en');
    expect(useAppStore.getState().language).toBe('en');

    store.setActiveView('monthly');
    expect(useAppStore.getState().activeView).toBe('monthly');

    // Reset to defaults
    store.setLanguage('ml');
    store.setActiveView('home');
  });
});
