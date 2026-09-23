'use server'

import { redirect } from 'next/navigation'
import { PostModel, zPost } from '@/lib/models'
import { TAGS } from '@/lib/content/_util'
import {
  body,
  day,
  optInt,
  optText,
  parseMedia,
  parseSeo,
  text,
  tokens,
  zodFieldErrors,
} from '@/lib/admin/form'
import {
  guard,
  resolvePublishedAt,
  revalidate,
  saved,
  trackSlugChange,
  writeError,
  type ActionState,
} from '@/lib/admin/mutations'

/**
 * Create and update a post.
 *
 * ONE action for both, keyed on whether an id came through. A separate create
 * action would be the same forty lines with `new` instead of `findById`, and the
 * two would drift the first time a field was added to only one of them.
 *
 * The write goes through doc.save() rather than findOneAndUpdate, deliberately:
 * PostSchema computes readingMinutes in a pre('save') hook, and update queries do
 * not run document middleware. Using an update here would leave reading time
 * frozen at whatever it was when the post was created.
 */
export async function savePost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const blocked = await guard()
  if (blocked) return blocked

  const id = String(formData.get('id') ?? '').trim()

  const cover = parseMedia(formData, 'coverImage')
  if ('error' in cover && cover.error) return { ok: false, fieldErrors: cover.error }

  const status = text(formData, 'status')

  const existing = id ? await PostModel.findById(id) : null
  if (id && !existing) return { ok: false, error: 'That post no longer exists.' }

  const parsed = zPost.safeParse({
    slug: text(formData, 'slug'),
    title: text(formData, 'title'),
    excerpt: text(formData, 'excerpt'),
    body: body(formData, 'body'),
    coverImage: cover.value,
    tags: tokens(formData, 'tags'),
    status,
    publishedAt: resolvePublishedAt(status, day(formData, 'publishedAt'), existing?.publishedAt),
    featuredOrder: optInt(formData, 'featuredOrder'),
    relatedWorkRef: optText(formData, 'relatedWorkRef'),
    canonicalUrl: optText(formData, 'canonicalUrl'),
    // Read counters are not editable. They are written by the site, and a form
    // that can set them is a form that can quietly invent numbers.
    stats: {
      views: existing?.stats?.views ?? 0,
      likes: existing?.stats?.likes ?? 0,
    },
    seo: parseSeo(formData),
  })

  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) }

  let created: string | null = null

  try {
    const previousSlugs = await trackSlugChange(
      existing ? { slug: existing.slug, previousSlugs: existing.previousSlugs } : null,
      parsed.data.slug,
      '/blog'
    )

    const doc = existing ?? new PostModel({})
    Object.assign(doc, parsed.data, { previousSlugs })
    await doc.save()

    revalidate(TAGS.post)
    if (!id) created = String(doc._id)
  } catch (err) {
    return writeError(err)
  }

  // Outside the try on purpose: redirect() signals by throwing, so calling it
  // inside would be caught by the handler above and reported as a save failure.
  //
  // A newly created post has no URL until it has an id, so the form has to move
  // to the one it just got. Without this the next save creates a second post,
  // because the form it posted from still carries no id.
  if (created) redirect(`/admin/posts/${created}`)

  return saved()
}

export async function deletePost(formData: FormData): Promise<void> {
  const blocked = await guard()
  if (blocked) throw new Error(blocked.error ?? 'Not allowed')

  const id = String(formData.get('id') ?? '')
  if (id) await PostModel.deleteOne({ _id: id })

  revalidate(TAGS.post)
  redirect('/admin/posts')
}

/** Publish or unpublish from the list, without opening the post. */
export async function togglePostStatus(formData: FormData): Promise<void> {
  const blocked = await guard()
  if (blocked) throw new Error(blocked.error ?? 'Not allowed')

  const id = String(formData.get('id') ?? '')
  const doc = id ? await PostModel.findById(id) : null
  if (!doc) return

  doc.status = doc.status === 'published' ? 'draft' : 'published'
  if (doc.status === 'published' && !doc.publishedAt) doc.publishedAt = new Date()
  await doc.save()

  revalidate(TAGS.post)
}
