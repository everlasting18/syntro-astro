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
| `Pocketbase-Cloud/pb_migrations` | `subscribers`, `messages`, and `changelog` collections with API rules, plus two sample changelog entries |
| `Syntro/` | The Astro site. `src/lib/pocketbase.ts` creates the client from `PUBLIC_POCKETBASE_URL` |

- **Newsletter** — the footer form creates a `subscribers` record. Anyone can
  subscribe; only superusers can read the list, and duplicate emails are
  rejected.
- **Contact** — `/contact` creates a `messages` record, readable only by
  superusers.
- **Changelog** — `/changelog` loads published `changelog` records in the
  browser, so edits in the dashboard show up without a redeploy.
- **Login / Sign up** — design-only pages from upstream, ready for you to wire
  to PocketBase auth.

## 1. Before you start

Install the `pbc` CLI and log in. The login opens a browser once and is
remembered afterwards.

```bash
curl -fsSL https://raw.githubusercontent.com/pocketbasecloud/cli/main/scripts/install.sh | sh
pbc login
pbc whoami
```

The site uses pnpm (the lockfile is `Syntro/pnpm-lock.yaml`), and `pbc` installs
dependencies with the package manager the lockfile names, so have it available:

```bash
corepack enable
```

Both parts live in one project. Create it once and make it the default for this
machine:

```bash
pbc project create syntro
pbc project use syntro
```

## 2. Set up PocketBase

### Deploy the database

`Pocketbase-Cloud/` holds only `pb_migrations`. Deploy it as a PocketBase
instance:

```bash
cd Pocketbase-Cloud
pbc pocketbase deploy --name syntro-pocketbase
```

`pbc deploy --name syntro-pocketbase` does the same thing — it sees
`pb_migrations` and runs `pbc pocketbase deploy` for you — but naming the kind
keeps the command unambiguous.

The first deploy creates the instance, uploads the migrations, and restarts it
so they run: the three collections, their API rules, and two sample changelog
entries exist as soon as it is up. When it asks about an env file, choose not to
push one — this template needs none on the database.

### The pbc.json file

The first deploy writes `pbc.json` in the directory. It links the directory to
the project and the resource the deploy created, and records how to package it,
so later commands there need no `--name`. `Pocketbase-Cloud/pbc.json.example`
and `Syntro/pbc.json.example` show its shape:

```json
{
  "build": { "pbMigrations": "pb_migrations" },
  "projectId": "YOUR_PROJECT_ID",
  "kind": "pocketbases",
  "defaultEnvironment": "production",
  "environments": {
    "production": { "id": "YOUR_INSTANCE_ID", "name": "syntro-pocketbase" }
  }
}
```

| Field | Meaning |
| --- | --- |
| `build` | What to package: `pbMigrations` for PocketBase; `command` and `outputDir` for the frontend |
| `projectId` | The project the resource belongs to — see `pbc project ls` |
| `kind` | `pocketbases` or `frontends`, so `pbc deploy` never guesses again |
| `defaultEnvironment` | The environment a deploy targets when you pass no `--env` |
| `environments.<env>.id` / `.name` | The resource that environment deploys to — see `pbc pocketbase ls` or `pbc frontend ls` |

The ids belong to your account, so `pbc.json` is listed in `.gitignore` and
only the examples are committed. Don't copy an example into place: deploy once
and let the CLI write the real file.

### Find the URL and the superuser login

A new instance gets a superuser account with your account email and a generated
password, printed once at the end of the deploy. Show the instance again at any
time:

```bash
pbc pocketbase info --name syntro-pocketbase
```

Copy the instance URL from that output — the frontend needs it. The PocketBase
dashboard is the same URL followed by `/_/`, for example
`https://<id>.<compute>.pocketbasecloud.com/_/`. Log in there with the superuser
account.

### Check the collections from the terminal

`pbc admin` talks to any PocketBase instance as its superuser:

```bash
pbc admin use https://<id>.<compute>.pocketbasecloud.com
pbc admin login
pbc admin collections ls
pbc admin records ls changelog
```

You should see `subscribers`, `messages`, and `changelog`, and two changelog
records whose titles start with `Sample:`. Superuser commands bypass API rules;
to see what visitors get, use an unauthenticated request:

```bash
curl https://<id>.<compute>.pocketbasecloud.com/api/collections/subscribers/records
```

That returns `403`, because only superusers may list subscribers.

### Everyday tasks

| Task | How |
| --- | --- |
| Read newsletter sign-ups | `pbc admin records ls subscribers --sort -created` |
| Read contact messages | `pbc admin records ls messages --sort -created` |
| Write a changelog entry | Dashboard → **changelog** → **New record**, fill `title`, `body`, `tag`, and switch on `published` |
| Remove the sample entries | Delete the two `Sample:` records in the dashboard |
| Follow the instance logs | `pbc logs pocketbase --name syntro-pocketbase -f` |
| Take a backup | `pbc admin settings backup create` |

### Change the schema

Add a new file to `Pocketbase-Cloud/pb_migrations` — never edit one that has already run —
and redeploy:

```bash
cd Pocketbase-Cloud
pbc pocketbase deploy
```

New migrations are merged with the ones already on the instance and applied by
the restart that follows. Changes made in the dashboard are not written back to
this repository, so prefer migrations for anything the site depends on.

### Use your own domain for the database

```bash
pbc pocketbase domain add api.example.com --name syntro-pocketbase
pbc pocketbase domain verify api.example.com --name syntro-pocketbase
pbc pocketbase domain status --name syntro-pocketbase
```

