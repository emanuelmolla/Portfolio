'use server'

import { redirect } from 'next/navigation'
import { ExperienceModel, zExperience } from '@/lib/models'
import { TAGS } from '@/lib/content/_util'
import {
  day,
  flag,
  int,
  lines,
  many,
  optText,
  rows,
  text,
  zodFieldErrors,
} from '@/lib/admin/form'
import { guard, revalidate, saved, slugify, writeError, type ActionState } from '@/lib/admin/mutations'

/**
 * Work history, education, awards.
 *
 * No slug tracking and no redirects: experience entries have no page of their
 * own, they are rows rendered inside /about and eventually the resume. The slug
 * is an identifier, not a URL, so renaming one breaks nothing outside the
 * database.
 */
export async function saveExperience(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const blocked = await guard()
  if (blocked) return blocked

  const id = String(formData.get('id') ?? '').trim()

  const existing = id ? await ExperienceModel.findById(id) : null
  if (id && !existing) return { ok: false, error: 'That entry no longer exists.' }

  const org = text(formData, 'org')
  const role = text(formData, 'role')
  const current = flag(formData, 'current')

  const parsed = zExperience.safeParse({
    // Derived rather than entered. It identifies the row and nothing links to it,
    // so asking for one would be a required field with no reader.
    slug: text(formData, 'slug') || slugify(`${org}-${role}`),
    section: text(formData, 'section'),
    sortMode: text(formData, 'sortMode') || 'date-desc',

    org,
    role,
    location: optText(formData, 'location'),
    employmentType: optText(formData, 'employmentType'),
    url: optText(formData, 'url'),

    startDate: day(formData, 'startDate'),
    // An ongoing role has no end date. Storing one anyway and relying on
    // `current` to hide it means two fields disagreeing about the same fact.
    endDate: current ? null : day(formData, 'endDate'),
    current,

    summary: optText(formData, 'summary'),
    highlights: lines(formData, 'highlights'),

    techRefs: many(formData, 'techRefs'),
    links: rows(
      formData,
      { kind: 'link.kind', label: 'link.label', url: 'link.url' },
      'url'
    ).map((row) => ({ kind: row.kind, label: row.label || null, url: row.url })),

    order: int(formData, 'order'),
    status: text(formData, 'status') || 'published',
  })

  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) }

  let created: string | null = null

  try {
    const doc = existing ?? new ExperienceModel({})
    Object.assign(doc, parsed.data)
    await doc.save()

    revalidate(TAGS.experience)
    if (!id) created = String(doc._id)
  } catch (err) {
    return writeError(err)
  }

  if (created) redirect(`/admin/experience/${created}`)

  return saved()
}

export async function deleteExperience(formData: FormData): Promise<void> {
  const blocked = await guard()
  if (blocked) throw new Error(blocked.error ?? 'Not allowed')

  const id = String(formData.get('id') ?? '')
  if (id) await ExperienceModel.deleteOne({ _id: id })

  revalidate(TAGS.experience)
  redirect('/admin/experience')
}
