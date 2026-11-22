# ADR 004: Hijri Calendar Resolution and Precedence Policy

## Status
Accepted

## Context
The Islamic calendar (Hijri) is intrinsically lunar, with each month starting upon the actual visual sighting of the crescent moon (Hilal). However, astronomical software requires deterministic date mapping. Sighting announcements in Kerala are formally issued by recognized Qazis and Hilal committees on the evening of the 29th of each lunar month.

A pure astronomical or Umm al-Qura calculation frequently differs by $\pm 1$ or $\pm 2$ days from Kerala's verified visual sightings.

## Decision
We enforce a strict 3-tier precedence hierarchy for resolving any Hijri date:

1. **User Personal Override** (Highest Precedence):
   - Stored locally in the user's IndexedDB.
   - Allows marking any Gregorian date as the 1st of a Hijri month, or applying a global $\pm 1 / \pm 2$ day offset.
   - Badge: `Edited by you` (`നിങ്ങൾ മാറ്റം വരുത്തിയത്`).
   - Reversible at any time under "My adjustments".

2. **Published Moon-Sighting Confirmation** (Middle Precedence):
   - Sourced from verified Kerala moon committee publications (registered with citation, scope, and two-person verification rule in admin).
   - District scope takes precedence over Kerala-wide scope when available.
   - Badge: `Sighting-confirmed` (`മാസപ്പിറവി സ്ഥിരീകരിച്ചത്`).

3. **Calculated Baseline** (Lowest Precedence / Fallback):
   - Arithmetic / astronomical civil baseline (e.g. Umm al-Qura / standard tabular algorithm).
   - Badge: `Calculated` (`കണക്കുകൂട്ടിയത്`).

### Provisional Month Lengths
- Hijri month length (29 vs 30 days) is derived deterministically from the next month's resolved start date.
- Until the next month's sighting is published, the 30th day is explicitly flagged as **provisional / pending sighting**.
- Prominently display: `"Ramadan dates are subject to moon sighting."`

## Consequences
- The calendar dynamically adapts to official Kerala crescent sightings without breaking offline availability or invalidating prayer times.
- Users always know exactly why a Hijri date is shown through unambiguous provenance tags.
