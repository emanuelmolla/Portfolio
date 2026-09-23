import { notFound } from 'next/navigation'
import { PUBLISH_STATUS } from '@/lib/models'
import { readPost, workOptions } from '@/lib/admin/read'
import { toDayInput } from '@/lib/admin/form'
import { PageHeader } from '@/components/admin/page-parts'
import { PostForm, type PostFormValues } from './PostForm'

export const dynamic = 'force-dynamic'

/**
 * Edit a post, or write a new one.
 *
 * 'new' is a literal id rather than a separate /posts/new route, because the two
 * screens are the same form with the same validation and the same save action.
 * Splitting them duplicates every field.
 */

const blank: PostFormValues = {
  slug: '',
  title: '',
  excerpt: '',
  body: '',
  tags: [],
  status: 'draft',
  publishedAt: '',
  featuredOrder: null,
  relatedWorkRef: null,
  canonicalUrl: null,
  coverImage: null,
  seo: { title: null, description: null, canonicalUrl: null, noindex: false },
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'new'

  const [post, work] = await Promise.all([isNew ? null : readPost(id), workOptions()])
  if (!isNew && !post) notFound()

  const values: PostFormValues = post
    ? {
        _id: post._id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        body: post.body ?? '',
        tags: post.tags ?? [],
        status: post.status,
        publishedAt: toDayInput(post.publishedAt),
        featuredOrder: post.featuredOrder,
        relatedWorkRef: post.relatedWorkRef ? String(post.relatedWorkRef) : null,
        canonicalUrl: post.canonicalUrl,
        coverImage: post.coverImage
          ? {
              url: post.coverImage.url,
              alt: post.coverImage.alt,
              width: post.coverImage.width,
              height: post.coverImage.height,
              caption: post.coverImage.caption,
            }
          : null,
        seo: {
          title: post.seo?.title ?? null,
          description: post.seo?.description ?? null,
          canonicalUrl: post.seo?.canonicalUrl ?? null,
          noindex: post.seo?.noindex ?? false,
        },
      }
    : blank

  return (
    <>
      <PageHeader
        title={isNew ? 'New post' : post?.title || 'Untitled'}
        back={{ href: '/admin/posts', label: 'Writing' }}
      />
      <PostForm values={values} statuses={PUBLISH_STATUS} workOptions={work} />
    </>
  )
}
