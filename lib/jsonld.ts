import type { Post, Profile, Work } from '@/lib/models'

/**
 * Structured data is generated here, in the data layer, and never in a theme.
 *
 * Google: "Don't mark up content that is not visible to readers of the page."
 * If each theme emitted its own JSON-LD they would drift, and the desktop theme
 * would end up describing content sitting inside a closed window. One builder,
 * every theme consumes it.
 *
 * Honest expectations, because this is widely oversold:
 *  - Person is NOT a rich result. It appears in Google's docs only as a value
 *    for Article.author and ProfilePage.mainEntity.
 *  - ProfilePage is the one documented way to say "this page is about this
 *    specific human". Treat it as an entity-understanding signal, not a SERP
 *    widget.
 *  - WebSite with name/url/alternateName is the one here with a concrete,
 *    visible payoff: it controls the site name shown in search results.
 *  - SoftwareApplication is deliberately NOT used for projects. It requires
 *    offers.price plus a rating, and inventing a rating for your own side
 *    project violates Google's structured-data policies. SoftwareSourceCode is
 *    accurate and carries no such requirement.
 */

const BASE = 'https://emanuelmolla.dev'

function toIso(value: unknown): string | undefined {
  if (!value) return undefined
  const d = value instanceof Date ? value : new Date(String(value))
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
}

export function websiteJsonLd(profile: Profile | null) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE}/#website`,
    url: BASE,
    name: profile?.name ?? 'Emanuel Molla',
    alternateName: profile?.alternateName ?? undefined,
    inLanguage: profile?.inLanguage ?? 'en',
  }
}

export function personJsonLd(profile: Profile | null) {
  if (!profile) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${BASE}/#person`,
    name: profile.name,
    givenName: profile.givenName || undefined,
    familyName: profile.familyName || undefined,
    // Google's ProfilePage guidance: real name in `name`, handle in `alternateName`.
    alternateName: profile.alternateName ?? undefined,
    description: profile.bio.short,
    jobTitle: profile.headline,
    url: BASE,
    image: profile.avatar ? `${BASE}${profile.avatar.url}` : undefined,
    // sameAs takes full URLs, never handles. Mail links are not identities.
    sameAs: profile.links
      .filter((l) => l.visible && l.url.startsWith('http'))
      .map((l) => l.url),
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.location.city,
      addressRegion: profile.location.region ?? undefined,
      addressCountry: profile.location.country,
    },
    knowsAbout: profile.knowsAbout.length ? profile.knowsAbout : undefined,
    knowsLanguage: profile.knowsLanguage.length ? profile.knowsLanguage : undefined,
  }
}

export function profilePageJsonLd(profile: Profile | null) {
  const person = personJsonLd(profile)
  if (!person) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${BASE}/about#profilepage`,
    url: `${BASE}/about`,
    mainEntity: person,
  }
}

export function workJsonLd(work: Work, profile: Profile | null) {
  const isSoftware = work.kind === 'software'
  const repo = work.details?.kind === 'software' ? work.details.repoUrl : null

  return {
    '@context': 'https://schema.org',
    '@type': isSoftware ? 'SoftwareSourceCode' : 'CreativeWork',
    name: work.title,
    description: work.summary,
    url: `${BASE}/work/${work.slug}`,
    dateCreated: work.startDate ? new Date(work.startDate).toISOString() : undefined,
    codeRepository: repo ?? undefined,
    programmingLanguage:
      work.details?.kind === 'software' && work.details.stack.length
        ? work.details.stack
        : undefined,
    author: profile ? { '@type': 'Person', name: profile.name, url: BASE } : undefined,
  }
}

export function postJsonLd(post: Post, profile: Profile | null) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: `${BASE}/blog/${post.slug}`,
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    // updatedAt comes from Mongoose timestamps, so it is on the document but
    // not in the zod shape. Read it defensively rather than widening the type.
    dateModified: toIso((post as unknown as { updatedAt?: unknown }).updatedAt),
    author: profile ? { '@type': 'Person', name: profile.name, url: BASE } : undefined,
    image: post.coverImage ? `${BASE}${post.coverImage.url}` : undefined,
  }
}
