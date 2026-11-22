# ADR 001: Selection and Limitations of Calculation Library (Adhan.js)

## Status
Accepted

## Context
Accurate, offline-capable prayer time calculation is a core requirement for Kerala Athaan. The non-negotiable rules dictate:
1. The calculation engine must work with no internet connection once location and settings are saved. It must never call a remote API for prayer calculation.
2. We must not invent astronomical algorithms, nor copy proprietary third-party code.
3. Every displayed time must have a clear provenance and an auditable calculation trail.

We evaluated `adhan` (Adhan.js) v4.4.3, an open-source, thoroughly tested astronomical calculation library for Islamic prayer times based on Jean Meeus's *Astronomical Algorithms*.

## Findings & Capabilities

### Supported Methods
Adhan.js provides built-in parameter presets matching major international standards:
- **MuslimWorldLeague**: Fajr 18.0°, Isha 17.0°
- **Egyptian**: Fajr 19.5°, Isha 17.5°
- **Karachi**: Fajr 18.0°, Isha 18.0°
- **UmmAlQura**: Fajr 18.5°, Isha 90 min after Maghrib (120 min during Ramadan)
- **NorthAmerica (ISNA)**: Fajr 15.0°, Isha 15.0°
- **Singapore (MUIS)**: Fajr 20.0°, Isha 18.0°
- **Other / Custom**: Custom parameters supporting arbitrary Fajr, Maghrib, and Isha solar depression angles or fixed Isha intervals.

### Madhab (Asr Shadow Factor)
Adhan.js implements the classical Asr shadow length formulas:
- `Shafi` (Standard): Shadow of an object equals the object length plus shadow at noon ($n = 1$).
- `Hanafi`: Shadow of an object equals twice the object length plus shadow at noon ($n = 2$).

### High-Latitude Rules
Adhan.js supports:
- `MiddleOfTheNight`: Caps twilight at half the night length.
- `SeventhOfTheNight`: Caps twilight at 1/7th of the night length.
- `TwilightAngle`: Scales twilight duration proportionally based on the sun's angle relative to 60° latitude.

### Rounding Mechanics
Adhan.js provides three rounding modes via `Rounding`:
- `Nearest` (default in Adhan): Rounds up or down to nearest minute at 30 seconds.
- `Up`: Rounds up if seconds > 0.
- `None`: Retains unrounded Date objects with exact milliseconds.

**Decision on Rounding**: We configure Adhan.js with `Rounding.None` internally. All engine outputs store pure unrounded UTC instants. Rounding is deferred strictly to display time and formatting, ensuring mathematical consistency and enabling precise comparison against mosque timetables and reference fixtures.

## Critical Limitation: Elevation Support
Adhan.js computes solar altitude at sunrise/sunset as a hardcoded constant:
$$\alpha_{\text{sunrise/sunset}} = -50' = -0.8333^\circ$$
representing 34 arcminutes of atmospheric refraction plus 16 arcminutes for the Sun's semi-diameter at sea level (0 meters elevation).

Adhan.js's `Coordinates` class accepts only `(latitude, longitude)`. It **does not accept elevation** and does not apply horizon depression (dip of the horizon):
$$d \approx 0.0347^\circ \times \sqrt{h \text{ (meters)}}$$

### Impact for Kerala
Most of Kerala's population resides in coastal and midland plains (0 to 150m above sea level), where elevation impact on sunrise/sunset is under 30 seconds. However, high-altitude regions (e.g. Wayanad plateau at ~700–1000m, Munnar at ~1500m) experience an actual geometric horizon dip of ~1.0° to 1.3°, advancing sunrise and delaying sunset by ~3 to 5 minutes.

### Kerala Athaan Policy
1. We document this limitation explicitly and transparently to users.
2. Elevation is optional and defaulted to off (0m).
3. If an elevation parameter is provided, our engine accepts it in the schema, logs the parameter, and notes in the documentation that Adhan.js calculates times at sea-level horizon. (In later milestones, an elevation correction factor can be layered onto sunrise/sunset if verified against local high-altitude mosque timetables).

## Consequences
- We adopt Adhan.js v4.4.3 as our baseline calculation library.
- We wrap Adhan.js inside `packages/engine` behind our own strict TypeScript contract, isolating our application logic from library-specific quirks.
- We set `rounding: Rounding.None` on Adhan parameters so our engine yields raw UTC timestamps with micro-accuracy, keeping rounding strictly in the display layer.
