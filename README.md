# Syntro for PocketBase Cloud

A SaaS and startup landing page built with Astro and Tailwind CSS, with a real
backend: newsletter sign-ups, a contact form, and a changelog you edit in
PocketBase.

## Credits and licence

Syntro was originally created by Michael Andreuzza and modified and extended by
Bektur Aslan ([upstream](https://github.com/bekturaslan/syntro-astro)). This
version adds PocketBase wiring and is distributed under the same
[GPL-3.0 licence](LICENSE).

## What is inside

| Path | Purpose |
| --- | --- |
| `db/pb_migrations` | `subscribers`, `messages`, and `changelog` collections with API rules, plus two sample changelog entries |
| `web/` | The Astro site. `src/lib/pocketbase.ts` creates the client from `PUBLIC_POCKETBASE_URL` |

- **Newsletter** — the footer form creates a `subscribers` record. Anyone can
  subscribe; only superusers can read the list, and duplicate emails are
  rejected.
- **Contact** — `/contact` creates a `messages` record, readable only by
  superusers.
- **Changelog** — `/changelog` loads published `changelog` records in the
  browser, so edits in the dashboard show up without a redeploy.
- **Login / Sign up** — design-only pages from upstream, ready for you to wire
  to PocketBase auth.

## Deploy to PocketBase Cloud

```bash
curl -fsSL https://raw.githubusercontent.com/pocketbasecloud/cli/main/scripts/install.sh | sh
pbc login

cd db
pbc deploy --name syntro-db
pbc pocketbase info --name syntro-db   # copy the instance URL

cd ../web
PUBLIC_POCKETBASE_URL=https://<id>.<compute>.pocketbasecloud.com pbc deploy --name syntro-web
```

The URL is baked into the site at build time; redeploy `web` after changing it.

## Run locally

```bash
pocketbase serve --dir db/pb_data --migrationsDir db/pb_migrations

cd web
cp .env.example .env
pnpm install
pnpm dev
```

| Command | Action |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Build to `web/dist/` |
| `pnpm preview` | Preview the build |
