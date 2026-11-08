# CodeQuarry

**Dig Deeper. Build Smarter.**

CodeQuarry is a developer knowledge platform of practical, searchable cheatsheets and engineering references. It has languages, frontend, backend, databases, DevOps, networking, security, system design and computer science.

Live target: <https://codequarry.vercel.app>

---

## Features

- **20 real cheatsheets** across 10 categories: TypeScript, React, Next.js, SQL, PostgreSQL, Docker, Git, system design, Big O, and more.
- **Global search** (<kbd>⌘K</kbd> / <kbd>Ctrl K</kbd> or <kbd>/</kbd>): PostgreSQL full-text search with weighted ranking and prefix matching, highlighted excerpts, results grouped by category, and keyboard navigation. Queries are debounced and server-side, so the collection is never sent to the browser.
- **Explore page** with server-side filters for category, technology and difficulty. You can sort by relevance, latest, popular or A–Z, switch between grid and list layouts, and page through results. Every state is a shareable URL, and the page works without JavaScript.
- **Cheatsheet reader** with:
  - a category sidebar and a table of contents that tracks the active section
  - a reading progress bar and a collapsible table of contents on mobile
  - Shiki syntax highlighting (light and dark), copy buttons and language labels
  - Mermaid diagrams, callouts, tables and keyboard-shortcut styling
  - previous/next and related cheatsheets
  - bookmark, share, copy-link and print actions, plus "Was this helpful?" feedback
  - a print-friendly layout
- **Bookmarks** stored in `localStorage` behind a `BookmarkStore` interface, so a server-backed store for signed-in users can replace it later.
- **SEO**: per-page metadata, canonical URLs, Open Graph and Twitter cards, generated OG images, JSON-LD (`WebSite`, `TechArticle`, `BreadcrumbList`, `CollectionPage`), `sitemap.xml` and `robots.txt`.
- **Dark-first design system** with a full light theme, responsive layouts and accessible focus states.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components, Partial Prefetching), React 19, TypeScript (strict) |
| UI | Tailwind CSS v4, shadcn/ui (Radix), Lucide icons, Geist and Geist Mono |
| Database | Neon serverless PostgreSQL, accessed with Prisma 7 through `@prisma/adapter-neon` |
| Content | MDX (`next-mdx-remote/rsc`), Shiki, Mermaid, remark-gfm, rehype-slug |
| Validation | Zod |
| Hosting | Vercel and Vercel Analytics |

> The original spec called for Drizzle ORM. Per the project owner's decision, Prisma is used instead. All database access lives in `src/db/`, so swapping ORMs only affects that folder.

---

## Getting started

### Prerequisites

- Node.js 22 or newer (developed on 26)
- A Neon project (the free tier is fine)

### 1. Install

```bash
git clone https://github.com/kashyapkrlucky/codequarry.git
cd codequarry
npm install          # also runs `prisma generate`
```

### 2. Configure the environment

```bash
cp .env.example .env
```

Set `DATABASE_URL` to your Neon **pooled** connection string. Migrations use a direct connection: set `DIRECT_URL`, or leave it unset and it is derived automatically by removing `-pooler` from the host.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Neon pooled connection string (server-only) |
| `DIRECT_URL` | No | Direct connection for migrations |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical origin for metadata and the sitemap |
| `REVALIDATE_SECRET` | No | Bearer secret for `POST /api/revalidate` |
| `REVALIDATE_URL` | No | Endpoint the import script calls after publishing |

### 3. Create the schema and seed the content

```bash
npm run db:deploy    # apply migrations in prisma/migrations
npm run db:seed      # import categories, technologies, tags and all cheatsheets
```

### 4. Run

```bash
npm run dev          # http://localhost:3000
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js dev server, production build, production server |
| `npm run typecheck` / `lint` / `test` | TypeScript, ESLint, Vitest |
| `npm run db:generate` | Generate the Prisma client into `src/generated/prisma` |
| `npm run db:migrate` | Create and apply a new migration after editing `schema.prisma` (development) |
| `npm run db:deploy` | Apply pending migrations (CI and production) |
| `npm run db:seed` | Full import; archives cheatsheets whose files were removed. `-- --reset` also clears feedback and view counts |
| `npm run db:studio` | Open Prisma Studio |
| `npm run content:validate` | Validate all MDX files without touching the database |
| `npm run content:import` | Validate and upsert content. `-- --prune` archives cheatsheets with no source file |

---

## Architecture

```text
content/                     MDX source of truth for authors (imported into PostgreSQL)
  _meta/categories.json      category tree (name, icon, order, parent)
  _meta/technologies.json    technology catalogue
  <category>/<slug>.mdx      one cheatsheet per file
prisma/
  schema.prisma              data model
  migrations/                SQL migrations (including the GIN full-text index)
scripts/
  seed.ts                    full import + prune
  import-content.ts          validate/import, optional cache revalidation
src/
  app/                       routes: /, /explore, /categories, /categories/[slug],
                             /cheatsheets/[slug], /bookmarks, /about, /privacy, /terms,
                             api/{search,cheatsheets,feedback,views,revalidate},
                             sitemap.ts, robots.ts, opengraph-image.tsx
  components/
    layout/ navigation/ search/ cheatsheets/ categories/ content/ bookmarks/ seo/ ui/
  db/
    client.ts                Prisma + Neon adapter factory (shared with scripts)
    index.ts                 server-only singleton
    queries/                 every read/write; cached reads use "use cache"
  lib/
    content/                 loader, MDX policy and validator, TOC, Shiki, ingestion
    search/                  tsquery builder, highlight parsing
    validation/              Zod schemas (frontmatter, URL params, API bodies)
    bookmarks/               BookmarkStore interface and localStorage implementation
    rate-limit/  seo/
  config/                    site config and the icon allow-list
  hooks/  types/
