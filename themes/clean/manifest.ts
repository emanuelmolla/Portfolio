import type { ThemeManifest } from '@/lib/theme/contract'

/**
 * The default theme: a genuinely clean, modern site.
 *
 * This is the canonical theme. It owns the bare URLs, it is what Googlebot
 * receives (cookies are cleared between page loads for crawlers, so a stateless
 * client always gets the default), and it is the one theme that must render
 * every content kind.
 */
const manifest: ThemeManifest = {
  /**
   * `id` stays 'clean' while the display name is 'Minimal'. The id is the stable
   * key: it is what the theme cookie stores and what the registry and the drift
   * checks key on, so renaming it would silently reset the preference of anyone
   * already carrying that cookie. The name is the only part anyone reads.
   */
  id: 'clean',
  name: 'Minimal',
  version: '0.1.0',
  description: 'Minimal and typographic. The default.',

  renders: {
    profile: ['full', 'summary'],
    page: ['full'],
    work: ['full', 'summary', 'inline'],
    post: ['full', 'summary', 'inline'],
    experience: ['full', 'summary'],
    contact: ['full'],
  },
  omits: [],

  routes: {
    page: { pattern: '/:slug' },
    work: { pattern: '/work/:slug', indexPattern: '/work' },
    post: { pattern: '/blog/:slug', indexPattern: '/blog' },
    experience: { indexPattern: '/experience', pattern: '/experience/:slug' },
    contact: { pattern: '/contact' },
    profile: { pattern: '/about' },
  },

  settings: {},

  canonical: true,
}

export default manifest
