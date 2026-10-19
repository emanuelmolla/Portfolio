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

A theme is a folder under `themes/` that renders the shared content model.

| id        | what it is                                            |
| --------- | ----------------------------------------------------- |
| `clean`   | the default. Quiet, typographic, reading-first.       |
| `chess`   | Clubroom: project folios, scoresheets, and a playable board. |
| `terminal` | portfolio files explored with commands or links. |
| `desktop` | pages as windows on a dock. The previous site, rebuilt. |

The appearance menu follows that order. Desktop is offered at widths of 1024px
and above; a saved Desktop preference falls back to Minimal on smaller screens,
preserving the page URL. A dismissible cat introduces appearance settings once
per browser. Its motion respects the system's reduced-motion preference.

Visitors currently see Minimal, Clubroom, and Desktop. Terminal is registered but
disabled by default. `/admin/settings` controls which optional themes are offered;
it requires admin authentication and MongoDB to save. Minimal cannot be disabled.
Disabled theme cookies and selection links fall back to Minimal without changing
the page URL.

Desktop starts on the bare workspace at `/`, without a Home folder. Windows can
be closed, minimised, maximised, and dragged by their title bars. Closing an app
returns to `/`; the dock reopens apps. Maximisation is preserved between apps.
Double-clicking a title bar toggles maximisation. Title bars also support
arrow-key movement, Home to centre, and Enter to maximise. Sticky notes can be
moved with a pointer or arrow keys, with positions kept during navigation.
Rich-content files use Markdown names.

Switching is a cookie, never a URL. Every theme serves the same canonical URLs,
so there is exactly one address per piece of content and no duplicate-content
problem. Since crawlers do not carry cookies between requests, they always
receive the canonical theme.

Colour scheme (`light` / `dark` / `system`) is a separate axis. Every theme
supports both; dark mode is not a theme.

### Adding a theme

1. `themes/<id>/` with a `manifest.ts` and an `index.ts` exporting
   `{ manifest, Shell, views }`.
2. One line in `themes/registry.ts`.
3. Add its menu position to `THEME_ORDER` in `lib/theme/appearance.ts`.

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
| `npm test`          | content, theme, and interaction unit tests |
| `npm run seed`      | seed content and migrate v1 blogs        |

With a local seed-data server running, `npx tsx scripts/check-theme-routes.ts
http://localhost:3219` checks all four themes' public routes, headings,
canonicals, redirects, and not-found behavior. It does not submit forms or write
data. Visual and theme-switching checks still require a browser.

## Preview builds

`vercel.json` selects Next.js, runs `npm run build`, and overrides the output
directory to `.next`. This prevents the old Vite project's `dist` setting from
rejecting a successful Next.js build. Do not add the old SPA catch-all rewrite:
Next.js owns its routes, server actions, and API endpoints.

Keep the production branch on `main` while reviewing `dev`. These file-based
settings apply to deployments that contain this configuration; changing them
locally does not redeploy or modify the existing production site.

## History

The commit history includes the previous Vite frontend and the Express API that
used to live in a separate repository, merged here so nothing was lost when the
two were consolidated. Tag `v1-final` marks the last state of that version.
