# emanuelmolla.dev

Personal site. Server-rendered, content-driven, and themeable: one content model
rendered by several completely different front ends.

```bash
npm install
npm run dev          # http://localhost:3000
```

It runs with no configuration. Without `MONGODB_URI` the content layer serves
the seed content in `lib/content/_seed.ts`, which is the same data the seed
script writes to the database.

## Themes

A theme is a folder under `themes/` that renders the shared content model. Two
exist today:

| id        | what it is                                            |
| --------- | ----------------------------------------------------- |
| `clean`   | the default. Quiet, typographic, reading-first.       |
| `desktop` | pages as windows on a dock. The previous site, rebuilt. |

Switching is a cookie, never a URL. Every theme serves the same canonical URLs,
so there is exactly one address per piece of content and no duplicate-content
problem. Since crawlers do not carry cookies between requests, they always
receive the canonical theme.

Colour scheme (`light` / `dark` / `auto`) is a separate axis. Every theme
supports both; dark mode is not a theme.

### Adding a theme

1. `themes/<id>/` with a `manifest.ts` and an `index.ts` exporting
   `{ manifest, Shell, views }`.
2. One line in `themes/registry.ts`.

Nothing else changes. No model, no query, no route. The registry validates at
import time and the build fails if a theme leaves a content kind undeclared, if
there is not exactly one canonical theme, or if the canonical theme omits
anything (it is the fallback for the others, so it has to render everything).

## Layout

```
app/          routes. Thin: resolve theme, fetch data, hand it to a view.
lib/
  db.ts       cached Mongo connection for serverless
  models/     Mongoose schemas + zod schemas
  content/    the data access layer. THE theme-facing contract.
  theme/      the theme contract and resolution
  jsonld.ts   structured data, generated once and shared by every theme
themes/       one folder per renderer
components/   cross-theme pieces (appearance controls, JSON-LD)
scripts/      seed and migration
```

The only structural rule: **arrows never point up.** `themes/` imports
`lib/content`; `lib/content` never imports `themes/`. And `lib/content` returns
data, never presentation. The moment a query returns a formatted date or a class
name, the boundary is broken.

## Content

Content lives in MongoDB and is edited as data, never in code. That is the whole
point of the rewrite: the previous version hardcoded identity in fourteen places
across component files, six of them pointing at a GitHub handle that no longer
existed, so changing a username meant a deploy.

Collections: `profile` (singleton), `page`, `work`, `post`, `experience`,
`tech`, `redirect`.

`work` is one collection discriminated by `kind`, so software, writing,
photography and chess are all work items rather than separate systems.

## Database

```bash
cp .env.example .env.local     # add MONGODB_URI
npm run seed -- --dry          # report what would change
npm run seed                   # write it
```

The seed is idempotent (upserts keyed on slug) and reads the v1 `blogs`
collection in place to migrate posts. It never drops or overwrites the old
collections.

## Scripts

| command             | does                                     |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | dev server                               |
| `npm run build`     | production build                         |
| `npm run typecheck` | `tsc --noEmit`                           |
| `npm run lint`      | eslint                                   |
| `npm run seed`      | seed content and migrate v1 blogs        |

## History

The commit history includes the previous Vite frontend and the Express API that
used to live in a separate repository, merged here so nothing was lost when the
two were consolidated. Tag `v1-final` marks the last state of that version.
