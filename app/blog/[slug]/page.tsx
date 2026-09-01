import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPost, getProfile } from '@/lib/content'
import { ThemedPage, resolveView } from '@/components/ThemedPage'
import { postJsonLd } from '@/lib/jsonld'
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
  const post = await getPost(slug)
  if (!post) return {}

  return {
    title: post.seo?.title ?? post.title,
    description: post.seo?.description ?? post.excerpt,
    alternates: { canonical: post.canonicalUrl ?? `/blog/${post.slug}` },
    openGraph: { type: 'article', publishedTime: post.publishedAt?.toString() },
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const [View, profile] = await Promise.all([resolveView('post', 'full'), getProfile()])

  return (
    <ThemedPage path={`/blog/${post.slug}`}>
      <JsonLd data={postJsonLd(post, profile)} />
      <View post={post} />
    </ThemedPage>
  )
}
