import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAdjacentWork, getTechByIds, getWorkItem } from '@/lib/content'
import { ThemedPage, resolveView } from '@/components/ThemedPage'
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
  const work = await getWorkItem(slug)
  if (!work) return {}

  return {
    title: work.seo?.title ?? work.title,
    description: work.seo?.description ?? work.summary,
    alternates: { canonical: `/work/${work.slug}` },
  }
}

export default async function WorkItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const work = await getWorkItem(slug)
  if (!work) notFound()

  const [tech, View, profile, adjacent] = await Promise.all([
    getTechByIds(work.techRefs ?? []),
    resolveView('work', 'full'),
    getProfile(),
    getAdjacentWork(work.slug),
  ])

  return (
    <ThemedPage path={`/work/${work.slug}`}>
      <JsonLd data={workJsonLd(work, profile)} />
      <View work={work} tech={tech} adjacent={adjacent} />
    </ThemedPage>
  )
}
