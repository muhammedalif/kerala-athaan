import { create } from 'zustand';
import {
  DEFAULT_CALC_PROFILE,
  notificationScheduler,
  resolveMosqueDay,
  type CalcProfile,
  type LocalDate,
  type PrayerName,
  type RoundingPolicy,
  type SavedLocation,
  type MosqueRecord,
  type TimetableEntry,
  type MosqueMode,
  type AthaanPrefs,
  type PrayerNotificationPref,
  type NotificationCapabilities,
  type UserHijriOverride,
  type HijriMonthStartRecord,
  type HijriResolverContext,
} from '@kerala-athaan/engine';
import i18n from '../i18n.js';
import { db, initializeDatabase, requestPersistentStorage } from '../db/index.js';

export type AppView = 'home' | 'daily' | 'monthly' | 'locations' | 'settings';

interface AppState {
  activeView: AppView;
  language: 'ml' | 'en';
  roundingPolicy: RoundingPolicy;
  currentDate: LocalDate;
  activeLocation: SavedLocation;
  savedLocations: SavedLocation[];
  calcProfile: CalcProfile;
  preferredMosqueName: string | null;
  mosqueMode: MosqueMode;
  selectedMosque: MosqueRecord | null;
  availableMosques: MosqueRecord[];
  currentTimetableRow: TimetableEntry | null;
  athaanPrefs: AthaanPrefs;
  notificationCaps: NotificationCapabilities | null;
  hijriOverrides: (UserHijriOverride & { id: string })[];
  publishedSightings: HijriMonthStartRecord[];
  hijriGlobalOffset: number;
  isDbHydrated: boolean;
  isStoragePersisted: boolean;

  // Actions
  initStorage: () => Promise<void>;
  setActiveView: (view: AppView) => void;
  setLanguage: (lang: 'ml' | 'en') => void;
  setRoundingPolicy: (policy: RoundingPolicy) => void;
  setCurrentDate: (date: LocalDate) => void;
  setActiveLocation: (loc: SavedLocation) => void;
  addSavedLocation: (loc: SavedLocation) => void;
  removeSavedLocation: (id: string) => void;
  renameSavedLocation: (id: string, newName: string) => void;
  updateLocationProfile: (id: string, profile: CalcProfile) => void;
  updateCalcProfile: (profile: Partial<CalcProfile>) => void;
  setPrayerAdjustment: (prayer: PrayerName, minutes: number) => void;
  setPreferredMosqueName: (name: string | null) => void;
  setMosqueMode: (mode: MosqueMode) => void;
  setSelectedMosque: (mosque: MosqueRecord | null) => void;
  setAvailableMosques: (mosques: MosqueRecord[]) => void;
  refreshTimetableRow: () => Promise<void>;
  updateAthaanPrefs: (prefs: Partial<AthaanPrefs>) => void;
  updatePrayerNotification: (prayer: PrayerName, pref: Partial<PrayerNotificationPref>) => void;
  refreshNotificationCaps: () => Promise<void>;
  rescheduleNotifications: () => void;
  addUserHijriOverride: (override: UserHijriOverride) => Promise<void>;
  removeUserHijriOverride: (hijriYear: number, hijriMonth: number) => Promise<void>;
  clearUserHijriOverrides: () => Promise<void>;
  setHijriGlobalOffset: (offset: number) => Promise<void>;
  addPublishedSighting: (sighting: HijriMonthStartRecord) => Promise<void>;
  getHijriContext: () => HijriResolverContext;
}

const today = new Date();
const initialDate: LocalDate = {
  year: today.getFullYear(),
  month: today.getMonth() + 1,
  day: today.getDate(),
};

const initialSavedLocations: SavedLocation[] = [
  {
    id: 'loc-kozhikode',
    name: 'Kozhikode (കോഴിക്കോട്)',
    district: 'Kozhikode',
    lat: 11.2588,
    lon: 75.7804,
    elevationM: 1,
    tz: 'Asia/Kolkata',
    isDefault: true,
  },
  {
    id: 'loc-tvm',
    name: 'Thiruvananthapuram (തിരുവനന്തപുരം)',
    district: 'Thiruvananthapuram',
    lat: 8.5241,
    lon: 76.9366,
    elevationM: 10,
    tz: 'Asia/Kolkata',
    isDefault: false,
  },
  {
    id: 'loc-kochi',
    name: 'Kochi (കൊച്ചി)',
    district: 'Ernakulam',
    lat: 9.9816,
    lon: 76.2999,
    elevationM: 4,
    tz: 'Asia/Kolkata',
    isDefault: false,
  },
];

