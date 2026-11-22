# ADR 003: Asr Madhhab Default (Shafi'i)

## Status
Accepted

## Context
In Islamic jurisprudence, the entry time of Asr is determined by the length of an object's shadow:
- **Jumhur (Shafi'i, Maliki, Hanbali)**: Asr begins when the shadow of an upright object equals its noon shadow plus the length of the object ($1\times \text{object height}$).
- **Hanafi**: Asr begins when the shadow of an upright object equals its noon shadow plus twice the length of the object ($2\times \text{object height}$).

The overwhelming majority of Muslims in Kerala follow the Shafi'i madhhab.

## Decision
1. The default Asr calculation setting in Kerala Athaan is **Shafi'i** ($n = 1$).
2. The user can select **Hanafi** ($n = 2$) at any time in the settings or on a per-saved-location basis.
3. The selected madhhab is surfaced transparently in the daily timetable and calculation metadata.

## Consequences
- Defaults match the local religious tradition in Kerala without imposing it universally or hiding the Hanafi option.
