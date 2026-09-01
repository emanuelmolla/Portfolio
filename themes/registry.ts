import type { ThemeModule } from '@/lib/theme/contract'
import { assertThemeCoverage } from '@/lib/theme/contract'
import clean from './clean'
import desktop from './desktop'

/**
 * The theme registry.
 *
 * Every entry uses a LITERAL import path. Never `import(`./themes/${id}`)`: a
 * dynamic expression makes the bundler build a context module that enumerates
 * every file under the tree (webpack's inferred pattern defaults to /.*​/ and is
 * recursive), and Turbopack's handling of it is undocumented. One line per
 * theme is the price, and it is the right price, because themes are code. The
 * requirement is that adding a theme touches no model, no content function and
 * no admin screen, not that it touches zero files.
 */

export const themeModules = {
  clean,
  desktop,
  // chess: → themes/chess  (board as navigation, see OPEN_QUESTIONS Q9)
} satisfies Record<string, ThemeModule>

export type ThemeId = keyof typeof themeModules

/** Manifests only, for anything that needs metadata without pulling components. */
export const themes = Object.fromEntries(
  Object.entries(themeModules).map(([id, mod]) => [id, mod.manifest])
) as Record<ThemeId, ThemeModule['manifest']>

export const DEFAULT_THEME: ThemeId = 'clean'

/* ------------------------------------------------- build-time drift checks --- */
/* These run at import, so a drifted theme fails the build rather than 404ing
   for a visitor months later. Silent gaps are the failure mode here.          */

for (const mod of Object.values(themeModules)) {
  assertThemeCoverage(mod.manifest)
}

const canonicals = Object.values(themeModules).filter((m) => m.manifest.canonical)
if (canonicals.length !== 1) {
  throw new Error(
    `Exactly one theme must set canonical: true (found ${canonicals.length}). ` +
      `The canonical theme owns the indexed URLs.`
  )
}

/**
 * When a theme omits a kind, that route falls back to the canonical theme's
 * renderer rather than 404ing, so URLs stay alive whichever theme is active.
 * That makes the canonical theme the bottom of the cascade: it has to render
 * everything, or the fallback has nowhere to land.
 */
if (canonicals[0].manifest.omits.length > 0) {
  throw new Error(
    `Canonical theme "${canonicals[0].manifest.id}" cannot omit any content kind ` +
      `(omits: ${canonicals[0].manifest.omits.join(', ')}). It is the fallback for ` +
      `every other theme, so it must render all of them.`
  )
}

export function getThemeModule(id: string | undefined): ThemeModule {
  if (id && id in themeModules) return themeModules[id as ThemeId]
  return themeModules[DEFAULT_THEME]
}

export const canonicalModule = canonicals[0]
