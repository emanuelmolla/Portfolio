import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPost, getPostSlugs } from '@/lib/content'
import { ThemedPage, resolveView } from '@/components/ThemedPage'

export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await getPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

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

  const View = await resolveView('post', 'full')

  return (
    <ThemedPage path={`/blog/${post.slug}`}>
      <View post={post} />
    </ThemedPage>
  )
}
