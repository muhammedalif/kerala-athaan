# Kerala Athaan (കേരള അദാൻ)

> **Transparent, Offline-Reliable Islamic Prayer Times, Hijri Calendar & Mosque Timetables for Kerala.**

Kerala Athaan is a public-use, Kerala-focused Islamic prayer time application engineered with an uncompromising commitment to **accuracy, transparency, offline reliability, and honesty regarding web platform capabilities**.

---

## 📖 Table of Contents

- [Core Principles & Non-Negotiable Rules](#core-principles--non-negotiable-rules)
- [Architecture & Monorepo Structure](#architecture--monorepo-structure)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Deployment](#deployment)
- [Documentation & ADRs](#documentation--adrs)
- [License & Acknowledgments](#license--acknowledgments)

---

## ⚖️ Core Principles & Non-Negotiable Rules

1. **Never Invent Data:** No made-up mosque timetables, moon-sighting dates, coordinates, or organization endorsements. Verified placeholders (`is_placeholder: true`) are used where real data is pending field verification.
2. **Never Hardcode Prayer Times:** Every displayed time derives either from the pure mathematical calculation engine (`computeDay`) or from a verified, published mosque timetable row.
3. **Transparent Provenance Tags:** Every displayed time carries an explicit provenance tag:
   - `calculated`: Derived from astronomical solar calculation algorithms.
   - `adjusted`: Derived from calculation with applied local/mosque minute adjustments.
   - `mosque-verified`: Exact time matched from a published, verified mosque timetable row.
4. **100% Offline Engine:** The pure TypeScript calculation engine operates with zero remote API calls once location and settings are stored locally.
5. **No Third-Party Asset Copying:** Zero stolen audio, boundary polygons, or timetable scrapings. Original code, open-license gazetteer data, and custom-synthesized audio.
6. **Honest Web Platform Capabilities:** We never mislead users into believing a PWA can guarantee background audio playback when closed. Clear disclosures inform users:
   > *"In the web app, full Athaan audio plays only while the app is open. For reliable Athaan when closed, use the Android app (planned)."*
7. **No Secrets in the Client:** All sensitive keys live exclusively in server-side functions or secure environment variables. Public bundles contain only anonymous, RLS-governed keys.
8. **Unverified Data Is Never Published:** External snapshots and raw suggestions are strictly quarantined in a `pending_review` queue until verified by an authorized `moon_committee` or `super_admin`.
9. **Ban on Unlicensed Audio:** The app ships by default with an acoustic harmonic chime synthesized directly via the Web Audio API. Third-party recordings are incorporated only with documented permission.
10. **Clean Architecture:** Strict TypeScript across packages; zero business logic in UI view components.

---

## 🏗️ Architecture & Monorepo Structure

```text
kerala-athaan/
├── apps/
│   ├── web/              # Public React 18 + Vite PWA with Workbox Service Worker
│   └── admin/            # Role-gated Admin Portal for moon sightings and timetable reviews
├── packages/
│   ├── engine/           # Pure TypeScript prayer time calculation engine (100% unit-tested)
│   ├── schemas/          # Shared Zod validation schemas across web, admin, and edge functions
│   ├── tokens/           # Shared design tokens and color palettes (Emerald, Amber, etc.)
│   └── i18n/             # Malayalam (ml.json) & English (en.json) localization bundles
├── supabase/
│   ├── migrations/       # PostgreSQL schema, spatial indexes, and Row Level Security policies
│   ├── functions/        # Deno edge functions for reverse-geocoding and source watcher
│   └── seeds/            # Initial verified placeholder data
└── docs/
    ├── methodology.md    # In-depth mathematical and engineering methodology
    ├── test-sources.md   # Reference sources, fixtures, and gazetteer licenses
    └── adr/              # Architecture Decision Records (ADR 001 through 010)
```

---

## ✨ Key Features

- **Prayer Calculation Engine:**
  - Standard calculation methods: Muslim World League (default, labeled "not a Kerala-specific standard"), Umm al-Qura, Karachi, Egyptian, ISNA, Singapore/MUIS, and custom twilight angles.
  - Asr madhhab selection: Shafi'i (standard shadow 1, Kerala default) and Hanafi (shadow 2).
  - High-latitude handling, elevation dip calculation, and civil date resolution strictly in `Asia/Kolkata` (+05:30 IST).
- **Dual Hijri & Gregorian Calendar:**
  - Umm al-Qura astronomical baseline combined with published moon-sighting overrides and local user adjustments.
  - Derives provisional month lengths (29/30 days) with explicit pending sighting badges.
  - Ramadan fasting module featuring distinct Sehri cutoff vs Fajr times and live fasting countdown.
- **Mosque Timetable Resolution:**
  - 3 operating modes: Astronomical calculation, Verified mosque timetable, and Mosque-adjusted calculation.
  - Automatic fallback with visible provenance badges if a verified date row is absent.
  - Side-by-side comparison view highlighting minute discrepancies between mosque timetables and astronomical times.
- **Geographic Location & Offline Gazetteer:**
  - Multi-tier location resolution: GPS geolocation, live OSM Nominatim reverse-geocoding, and bundled offline gazetteer fallback with open census attribution.
  - Interactive map coordinate picker with latitude/longitude swap validation and coordinate bounds checking.
  - Regional convention suggestions for Kerala districts and highland elevations.
- **Honest Notification & Athaan Scheduler:**
  - Synthesized harmonic acoustic chime via Web Audio API (zero audio file dependencies).
  - PWA Tier 1 in-app audio with `visibilitychange` synchronization and Tier 2 Web Push server notifications.
  - Per-prayer style controls (Full, Short, Silent), pre-prayer reminder offsets, and live audio testing.
- **Resilient Offline Synchronization:**
  - IndexedDB storage via Dexie.js for locations, timetables, settings, and sighting overrides.
  - Chromium Periodic Background Sync (`sync-timetables`) coupled with automatic foreground resync on app resume.
  - Device timezone mismatch detection alert when device offset differs from +05:30 IST.

---

## 🛠️ Tech Stack

- **Frontend & PWA:** React 18, TypeScript (Strict), Vite, Tailwind CSS, Radix UI Primitives, Lucide Icons.
- **State Management & Storage:** Zustand, Dexie.js (IndexedDB wrapper).
- **Calculation Core:** `adhan` library wrapped in pure TypeScript `packages/engine`.
- **Localization:** `i18next` with complete Malayalam (`ml`) and English (`en`) translations.
- **Backend & Database:** Supabase (PostgreSQL 15, PostGIS, Row Level Security, Deno Edge Functions).
- **Validation:** Zod schemas shared across all tiers.
- **Testing:** Vitest, `@vitest/coverage-v8`, `fast-check` (property-based testing), Playwright (E2E and offline simulation).

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/kerala-athaan.git
cd kerala-athaan

# Install monorepo dependencies
pnpm install

# Copy environment template
cp .env.example .env
```

### Development

```bash
# Run public web PWA (http://localhost:3000)
pnpm --filter @kerala-athaan/web dev

# Run admin portal (http://localhost:3001)
pnpm --filter @kerala-athaan/admin dev
```

### Production Build

```bash
# Build all packages and applications
pnpm run build
```

---

## 🧪 Testing & Quality Assurance

Kerala Athaan enforces strict test coverage across mathematical calculations, validation schemas, and offline service worker behaviors.

```bash
# Run all Vitest unit and property tests
pnpm run test

# Run tests with code coverage report
pnpm run test:coverage

# Run Playwright offline and E2E browser tests
pnpm run test:e2e

# Run TypeScript typechecks across all monorepo workspaces
pnpm run typecheck
```

---

## 🌐 Deployment

### Vercel Deployment

The repository includes a ready-to-deploy [`vercel.json`](./vercel.json) configured for Vite SPA routing and Service Worker cache headers:

```bash
# Deploy public PWA to Vercel
vercel --prod
```

### Netlify Deployment

The repository includes [`netlify.toml`](./netlify.toml) configured for monorepo publishing:

```bash
# Deploy to Netlify
netlify deploy --prod --dir=apps/web/dist
```

### Supabase Edge Functions

```bash
# Deploy edge functions
supabase functions deploy reverse-geocode --no-verify-jwt
supabase functions deploy source-watcher
```

---

## 📚 Documentation & ADRs

- **[Methodology & Astronomical Standards](docs/methodology.md):** Detailed breakdown of calculation profiles, elevation algorithms, mosque resolution priority, and sighting overrides.
- **[Test Sources & Benchmark Fixtures](docs/test-sources.md):** Independent solar position checks, Meeus benchmark tables, gazetteer licensing, and synthesized audio frequencies.
- **[Architecture Decision Records (ADRs)](docs/adr/README.md):**
  - [ADR 001: Calculation Engine Core & Adhan.js Wrap](docs/adr/001-engine-adhan-wrap.md)
  - [ADR 002: Dual Hijri Calendar Resolution & Sighting Overrides](docs/adr/002-dual-hijri-resolution.md)
  - [ADR 003: Mosque Timetable Resolution Order](docs/adr/003-mosque-resolution-order.md)
  - [ADR 004: Honest Notification Architecture & Capabilities](docs/adr/004-honest-notifications.md)
  - [ADR 005: Offline-First Architecture & Service Worker Strategy](docs/adr/005-offline-first-pwa.md)
  - [ADR 006: Data Sovereignty & Provenance Tagging](docs/adr/006-data-sovereignty-provenance.md)
  - [ADR 007: Synthesized Acoustic Tone Audio Strategy](docs/adr/007-synthesized-tone-audio.md)
  - [ADR 008: Month Length Derivation & Provisional Ramadan Calendar](docs/adr/008-month-length-derivation.md)
  - [ADR 009: Reverse Geocoding Multi-Tier Strategy & Offline Gazetteer](docs/adr/009-reverse-geocoding-gazetteer.md)
  - [ADR 010: Periodic Background Sync & Civil Date Rollover Policy](docs/adr/010-periodic-sync-and-date-rollover.md)

---

## 📄 License & Attribution

- **Code:** Licensed under the MIT License.
- **Gazetteer Data:** Census of India 2011 / Survey of India Open Data (Government Open Data License - India).
- **Audio Synthesizer:** Original Web Audio API implementation (No external recordings).
