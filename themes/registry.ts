import type { ThemeManifest } from '@/lib/theme/contract'
import { assertThemeCoverage } from '@/lib/theme/contract'
import cleanManifest from './clean/manifest'

/**
 * The theme registry.
 *
 * Every entry uses a LITERAL import path. Never `import(`./themes/${id}`)`:
 * a dynamic expression makes the bundler build a context module that enumerates
 * every file under the tree (webpack's inferred pattern defaults to /.*​/ and is
 * recursive), and Turbopack's handling of it is undocumented. One line per theme
 * is the price, and it is the right price, because themes are code. The
 * requirement is that adding a theme touches no model, no content function, and
 * no admin screen.
 */

export const themes = {
  clean: cleanManifest,
  // chess:   → themes/chess/manifest
  // desktop: → themes/desktop/manifest  (port of the v1 dock UI, see tag v1-final)
} satisfies Record<string, ThemeManifest>

export type ThemeId = keyof typeof themes

export const DEFAULT_THEME: ThemeId = 'clean'

/** Validated at import time, so a malformed or drifted theme fails the build. */
for (const manifest of Object.values(themes)) {
  assertThemeCoverage(manifest)
}

const canonicals = Object.values(themes).filter((t) => t.canonical)
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
if (canonicals[0].omits.length > 0) {
  throw new Error(
    `Canonical theme "${canonicals[0].id}" cannot omit any content kind ` +
      `(omits: ${canonicals[0].omits.join(', ')}). It is the fallback for every ` +
      `other theme, so it must render all of them.`
  )
}

export function getTheme(id: string | undefined): ThemeManifest {
  if (id && id in themes) return themes[id as ThemeId]
  return themes[DEFAULT_THEME]
}