tests/                       Vitest unit tests
```

### Data model

`categories` (self-referencing `parent_id` for subcategories) · `technologies` · `cheatsheets` · `tags` · `cheatsheet_tags` · `cheatsheet_technologies` · `feedback`

- All tables use UUID primary keys.
- Slugs are unique, and foreign keys cascade on join tables and feedback.
- A category that still has cheatsheets cannot be deleted.
- Indexes cover category/status lookups, latest, popular and featured listings, and a GIN index on `cheatsheets.search_vector`.
- `search_vector` is a weighted `tsvector`: title and tags are weight A, description B, body C. The ingestion pipeline rebuilds it, which also lets it include tags from the join table.

### Content pipeline

1. Authors write MDX with frontmatter in `content/`.
2. `loadContent` validates each file:
   - **Frontmatter** is checked with a Zod schema: title, slug, description, category, difficulty, tags, technologies, `readingTime?`, featured, `status?`, `publishedAt?` and updatedAt.
   - **Category and technology references** must exist.
   - **Slugs** must be unique.
   - **The MDX AST** must pass a strict policy: no `import`/`export`, no `{expressions}`, only allow-listed components (`Callout`, `Kbd`, `Steps`, `Step`) and safe HTML, and no `javascript:` URLs.
3. `ingestContent` upserts everything idempotently and refreshes the search vectors.
4. At runtime the **database is the source of truth**. Pages render the stored MDX on the server with `blockJS` enabled and a component map that turns dangerous tags into nothing.

#### Adding a cheatsheet

```mdx
---
title: Kubernetes Cheatsheet
slug: kubernetes
description: kubectl commands, workloads, services, config and debugging.
category: devops
difficulty: intermediate
tags: [kubernetes, k8s, containers]
technologies: [docker]
featured: false
updatedAt: 2026-11-08
---

## Pods

<Callout type="tip">Use `kubectl explain pod.spec` to browse the API.</Callout>
```

Then run `npm run content:import`. Write fenced code blocks with a language (`ts`, `bash`, `sql`, …); a `mermaid` fence renders as a diagram. Literal `{`, `}` and `<` in prose must go inside backticks.

### Rendering and caching

- **Cache Components with Partial Prefetching.** Read queries use `"use cache"` with `cacheLife("hours")` and `cacheTag("content")`. Compiled article bodies are cached for days.
- **Prerendered at build time.** The homepage, category index and every cheatsheet are prerendered. Category pages and Explore prerender a static shell and stream in results that depend on the URL.
- **Fresh content.** `POST /api/revalidate` (bearer `REVALIDATE_SECRET`) expires the `content` tag. `content:import` calls it when `REVALIDATE_URL` is set.
- **Minimal client JavaScript.** Only interactive leaves are client components: search, theme, table of contents, bookmarks, feedback and copy buttons. The search dialog and Mermaid are lazy-loaded.

### Security

- The database is accessed only from `server-only` modules, with Prisma's parameterised queries and tagged-template raw SQL. The Neon URL is never exposed to the browser.
- API bodies and URL parameters are validated with Zod. Invalid filters are dropped rather than throwing.
- Public endpoints are rate-limited (`search`, `cheatsheets`, `feedback`, `views`, `revalidate`).
  - The limiter is in memory and applies per instance. Replace `src/lib/rate-limit` with a shared store (for example Upstash Redis) if you need global limits.
- Search highlighting uses sentinel markers rendered as text, never as HTML. JSON-LD output escapes `<`.
- Error boundaries, a not-found page (with `noindex`), loading skeletons and empty states are in place.

---

## Deploying to Vercel

1. Push the repository to GitHub and import it in Vercel (framework preset: Next.js).
2. Add environment variables for Production (and Preview if you want):
   - `DATABASE_URL`, the Neon pooled URL. The Neon–Vercel integration can set it for you.
   - `NEXT_PUBLIC_SITE_URL=https://codequarry.vercel.app`
   - `REVALIDATE_SECRET`, a random string.
3. The build command is the default `npm run build`, which runs `prisma generate && next build`. Pages are prerendered from the database during the build, so `DATABASE_URL` must be available at build time.
4. Apply migrations and seed content from your machine or CI. Migrations are deliberately not run on every deploy, so preview builds can never alter production data.

   ```bash
   npm run db:deploy
   npm run db:seed
   ```

5. Enable **Vercel Analytics** in the project dashboard. The `<Analytics />` component is already mounted.
6. After content changes, run:

   ```bash
   REVALIDATE_URL=https://codequarry.vercel.app/api/revalidate npm run content:import
   ```

   Or redeploy.

## Roadmap-ready extension points

- **Accounts.** Implement a server-backed `BookmarkStore` and keep `useBookmarks` unchanged.
- **Admin panel.** It can write directly through `ingestContent` / Prisma. The schema already supports `draft`, `published` and `archived`.
- **Search.** The search API is isolated in `src/db/queries/search.ts`, so it can move to a dedicated engine if the corpus outgrows PostgreSQL FTS.

## License

MIT
