import { getNavPages, getProfile } from '@/lib/content'
import { resolveColorScheme, resolveTheme } from '@/lib/theme/resolve'
import { getThemeModule, canonicalModule } from '@/themes/registry'
import type { ContentKind, NavLink, RenderContext } from '@/lib/theme/contract'
import { AppearanceMenu } from './AppearanceMenu'

/**
 * Wraps a page in the active theme's chrome.
 *
 * Every route uses this, which is what lets one route file serve every theme:
 * the route owns the URL and the data, the theme owns the pixels.
 */
export async function ThemedPage({
  path,
  children,
}: {
  path: string
  children: React.ReactNode
}) {
  const [theme, scheme, profile, navPages] = await Promise.all([
    resolveTheme(),
    resolveColorScheme(),
    getProfile(),
    getNavPages(),
  ])

  const mod = getThemeModule(theme.id)

  // Core kinds have dedicated routes; anything else in the nav is a Page row,
  // so adding /uses to the navigation is a CMS edit and not a deploy.
  const nav: NavLink[] = [
    { href: '/work', label: 'work' },
    { href: '/blog', label: 'writing' },
    { href: '/about', label: 'about' },
    ...navPages.map((p) => ({ href: `/${p.slug}`, label: p.title.toLowerCase() })),
    { href: '/contact', label: 'contact' },
  ]

  const Shell = mod.Shell

  return (
    <Shell
      nav={nav}
      siteName={profile?.name ?? 'Emanuel Molla'}
      path={path}
      headline={profile?.headline}
      location={profile?.location?.city}
      appearance={
        <AppearanceMenu
          path={path}
          currentTheme={theme.id}
          currentScheme={scheme}
          // The desktop taskbar sits at the bottom of the viewport, so its menu
          // has to open upward or it renders off-screen.
          align={theme.id === 'desktop' ? 'up' : 'down'}
          label={theme.id === 'desktop' ? 'Settings' : 'Appearance'}
        />
      }
    >
      {children}
    </Shell>
  )
}

/**
 * Look up a view, falling back to the canonical theme when the active theme
 * omits this kind.
 *
 * Falling back rather than 404ing is deliberate: a 404 that depends on a cookie
 * is a URL that works for some visitors and not others, and it would make the
 * sitemap a lie. This is the WordPress template-hierarchy model, where a theme
 * differentiates by what it provides and omissions fall through the cascade.
 * The canonical theme is the bottom of that cascade, which is why the registry
 * refuses to build if it omits anything.
 */
export async function resolveView(
  kind: ContentKind,
  context: RenderContext
): Promise<React.ComponentType<Record<string, unknown>>> {
  const theme = await resolveTheme()
  const mod = getThemeModule(theme.id)

  const own = mod.views[kind]?.[context]
  if (own) return own

  const fallback = canonicalModule.views[kind]?.[context]
  if (fallback) return fallback

  throw new Error(
    `No view for kind "${kind}" in context "${context}", and the canonical theme ` +
      `does not provide one either. This should be impossible: the registry ` +
      `validates coverage at build time.`
  )
}

export async function resolveHome(): Promise<React.ComponentType<Record<string, unknown>>> {
  const theme = await resolveTheme()
  const mod = getThemeModule(theme.id)
  return mod.views.home ?? canonicalModule.views.home!
}
