import type { MetadataRoute } from 'next'

/**
 * The admin is disallowed; nothing else is.
 *
 * Note what is deliberately NOT blocked. There are no themed URL variants to
 * hide, because a theme is a cookie and never a URL. And robots.txt is never
 * used for canonicalisation here, which Google explicitly warns against: a
 * blocked page cannot be read, so its noindex or canonical is never seen,
 * which produces the worst possible outcome.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }],
    sitemap: 'https://emanuelmolla.dev/sitemap.xml',
  }
}
