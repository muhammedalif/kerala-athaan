# Kerala Athaan (കേരള അദാൻ) - Production Deployment Runbook

This guide details the step-by-step production deployment procedure for **Kerala Athaan**, covering Supabase backend setup, PostgreSQL migrations, Edge Functions deployment, and frontend PWA hosting on Vercel and Netlify.

---

## 1. Supabase Backend Setup

### Prerequisites
- Supabase account ([supabase.com](https://supabase.com))
- Supabase CLI installed (`npm install -g supabase` or `brew install supabase/tap/supabase`)

### Step 1: Create Supabase Project
1. Log into the Supabase Dashboard and click **New project**.
2. Set the project name: `kerala-athaan-prod`.
3. Choose the region closest to Kerala (e.g., `South Asia (Mumbai)`: `ap-south-1`).
4. Generate and securely store the Database Password.

### Step 2: Apply Database Migrations & Seeds
Run the migrations in sequential order using the Supabase CLI or the SQL Editor in Supabase Dashboard:

```bash
# Link project to local repository
supabase login
supabase link --project-ref <your-project-ref>

# Push migrations to production database
supabase db push

# Apply verified placeholder seeds
supabase db execute --file supabase/seeds/001_seed_placeholders.sql
```

The migrations establish:
- PostGIS extensions for spatial queries.
- Tables: `mosques`, `timetables`, `moon_sightings`, `trusted_sources`, `source_snapshots`, `audit_logs`.
- PostgreSQL Row Level Security (RLS) policies guaranteeing public read access and role-gated admin write access.
- Geospatial search functions: `get_nearby_mosques(lat, lon, max_distance_km)`.

### Step 3: Deploy Edge Functions
Deploy the serverless Edge Functions for reverse geocoding and trusted source monitoring:

```bash
# Deploy reverse geocoding function (No JWT verification needed for public geocoding)
supabase functions deploy reverse-geocode --no-verify-jwt

# Deploy trusted source watcher function
supabase functions deploy source-watcher

# Set secret environment variables for Edge Functions
supabase secrets set NOMINATIM_USER_AGENT="KeralaAthaanBot/1.0 (https://keralaathaan.org; contact@keralaathaan.org)"
```

### Step 4: Schedule Periodic Source Watcher (Cron)
In the Supabase Dashboard under **Database > Extensions**, enable `pg_cron` and `pg_net`. Then add a recurring cron job in SQL Editor:

```sql
-- Run source watcher daily at 02:00 UTC (07:30 AM IST)
SELECT cron.schedule(
  'daily-source-watcher',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://<your-project-ref>.supabase.co/functions/v1/source-watcher',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <service-role-key>'
    )
  );
  $$
);
```

---

## 2. Frontend PWA Deployment (Vercel)

The repository includes a production-tuned [`vercel.json`](../vercel.json).

### Deployment via Vercel CLI

```bash
# Install Vercel CLI if needed
npm install -g vercel

# Deploy from project root
vercel --prod
```

### Environment Variables on Vercel
In the Vercel Project Dashboard under **Settings > Environment Variables**, configure:

| Variable Name | Value | Purpose |
|---------------|-------|---------|
| `VITE_SUPABASE_URL` | `https://<your-project-ref>.supabase.co` | Supabase API URL |
| `VITE_SUPABASE_ANON_KEY` | `<your-anon-key>` | Public Anon API Key |
| `VITE_APP_ENV` | `production` | Production environment flag |
| `VITE_APP_VERSION` | `1.0.0` | Production build version |

---

## 3. Frontend PWA Deployment (Netlify Alternative)

The repository includes [`netlify.toml`](../netlify.toml).

### Deployment via Netlify CLI

```bash
# Install Netlify CLI if needed
npm install -g netlify-cli

# Build web application
pnpm --filter @kerala-athaan/web build

# Deploy to Netlify production
netlify deploy --prod --dir=apps/web/dist
```

### Environment Variables on Netlify
Configure the same `VITE_*` variables in Netlify Dashboard under **Site configuration > Environment variables**.

---

## 4. Admin Portal Deployment

The Admin Portal ([`apps/admin`](../apps/admin)) can be deployed as an isolated, role-gated admin portal:

1. **Build Admin Bundle:**
   ```bash
   pnpm --filter @kerala-athaan/admin build
   ```
2. **Deploy to Admin Subdomain:**
   - On Vercel: Create a separate project pointing to `apps/admin` with output directory `dist`.
   - Domain: e.g. `admin.keralaathaan.org`.
3. **Provision First Admin User:**
   - In Supabase Dashboard under **Authentication > Users**, invite or create an admin user.
   - In SQL Editor, assign the `moon_committee` or `super_admin` role in `auth.users.raw_app_meta_data`:
     ```sql
     UPDATE auth.users
     SET raw_app_meta_data = raw_app_meta_data || '{"role": "moon_committee"}'::jsonb
     WHERE email = 'admin@keralaathaan.org';
     ```

---

## 5. Post-Deployment Verification Checklist

- [ ] Open PWA URL in browser (e.g. Chrome / Safari / Firefox).
- [ ] Verify SSL certificate (`https://`) is active (mandatory for Service Worker and Web Audio).
- [ ] Check console for successful Service Worker registration (`sw.js`).
- [ ] Test offline mode in Chrome DevTools: toggle **Offline** in Network tab and reload page.
- [ ] Trigger audio test button in Settings to verify synthesized harmonic chime.
- [ ] Confirm reverse-geocoding works online and falls back to offline gazetteer when disconnected.
- [ ] Confirm device timezone warning shows correctly if device offset differs from +05:30 IST.
