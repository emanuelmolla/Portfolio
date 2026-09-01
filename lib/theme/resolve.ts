import { cookies } from 'next/headers'
import { DEFAULT_THEME, themes, type ThemeId } from '@/themes/registry'
import type { ThemeManifest } from './contract'

/**
 * Two independent axes, deliberately kept apart:
 *
 *   THEME        which renderer draws the site   clean | desktop
 *   COLOR SCHEME which palette it draws with     light | dark | system
 *
 * Conflating them is the obvious mistake: "dark mode" is not a theme, it is a
 * property every theme has to support. The desktop theme happens to look best
 * dark and the clean theme light, but both must work in both.
 */

export const THEME_COOKIE = 'theme'
export const SCHEME_COOKIE = 'scheme'

export type ColorScheme = 'light' | 'dark' | 'system'

export function isThemeId(value: string | undefined): value is ThemeId {
  return Boolean(value && value in themes)
}

/**
 * Resolution order: explicit ?theme= param, then cookie, then default.
 *
 * The param is handled by a route handler that sets the cookie and redirects to
 * the clean URL, so it never lingers in history or gets indexed. That leaves
 * this function reading only the cookie.
 *
 * Googlebot clears cookies between page loads, so a crawler deterministically
 * receives DEFAULT_THEME at every URL. That is not cloaking: no user-agent
 * sniffing happens anywhere, we simply serve the documented default to any
 * stateless client.
 */
export async function resolveTheme(): Promise<ThemeManifest> {
  const store = await cookies()
  const requested = store.get(THEME_COOKIE)?.value
  return isThemeId(requested) ? themes[requested] : themes[DEFAULT_THEME]
}

export async function resolveColorScheme(): Promise<ColorScheme> {
  const store = await cookies()
  const value = store.get(SCHEME_COOKIE)?.value
  return value === 'light' || value === 'dark' ? value : 'system'
}

/**
 * Themes declare which content kinds they render. When one omits a kind, the
 * route falls back to the canonical theme rather than 404ing, so URLs stay
 * alive whichever theme is active. This is the WordPress template-hierarchy
 * model: a theme differentiates by what it provides, omissions fall through.
 */
export function canRender(manifest: ThemeManifest, kind: string): boolean {
  return Boolean(manifest.renders[kind as keyof typeof manifest.renders])
}

export function canonicalTheme(): ThemeManifest {
  const found = Object.values(themes).find((t) => t.canonical)
  if (!found) throw new Error('No canonical theme registered')
  return found
}
