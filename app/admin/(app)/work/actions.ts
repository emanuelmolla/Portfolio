'use server'

import { redirect } from 'next/navigation'
import { WorkModel, zWork } from '@/lib/models'
import { TAGS } from '@/lib/content/_util'
import {
  body,
  day,
  flag,
  many,
  optInt,
  optText,
  parseMedia,
  parseSeo,
  rows,
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
 * The kind-specific half of a work record.
 *
 * `details` is a discriminated union, so exactly one shape is valid for the
 * selected kind and the others must not be written. Reading whichever inputs
 * happen to be present would store a software record carrying a leftover
 * `outlet` from when it was briefly set to writing.
 *
 * The fields referencing collections that do not exist yet (galleryRef, gameRefs,
 * eventRef) are not rendered by the form and default to empty here. They are in
 * the schema because the chess theme will need them; inventing an input for a
 * reference with nothing to point at would be a control that cannot work.
 */
function parseDetails(fd: FormData, kind: string): Record<string, unknown> | null {
  switch (kind) {
    case 'software':
      return {
        kind: 'software',
        stack: tokens(fd, 'details.stack'),
        architectureNotes: optText(fd, 'details.architectureNotes'),
        repoUrl: optText(fd, 'details.repoUrl'),
        liveUrl: optText(fd, 'details.liveUrl'),
      }

    case 'writing':
      return {
        kind: 'writing',
        outlet: optText(fd, 'details.outlet'),
        publishedIn: optText(fd, 'details.publishedIn'),
        wordCount: optInt(fd, 'details.wordCount'),
      }

    case 'photo':
      return {
        kind: 'photo',
        galleryRef: null,
        locationsShot: tokens(fd, 'details.locationsShot'),
      }

    case 'chess':
      return { kind: 'chess', gameRefs: [], eventRef: null }

    case 'other':
      return {
        kind: 'other',
        medium: optText(fd, 'details.medium'),
        dimensions: null,
      }

    default:
      return null
  }
}

export async function saveWork(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const blocked = await guard()
  if (blocked) return blocked

  const id = String(formData.get('id') ?? '').trim()

  const cover = parseMedia(formData, 'coverImage')
  if ('error' in cover && cover.error) return { ok: false, fieldErrors: cover.error }

  const kind = text(formData, 'kind')
  const status = text(formData, 'status')

  const existing = id ? await WorkModel.findById(id) : null
  if (id && !existing) return { ok: false, error: 'That project no longer exists.' }

  const parsed = zWork.safeParse({
    slug: text(formData, 'slug'),
    kind,
    title: text(formData, 'title'),
    summary: text(formData, 'summary'),
    body: body(formData, 'body'),

    problem: optText(formData, 'problem'),
    outcome: optText(formData, 'outcome'),

    role: optText(formData, 'role'),
    isGroup: flag(formData, 'isGroup'),
    teamSize: optInt(formData, 'teamSize'),

    startDate: day(formData, 'startDate'),
    endDate: day(formData, 'endDate'),
    datePrecision: text(formData, 'datePrecision') || 'month',
    circa: flag(formData, 'circa'),
    dateOverride: optText(formData, 'dateOverride'),

    lifecycle: text(formData, 'lifecycle') || 'shipped',
    status,
    publishedAt: resolvePublishedAt(status, day(formData, 'publishedAt'), existing?.publishedAt),
    featuredOrder: optInt(formData, 'featuredOrder'),

    techRefs: many(formData, 'techRefs'),
    tags: tokens(formData, 'tags'),

    links: rows(
      formData,
      { kind: 'link.kind', label: 'link.label', url: 'link.url' },
      'url'
    ).map((row) => ({ kind: row.kind, label: row.label || null, url: row.url })),

    coverImage: cover.value,

    /**
     * Parallel arrays, same contract as links. Rows with no URL are dropped, and
     * a row whose dimensions did not get measured is dropped too rather than
     * saved at 0x0: zMedia requires positive integers, so it would fail the whole
     * form with an error pointing at a field the editor never typed into.
     */
    gallery: rows(
      formData,
      {
        url: 'gallery.url',
        alt: 'gallery.alt',
        width: 'gallery.width',
        height: 'gallery.height',
        caption: 'gallery.caption',
      },
      'url'
    )
      .map((row) => ({
        url: row.url,
        alt: row.alt || 'Screenshot',
        width: Number(row.width),
        height: Number(row.height),
        blurDataURL: null,
        caption: row.caption || null,
      }))
      .filter((m) => Number.isFinite(m.width) && Number.isFinite(m.height) && m.width > 0 && m.height > 0),

    mediaRefs: [],
    relatedPostRef: optText(formData, 'relatedPostRef'),

    details: parseDetails(formData, kind),
    seo: parseSeo(formData),
  })

  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) }

  let created: string | null = null

  try {
    const previousSlugs = await trackSlugChange(
      existing ? { slug: existing.slug, previousSlugs: existing.previousSlugs } : null,
      parsed.data.slug,
      '/work'
    )

    const doc = existing ?? new WorkModel({})
    Object.assign(doc, parsed.data, { previousSlugs })
    await doc.save()

    // The tech tag too: a project gaining or losing a technology changes what a
    // tech-filtered view returns, and that view is cached under its own tag.
    revalidate(TAGS.work, TAGS.tech)
    if (!id) created = String(doc._id)
  } catch (err) {
    return writeError(err)
  }

  if (created) redirect(`/admin/work/${created}`)

  return saved()
}

export async function deleteWork(formData: FormData): Promise<void> {
  const blocked = await guard()
  if (blocked) throw new Error(blocked.error ?? 'Not allowed')

  const id = String(formData.get('id') ?? '')
  if (id) await WorkModel.deleteOne({ _id: id })

  revalidate(TAGS.work)
  redirect('/admin/work')
}

export async function toggleWorkStatus(formData: FormData): Promise<void> {
  const blocked = await guard()
  if (blocked) throw new Error(blocked.error ?? 'Not allowed')

  const id = String(formData.get('id') ?? '')
  const doc = id ? await WorkModel.findById(id) : null
  if (!doc) return

  doc.status = doc.status === 'published' ? 'draft' : 'published'
  if (doc.status === 'published' && !doc.publishedAt) doc.publishedAt = new Date()
  await doc.save()

  revalidate(TAGS.work)
}
