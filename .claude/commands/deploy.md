---
description: Provision and deploy this app to Railway (project, /data volume, env vars, public URL)
argument-hint: "[app name]"
---

You are deploying this Next.js + SQLite app to Railway for the user. Be careful:
**confirm with the user before creating any cloud resources.** Keep them informed
at each step and never print or commit secrets.

The optional argument is the app name: `$ARGUMENTS`

## 0. Pick an engine and check auth

- If the Railway **MCP** tools (`mcp__railway-mcp-server__*` or similar) are
  available in this session, use them — this is the preferred path.
- Otherwise, if the **CLI** is installed (`railway --version` succeeds), use it.
- If neither is available, STOP and tell the user to do the one-time
  "Connect Railway" setup in `README.md` (install the Railway CLI, run
  `railway login`), then re-run `/deploy`.

Check authentication (MCP `whoami`, or `railway whoami`). If it fails, tell the
user to run `railway login` (it opens a browser) and stop until they confirm.

## 1. Gather inputs

Read defaults from `.env` if it exists. Confirm or collect from the user:

- **App name** — used for the Railway project, service, and subdomain. Default:
  `$ARGUMENTS`, else `APP_NAME` from `.env`, else the repo folder name.
- **INITIAL_ADMIN_EMAILS** — the first admin(s), comma-separated. Required.
- **ALLOWED_DOMAINS** — allowed email domains, comma-separated. Required.
- **RESEND_API_KEY** + **EMAIL_FROM** — needed to actually email sign-in codes.
  If the user skips them, warn clearly: sign-in codes will only appear in the
  Railway logs (fine for a quick test, not for real use).
- **Microsoft SSO** (optional) — only if the user provides `MICROSOFT_CLIENT_ID`
  and `MICROSOFT_CLIENT_SECRET`.

Generate a strong secret for `BETTER_AUTH_SECRET`:
`openssl rand -base64 32` (fallback: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`).
Keep it only in Railway's variables — never write it to a file.

## 2. Already linked? Just redeploy.

If this directory is already linked to a Railway project (MCP status / linked
service, or `railway status`), confirm with the user and simply deploy the
current code to the existing service (MCP `deploy` with `path: "."`, or
`railway up`). Then go to step 5. Do **not** create duplicate projects.

## 3. Provision — MCP path (preferred)

Do these **in order** — the ordering guarantees the first real boot already has
the volume and variables, so the database seeds correctly on the persistent disk:

1. `create_project` with the app name → note `project_id` and `environment_id`.
2. `create_service` (name = app name, no source) → note `service_id`. (Empty
   service; code is uploaded in step 6.)
3. `create_volume` with `mount_path: "/data"` on that service.
4. `generate_domain` for the service → note the domain. Public URL = `https://<domain>`.
5. `set_variables` with `skip_deploys: true` and:
   - `DATABASE_URL` = `file:/data/app.db`
   - `BETTER_AUTH_SECRET` = the generated secret
   - `BETTER_AUTH_URL` = `https://<domain>` (must match the domain exactly)
   - `APP_NAME`, `ALLOWED_DOMAINS`, `INITIAL_ADMIN_EMAILS`
   - `RESEND_API_KEY`, `EMAIL_FROM` (if provided)
   - `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID` (if provided)
6. `deploy` with `path: "."` → uploads the code, builds, and runs `pnpm release`
   (migrations + seed) with the volume and variables in place.

## 4. Provision — CLI fallback

The CLI can't create an empty service, so the **first** deploy boots before the
variables exist — it may log one error; that's expected and harmless, the
redeploy fixes it.

1. `railway up --new --name "<app name>" -y --detach` (creates project + service,
   links this directory, first deploy).
2. `railway volume add --mount-path /data`
3. `railway domain` → capture the generated URL.
4. Set all variables (one `--set` per variable), including
   `BETTER_AUTH_URL=https://<domain>` and `DATABASE_URL=file:/data/app.db`:
   `railway variables --set "KEY=VALUE" --set "KEY2=VALUE2" ...`
5. `railway up --detach` (redeploy — now the volume + variables are present, so
   migrate + seed run against `/data` and seed the first admin).

## 5. Verify and report

- Wait for the deploy to finish (MCP `get_logs`, or the CLI streams; else `railway logs`).
- Confirm the build succeeded and the logs show `[db] migrations applied` and
  `[db] seed complete`.
- Give the user the **public URL** and tell them to open it and sign in as one of
  the `INITIAL_ADMIN_EMAILS`. The 6-digit code arrives by email — or, if no Resend
  key was set, it appears in the Railway logs (point them to `railway logs`).
- Tell them how to update later: re-run `/deploy`, or connect the GitHub repo in
  Railway for automatic redeploys on every push.

Remember: confirm before creating resources, and keep secrets out of the repo.
