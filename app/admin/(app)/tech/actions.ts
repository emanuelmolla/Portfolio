'use server'

import { redirect } from 'next/navigation'
import { TechModel, zTech } from '@/lib/models'
import { TAGS } from '@/lib/content/_util'
import { flag, int, optInt, optText, text, zodFieldErrors } from '@/lib/admin/form'
import { guard, revalidate, saved, slugify, writeError, type ActionState } from '@/lib/admin/mutations'

/**
 * The tech taxonomy.
 *
 * Note what this form cannot set, because the field does not exist: proficiency.
 * Self-rated skill bars are on 12.2% of job-seeker portfolios and 0% of respected
 * personal sites. Leaving it out of the schema is what makes it impossible to
 * add a chart of your own competence in a weak moment.
 *
 * `rank` is the honest replacement: null for most, 1..N for the handful worth
 * calling out.
 */
export async function saveTech(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const blocked = await guard()
  if (blocked) return blocked

  const id = String(formData.get('id') ?? '').trim()

  const existing = id ? await TechModel.findById(id) : null
  if (id && !existing) return { ok: false, error: 'That entry no longer exists.' }

  const name = text(formData, 'name')

  const parsed = zTech.safeParse({
    slug: text(formData, 'slug') || slugify(name),
    name,
    category: text(formData, 'category'),
    firstEncounter: optInt(formData, 'firstEncounter'),
    note: optText(formData, 'note'),
    rank: optInt(formData, 'rank'),
    icon: {
      simpleIconsSlug: optText(formData, 'icon.simpleIconsSlug'),
      devicon: optText(formData, 'icon.devicon'),
      color: optText(formData, 'icon.color'),
    },
    featured: flag(formData, 'featured'),
    order: int(formData, 'order'),
  })

  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) }

  let created: string | null = null

  try {
    const doc = existing ?? new TechModel({})
    Object.assign(doc, parsed.data)
    await doc.save()

    // Work too: a renamed technology changes what a project's tech list reads,
    // and that list is cached under the work tag.
    revalidate(TAGS.tech, TAGS.work)
    if (!id) created = String(doc._id)
  } catch (err) {
    return writeError(err)
  }

  if (created) redirect(`/admin/tech/${created}`)

  return saved()
}

export async function deleteTech(formData: FormData): Promise<void> {
  const blocked = await guard()
  if (blocked) throw new Error(blocked.error ?? 'Not allowed')

  const id = String(formData.get('id') ?? '')
  if (id) await TechModel.deleteOne({ _id: id })

  // Work documents keep the dangling ObjectId. getTechByIds already drops refs
  // that resolve to nothing, so the effect is the entry disappearing from the
  // lists that mentioned it, which is what deleting it is supposed to mean.
  revalidate(TAGS.tech, TAGS.work)
  redirect('/admin/tech')
}
