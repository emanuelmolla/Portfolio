'use server'

import { redirect } from 'next/navigation'
import { PageModel, zPage } from '@/lib/models'
import { TAGS } from '@/lib/content/_util'
import {
  body,
  flag,
  int,
  parseSeo,
  rows,
  text,
  zodFieldErrors,
} from '@/lib/admin/form'
import {
  guard,
  revalidate,
  saved,
  trackSlugChange,
  writeError,
  type ActionState,
} from '@/lib/admin/mutations'

/**
 * Pages: /about, /uses, /now, and whatever else gets added.
 *
 * The slug basePath is '' because these live at the root. Which is also why the
 * rename tracking matters more here than anywhere: /about is the URL most likely
 * to be linked from somewhere outside the site.
 */
export async function savePage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const blocked = await guard()
  if (blocked) return blocked

  const id = String(formData.get('id') ?? '').trim()

  const existing = id ? await PageModel.findById(id) : null
  if (id && !existing) return { ok: false, error: 'That page no longer exists.' }

  const parsed = zPage.safeParse({
    slug: text(formData, 'slug'),
    title: text(formData, 'title'),
    body: body(formData, 'body'),
    sections: rows(
      formData,
      { heading: 'section.heading', body: 'section.body' },
      'heading'
    ).map((row, index) => ({ heading: row.heading, body: row.body, order: index })),
    status: text(formData, 'status'),
    inNav: flag(formData, 'inNav'),
    navOrder: int(formData, 'navOrder'),
    showUpdatedAt: flag(formData, 'showUpdatedAt'),
    seo: parseSeo(formData),
  })

  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) }

  let created: string | null = null

  try {
    const previousSlugs = await trackSlugChange(
      existing ? { slug: existing.slug, previousSlugs: existing.previousSlugs } : null,
      parsed.data.slug,
      ''
    )

    const doc = existing ?? new PageModel({})
    Object.assign(doc, parsed.data, { previousSlugs })
    await doc.save()

    revalidate(TAGS.page)
    if (!id) created = String(doc._id)
  } catch (err) {
    return writeError(err)
  }

  if (created) redirect(`/admin/pages/${created}`)

  return saved()
}

export async function deletePage(formData: FormData): Promise<void> {
  const blocked = await guard()
  if (blocked) throw new Error(blocked.error ?? 'Not allowed')

  const id = String(formData.get('id') ?? '')
  if (id) await PageModel.deleteOne({ _id: id })

  revalidate(TAGS.page)
  redirect('/admin/pages')
}
