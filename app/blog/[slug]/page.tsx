import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getPost, getProfile } from '@/lib/content'
import { previewPost } from '@/lib/content/preview'
import { findRedirect } from '@/lib/content/redirects'
import { isPreview } from '@/lib/preview'
import { ThemedPage, resolveView } from '@/components/ThemedPage'
import { PreviewBanner } from '@/components/PreviewBanner'
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
  const preview = await isPreview()
  const post = preview ? await previewPost(slug) : await getPost(slug)
  if (!post) return {}

  return {
    // A draft must never be indexable, whatever its own seo settings say.
    robots: preview ? { index: false, follow: false } : undefined,
    title: post.seo?.title ?? post.title,
    description: post.seo?.description ?? post.excerpt,
    alternates: { canonical: post.canonicalUrl ?? `/blog/${post.slug}` },
    openGraph: { type: 'article', publishedTime: post.publishedAt?.toString() },
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Preview reads bypass both the status filter and the cache. The cookie behind
  // isPreview() is signed, so this cannot be reached by setting a cookie by hand.
  const preview = await isPreview()
  const post = preview ? await previewPost(slug) : await getPost(slug)
  if (!post) {
    // No live document. The redirect table is the last chance before a 404, and
    // covers retired pages and v1 paths that have no record to hang history on.
    const moved = await findRedirect(`/blog/${slug}`)
    if (moved) permanentRedirect(moved.to)
    notFound()
  }

  // Reached through an old slug. Serving the content here as well would put the
  // same page at two URLs returning 200, which splits its ranking between them.
  // Preview is exempt: bouncing mid-edit would be confusing and nothing is
  // indexing a preview anyway.
  if (!preview && post.slug !== slug) permanentRedirect(`/blog/${post.slug}`)

  const [View, profile] = await Promise.all([resolveView('post', 'full'), getProfile()])
  const path = `/blog/${post.slug}`

  return (
    <>
      {preview && <PreviewBanner status={post.status} path={path} />}
      <ThemedPage path={path}>
        {/* No structured data for an unpublished page. JSON-LD describing a draft
            as a BlogPosting is a claim about something that does not exist yet. */}
        {!preview && <JsonLd data={postJsonLd(post, profile)} />}
        <View post={post} />
      </ThemedPage>
    </>
  )
}
