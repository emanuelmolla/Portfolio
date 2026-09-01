import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPage } from '@/lib/content'
import { ThemedPage, resolveView } from '@/components/ThemedPage'

/**
 * Arbitrary slash pages: /uses, /colophon, /now, whatever gets added later.
 * Static segments like /work and /about take precedence over this catch-all,
 * so the dedicated routes win and this only sees genuine Page rows.
 */
/**
 * Rendered on demand, not prerendered.
 *
 * Theme resolution reads a cookie in the root layout, which makes every route
 * dynamic. generateStaticParams cannot coexist with that: Next attempts a
 * static render, hits the cookie access, and unknown slugs fail with
 * DYNAMIC_SERVER_USAGE instead of returning a 404.
 *
 * This costs less than it sounds. Crawlers still receive fully server-rendered
 * HTML, which was the whole point of the migration, and every read is wrapped
 * in a tagged cache so a request is a render rather than a database round trip.
 * Making this static again would mean giving up server-side theme selection.
 */
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return {}

  return {
    title: page.seo?.title ?? page.title,
    description: page.seo?.description,
    alternates: { canonical: `/${page.slug}` },
    robots: page.seo?.noindex ? { index: false, follow: true } : undefined,
  }
}

export default async function SlashPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()

  const View = await resolveView('page', 'full')

  return (
    <ThemedPage path={`/${page.slug}`}>
      <View page={page} />
    </ThemedPage>
  )
}
