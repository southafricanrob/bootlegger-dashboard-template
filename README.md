# Bootlegger Dashboard Boilerplate

A secure, batteries-included starting point for internal Bootlegger dashboards,
built to deploy on [Railway](https://railway.app). Clone it, fill in a few
values, and you have a working app with sign-in, an access-controlled Settings
area, and a blank dashboard ready to build on.

**What you get out of the box**

- 🔐 **Invite-only sign-in** — only people you add can get in, and only from
  approved email domains (e.g. `bootlegger.co.za`, `thesilogroup.co.za`).
- ✉️ **Passwordless sign-in** with a one-time code emailed via [Resend](https://resend.com)
  (no passwords to manage).
- ⚙️ **Settings UI** to manage users and allowed domains — no code or redeploy
  needed.
- 🗄️ **SQLite database** on a Railway volume — nothing extra to provision, and
  local development is zero-setup.
- 🚀 **One-command deploy** on Railway (migrations and seeding run automatically).
- 🪟 **Microsoft SSO** wired up but dormant — flip it on later with two env vars.

## Tech stack

Next.js (App Router) · better-auth · Drizzle ORM · SQLite (libSQL) ·
Tailwind CSS · shadcn/ui · Resend · Railway

---

## Run it locally

You'll need [Node.js 22+](https://nodejs.org) and [pnpm](https://pnpm.io)
(`npm install -g pnpm`).

```bash
# 1. Install dependencies
pnpm install

# 2. Create your local config
cp .env.example .env
#    Open .env and set at least:
#      BETTER_AUTH_SECRET   (run: openssl rand -base64 32)
#      INITIAL_ADMIN_EMAILS (your email — this becomes the first admin)
#      ALLOWED_DOMAINS      (the domains you want to allow)
#    You can leave RESEND_API_KEY blank for now (see note below).

# 3. Set up the database
pnpm db:migrate   # creates the tables
pnpm db:seed      # adds your admin + allowed domains from .env

# 4. Start the app
pnpm dev
```

Open http://localhost:3000 and sign in with the email you put in
`INITIAL_ADMIN_EMAILS`.

> **No Resend key yet?** If `RESEND_API_KEY` is blank, the sign-in code is
> printed to your terminal instead of emailed. Look for a line like
> `[auth] ... sign-in code for you@example.com: 123456`. This lets you test
> sign-in before setting up email.

---

## How access control works

Two checks must **both** pass for someone to sign in:

1. **Their email domain is on the allowlist** (managed in Settings → Domains).
2. **They have an enabled invite** (managed in Settings → Users).

So even someone with a valid `@bootlegger.co.za` address can't get in until an
admin adds them. The first admin(s) come from the `INITIAL_ADMIN_EMAILS`
environment variable, seeded on first boot.

- **Admins** can view the dashboard *and* manage users and domains.
- **Members** can only view the dashboard.

Removing or disabling a user immediately revokes their active sessions.

---

## Setting up email (Resend)

Sign-in codes are sent through Resend. You verify a sending domain **once** and
then **every** dashboard you deploy can reuse it — it is not per-dashboard.

1. Create an account at [resend.com](https://resend.com).
2. Add and verify a domain **you own** (add the DNS records Resend gives you).
   - Tip: use a subdomain like `send.bootlegger.co.za` so it doesn't touch the
     DNS for your real Outlook/email.
3. Create an API key.
4. Set in your environment:
   - `RESEND_API_KEY` = your key
   - `EMAIL_FROM` = `Bootlegger Dashboard <noreply@send.bootlegger.co.za>`
     (the From domain must be the one you verified)

**Testing tip:** you can use your own Resend account and a domain you control
(e.g. `bootlegger.jemx.app`) to test, then swap to Bootlegger's account later by
changing just `RESEND_API_KEY` and `EMAIL_FROM` — no code change.

---

## Deploy to Railway

1. **Push this repo to GitHub**, then in Railway: **New Project → Deploy from
   GitHub repo** and pick it. Railway auto-detects Next.js and builds it.

2. **Add a Volume** (this is where the SQLite database lives, so data survives
   redeploys): on the service, **Settings → Volumes → New Volume**, mount path
   `/data`.

3. **Set the environment variables** (service → **Variables**). At minimum:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | `file:/data/app.db` *(points at the volume)* |
   | `BETTER_AUTH_SECRET` | a long random string (`openssl rand -base64 32`) |
   | `BETTER_AUTH_URL` | your public URL, e.g. `https://your-app.up.railway.app` |
   | `RESEND_API_KEY` | your Resend key |
   | `EMAIL_FROM` | `Bootlegger Dashboard <noreply@send.bootlegger.co.za>` |
   | `ALLOWED_DOMAINS` | `bootlegger.co.za,thesilogroup.co.za` |
   | `INITIAL_ADMIN_EMAILS` | the first admin email(s), comma-separated |
   | `APP_NAME` | `Bootlegger Dashboard` |

   > Set these **before** the first deploy so the initial admin and domains get
   > seeded correctly.

4. **Generate a domain**: service → **Settings → Networking → Generate Domain**,
   then make sure `BETTER_AUTH_URL` matches it.

5. **Deploy.** On every deploy Railway runs `pnpm release` (which applies
   migrations and seeds access lists) and then starts the app — see
   [`railway.json`](./railway.json).

---

## Turning on Microsoft sign-in later

The "Continue with Microsoft" button is already built — it just stays hidden
until credentials exist. When you have a Microsoft Entra ID app registration,
set these env vars and redeploy:

- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `MICROSOFT_TENANT_ID` (or leave as `common`)

Set the redirect URI in Entra to `https://your-app.up.railway.app/api/auth/callback/microsoft`.
The same invite-only + domain rules apply to Microsoft sign-ins.

---

## Building your dashboard

This is a skeleton — the real work goes here:

- **Replace the dashboard page**: [`src/app/(app)/dashboard/page.tsx`](<src/app/(app)/dashboard/page.tsx>).
- **Add new pages** under [`src/app/(app)/`](<src/app/(app)>) — anything there
  automatically requires a signed-in user.
- **Add admin-only pages** under `src/app/(app)/settings/` — those require an
  admin.
- **Query the database** with Drizzle via the `db` export in
  [`src/db/index.ts`](src/db/index.ts). Add tables in
  [`src/db/schema.ts`](src/db/schema.ts), then run `pnpm db:generate` and
  `pnpm db:migrate`.
- **Add UI components** with shadcn/ui: `pnpm dlx shadcn@latest add <component>`.

### Project layout

```
src/
  app/
    (app)/              # signed-in area (protected)
      dashboard/        # the dashboard — your starting point
      settings/         # admin-only: users + domains
    sign-in/            # email-code sign-in flow
    api/auth/[...all]/  # better-auth handler
  components/ui/        # shadcn/ui components
  db/                   # Drizzle schema + client
  lib/
    auth.ts             # better-auth config + access gate
    access.ts           # domain allowlist + invite checks
    email.ts            # Resend (with console fallback)
    session.ts          # requireUser / requireAdmin helpers
  proxy.ts              # edge guard that redirects to /sign-in
scripts/                # migrate + seed (run on deploy)
drizzle/                # generated SQL migrations
```

## Useful commands

| Command | What it does |
|---|---|
| `pnpm dev` | Run locally with hot reload |
| `pnpm build` / `pnpm start` | Production build / start |
| `pnpm db:generate` | Generate a migration after editing the schema |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:seed` | Seed admins + domains from env (idempotent) |
| `pnpm db:studio` | Browse the database in a GUI |
| `pnpm typecheck` | Type-check the project |
