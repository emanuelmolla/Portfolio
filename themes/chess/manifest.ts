import type { ThemeManifest } from '@/lib/theme/contract'

const manifest: ThemeManifest = {
  id: 'chess',
  name: 'Clubroom',
  version: '1.0.0',
  description: 'Walnut, felt, and a portfolio across the board.',
  renders: {
    profile: ['full'],
    page: ['full'],
    work: ['full', 'summary'],
    post: ['full', 'summary'],
    experience: ['full'],
    contact: ['full'],
  },
  omits: [],
  routes: {
    profile: { pattern: '/about' },
    page: { pattern: '/:slug' },
    work: { pattern: '/work/:slug', indexPattern: '/work' },
    post: { pattern: '/blog/:slug', indexPattern: '/blog' },
    experience: { pattern: '/experience' },
    contact: { pattern: '/contact' },
  },
  settings: {},
  canonical: false,
}
export default manifest
