import type { MetadataRoute } from 'next'
import { getPageSlugs, getPostSlugs, getWorkSlugs } from '@/lib/content'

const BASE = 'https://emanuelmolla.dev'

/**
 * Only canonical URLs appear here.
 *
 * Themes never get their own URLs, so there is exactly one entry per piece of
 * content and no duplicate-content problem to manage. Google's guidance is
 * explicit: where the same content is reachable at several URLs, list only the
 * preferred one.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [work, posts, pages] = await Promise.all([
    getWorkSlugs(),
    getPostSlugs(),
    getPageSlugs(),
  ])

  const fixed: MetadataRoute.Sitemap = ['', '/work', '/blog', '/about', '/contact'].map(
    (path) => ({
      url: `${BASE}${path}`,
      changeFrequency: 'monthly',
      priority: path === '' ? 1 : 0.8,
    })
  )

  return [
    ...fixed,
    ...work.map((slug) => ({ url: `${BASE}/work/${slug}`, priority: 0.7 })),
    ...posts.map((slug) => ({ url: `${BASE}/blog/${slug}`, priority: 0.6 })),
    ...pages.map((slug) => ({ url: `${BASE}/${slug}`, priority: 0.5 })),
  ]
}
