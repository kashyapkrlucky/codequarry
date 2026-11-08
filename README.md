# CodeQuarry

Developer cheatsheets — TypeScript, React, SQL, Docker, Git, system design and more — with full-text search.

https://codequarry.vercel.app

Built with Next.js 16 (App Router), Prisma + Neon Postgres, MDX, Tailwind and shadcn/ui.

## Setup

Needs Node 22+ and a Neon database.

```bash
npm install
cp .env.example .env    # add your DATABASE_URL
npm run db:deploy       # run migrations
npm run db:seed         # import everything in content/
npm run dev
```

Use the **pooled** Neon connection string for `DATABASE_URL`. Migrations need a direct connection; `prisma.config.ts` strips `-pooler` from the host automatically, or you can set `DIRECT_URL` yourself.

Other env vars (all optional):

- `NEXT_PUBLIC_SITE_URL` — used for canonical URLs, sitemap and OG tags
- `REVALIDATE_SECRET` — protects `POST /api/revalidate`
- `REVALIDATE_URL` — if set, `content:import` hits it after importing so the live site picks up changes

## Scripts

```
dev / build / start       the usual
typecheck / lint / test   tsc, eslint, vitest
db:migrate                new migration after changing schema.prisma
db:deploy                 apply migrations
db:seed                   import all content, archive sheets whose file was deleted (--reset clears feedback/views)
db:studio                 prisma studio
content:validate          check MDX files without touching the db
content:import            validate + upsert content (--prune to archive removed files)
```

## Writing a cheatsheet

Add a file at `content/<category>/<slug>.mdx`:

```mdx
---
title: Kubernetes Cheatsheet
slug: kubernetes
description: kubectl commands, workloads, services and debugging.
category: devops
difficulty: intermediate
tags: [kubernetes, k8s]
technologies: [docker]
updatedAt: 2026-11-08
---

## Pods

<Callout type="tip">`kubectl explain pod.spec` shows the API docs.</Callout>
```

Then `npm run content:import`.

- `category` and `technologies` must exist in `content/_meta/*.json`.
- Optional frontmatter: `featured`, `status` (draft/published/archived), `publishedAt`, `readingTime` (estimated if missing).
- Available components: `Callout` (info/tip/warning/danger), `Kbd`, `Steps`/`Step`. A ` ```mermaid ` block renders as a diagram.
- No imports, exports or `{expressions}` — the importer rejects them. Put literal `{`, `}` and `<` in backticks.

The files in `content/` are just the authoring format. The app only reads from Postgres, so nothing shows up until you import.

## How it fits together

```
content/            MDX + category/technology metadata
prisma/             schema and migrations
scripts/            seed + import (both use src/lib/content)
src/app/            routes and API handlers
src/db/queries/     all database access
src/lib/content/    MDX loading, validation, TOC, highlighting, ingestion
src/components/     UI, grouped by feature
tests/              vitest
```

A few things worth knowing:

- **Search** uses Postgres full-text search on a weighted `search_vector` column (title/tags > description > body) with a GIN index. The import script fills that column, not a trigger, so remember that if you ever write cheatsheets some other way.
- **Caching**: the app uses Cache Components. Queries are wrapped in `"use cache"` with a `content` tag; cheatsheet pages are prerendered at build. After importing content in production, either redeploy or call `/api/revalidate` (the import script does this if `REVALIDATE_URL` is set).
- **MDX rendering** happens on the server with JS expressions blocked and a fixed component map. Shiki does highlighting at render time; Mermaid loads client-side only on pages that use it.
- **Bookmarks** live in localStorage (`src/lib/bookmarks/store.ts`). It's behind a small interface so it can be swapped for a server store once there are accounts.
- **Rate limiting** on the API routes is in-memory, so it's per instance. Good enough for now; move to Redis/Upstash if it ever matters.
- **Views and feedback** are anonymous — a counter per sheet and a yes/no row.

## Deploying on Vercel

`vercel.json` pins the framework to Next.js. In the project settings add `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL` and `REVALIDATE_SECRET`. `DATABASE_URL` has to be available at build time because pages are prerendered from the database.

Migrations and seeding aren't part of the build (so preview deploys can't touch prod data). Run them yourself:

```bash
npm run db:deploy
npm run db:seed
```

## License

MIT
