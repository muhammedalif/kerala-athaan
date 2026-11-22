# ADR 006: Monorepo Architecture and Testing Infrastructure

## Status
Accepted

## Context
Kerala Athaan is planned as a modular application encompassing:
- Core calculation engine (`packages/engine`): pure TS, 100% unit-tested, zero DOM or React dependencies.
- Shared validation schemas (`packages/schemas`): Zod schemas shared across web, admin, and edge functions.
- Localized translations (`packages/i18n`): Malayalam (`ml.json`) and English (`en.json`).
- Design tokens (`packages/tokens`): Accessible color palette, typography, touch target constants, SVG patterns.
- Public PWA (`apps/web`): React 18, Vite, Tailwind CSS, Radix UI, Dexie.
- Admin dashboard (`apps/admin`): Role-gated management portal.
- Supabase backend (`supabase/`): PostgreSQL, PostGIS, RLS policies, migrations.

## Decision
1. **Package Manager**: pnpm workspaces for rapid, disk-efficient dependency resolution and strict package isolation.
2. **TypeScript**: Strict mode enabled across all packages (`noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`).
3. **Testing**:
   - `vitest` for fast, ESM-native unit testing.
   - `fast-check` for property-based testing (testing mathematical invariants, continuity, and time-zone independence).
   - High test coverage with verified reference fixtures for all 14 Kerala district headquarters, equinoxes, solstices, and leap years.
4. **CI/CD**: GitHub Actions matrix executing TypeScript checks, linting, and automated unit/property tests on every pull request and push to `main`.

## Consequences
- Guaranteed boundary enforcement: engine cannot accidentally leak DOM/React dependencies.
- High velocity and confidence during development.
