# ADR 002: Default Calculation Profile and Kerala Conventions

## Status
Accepted

## Context
There is currently no universally codified astronomical calculation angle standard published as a single statutory standard for Kerala. Local mosques in Kerala rely predominantly on regional published timetables (Niskara Samayam) historically calibrated by local scholars and astronomical observatories, or on conventions aligned with 18° or 19.5° Fajr angles.

The non-negotiable rules dictate:
- Never invent data or claim an endorsement without formal cited verification.
- Never silently alter times.
- Label non-Kerala profiles honestly.

## Decision
1. We set the default calculation profile to **Muslim World League (MWL)**:
   - Fajr Angle: 18.0°
   - Isha Angle: 17.0°
2. The UI and engine metadata must explicitly label this profile as:
   `"Muslim World League (Standard astronomical baseline - not a Kerala-specific standard)"`.
3. Kerala-specific calculation profiles (e.g. Samastha Kerala Jamiyyathul Ulama, Kerala Nadvathul Mujahideen, Samyuktha Mahallu Jama'ath) will be introduced strictly as **named profiles** only when backed by published, cited source documentation with documented angles and adjustments.
4. Users are informed that local mosque timetables may differ from pure astronomical MWL calculations by a few minutes due to local horizon considerations or precautionary buffer minutes (Ihtiyat).

## Consequences
- High transparency for end users.
- No false claims of Kerala authority endorsement until cited sources are supplied and verified.
