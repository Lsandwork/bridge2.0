# Bridge

Person-centered support for everyday life between appointments.

Production domain: **https://www.nuviobridge.com**

Complete monorepo for:
- Expo native app (`apps/mobile`)
- Next.js parent portal (`apps/portal`)
- Next.js admin dashboard (`apps/admin`)
- Supabase backend schema and seed data (`supabase`)

## Safety Rule

This platform provides supportive tools, education, routines, and skill-building exercises.
It does **not** diagnose, treat, or replace doctors, therapists, speech therapy, occupational therapy, ABA, school services, or clinical care.

## Local Preview (ports 4000/4001 — will NOT conflict with Academy on 3000)

| App | URL |
|-----|-----|
| Parent Portal | http://localhost:4000 |
| Admin Dashboard | http://localhost:4001 |

```bash
cd ~/Desktop/a
npm run dev:portal   # port 4000
npm run dev:admin    # port 4001
npm run dev:mobile   # Expo app
```

## Production — www.nuviobridge.com

The parent portal deploys to Vercel from the repository root. Full steps:
[docs/DEPLOY-bridge.md](docs/DEPLOY-bridge.md).

Quick checklist:

1. Push this repository to GitHub.
2. Import it into Vercel with the repository root as the Root Directory.
3. Set `NEXT_PUBLIC_SITE_URL=https://www.nuviobridge.com`.
4. Add `nuviobridge.com` and `www.nuviobridge.com` in Vercel.
5. Add the exact DNS records Vercel provides in IONOS.

## Setup

1. `npm install`
2. Copy `.env.example` → `.env.local` in portal/admin and `.env` in mobile
3. Apply `supabase/migrations/` and `supabase/seed/seed.sql`
4. Deploy the portal per [docs/DEPLOY-bridge.md](docs/DEPLOY-bridge.md).

# bridge2.0
