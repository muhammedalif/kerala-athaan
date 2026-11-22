# ADR 005: Time Zone and Elevation Handling

## Status
Accepted

## Context
Accurate prayer time computation depends on precise time zone identification and solar noon (transit). Kerala is located within the Indian Standard Time zone (`Asia/Kolkata`, UTC+5:30) with no Daylight Saving Time.

However, users may travel or run devices set to incorrect system time zones or UTC. Furthermore, elevation alters geometric sunrise/sunset.

## Decision
1. **Time Zone Policy**:
   - For all locations within India / Kerala, the calculation time zone is strictly `Asia/Kolkata` (UTC+5:30).
   - If the user's device clock reports an offset different from `+05:30` while viewing an Indian location, a non-blocking warning is displayed informing the user that times reflect the location's local time zone, not the device's clock.
   - For locations outside India, IANA time zones are resolved from coordinates or explicitly selected by the user.
   - Internal date arithmetic always uses UTC instants.

2. **Elevation Policy**:
   - Default elevation is 0 meters (off).
   - Adhan.js does not compute dip of the horizon ($d \approx 0.0347^\circ \sqrt{h}$).
   - The engine accepts `elevationM?: number` in its signature, documents the limitation, and provides transparent metadata.

## Consequences
- No silent time shift caused by misconfigured device clocks.
- Strict consistency with Kerala mosque clocks and civil IST wall time.
