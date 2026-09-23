import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getAdjacentWork, getTechByIds, getWorkItem } from '@/lib/content'
import { previewWork } from '@/lib/content/preview'
import { findRedirect } from '@/lib/content/redirects'
import { isPreview } from '@/lib/preview'
import { ThemedPage, resolveView } from '@/components/ThemedPage'
import { PreviewBanner } from '@/components/PreviewBanner'
import { getProfile } from '@/lib/content'
import { workJsonLd } from '@/lib/jsonld'
import { JsonLd } from '@/components/JsonLd'

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
  const work = preview ? await previewWork(slug) : await getWorkItem(slug)
  if (!work) return {}

  return {
    robots: preview ? { index: false, follow: false } : undefined,
    title: work.seo?.title ?? work.title,
    description: work.seo?.description ?? work.summary,
    alternates: { canonical: `/work/${work.slug}` },
  }
}

export default async function WorkItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const preview = await isPreview()
  const work = preview ? await previewWork(slug) : await getWorkItem(slug)
  if (!work) {
    // No live document. The redirect table is the last chance before a 404, and
    // covers retired pages and v1 paths that have no record to hang history on.
    const moved = await findRedirect(`/work/${slug}`)
    if (moved) permanentRedirect(moved.to)
    notFound()
  }

  // Reached through an old slug. Serving the content here as well would put the
  // same page at two URLs returning 200, which splits its ranking between them.
  // Preview is exempt: bouncing mid-edit would be confusing and nothing is
  // indexing a preview anyway.
  if (!preview && work.slug !== slug) permanentRedirect(`/work/${work.slug}`)

  const [tech, View, profile, adjacent] = await Promise.all([
    getTechByIds(work.techRefs ?? []),
    resolveView('work', 'full'),
    getProfile(),
    getAdjacentWork(work.slug),
  ])

  const path = `/work/${work.slug}`

  return (
    <>
      {preview && <PreviewBanner status={work.status} path={path} />}
      <ThemedPage path={path}>
        {!preview && <JsonLd data={workJsonLd(work, profile)} />}
        <View work={work} tech={tech} adjacent={adjacent} />
      </ThemedPage>
    </>
  )
}
