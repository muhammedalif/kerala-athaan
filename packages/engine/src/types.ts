import type {
  CalcMethod,
  AsrMadhhab,
  HighLatitudeRule,
  PerPrayerAdjustments,
  CustomCalcParameters,
  CalcProfile,
  LocationCoordinates,
  SavedLocation,
  PrayerName,
  Provenance,
  PrayerTimeResult,
  HijriScope,
  HijriProvenance,
  HijriMonthStartRecord,
  UserHijriOverride,
  MosqueRecord,
  TimetableEntry,
  MosqueMode,
  MosqueComparisonItem,
  MosqueComparisonSummary,
  PrayerAthaanStyle,
  PrayerSoundChoice,
  PrayerNotificationPref,
  AthaanPrefs,
  NotificationCapabilities,
} from '@kerala-athaan/schemas';

export type {
  CalcMethod,
  AsrMadhhab,
  HighLatitudeRule,
  PerPrayerAdjustments,
  CustomCalcParameters,
  CalcProfile,
  LocationCoordinates,
  SavedLocation,
  PrayerName,
  Provenance,
  PrayerTimeResult,
  HijriScope,
  HijriProvenance,
  HijriMonthStartRecord,
  UserHijriOverride,
  MosqueRecord,
  TimetableEntry,
  MosqueMode,
  MosqueComparisonItem,
  MosqueComparisonSummary,
  PrayerAthaanStyle,
  PrayerSoundChoice,
  PrayerNotificationPref,
  AthaanPrefs,
  NotificationCapabilities,
};

export interface LocalDate {
  year: number;
  month: number; // 1-12
  day: number;   // 1-31
}

export type RoundingPolicy = 'nearest' | 'floor' | 'ceiling' | 'none';

export interface CoordinateParseSuccess {
  success: true;
  lat: number;
  lon: number;
  warnings: string[];
}

export interface CoordinateParseFailure {
  success: false;
  error: string;
}

export type CoordinateParseResult = CoordinateParseSuccess | CoordinateParseFailure;

export interface HijriDate {
  year: number;
  month: number; // 1-12
  day: number;   // 1-30
  monthNameEn: string;
  monthNameMl: string;
  provenance: HijriProvenance;
  isProvisional: boolean; // True if month length is tentative (e.g. 30th day pending sighting)
  sourceNote?: string;
}

export interface IslamicEvent {
  id: string;
  nameEn: string;
  nameMl: string;
  hijriMonth: number;
  hijriDay: number;
  gregorianDate: LocalDate;
  isSubjectToSighting: boolean;
}

export interface ResolvedDayResult {
  times: PrayerTimeResult[];
  mode: MosqueMode;
  isFallback: boolean;
  fallbackReason?: 'no_verified_row' | 'unverified_mosque' | 'no_mosque_selected';
  mosqueName?: string;
  sourceAttribution?: string;
}

