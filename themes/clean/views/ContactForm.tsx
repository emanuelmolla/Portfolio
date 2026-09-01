'use client'

import { useActionState } from 'react'
import { submitMessage, type ContactState } from '@/app/contact/actions'

/**
 * The clean theme's contact form.
 *
 * Deliberately owned by this theme rather than shared. The server action is
 * shared, because validating and storing a message is logic; how the form
 * LOOKS is presentation, and presentation belongs to a theme. A form component
 * imported by every theme is the same leak as a formatted date coming out of
 * the data layer.
 *
 * This one is editorial to match the rest: labels above fields, hairline
 * rules instead of boxes, generous spacing, no filled buttons.
 */

const initial: ContactState = { ok: false }

const field =
  'w-full border-0 border-b border-[var(--rule)] bg-transparent px-0 py-2.5 text-[15px] ' +
  'text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--faint)] ' +
  'focus:border-[var(--accent)]'

const label = 'font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--faint)]'

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitMessage, initial)

  if (state.ok) {
    return (
      <div className="max-w-[34rem] border-t border-[var(--accent)] pt-5">
        <p className="font-medium">Sent.</p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--muted)]">
          I read everything and usually reply within a couple of days.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex max-w-[34rem] flex-col gap-7">
      <div className="flex flex-col gap-1">
        <label className={label} htmlFor="name">
          Name
        </label>
        <input id="name" name="name" required className={field} autoComplete="name" />
        {state.fieldErrors?.name && (
          <p className="text-xs text-[var(--accent)]">{state.fieldErrors.name}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className={label} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className={field}
          autoComplete="email"
        />
        {state.fieldErrors?.email && (
          <p className="text-xs text-[var(--accent)]">{state.fieldErrors.email}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className={label} htmlFor="message">
          Message
        </label>
        <textarea id="message" name="message" required rows={5} className={`${field} resize-y`} />
        {state.fieldErrors?.message && (
          <p className="text-xs text-[var(--accent)]">{state.fieldErrors.message}</p>
        )}
      </div>

      {/* Honeypot: offered to bots, hidden from people and assistive tech. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex items-start gap-2.5 text-[13px] text-[var(--muted)]">
        <input type="checkbox" name="contactConsent" className="mt-1 accent-[var(--accent)]" />
        <span>You can keep my details on file to reply.</span>
      </label>

      {state.error && <p className="text-sm text-[var(--accent)]">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start font-mono text-xs tracking-[0.06em] text-[var(--ink)] underline decoration-[var(--rule)] underline-offset-[6px] transition-colors hover:text-[var(--accent)] hover:decoration-[var(--accent)] disabled:opacity-50"
      >
        {pending ? 'sending…' : 'send message →'}
      </button>
    </form>
  )
}
