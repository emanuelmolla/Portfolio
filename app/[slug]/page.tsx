import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPage, getPageSlugs } from '@/lib/content'
import { ThemedPage, resolveView } from '@/components/ThemedPage'

/**
 * Arbitrary slash pages: /uses, /colophon, /now, whatever gets added later.
 * Static segments like /work and /about take precedence over this catch-all,
 * so the dedicated routes win and this only sees genuine Page rows.
 */
export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await getPageSlugs()
  return slugs.map((slug) => ({ slug }))
}

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
