'use client'

import { useActionState } from 'react'
import { submitMessage, type ContactState } from '@/app/contact/actions'

/**
 * The one genuinely interactive piece on the public site, so the one place a
 * client component is warranted.
 *
 * Shared across themes rather than duplicated: a form is an input surface, and
 * the tokens make it inherit whatever chrome surrounds it. Themes that want a
 * different arrangement can lay it out differently; they should not need to
 * reimplement validation.
 */

const initial: ContactState = { ok: false }

const field =
  'w-full border border-[var(--rule)] bg-[var(--raised)] px-3 py-2.5 text-[15px] ' +
  'text-[var(--ink)] outline-none placeholder:text-[var(--faint)] focus:border-[var(--accent)]'

const label = 'font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--faint)]'

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitMessage, initial)

  if (state.ok) {
    return (
      <div className="border border-[var(--rule)] bg-[var(--raised)] p-5">
        <p className="font-medium">Sent.</p>
        <p className="mt-1.5 text-[15px] text-[var(--muted)]">
          I read everything and usually reply within a couple of days.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex max-w-[34rem] flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className={label} htmlFor="name">
          Name
        </label>
        <input id="name" name="name" required className={field} autoComplete="name" />
        {state.fieldErrors?.name && (
          <p className="text-xs text-[var(--accent)]">{state.fieldErrors.name}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
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

      <div className="flex flex-col gap-1.5">
        <label className={label} htmlFor="message">
          Message
        </label>
        <textarea id="message" name="message" required rows={6} className={field} />
        {state.fieldErrors?.message && (
          <p className="text-xs text-[var(--accent)]">{state.fieldErrors.message}</p>
        )}
      </div>

      {/* Honeypot. Hidden from people, offered to bots. aria-hidden and
          tabIndex keep it away from screen readers and keyboard users too. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex items-start gap-2.5 text-[13px] text-[var(--muted)]">
        <input type="checkbox" name="contactConsent" className="mt-1" />
        <span>You can keep my details on file to reply.</span>
      </label>

      {state.error && <p className="text-sm text-[var(--accent)]">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start border border-[var(--ink)] px-5 py-2.5 font-mono text-xs tracking-[0.04em] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50"
      >
        {pending ? 'sending…' : 'send'}
      </button>
    </form>
  )
}
