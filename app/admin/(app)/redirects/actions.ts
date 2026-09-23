'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { RedirectModel, zRedirect } from '@/lib/models'
import { optText, text, zodFieldErrors } from '@/lib/admin/form'
import { guard, saved, writeError, type ActionState } from '@/lib/admin/mutations'

/**
 * Redirects.
 *
 * Mostly written automatically when a slug is renamed, and editable here for the
 * cases nothing can infer: a page that was retired, a URL restructured by hand,
 * or a v1 path that needs to land somewhere sensible.
 *
 * No cache tag. findRedirect() is uncached by design (see lib/content/redirects.ts),
 * so there is nothing to invalidate; revalidatePath just refreshes this screen.
 */
export async function saveRedirect(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const blocked = await guard()
  if (blocked) return blocked

  const id = String(formData.get('id') ?? '').trim()

  const from = normalizePath(text(formData, 'from'))
  const to = text(formData, 'to')

  // A redirect to itself is an infinite loop, and the browser is the thing that
  // gets to find that out. Cheaper to refuse it here.
  if (from === normalizePath(to)) {
    return { ok: false, fieldErrors: { to: 'That points at itself, which would loop forever.' } }
  }

  const parsed = zRedirect.safeParse({
    from,
    to,
    statusCode: Number(text(formData, 'statusCode')) === 302 ? 302 : 301,
    note: optText(formData, 'note'),
  })

  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) }

  let created: string | null = null

  try {
    const existing = id ? await RedirectModel.findById(id) : null
    if (id && !existing) return { ok: false, error: 'That redirect no longer exists.' }

    const doc = existing ?? new RedirectModel({})
    Object.assign(doc, parsed.data)
    await doc.save()

    revalidatePath('/admin/redirects')
    if (!id) created = String(doc._id)
  } catch (err) {
    return writeError(err)
  }

  if (created) redirect(`/admin/redirects/${created}`)

  return saved()
}

export async function deleteRedirect(formData: FormData): Promise<void> {
  const blocked = await guard()
  if (blocked) throw new Error(blocked.error ?? 'Not allowed')

  const id = String(formData.get('id') ?? '')
  if (id) await RedirectModel.deleteOne({ _id: id })

  revalidatePath('/admin/redirects')
  redirect('/admin/redirects')
}

/** Leading slash, no trailing one. The form that findRedirect() looks up. */
function normalizePath(value: string): string {
  if (!value) return value
  if (/^https?:\/\//i.test(value)) return value
  const withSlash = value.startsWith('/') ? value : `/${value}`
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : withSlash
}
