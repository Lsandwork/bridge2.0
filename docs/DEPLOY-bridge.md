# Deploy Bridge to Vercel

Production domains:

- `https://nuviobridge.com`
- `https://www.nuviobridge.com`

## 1. Push this repository to GitHub

The repository must include the monorepo root because the portal depends on
`packages/core` and `packages/data`.

```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/nuviobridge.git
git push -u origin main
```

## 2. Import into Vercel

1. Open [vercel.com/new](https://vercel.com/new).
2. Select the `nuviobridge` GitHub repository.
3. Leave **Root Directory** as the repository root (`./`).
4. Vercel will use the root `vercel.json`:
   - Install: `npm install`
   - Build: `npm run build --workspace=portal`
   - Output: `apps/portal/.next`
5. Deploy once using the temporary `*.vercel.app` URL.

Do not set the Vercel Root Directory to `apps/portal`; that would separate the
portal from the local workspace packages it requires.

## 3. Add environment variables

In **Vercel → Project → Settings → Environment Variables**, add the required
values for Production, Preview, and Development as appropriate.

Required:

```text
NEXT_PUBLIC_SITE_URL=https://www.nuviobridge.com
VIDEO_SESSION_SECRET=<a-long-random-secret>
NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-rotated-service-role-key>
```

AI features require one configured provider:

```text
AI_PROVIDER=gemini
GEMINI_API_KEY=<your-rotated-key>
GEMINI_MODEL=gemini-2.5-flash
```

Optional integrations:

```text
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
YOUTUBE_API_KEY=
GOOGLE_PLACES_API_KEY=
YELP_API_KEY=
```

Never commit real values to GitHub.

## 4. Add the domains in Vercel

In **Vercel → Project → Settings → Domains**:

1. Add `nuviobridge.com`.
2. Add `www.nuviobridge.com`.
3. Make `www.nuviobridge.com` the primary domain if desired.
4. Configure a redirect from the apex domain to `www`.

Vercel will display the exact DNS records required.

## 5. Configure IONOS DNS

In **IONOS → Domains & SSL → nuviobridge.com → DNS**, add the records shown by
Vercel. Vercel commonly requests:

- An apex `A` record for `@`
- A `CNAME` record for `www`

Use Vercel’s displayed values rather than guessing them. Remove conflicting
records for the same host names. Vercel provisions HTTPS after DNS verifies.

## 6. Supabase URL configuration

In Supabase Authentication URL settings:

- Site URL: `https://www.nuviobridge.com`
- Redirect URL: `https://www.nuviobridge.com/**`
- Optional apex redirect URL: `https://nuviobridge.com/**`

## 7. Verify

Test:

- Landing page
- Onboarding and all nine pathways
- Login and account setup
- Parent dashboard and My Space
- Therapist workspace
- Routines, reports, communication, and library
- AI and voice features
- Mobile layout

```bash
curl -I https://www.nuviobridge.com
```
