# ADR 008: Ramadan Module Architecture and Fasting Countdown Specification

## Status
Accepted

## Context
During the holy month of Ramadan, users depend on the app for two critical daily milestones:
1. **Sehri / Imsak (അത്താഴ വിരാമം):** The cessation of eating and drinking before Fajr.
2. **Iftar (ഇഫ്താർ):** The breaking of the fast upon sunset (Maghrib).

In Kerala mahallu traditions:
- Many mosques designate a specific precautionary buffer (e.g. 10 to 15 minutes prior to Fajr prayer) for the Sehri cutoff (Imsak / ഇംസാക്).
- Others align Sehri cutoff strictly with the astronomical Fajr call to prayer.
- Misrepresenting a mosque's specific Sehri cutoff as the Fajr prayer time (or vice versa) creates confusion and violates liturgical accuracy.

## Decision
1. **Separation of Sehri Cutoff and Fajr (Non-Negotiable Rules 1 & 2):**
   - The calculation engine computes astronomical Fajr independently.
   - If a preferred mosque publishes a `sehriCutoffMinutes` property (e.g. 10 or 15 mins), the Sehri cutoff time is calculated as:
     $$\text{Imsak} = \text{Fajr} - (\text{sehriCutoffMinutes} \times 60 \text{ sec})$$
   - Both timings are shown side-by-side with clear labels:
     - `Sehri End (Imsak)` / `Mahallu Sehri Cutoff (-15m)`
     - `Fajr Prayer` (the actual prayer time)
   - When no mosque cutoff is specified, standard Imsak matches Fajr.

2. **Fasting Countdown State Machine:**
   The countdown evaluates real-time transitions:
   - **`eating_allowed` (Night):** Between Maghrib and next morning's Sehri cutoff $\to$ counts down to Sehri End / Imsak.
   - **`fasting` (Day):** Between morning Sehri cutoff and evening Maghrib $\to$ counts down to Iftar (Maghrib).
   - Ticks every second without battery drain or unnecessary network activity.

3. **Month Length & Provisional Dates:**
   - Ramadan month length (29 or 30 days) is derived strictly from the start of Shawwal (10th month).
   - If Shawwal sighting has not yet been confirmed, day 30 is provisionally rendered with the tag `Pending Moon Sighting (29/30)`.
   - The mandatory honesty notice is permanently displayed:
     > *"Ramadan dates are subject to moon sighting."* (`മാസപ്പിറവി കാണുന്നതിനനുസരിച്ച് റമദാൻ തീയതികളിൽ മാറ്റമുണ്ടാകാം.`)

4. **Printable Monthly Timetable:**
   - Provides clean CSS `@media print` styling formatted for single-page A4 printing.
