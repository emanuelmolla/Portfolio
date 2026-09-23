'use server'

import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { connectDB } from '@/lib/db'
import { MessageModel, zMessageInput } from '@/lib/models/message'
import { hasDatabase } from '@/lib/content/_util'
import { sendContactNotification } from '@/lib/email'

export interface ContactState {
  ok: boolean
  error?: string
  fieldErrors?: Record<string, string>
}

/**
 * Contact form submission.
 *
 * A server action rather than a REST endpoint: the write and its validation
 * live in one place, and the form still submits with JavaScript disabled
 * because Next posts to it natively.
 */
export async function submitMessage(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const parsed = zMessageInput.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
    contactConsent: formData.get('contactConsent') === 'on',
    website: formData.get('website') ?? '',
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form')
      // The honeypot failing means a bot filled a field no human can see.
      // Report a generic failure rather than explaining the trap.
      fieldErrors[key] = key === 'website' ? 'Something went wrong.' : issue.message
    }
    return { ok: false, fieldErrors }
  }

  if (!hasDatabase()) {
    return {
      ok: false,
      error: 'Messages are not wired up yet. Email works in the meantime.',
    }
  }

  const head = await headers()

  const sourcePage = head.get('referer') ?? null

  try {
    await connectDB()
    const created = await MessageModel.create({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
      contactConsent: parsed.data.contactConsent,
      sourcePage,
      referrer: sourcePage,
      meta: {
        userAgent: head.get('user-agent') ?? null,
        country: head.get('x-vercel-ip-country') ?? null,
      },
      // Hashed, never stored raw. Enough to spot a flood, useless as personal data.
      ipHash: hashIp(head.get('x-forwarded-for')),
    })

    /**
     * Notify by email, and never let that failure reach the visitor.
     *
     * The message is already durable at this point. If Resend is misconfigured,
     * rate limited or simply down, the right outcome is a stored message and a
     * confirmed submission, not a stranger being told their message failed when
     * it did not. So the result is logged for the server and discarded here.
     *
     * Awaited rather than fire-and-forget: a serverless function can be frozen
     * the moment it returns a response, which kills any promise still in flight.
     * "Send it in the background" does not exist on this runtime.
     */
    const notified = await sendContactNotification({
      id: String(created._id),
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
      contactConsent: parsed.data.contactConsent,
      sourcePage,
      origin: originFrom(head),
    })

    if (!notified.ok && !notified.skipped) {
      console.error('[contact] notification failed:', notified.error)
    }

    return { ok: true }
  } catch {
    return { ok: false, error: 'That did not send. Email works if this keeps failing.' }
  }
}

/**
 * The site's own origin, for links inside the notification email.
 *
 * Read from the request rather than hardcoded so it is correct on localhost, on
 * a Vercel preview deployment and in production without three branches. The
 * forwarded headers are what a proxy sets; the fallback is only reached in a
 * context that has neither.
 */
function originFrom(head: Headers): string {
  const host = head.get('x-forwarded-host') ?? head.get('host')
  if (!host) return 'https://emanuelmolla.dev'
  const proto = head.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

function hashIp(value: string | null): string | null {
  if (!value) return null
  const ip = value.split(',')[0]?.trim()
  if (!ip) return null
  return createHash('sha256').update(`${ip}:emanuelmolla.dev`).digest('hex').slice(0, 32)
}
