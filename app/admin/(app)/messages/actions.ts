'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { MessageModel } from '@/lib/models'
import { guard } from '@/lib/admin/mutations'

/**
 * Message triage.
 *
 * No revalidateTag here: messages are never read by the public site, so they are
 * not behind a cache tag. revalidatePath is enough to refresh the admin's own
 * list and the unread badge in the shell.
 */

async function update(formData: FormData, patch: Record<string, boolean>): Promise<void> {
  const blocked = await guard()
  if (blocked) throw new Error(blocked.error ?? 'Not allowed')

  const id = String(formData.get('id') ?? '')
  if (!id) return

  await MessageModel.updateOne({ _id: id }, { $set: patch })

  // The layout too, because the unread count lives there.
  revalidatePath('/admin', 'layout')
}

export async function setRead(formData: FormData): Promise<void> {
  await update(formData, { read: String(formData.get('read')) === 'true' })
}

export async function setArchived(formData: FormData): Promise<void> {
  const archived = String(formData.get('archived')) === 'true'
  // Archiving implies it has been dealt with, so it is also read. Leaving an
  // archived message unread means the badge counts something that is filed away.
  await update(formData, archived ? { archived: true, read: true } : { archived: false })
  redirect('/admin/messages')
}

export async function setSpam(formData: FormData): Promise<void> {
  const spam = String(formData.get('spam')) === 'true'
  await update(formData, spam ? { spam: true, read: true } : { spam: false })
  redirect(spam ? '/admin/messages' : '/admin/messages?box=spam')
}

export async function deleteMessage(formData: FormData): Promise<void> {
  const blocked = await guard()
  if (blocked) throw new Error(blocked.error ?? 'Not allowed')

  const id = String(formData.get('id') ?? '')
  if (id) await MessageModel.deleteOne({ _id: id })

  revalidatePath('/admin', 'layout')
  redirect('/admin/messages')
}
