import { adminEmails } from '@/auth'

/**
 * Outbound email, via Resend.
 *
 * A plain fetch rather than the resend SDK. This is one POST with a bearer token
 * and a JSON body; the SDK would add a dependency to the deploy for types that
 * are four lines here, and the failure modes are easier to see when the request
 * is visible.
 *
 * THE RULE THIS FILE FOLLOWS: sending email is never allowed to fail a user
 * action. A contact form submission is complete once the message is in the
 * database. The notification is a convenience for the operator, so every function
 * here returns a result rather than throwing, and the caller logs and carries on.
 * The alternative, a visitor seeing "that did not send" because Resend had a bad
 * minute, loses a real message to protect a notification.
 */

const ENDPOINT = 'https://api.resend.com/emails'

export interface EmailResult {
  ok: boolean
  error?: string
  skipped?: boolean
}

/** Where notifications go. Falls back to the first allow-listed admin address. */
export function notificationRecipient(): string | null {
  return process.env.CONTACT_TO_EMAIL?.trim() || adminEmails()[0] || null
}

/**
 * The From address must be on a domain verified in Resend. Resend rejects
 * anything else outright, which is the correct behaviour: it is what stops
 * anyone sending mail that claims to be from a domain they do not control.
 *
 * It is NOT the visitor's address, for the same reason. The visitor's address
 * goes in reply_to, so hitting Reply in a mail client still reaches them.
 */
export function emailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY &&
      process.env.CONTACT_FROM_EMAIL &&
      notificationRecipient()
  )
}

interface SendInput {
  to: string
  subject: string
  text: string
  html: string
  replyTo?: string | null
}

async function send(input: SendInput): Promise<EmailResult> {
  if (!emailConfigured()) return { ok: false, skipped: true, error: 'Email is not configured.' }

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL,
        to: [input.to],
        subject: input.subject,
        text: input.text,
        html: input.html,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
      // A serverless function that hangs on an outbound request burns its whole
      // timeout and takes the response to the visitor with it.
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      return { ok: false, error: `Resend returned ${response.status}. ${detail}`.trim() }
    }

    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/* --------------------------------------------------------------- escaping --- */

/**
 * The visitor wrote this text. It goes into an HTML email, so it is escaped.
 *
 * Mail clients are HTML renderers, and a contact form is an open door: anyone can
 * type anything into it. Interpolating that into markup unescaped is the same
 * mistake as rendering it on a page unescaped, with the difference that the
 * result lands in an inbox rather than a browser tab.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/* ---------------------------------------------------------- notifications --- */

export interface ContactNotification {
  id: string
  name: string
  email: string
  message: string
  contactConsent: boolean
  sourcePage: string | null
  /** Origin of the site, for the link back into the admin. */
  origin: string
}

export async function sendContactNotification(
  input: ContactNotification
): Promise<EmailResult> {
  const to = notificationRecipient()
  if (!to) return { ok: false, skipped: true, error: 'No recipient configured.' }

  const adminUrl = `${input.origin}/admin/messages/${input.id}`

  const text = [
    `${input.name} <${input.email}> wrote:`,
    '',
    input.message,
    '',
    '---',
    input.contactConsent
      ? 'They agreed to their details being kept for a reply.'
      : 'They did not tick the consent box.',
    input.sourcePage ? `Sent from: ${input.sourcePage}` : '',
    `Open in the admin: ${adminUrl}`,
    '',
    'Reply to this email to answer them directly.',
  ]
    .filter(Boolean)
    .join('\n')

  // Deliberately plain HTML with inline styles and no images. Mail clients
  // support roughly 2003-era CSS, and a notification to one person does not need
  // a design; it needs to be readable in a preview pane on a phone.
  const html = `
<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.55;color:#16191d;max-width:560px">
  <p style="margin:0 0 4px"><strong>${escapeHtml(input.name)}</strong></p>
  <p style="margin:0 0 16px;color:#5b646e;font-size:13px">${escapeHtml(input.email)}</p>
  <div style="white-space:pre-wrap;border-left:3px solid #e0e4e8;padding-left:14px;margin:0 0 20px">${escapeHtml(
    input.message
  )}</div>
  <p style="margin:0 0 6px;color:#5b646e;font-size:13px">
    ${
      input.contactConsent
        ? 'They agreed to their details being kept for a reply.'
        : 'They did not tick the consent box.'
    }
  </p>
  ${
    input.sourcePage
      ? `<p style="margin:0 0 6px;color:#8b949e;font-size:12px">Sent from ${escapeHtml(input.sourcePage)}</p>`
      : ''
  }
  <p style="margin:16px 0 0;font-size:13px">
    <a href="${adminUrl}" style="color:#17763c">Open in the admin</a>
  </p>
  <p style="margin:16px 0 0;color:#8b949e;font-size:12px">
    Reply to this email to answer them directly.
  </p>
</div>`.trim()

  return send({
    to,
    // The name is in the subject so the inbox list is scannable without opening
    // anything. Prefixed so a filter rule can catch these.
    subject: `Portfolio: ${input.name}`,
    text,
    html,
    // The whole point: Reply in any mail client goes to the visitor, not to the
    // verified sending address.
    replyTo: input.email,
  })
}

/** Proves the configuration works, from the admin, without waiting for a stranger. */
export async function sendTestEmail(): Promise<EmailResult> {
  const to = notificationRecipient()
  if (!to) return { ok: false, skipped: true, error: 'No recipient configured.' }

  return send({
    to,
    subject: 'Portfolio: test message',
    text: 'Email is configured correctly. Contact form notifications will arrive here.',
    html: '<p style="font-family:-apple-system,Segoe UI,Roboto,sans-serif">Email is configured correctly. Contact form notifications will arrive here.</p>',
  })
}
