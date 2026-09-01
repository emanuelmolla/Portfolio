import type { ThemeManifest } from '@/lib/theme/contract'

/**
 * The desktop theme: the v1 motif, rebuilt.
 *
 * The original was a Vite SPA where clicking a dock icon changed client state
 * and fetched content over the network. That is the version of this idea that
 * cannot be indexed: Google will not load content that requires a click, and it
 * only discovers links that are real anchors. So this is a port, not a move.
 * The window metaphor survives; the plumbing underneath it is completely
 * different. Every dock item is an <a href> to a real URL, and every window's
 * content is in the server HTML before any JavaScript runs.
 */
const manifest: ThemeManifest = {
  id: 'desktop',
  name: 'Desktop',
  version: '0.1.0',
  description: 'Pages as windows on a dock. The previous version of this site, rebuilt.',

  renders: {
    profile: ['full', 'summary'],
    page: ['full'],
    work: ['full', 'summary'],
    post: ['full', 'summary'],
    experience: ['full'],
    contact: ['full'],
  },
  omits: [],

  routes: {
    page: { pattern: '/:slug' },
    work: { pattern: '/work/:slug', indexPattern: '/work' },
    post: { pattern: '/blog/:slug', indexPattern: '/blog' },
    experience: { pattern: '/experience/:slug', indexPattern: '/experience' },
    contact: { pattern: '/contact' },
    profile: { pattern: '/about' },
  },

  settings: {},
  canonical: false,
}

export default manifest
