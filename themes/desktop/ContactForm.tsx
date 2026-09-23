'use client'

import { useActionState } from 'react'
import { submitMessage, type ContactState } from '@/app/contact/actions'

/**
 * The desktop theme's contact form, as a mail composer.
 *
 * Same server action as the clean theme; completely different presentation.
 * A mail client is the right metaphor here because the thing being done really
 * is composing a message: addressed header rows with the recipient fixed, a
 * plain body area with no visible box, and a toolbar footer carrying the
 * status and the send button.
 *
 * The header rows use a hairline under each field rather than a bordered
 * input, which is how every mail client renders To/From: the label is the
 * chrome, the field is just where you type.
 */

const initial: ContactState = { ok: false }

const row = 'grid grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-3 border-b border-[var(--rule)] px-4 py-2.5'
const label = 'font-mono text-[11px] text-[var(--faint)]'
const input =
  'w-full border-0 bg-transparent p-0 text-[13px] text-[var(--ink)] outline-none placeholder:text-[var(--faint)]'

export function ContactForm({ toName, toEmail }: { toName: string; toEmail: string }) {
  const [state, formAction, pending] = useActionState(submitMessage, initial)

  if (state.ok) {
    return (
      <div className="overflow-hidden rounded-md border border-[var(--rule)] bg-[var(--window)]">
        <div className="border-b border-[var(--rule)] bg-[var(--chrome)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
          Sent
        </div>
        <div className="px-4 py-8">
          <p className="text-[13px] text-[var(--ink)]">Message sent to {toName}.</p>
          <p className="mt-1.5 text-[13px] text-[var(--muted)]">
            I read everything and usually reply within a couple of days.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form
      action={formAction}
      className="overflow-hidden rounded-md border border-[var(--rule)] bg-[var(--window)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-[var(--rule)] bg-[var(--chrome)] px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
          New message
        </span>
      </div>

      {/* Recipient is fixed. Showing it as a disabled-looking row rather than
          omitting it is what makes this read as mail instead of a web form. */}
      <div className={row}>
        <span className={label}>To</span>
        <span className="truncate text-[13px] text-[var(--muted)]">
          {toName} <span className="text-[var(--faint)]">&lt;{toEmail}&gt;</span>
        </span>
      </div>

      <div className={row}>
        <label className={label} htmlFor="name">
          From
        </label>
        <div>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder="Your name"
            className={input}
          />
          {state.fieldErrors?.name && (
            <p className="mt-1 font-mono text-[11px] text-[var(--accent)]">
              {state.fieldErrors.name}
            </p>
          )}
        </div>
      </div>

      <div className={row}>
        <label className={label} htmlFor="email">
          Reply to
        </label>
        <div>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={input}
          />
          {state.fieldErrors?.email && (
            <p className="mt-1 font-mono text-[11px] text-[var(--accent)]">
              {state.fieldErrors.email}
            </p>
          )}
        </div>
      </div>

      {/* Body: no border, no box. A mail body is just the page. */}
      <div className="px-4 py-3">
        <textarea
          id="message"
          name="message"
          required
          rows={9}
          placeholder="Write your message…"
          className={`${input} resize-y leading-relaxed`}
        />
        {state.fieldErrors?.message && (
          <p className="mt-1 font-mono text-[11px] text-[var(--accent)]">
            {state.fieldErrors.message}
          </p>
        )}
      </div>

      {/* Honeypot: offered to bots, hidden from people and assistive tech. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--rule)] bg-[var(--chrome)] px-4 py-2.5">
        <label className="flex items-center gap-2 text-[12px] text-[var(--muted)]">
          <input type="checkbox" name="contactConsent" className="accent-[var(--accent)]" />
          <span>Keep my details to reply</span>
        </label>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-[var(--faint)]">
            {state.error ?? (pending ? 'Sending…' : '')}
          </span>
          <button
            type="submit"
            disabled={pending}
            className="rounded-[3px] border border-[var(--accent)] bg-[var(--accent)] px-4 py-1.5 font-mono text-[11px] text-[var(--accent-contrast)] transition-opacity hover:opacity-90 active:translate-y-px disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </form>
  )
}
