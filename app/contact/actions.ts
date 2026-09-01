'use server'

import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { connectDB } from '@/lib/db'
import { MessageModel, zMessageInput } from '@/lib/models/message'
import { hasDatabase } from '@/lib/content/_util'

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

  try {
    await connectDB()
    await MessageModel.create({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
      contactConsent: parsed.data.contactConsent,
      sourcePage: head.get('referer') ?? null,
      referrer: head.get('referer') ?? null,
      meta: {
        userAgent: head.get('user-agent') ?? null,
        country: head.get('x-vercel-ip-country') ?? null,
      },
      // Hashed, never stored raw. Enough to spot a flood, useless as personal data.
      ipHash: hashIp(head.get('x-forwarded-for')),
    })

    return { ok: true }
  } catch {
    return { ok: false, error: 'That did not send. Email works if this keeps failing.' }
  }
}

function hashIp(value: string | null): string | null {
  if (!value) return null
  const ip = value.split(',')[0]?.trim()
  if (!ip) return null
  return createHash('sha256').update(`${ip}:emanuelmolla.dev`).digest('hex').slice(0, 32)
}
