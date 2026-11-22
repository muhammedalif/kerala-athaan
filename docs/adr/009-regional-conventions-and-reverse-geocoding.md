# ADR 009: Regional Convention Suggestions and Reverse Geocoding Architecture

## Status
Accepted

## Context
Users set locations through a variety of modalities: GPS coordinates, town searches, manual coordinate typing (decimal, DMS), pasted map links (Google Maps, OpenStreetMap), or dropping a pin on an interactive map.

Two core requirements must be balanced:
1. **Never Invent Data & Never Silently Alter Times (Rules 1 & 3):**
   - The application must not guess place names when network connectivity is lost.
   - The calculation engine must never silently enforce a regional profile without user awareness and consent.
2. **Autonomous Offline Reliability (Rule 4):**
   - Place name resolution must function when the user is completely offline.
   - Each saved location may have specific local calculation preferences (e.g. Shafi'i vs Hanafi, or minute offsets).

## Decision

### 1. Regional Convention Suggestions (User Decides)
- We define bounded regional geographic zones using open topographical and Mahallu convention data (e.g. `kerala-general` and `kerala-highlands`).
- If custom coordinates fall within a region with a known convention:
  - The UI presents a suggestion banner citing the source.
  - The user is provided two clear buttons:
    - **"Apply Convention Profile"** (applies the convention profile to the location)
    - **"Keep Custom Profile"** (dismisses the suggestion and retains standard calculation)
  - No profile is ever applied automatically without user selection.

### 2. Multi-Tier Reverse Geocoding
To avoid guessing place names:
- **Online Tier:** Supabase Edge Function (`supabase/functions/reverse-geocode`) queries OpenStreetMap Nominatim with compliant User-Agent headers (`KeralaAthaanApp/1.0`). Responses are cached in memory (rounded to ~100m precision) to eliminate redundant requests.
- **Offline Fallback:** If offline or the network request fails, the app computes the haversine distance to the nearest town in the bundled open-data gazetteer:
  $$\text{Name} = \text{Town Name} + \text{ " (~" } + d_{\text{km}} + \text{ " km)"}$$
- **Fallback:** If coordinates are outside Kerala (>100km), displays exact coordinates without fabricating a name:
  $$\text{Name} = \text{Lat}° \text{ N, } \text{Lon}° \text{ E}$$
- **User Customization:** Users can rename any location at any time.

### 3. Per-Location Calculation Profiles
- `SavedLocation` stores an optional `profile: CalcProfile` property in IndexedDB.
- When selecting an active location, its custom calculation method, Asr madhhab, and adjustments take immediate effect.

## Consequences
- Guarantees transparency and builds trust: users retain full sovereignty over their calculation settings.
- 100% offline functionality is preserved.