const defaultAthaanPrefs: AthaanPrefs = {
  masterVolume: 0.8,
  fajr: { enabled: true, style: 'short', soundChoice: 'neutral_tone', prePrayerReminderMinutes: 0, volume: 0.8 },
  sunrise: { enabled: false, style: 'silent', soundChoice: 'neutral_tone', prePrayerReminderMinutes: 0, volume: 0.8 },
  dhuhr: { enabled: true, style: 'short', soundChoice: 'neutral_tone', prePrayerReminderMinutes: 0, volume: 0.8 },
  asr: { enabled: true, style: 'short', soundChoice: 'neutral_tone', prePrayerReminderMinutes: 0, volume: 0.8 },
  maghrib: { enabled: true, style: 'short', soundChoice: 'neutral_tone', prePrayerReminderMinutes: 0, volume: 0.8 },
  isha: { enabled: true, style: 'short', soundChoice: 'neutral_tone', prePrayerReminderMinutes: 0, volume: 0.8 },
  tahajjudEnabled: false,
  tahajjudMinutesBeforeFajr: 45,
  sehriAlertEnabled: false,
  sehriAlertMinutesBeforeFajr: 20,
};

export const useAppStore = create<AppState>((set, get) => ({
  activeView: 'home',
  language: 'ml',
  roundingPolicy: 'nearest',
  currentDate: initialDate,
  activeLocation: initialSavedLocations[0]!,
  savedLocations: initialSavedLocations,
  calcProfile: DEFAULT_CALC_PROFILE,
  preferredMosqueName: null,
  mosqueMode: 'astronomical',
  selectedMosque: null,
  availableMosques: [],
  currentTimetableRow: null,
  athaanPrefs: defaultAthaanPrefs,
  notificationCaps: null,
  hijriOverrides: [],
  publishedSightings: [],
  hijriGlobalOffset: 0,
  isDbHydrated: false,
  isStoragePersisted: false,

  initStorage: async () => {
    try {
      const persisted = await requestPersistentStorage();
      const locations = await initializeDatabase(initialSavedLocations);

      // Load saved settings
      const langSetting = await db.settings.get('language');
      const roundingSetting = await db.settings.get('roundingPolicy');
      const profileSetting = await db.settings.get('calcProfile');
      const activeLocSetting = await db.settings.get('activeLocationId');
      const mosqueModeSetting = await db.settings.get('mosqueMode');
      const selectedMosqueIdSetting = await db.settings.get('selectedMosqueId');
      const athaanPrefsSetting = await db.settings.get('athaanPrefs');
      const hijriOffsetSetting = await db.settings.get('hijriGlobalOffset');

      let activeLoc = locations[0]!;
      if (activeLocSetting?.value) {
        const found = locations.find((l) => l.id === activeLocSetting.value);
        if (found) activeLoc = found;
      }

      const lang = (langSetting?.value as 'ml' | 'en') || 'ml';
      i18n.changeLanguage(lang);

      // Load mosques from cache
      const mosques = await db.mosques.toArray();
      let selectedM: MosqueRecord | null = null;
      if (selectedMosqueIdSetting?.value) {
        selectedM = mosques.find((m) => m.id === selectedMosqueIdSetting.value) || null;
      }

      const mode = (mosqueModeSetting?.value as MosqueMode) || 'astronomical';
      const prefs = (athaanPrefsSetting?.value as AthaanPrefs) || defaultAthaanPrefs;

      // Load Hijri overrides and sightings from Dexie
      const overrides = (await db.hijriOverrides.toArray()) as (UserHijriOverride & { id: string })[];
      const sightings = await db.hijriSightings.toArray();
      const globalOffset = typeof hijriOffsetSetting?.value === 'number' ? hijriOffsetSetting.value : 0;

      const caps = await notificationScheduler.capabilities();

      set({
        savedLocations: locations,
        activeLocation: activeLoc,
        language: lang,
        roundingPolicy: (roundingSetting?.value as RoundingPolicy) || 'nearest',
        calcProfile: (profileSetting?.value as CalcProfile) || DEFAULT_CALC_PROFILE,
        mosqueMode: mode,
        availableMosques: mosques,
        selectedMosque: selectedM,
        preferredMosqueName: selectedM ? selectedM.nameEn : null,
        athaanPrefs: prefs,
        notificationCaps: caps,
        hijriOverrides: overrides,
        publishedSightings: sightings,
        hijriGlobalOffset: globalOffset,
        isDbHydrated: true,
        isStoragePersisted: persisted,
      });

      if (selectedM) {
        await get().refreshTimetableRow();
      }

      get().rescheduleNotifications();
    } catch {
      // If IndexedDB unavailable, fallback gracefully to in-memory state
      set({ isDbHydrated: true });
    }
  },

  setActiveView: (view) => set({ activeView: view }),

  setLanguage: (lang) => {
    i18n.changeLanguage(lang);
    set({ language: lang });
    db.settings.put({ key: 'language', value: lang }).catch(() => {});
  },

  setRoundingPolicy: (policy) => {
    set({ roundingPolicy: policy });
    db.settings.put({ key: 'roundingPolicy', value: policy }).catch(() => {});
  },

  setCurrentDate: (date) => {
    set({ currentDate: date });
    get().refreshTimetableRow();
  },

  setActiveLocation: (loc) => {
    set({
      activeLocation: loc,
      calcProfile: loc.profile ? loc.profile : get().calcProfile,
    });
    if (loc.id) {
      db.settings.put({ key: 'activeLocationId', value: loc.id }).catch(() => {});
    }
  },

  addSavedLocation: (loc) => {
    const exists = get().savedLocations.some((s) => s.id === loc.id);
    if (!exists) {
      const updated = [...get().savedLocations, loc];
      set({ savedLocations: updated });
      db.savedLocations.put(loc).catch(() => {});
    }
  },

  removeSavedLocation: (id) => {
    const updated = get().savedLocations.filter((s) => s.id !== id);
    set({ savedLocations: updated });
    db.savedLocations.delete(id).catch(() => {});
  },

  renameSavedLocation: (id, newName) => {
    const updated = get().savedLocations.map((s) =>
      s.id === id ? { ...s, name: newName } : s,
    );
    const newActive =
      get().activeLocation.id === id
        ? { ...get().activeLocation, name: newName }
        : get().activeLocation;

    set({
      savedLocations: updated,
      activeLocation: newActive,
    });

    const found = updated.find((l) => l.id === id);
    if (found) {
      db.savedLocations.put(found).catch(() => {});
    }
  },

  updateLocationProfile: (id, profile) => {
    const updated = get().savedLocations.map((l) => {
      if (l.id === id) {
        return { ...l, profile };
      }
      return l;
    });
    set({
      savedLocations: updated,
      calcProfile: get().activeLocation.id === id ? profile : get().calcProfile,
      activeLocation:
        get().activeLocation.id === id
          ? { ...get().activeLocation, profile }
          : get().activeLocation,
    });
    const targetLoc = updated.find((l) => l.id === id);
    if (targetLoc) {
      db.savedLocations.put(targetLoc).catch(() => {});
    }
  },

  updateCalcProfile: (partial) => {
    const updated = {
      ...get().calcProfile,
      ...partial,
    };
    set({ calcProfile: updated });
    db.settings.put({ key: 'calcProfile', value: updated }).catch(() => {});
  },

  setPrayerAdjustment: (prayer, minutes) => {
    const current = get().calcProfile;
    const updated: CalcProfile = {
      ...current,
      adjustments: {
        ...current.adjustments,
        [prayer]: minutes,
      },
    };
    set({ calcProfile: updated });
    db.settings.put({ key: 'calcProfile', value: updated }).catch(() => {});
  },

  setPreferredMosqueName: (name) => set({ preferredMosqueName: name }),

  setMosqueMode: (mode) => {
    set({ mosqueMode: mode });
    db.settings.put({ key: 'mosqueMode', value: mode }).catch(() => {});
  },

  setSelectedMosque: (mosque) => {
    set({
      selectedMosque: mosque,
      preferredMosqueName: mosque ? mosque.nameEn : null,
    });
    if (mosque) {
      db.settings.put({ key: 'selectedMosqueId', value: mosque.id }).catch(() => {});
      db.mosques.put(mosque).catch(() => {});
      get().refreshTimetableRow();
    } else {
      db.settings.delete('selectedMosqueId').catch(() => {});
      set({ currentTimetableRow: null });
    }
  },

  setAvailableMosques: (mosques) => set({ availableMosques: mosques }),

  refreshTimetableRow: async () => {
    const { selectedMosque, currentDate } = get();
    if (!selectedMosque) {
      set({ currentTimetableRow: null });
      return;
    }
    const dateStr = `${currentDate.year}-${String(currentDate.month).padStart(2, '0')}-${String(currentDate.day).padStart(2, '0')}`;
    try {
      const row = await db.timetableEntries.get([selectedMosque.id, dateStr]);
      set({ currentTimetableRow: row || null });
    } catch {
      set({ currentTimetableRow: null });
    }
  },

  updateAthaanPrefs: (partial) => {
    const updated = {
      ...get().athaanPrefs,
      ...partial,
    };
    set({ athaanPrefs: updated });
    db.settings.put({ key: 'athaanPrefs', value: updated }).catch(() => {});
    get().rescheduleNotifications();
  },

  updatePrayerNotification: (prayer, pref) => {
    const current = get().athaanPrefs;
    const currentPrayerPref = current[prayer];
    const updated: AthaanPrefs = {
      ...current,
      [prayer]: {
        ...currentPrayerPref,
        ...pref,
      },
    };
    set({ athaanPrefs: updated });
    db.settings.put({ key: 'athaanPrefs', value: updated }).catch(() => {});
    get().rescheduleNotifications();
  },

  refreshNotificationCaps: async () => {
    const caps = await notificationScheduler.capabilities();
    set({ notificationCaps: caps });
  },

  rescheduleNotifications: () => {
    const { activeLocation, currentDate, calcProfile, mosqueMode, selectedMosque, currentTimetableRow, athaanPrefs } = get();
    const resolved = resolveMosqueDay({
      mode: mosqueMode,
      location: activeLocation,
      date: currentDate,
      userProfile: calcProfile,
      mosque: selectedMosque,
      timetableRow: currentTimetableRow,
    });
    notificationScheduler.schedule(resolved.times, athaanPrefs).catch(() => {});
  },

  addUserHijriOverride: async (override: UserHijriOverride) => {
    const id = `${override.hijriYear}-${override.hijriMonth}`;
    const record = { ...override, id };
    await db.hijriOverrides.put(record);
    const existing = get().hijriOverrides.filter((o) => o.id !== id);
    set({ hijriOverrides: [...existing, record] });
  },

  removeUserHijriOverride: async (hijriYear: number, hijriMonth: number) => {
    const id = `${hijriYear}-${hijriMonth}`;
    await db.hijriOverrides.delete(id);
    set({ hijriOverrides: get().hijriOverrides.filter((o) => o.id !== id) });
  },

  clearUserHijriOverrides: async () => {
    await db.hijriOverrides.clear();
    set({ hijriOverrides: [] });
  },

  setHijriGlobalOffset: async (offset: number) => {
    set({ hijriGlobalOffset: offset });
    await db.settings.put({ key: 'hijriGlobalOffset', value: offset });
  },

  addPublishedSighting: async (sighting: HijriMonthStartRecord) => {
    await db.hijriSightings.put(sighting);
    const existing = get().publishedSightings.filter((s) => s.id !== sighting.id);
    set({ publishedSightings: [...existing, sighting] });
  },

  getHijriContext: (): HijriResolverContext => {
    const { publishedSightings, hijriOverrides, hijriGlobalOffset, activeLocation } = get();
    return {
      publishedSightings,
      userOverrides: hijriOverrides,
      userGlobalOffsetDays: hijriGlobalOffset,
      district: activeLocation.district,
    };
  },
}));
