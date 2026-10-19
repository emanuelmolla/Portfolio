import type { ThemeManifest } from '@/lib/theme/contract'
const contexts = ['full', 'summary', 'inline'] as const
const manifest: ThemeManifest = {
  id: 'terminal',
  name: 'Terminal',
  version: '1.0.0',
  description: 'A quiet, navigable terminal with readable portfolio files.',
  renders: {
    profile: [...contexts],
    page: [...contexts],
    work: [...contexts],
    post: [...contexts],
    experience: [...contexts],
    contact: [...contexts],
  },
  omits: [],
  settings: {},
  canonical: false,
  routes: {
    profile: { pattern: '/about' },
    page: { pattern: '/:slug' },
    work: { pattern: '/work/:slug', indexPattern: '/work' },
    post: { pattern: '/blog/:slug', indexPattern: '/blog' },
    experience: { pattern: '/experience' },
    contact: { pattern: '/contact' },
  },
}
export default manifest
