# Kerala Athaan Calculation Methodology

Version: 1.0.0
Author: Kerala Athaan Engineering Team

---

## 1. Architectural Philosophy

Kerala Athaan is built on three fundamental tenets:
1. **Mathematical Honesty**: Never silently coerce astronomical calculations to match another app.
2. **Provenance Transparency**: Every single time stamp displayed carries an explicit tag:
   - `calculated`: Derived directly from astronomical solar equations for the selected method and coordinates.
   - `adjusted`: Derived from astronomical calculation plus user or admin configured minute offsets.
   - `mosque-verified`: Exact row from a human-verified, published mosque timetable.
3. **Zero Network Dependence**: All core calculations execute 100% locally on the device with zero remote API calls.

---

## 2. Solar Position & Prayer Time Formulation

The position of the Sun is determined using high-precision astronomical algorithms (Jean Meeus solar coordinates).

### 2.1 Prayers Defined

- **Fajr (Dawn)**:
  Subh Sadiq (true dawn), when morning twilight first appears horizontally on the horizon. Occurs when the Sun's center descends to $\alpha_{\text{fajr}}$ degrees below the astronomical horizon.
- **Sunrise (Shuruq)**:
  When the upper limb of the Sun breaks the horizon. Geometrically calculated at $-0.8333^\circ$ ($-50'$), accounting for atmospheric refraction (34') and solar semi-diameter (16').
- **Dhuhr (Midday / Solar Noon)**:
  The moment the Sun transits the local celestial meridian (Zawal).
- **Asr (Afternoon)**:
  When the shadow of an upright object exceeds its solar noon shadow by a factor $n$:
  - Shafi'i (Standard default in Kerala): $n = 1$
  - Hanafi: $n = 2$
  $$\text{Shadow Length} = \tan(\theta_{\text{noon}})^{-1} + n$$
- **Maghrib (Sunset)**:
  When the upper limb of the Sun completely disappears below the astronomical horizon (solar altitude $-0.8333^\circ$).
- **Isha (Nightfall)**:
  Disappearance of the evening twilight (Shafaq). Occurs when the Sun descends to $\alpha_{\text{isha}}$ degrees below the horizon (or fixed interval after Maghrib, e.g. 90 minutes in Umm al-Qura).

---

## 3. Supported Calculation Methods

| Method Code | Name | Fajr Angle | Isha Parameter | Description |
| :--- | :--- | :--- | :--- | :--- |
| `mwl` | Muslim World League | 18.0° | 17.0° | **Default baseline** (clearly labelled: not a Kerala-specific standard) |
| `umm-al-qura` | Umm al-Qura (Makkah) | 18.5° | +90 min (+120 min Ramadan) | Saudi standard |
| `karachi` | Univ. of Islamic Sciences, Karachi | 18.0° | 18.0° | Common across Pakistan, India, Bangladesh |
| `isna` | Islamic Society of North America | 15.0° | 15.0° | North American standard |
| `egyptian` | Egyptian General Authority of Survey | 19.5° | 17.5° | Africa, Syria, parts of Middle East |
| `singapore-muis` | MUIS Singapore | 20.0° | 18.0° | South East Asia (Singapore/Malaysia) |
| `custom` | Custom Parameters | User defined | User defined | Explicit Fajr, Maghrib, Isha angles or intervals |

*Note on Kerala Profiles: Formal Kerala calculation profiles (e.g., Samastha, KNM) will be added once cited, verified reference documents with exact parameters are registered.*

---

## 4. Time Zone and Civil Date Resolution

- A prayer day is indexed by its **civil calendar date in the target location's time zone** (for Kerala, `Asia/Kolkata`, UTC+5:30), **never** the device's clock or time zone.
- Computing prayer times for `2026-03-20` in Kozhikode evaluates the solar cycle for that specific civil calendar day in IST.
- If the client device clock reports an offset differing from `+05:30` when viewing an Indian location, a warning informs the user:
  > *"Device timezone differs from the selected location (Asia/Kolkata). Times are presented in the local location time."*

---

## 5. Rounding and Precision Policy

1. **Internal Precision**: All internal calculation results are pure unrounded UTC `Date` objects retaining millisecond accuracy.
2. **Display Rounding**: Rounding occurs strictly in the display formatting layer:
   - `nearest` (Standard): $\ge 30$ seconds rounds up to the next minute; $< 30$ seconds rounds down.
   - `floor`: Truncates seconds, matching digital clock displays that only tick on the whole minute.
   - `ceiling`: Rounds up if seconds $> 0$ (used in some traditional timetables as a precautionary buffer / Ihtiyat).
3. The display formatting function:
   `formatPrayerDisplay(time: Date, tz: string, rounding: 'nearest' | 'floor' | 'ceiling'): string`

---

## 6. Adjustments and Provenance Tracking

When per-prayer minute adjustments are applied:
$$\text{Adjusted Time} = \text{Base Instant} + (\text{adjustmentMin} \times 60\,000\text{ ms})$$

Provenance assignment:
- If `adjustmentMin === 0` and calculated: `provenance = 'calculated'`
- If `adjustmentMin !== 0`: `provenance = 'adjusted'`
- If loaded from verified mosque timetable: `provenance = 'mosque-verified'`

---

## 7. Hijri Calendar Resolution Engine

Hijri month calculation resolves through a strict three-tier precedence:
1. **User Personal Edit**: User marks a date as the 1st of a month, or sets a $\pm 1$ or $\pm 2$ day offset. (Local to user's device).
2. **Published Moon Sighting**: Registered committee confirmation for Kerala or a specific district.
3. **Calculated Baseline**: Standard arithmetic tabular civil baseline.

### Provisional Month Status
- Month duration (29 vs 30 days) is defined by when the next month commences.
- Until the next month's start is officially published or edited, the 30th day is explicitly flagged as **provisional / pending sighting**.
- Prominent notice: *"Ramadan dates are subject to moon sighting."*

---

## 8. Mosque Timetable Resolution Engine

The mosque resolution engine operates in three distinct modes chosen explicitly by the user:

1. **`astronomical`**: Pure solar calculation based on device/saved location coordinates.
2. **`verified_timetable`**: Uses human-verified, official published timetable rows for the selected mosque.
   - **Fallback Mechanism**: If no verified published row exists for the requested date, the engine automatically falls back to astronomical calculation, surfaces an amber warning badge (`fallbackReason: 'no_verified_row'`), and **never fabricates a time**.
3. **`mosque_adjusted_astronomical`**: Astronomical calculation utilizing the mosque's specific calculation profile, Asr madhhab, and minute offsets.

### Discrepancy Detection & Comparison
- The engine calculates differences in minutes between verified mosque rows and pure astronomical calculation:
  $$\Delta = \text{round}\left(\frac{\text{Time}_{\text{mosque}} - \text{Time}_{\text{calculated}}}{60\,000\text{ ms}}\right)$$
- If $|\Delta| > 5\text{ minutes}$ (configurable threshold), the UI displays a discrepancy flag.

---

## 9. Trusted-Source Monitoring & Multi-Source Disagreements

The server-side Source Watcher (`supabase/functions/source-watcher`) monitors an allowlist of recognized Kerala Islamic bodies (e.g., Samastha Kerala Jam'eyyat ul-Ulama, Samyuktha Mahallu Jama'ath).

### Non-Negotiable Flow
1. Fetch snapshot $\to$ SHA-256 deterministic hash $\to$ Extract candidate sighting $\to$ Admin review queue.
2. **Multi-Source Disagreement Principle**:
   - When two recognized bodies announce differing sighting declarations, **both sources are displayed side-by-side with full source attribution**.
   - **Nothing is auto-chosen or mathematically averaged**. Humans verify and publish announcements.

---

## 10. Athaan Audio Synthesis (Pure Web Audio API)

In accordance with Non-Negotiable Rule 9 (*"Do not use an unlicensed Athaan recording. Ship a short neutral tone by default; add recordings only when I supply permission"*):
- Zero external MP3/WAV files are bundled.
- A neutral acoustic harmonic chime is dynamically synthesized on-device via the Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`).
- Dual frequency resonance (A4 432 Hz fundamental with 528 Hz harmonic overtone and exponential gain decay).

---

## 11. Honest Notification Scheduler & PWA Capabilities

In accordance with Non-Negotiable Rule 6 (*"Do not promise guaranteed background Athaan from a PWA. Detect capabilities and tell users the truth"*):
- The scheduler contract:
  ```typescript
  interface NotificationScheduler {
    capabilities(): Promise<NotificationCapabilities>;
    schedule(day: PrayerTime[], prefs: AthaanPrefs): Promise<void>;
    cancelAll(): Promise<void>;
    test(prayer: PrayerName): Promise<void>;
  }
  ```
- Capabilities honestly report:
  `{ canPlayBackgroundAudio: false, canScheduleLocalExactAlarms: false, tier: 'pwa_open_only' }`.
- User-facing settings text states plainly:
  > *"In the web app, full Athaan audio plays only while the app is open. For reliable Athaan when closed, use the Android app (planned)."*
- Timers auto-resync upon `visibilitychange` when the app becomes visible.

---

## 12. Ramadan Fasting Module & Mosque Sehri Cutoff

1. **Separation of Sehri Cutoff and Fajr**:
   - If a preferred mosque publishes `sehriCutoffMinutes` (e.g. 10m or 15m), Sehri End (Imsak) is computed as $\text{Fajr} - \text{cutoff}$.
   - The UI displays both times separately with unambiguous labels.
2. **Live Fasting Countdown**:
   - Evaluates real-time state: `eating_allowed` (night, counts down to Sehri end) vs `fasting` (day, counts down to Iftar).
3. **Mandatory Disclaimer**:
   - Displayed prominently across Ramadan views: *"Ramadan dates are subject to moon sighting."* (`മാസപ്പിറവി കാണുന്നതിനനുസരിച്ച് റമദാൻ തീയതികളിൽ മാറ്റമുണ്ടാകാം.`).

---

## 13. Regional Convention Suggestions & Reverse Geocoding

1. **Regional Convention Profiles**:
   - Geographic boundaries (Kerala Plains/Coast and Highland Western Ghats) offer convention suggestions.
   - The user explicitly chooses whether to apply or keep custom settings. Never silently altered.
2. **Multi-Tier Reverse Geocoding**:
   - Online: Supabase Edge Function with OpenStreetMap Nominatim and server caching.
   - Offline Fallback: Nearest town from bundled open-data gazetteer with distance attribution.
   - Never guesses a place name. Users can rename any location.