After `domain add`, create a `CNAME` for the subdomain pointing at the instance
id shown in the instance's **Domains** section in the portal (if the domain is
proxied through Cloudflare, add a `TXT` record named `_pbc-verify` with the
instance id instead), then run `verify`. HTTPS is issued once the DNS resolves —
see [Custom Domains](https://pocketbasecloud.com/docs/pocketbase/custom-domains).
If you switch the site to this domain, rebuild the frontend with the new
`PUBLIC_POCKETBASE_URL`.

## 3. Deploy the frontend

### Build variables

The Astro site reads two variables. Both are baked into the files at build
time, so a change means a redeploy.

| Variable | Required | Purpose |
| --- | --- | --- |
| `PUBLIC_POCKETBASE_URL` | Yes | The `syntro-pocketbase` URL from `pbc pocketbase info` |
| `PUBLIC_SITE_URL` | No | The site's public address, for canonical and Open Graph URLs and the sitemap |

Without `PUBLIC_POCKETBASE_URL` the pages still build, and the forms and the
changelog show a message saying PocketBase is not configured.

### Deploy

Name the kind explicitly. `Syntro/` has a `start` script and no Vite config, so a
bare `pbc deploy` would guess it is a backend.

```bash
cd Syntro
PUBLIC_POCKETBASE_URL=https://<id>.<compute>.pocketbasecloud.com \
  pbc deploy frontend --name syntro
```

The CLI installs dependencies, runs `pnpm run build`, uploads `dist/`, and waits
for HTTPS. Find the site address afterwards with:

```bash
pbc frontend info --name syntro
```

Open it, subscribe from the footer, send a message from `/contact`, and check
that `/changelog` lists the sample entries.

### Redeploy

The first deploy links the directory in `pbc.json`, so from `Syntro/` a redeploy
needs no name — only the build variables again:

```bash
PUBLIC_POCKETBASE_URL=https://<id>.<compute>.pocketbasecloud.com pbc deploy frontend
```

To avoid retyping it, put the variables in `Syntro/.env` (see
`Syntro/.env.example`); Astro reads that file during the build.

### Use your own domain for the site

```bash
pbc frontend domain add www.example.com --name syntro
pbc frontend domain verify www.example.com --name syntro
pbc frontend domain status --name syntro
```

Create the DNS record shown on the site's detail page in the portal before
running `verify`. Then set `PUBLIC_SITE_URL=https://www.example.com` and
redeploy so canonical URLs and the sitemap use it.

## 4. Deploy on every push (optional)

`pbc ci init` writes a GitHub Actions workflow for the directory it runs in:

```bash
cd Syntro
pbc ci init frontend
```

It writes a workflow file under `.github/workflows/`, named after the directory, and prints the two one-time
steps: copy a token from the portal's **Account → CLI access token**, and save
it as a repository secret named `PBC_TOKEN`.

Frontend variables are baked in at build time, so they belong in the workflow's
build step, not on the platform. Save the database URL as a repository variable
(**Settings → Secrets and variables → Actions → Variables**) named
`PUBLIC_POCKETBASE_URL`, then make the deploy steps of the generated file look
like this:

```yaml
      - name: Build
        working-directory: Syntro
        env:
          PUBLIC_POCKETBASE_URL: ${{ vars.PUBLIC_POCKETBASE_URL }}
        run: |
          corepack enable
          pnpm install --frozen-lockfile
          pnpm build

      - uses: pocketbasecloud/cli/action@v0.8.7
        with:
          token: ${{ secrets.PBC_TOKEN }}
          working-directory: Syntro
          kind: frontend
          skip-build: "true"
          project: syntro
          name: syntro
```

`skip-build` uploads what the build step produced instead of building again.
This repository ignores `pbc.json`, so the workflow names the project and site
with `project` and `name`; if you commit `Syntro/pbc.json` instead, drop those two
lines. Keep the `uses:` version that `pbc ci init` wrote for you.

For the database, run `pbc ci init pocketbase` in `Pocketbase-Cloud/` and add
`project: syntro` and `name: syntro-pocketbase` to its action step the same way, so
schema changes deploy on push too.

## 5. Run locally

Download PocketBase from [pocketbase.io](https://pocketbase.io/docs/), then:

```bash
pocketbase serve --dir Pocketbase-Cloud/pb_data --migrationsDir Pocketbase-Cloud/pb_migrations
```

The first start prints a link for creating a local superuser; the dashboard is
at `http://127.0.0.1:8090/_/`. In a second terminal:

```bash
cd Syntro
cp .env.example .env
pnpm install
pnpm dev
```

| Command | Action |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Build to `Syntro/dist/` |
| `pnpm preview` | Preview the build |

## CLI quick reference

| Command | What it does |
| --- | --- |
| `pbc login` / `pbc whoami` | Log in and show the current account |
| `pbc project create <name>` / `pbc project use <name>` | Create a project and make it the default |
| `pbc pocketbase deploy --name syntro-pocketbase` | Deploy `Pocketbase-Cloud/` as a PocketBase instance |
| `pbc deploy frontend --name syntro` | Deploy `Syntro/` as a static site |
| `pbc pocketbase info --name syntro-pocketbase` | Instance URL, version, and superuser login |
| `pbc frontend info --name syntro` | Site URL |
| `pbc pocketbase ls` / `pbc frontend ls` | List instances and sites |
| `pbc admin use <url>` / `pbc admin login` | Point `pbc admin` at the instance as superuser |
| `pbc admin collections ls` | List collections |
| `pbc admin records ls <collection>` | List records |
| `pbc logs pocketbase --name syntro-pocketbase -f` | Follow instance logs |
| `pbc pocketbase domain add <domain> --name syntro-pocketbase` | Custom domain for the database |
| `pbc frontend domain add <domain> --name syntro` | Custom domain for the site |
| `pbc ci init <pocketbase\|frontend>` | Write a GitHub Actions workflow |
