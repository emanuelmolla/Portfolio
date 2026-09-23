import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getPage } from '@/lib/content'
import { previewPage } from '@/lib/content/preview'
import { findRedirect } from '@/lib/content/redirects'
import { isPreview } from '@/lib/preview'
import { ThemedPage, resolveView } from '@/components/ThemedPage'
import { PreviewBanner } from '@/components/PreviewBanner'

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
  const preview = await isPreview()
  const page = preview ? await previewPage(slug) : await getPage(slug)
  if (!page) return {}

  return {
    title: page.seo?.title ?? page.title,
    description: page.seo?.description,
    alternates: { canonical: `/${page.slug}` },
    robots:
      preview || page.seo?.noindex ? { index: false, follow: !preview } : undefined,
  }
}

export default async function SlashPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const preview = await isPreview()
  const page = preview ? await previewPage(slug) : await getPage(slug)
  if (!page) {
    // No live document. The redirect table is the last chance before a 404, and
    // covers retired pages and v1 paths that have no record to hang history on.
    const moved = await findRedirect(`/${slug}`)
    if (moved) permanentRedirect(moved.to)
    notFound()
  }

  // Reached through an old slug. Serving the content here as well would put the
  // same page at two URLs returning 200, which splits its ranking between them.
  // Preview is exempt: bouncing mid-edit would be confusing and nothing is
  // indexing a preview anyway.
  if (!preview && page.slug !== slug) permanentRedirect(`/${page.slug}`)

  const View = await resolveView('page', 'full')
  const path = `/${page.slug}`

  return (
    <>
      {preview && <PreviewBanner status={page.status} path={path} />}
      <ThemedPage path={path}>
        <View page={page} />
      </ThemedPage>
    </>
  )
}
