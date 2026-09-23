'use server'

import { notificationRecipient, sendTestEmail } from '@/lib/email'
import { adminOrNull } from '@/lib/admin/session'
import type { ActionState } from '@/lib/admin/state'

/**
 * Its own module rather than a function inside the dashboard, because a file with
 * 'use server' publishes every export as an endpoint and this one has nothing to
 * do with content.
 *
 * Not guard(): sending a test email needs a signed-in admin but does not need a
 * database, and refusing it when Mongo is unreachable would take away the one
 * diagnostic that still works.
 */
export async function testEmail(): Promise<ActionState> {
  if (!(await adminOrNull())) {
    return { ok: false, error: 'Not signed in.' }
  }

  const result = await sendTestEmail()

  if (result.skipped) {
    return { ok: false, error: result.error ?? 'Email is not configured.' }
  }

  if (!result.ok) {
    return { ok: false, error: result.error ?? 'Sending failed.' }
  }

  return { ok: true, message: `Sent to ${notificationRecipient()}. Check your inbox.` }
}
