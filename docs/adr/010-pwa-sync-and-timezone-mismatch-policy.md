# ADR 010: PWA Offline Sync, Device Timezone Mismatch Detection, and Audit Trail Policy

## Status
Accepted

## Context
A prayer application utilized by travelers and residents must navigate device clock anomalies:
1. When a user in the Gulf or abroad checks prayer times for Kerala, their device clock is in a foreign timezone (e.g. UTC+4 or UTC+3). If an app evaluates civil dates or day boundaries based on the client device's clock rather than the location's timezone (`Asia/Kolkata`), prayer times roll over prematurely or late, causing invalid timetable displays.
2. Progressive Web Apps on modern browsers require reliable data synchronization without draining device batteries or assuming persistent network connectivity.

## Decision

### 1. Location-Centric Zoned Date Resolution & Mismatch Warning
- Civil dates are resolved strictly in the location's IANA timezone (`Asia/Kolkata` for Kerala), never using `new Date()` device local day.
- A client-side detector evaluates device offset (`-new Date().getTimezoneOffset()`) against the location's expected offset (+330 min for IST).
- If the device clock differs from +05:30 while viewing an India location, a prominent warning is rendered on the home screen:
  > *"Device timezone differs from selected location (Asia/Kolkata). Times are presented in local IST time."*

### 2. Multi-Trigger Synchronization Strategy
- **Periodic Background Sync:** Where supported (Chromium PWA installed tier), registers `sync-timetables` with a 24-hour minimum interval.
- **Foreground Resync:** Automatically synchronizes and updates the `syncState` table on:
  1. App initial launch.
  2. `visibilitychange` (when returning to the app tab or unlocking the screen).
  3. `online` window event (when network connection is restored).
- All calculations remain 100% offline-capable regardless of sync status.

### 3. Role-Gated Admin Audit Trail
- Publishing of moon sighting records or verified mosque timetables requires `moon_committee` or `super_admin` role.
- Every state change writes to the audit log with user id, action, target record ID, and UTC timestamp.
- Superseded records are version-tracked rather than hard-deleted.

## Consequences
- Guaranteed mathematical consistency: times and civil day rollovers never corrupt when travelers view Kerala times from foreign time zones.
- Transparent audit trail for all published Islamic calendar dates.
