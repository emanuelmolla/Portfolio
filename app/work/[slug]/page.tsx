import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTechByIds, getWorkItem, getWorkSlugs } from '@/lib/content'
import { ThemedPage, resolveView } from '@/components/ThemedPage'
import { getProfile } from '@/lib/content'
import { workJsonLd } from '@/lib/jsonld'
import { JsonLd } from '@/components/JsonLd'

export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await getWorkSlugs()
  return slugs.map((slug) => ({ slug }))
}

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

  const [tech, View, profile] = await Promise.all([
    getTechByIds(work.techRefs ?? []),
    resolveView('work', 'full'),
    getProfile(),
  ])

  return (
    <ThemedPage path={`/work/${work.slug}`}>
      <JsonLd data={workJsonLd(work, profile)} />
      <View work={work} tech={tech} />
    </ThemedPage>
  )
}
