# CLAUDE.md

Guidance for Claude Code when working in this repo. See `README.md` for the full
human-facing setup and deploy guide.

## What this is

A boilerplate for internal Bootlegger dashboards deployed on Railway. It ships
working auth, an access-control gate, and a Settings UI so the only thing to
build is the actual dashboard.

**Stack:** Next.js (App Router) · better-auth · Drizzle ORM · SQLite (libSQL) ·
Tailwind · shadcn/ui · Resend · Railway. Package manager is **pnpm**.

## Gotchas (read before debugging)

- **`ALLOWED_DOMAINS` and `INITIAL_ADMIN_EMAILS` only apply after a re-seed.**
  These env vars are written into the DB by `pnpm db:seed`. Editing `.env` alone
  does nothing — the access gate reads the database, not the environment. After
  changing either, run `pnpm db:seed` (idempotent; never overwrites existing
  rows). On Railway it runs automatically each deploy. Day-to-day, add users and
  domains via the **Settings UI**, not by re-seeding.
- **A `{"success":true}` from the sign-in endpoint does NOT mean an email was
  sent.** Responses are intentionally identical for allowed and non-allowed
  emails (anti-enumeration). The real signal is the server log line
  `[auth] sign-in code emailed to … (resend id …)`. No line = the gate blocked
  it (domain not allowed or no enabled invite).
- **No `RESEND_API_KEY`?** Sign-in codes print to the server log instead of
  emailing — fine for local dev.
- **`.env` changes need a dev-server restart** (Next loads env at boot).

## Access model

Two checks must BOTH pass to sign in (see `src/lib/access.ts`):
1. email domain is in `allowed_domain`, and
2. email has an enabled row in `invited_user`.

Enforced server-side in two places: the `sendVerificationOTP` callback (won't
email a code to anyone not allowed) and the `databaseHooks.user.create.before`
hook (won't create an account), both in `src/lib/auth.ts`. Roles are `admin`
(can manage Settings) and `member`.

## Conventions

- **New signed-in pages** go under `src/app/(app)/` — they're auth-guarded by the
  group layout. **Admin-only pages** go under `src/app/(app)/settings/`.
- **Auth in server components:** use `requireUser()` / `requireAdmin()` from
  `src/lib/session.ts`. Never trust the client for authz.
- **Mutations** are server actions (`"use server"`) that call `requireUser`/
  `requireAdmin` first, then `revalidatePath`.
- **DB:** import `db` from `src/db`. Add tables in `src/db/schema.ts`, then
  `pnpm db:generate` (creates a migration) and `pnpm db:migrate`. Migrations in
  `drizzle/` are committed.
- **UI:** shadcn/ui in `src/components/ui`. Add more with
  `pnpm dlx shadcn@latest add <name>`. Use the `cn()` helper for class names.
- The edge guard is `src/proxy.ts` (Next 16's `proxy`, formerly `middleware`).

## Don't

- Commit `.env` or the `data/` SQLite files (both gitignored).
- Hardcode secrets — read from `process.env` at call-time.
- Move the access checks to the client.

## Commands

`pnpm dev` · `pnpm build` · `pnpm typecheck` · `pnpm db:generate` ·
`pnpm db:migrate` · `pnpm db:seed` · `pnpm db:studio`

Run `pnpm typecheck` after non-trivial changes.
