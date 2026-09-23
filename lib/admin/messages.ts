import { connectDB } from '@/lib/db'
import { hasDatabase } from '@/lib/content/_util'
import { MessageModel } from '@/lib/models'

/**
 * Mark a message read because it was opened.
 *
 * Not a server action: it is called during the render of the detail page rather
 * than from a form, and a 'use server' export would publish it as an endpoint for
 * no reason. The write is idempotent, which is what makes it safe to run in a
 * render that React may execute more than once.
 *
 * It deliberately does NOT revalidate. The unread badge in the layout catches up
 * on the next navigation, which is one click away and is how every mail client
 * behaves anyway; revalidating mid-render is not allowed and re-rendering the
 * shell to decrement a number is not worth a second round trip.
 */
export async function markOpened(id: string): Promise<void> {
  if (!hasDatabase()) return

  try {
    await connectDB()
    await MessageModel.updateOne({ _id: id, read: false }, { $set: { read: true } })
  } catch {
    // Opening a message must not fail because the flag could not be written.
  }
}
