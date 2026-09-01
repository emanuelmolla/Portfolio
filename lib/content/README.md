# lib/content — the data access layer

This directory is the **theme-facing contract**. Themes import from here and from
nowhere else in the data stack. Freeze this interface before writing any theme.

## The dependency rule

```
themes/*      →  imports lib/content. Nothing else.
app/*         →  thin: resolves theme, renders it.
lib/content/* →  imports lib/models. NEVER imports themes.
lib/models/*  →  imports lib/db.
lib/db.ts     →  infrastructure.
```

Arrows never point up. `lib/content` not importing from `themes/` is the whole
architecture; everything else follows from it.

## The rule that keeps this from rotting

**Return data, never presentation.** No formatted strings, no JSX, no
theme-shaped anything. If a function here ever returns `displayDate`,
`cardTitle`, or an HTML string, presentation has leaked downward and the boundary
is broken. Themes format; this layer supplies facts.

## Planned files

| File | Exports |
|---|---|
| `profile.ts` | `getProfile()` |
| `pages.ts` | `getPage(slug)`, `getNavPages()` |
| `work.ts` | `getWork(filter)`, `getWorkItem(slug)`, `getRelatedWork(id)` |
| `posts.ts` | `getPosts(filter)`, `getPost(slug)` |
| `experience.ts` | `getExperience(filter)` |
| `tech.ts` | `getTech()`, `getTopTech(n)` |
| `media.ts` | `getGallery(slug)` |
| `index.ts` | the port (see below) |

## The port

`index.ts` does two jobs, and both are needed:

1. **Re-exports the named typed functions.** The normal path. A theme that knows
   what it wants keeps full TypeScript types.
2. **A dispatcher** for the manifest-driven path, where the router holds a
   `ContentKind` as a *value* read from a theme manifest and needs the matching
   query: `resolve(kind: ContentKind, ctx: RouteContext)`.

A dispatcher alone would be stringly-typed and throw away the types this design
exists to buy. Named functions alone cannot serve the dynamic path. Ship both.

## Caching

Every read is wrapped in `unstable_cache(fn, keys, { tags: [...] })`. Admin writes
call `revalidateTag(...)` in the same server action as the write. That single
mechanism is what makes the site fully static for crawlers *and* editable without
a redeploy.

See `DATA-MODEL.md` §8 in the planning repo for the full rationale.
