# ADR 007: Notification & Athaan Audio Strategy (Honest PWA Limits & Synthesized Chimes)

## Status
Accepted

## Context
Islamic prayer apps are expected by users to alert them reliably at prayer times. However, browsers running Progressive Web Apps (PWAs) have strict operating system and browser engine limitations:
1. When a PWA tab is closed or mobile screen locked, timers (`setTimeout`/`setInterval`) are suspended.
2. Browsers do not support arbitrary background audio playback or custom service-worker audio triggers without user interaction.
3. Attempting to promise "guaranteed background Athaan" from a PWA misleads users and causes missed prayers.
4. Using copyrighted or unverified third-party audio recordings violates licensing rules (Non-Negotiable Rule 9).

## Decision
We enforce strict transparency and clean separation of audio and notification tiers:

### 1. Honest Capability Reporting (Rule 6)
The scheduler exposes a strict contract:
```typescript
interface NotificationScheduler {
  capabilities(): Promise<NotificationCapabilities>;
  schedule(day: PrayerTime[], prefs: AthaanPrefs): Promise<void>;
  cancelAll(): Promise<void>;
  test(prayer: PrayerName): Promise<void>;
}
```
`capabilities()` honestly reports:
- `canPlayBackgroundAudio: false` (on PWA tier)
- `canScheduleLocalExactAlarms: false` (on PWA tier)
- `tier: 'pwa_open_only'`

The user-facing UI displays explicit notice text:
> "In the web app, full Athaan audio plays only while the app is open. For reliable Athaan when closed, use the Android app (planned)."

### 2. Tiered Notification Architecture
- **Tier 1 (PWA Open - Implemented in M6):** In-app Web Audio API playback using scheduled timers. Automatically resyncs on `visibilitychange` to recalculate any missed or pending alerts when the app becomes visible.
- **Tier 2 (Opt-in Web Push - Future PWA enhancement):** Server-side cron push near prayer times. Carries default browser banner or silent notification. Requires explicit user opt-in and server-side timezone/location storage.
- **Tier 3 (Native Android via Capacitor - Planned):** Exact alarms via Android `AlarmManager`, Foreground Service with media notification, boot receiver, and lock-screen stop controls.

### 3. Neutral Tone Synthesis (Rule 9)
To guarantee zero copyright infractions:
- The default sound is a synthesized harmonic acoustic chime (A4 432 Hz / 528 Hz tuning) generated dynamically via the Web Audio API (`OscillatorNode`, `GainNode`).
- No unlicensed MP3 or WAV audio files are bundled with the repository.
- User-supplied recordings or community-licensed recordings can be plugged in only with explicit licensing documentation.

## Consequences
- **Positive:** Absolute transparency with users builds long-term trust. Zero risk of copyright litigation. Clean abstraction layer makes dropping in Capacitor Android native scheduler seamless later.
- **Negative:** PWA users will not hear audio when the browser tab is closed or phone is locked.
