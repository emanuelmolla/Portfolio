'use client'

import { useActionState } from 'react'
import { submitMessage, type ContactState } from '@/app/contact/actions'

/**
 * The desktop theme's contact form, as an OS dialog.
 *
 * Same server action as the clean theme, completely different presentation:
 * label column on the left, inset sunken fields, a chunky raised button, and a
 * status strip along the bottom the way a real dialog reports what it is doing.
 * That difference is the point of having themes at all.
 */

const initial: ContactState = { ok: false }

const field =
  'w-full rounded-[3px] border border-[var(--rule)] bg-[var(--ground)] px-2.5 py-1.5 ' +
  'text-[13px] text-[var(--ink)] outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)] ' +
  'focus:border-[var(--accent)]'

function Row({
  htmlFor,
  label,
  error,
  children,
}: {
  htmlFor: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-1.5 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-3">
      <label
        htmlFor={htmlFor}
        className="pt-1.5 font-mono text-[11px] text-[var(--muted)] sm:text-right"
      >
        {label}
      </label>
      <div>
        {children}
        {error && <p className="mt-1 font-mono text-[11px] text-[var(--accent)]">{error}</p>}
      </div>
    </div>
  )
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitMessage, initial)

  return (
    <div className="max-w-[34rem] overflow-hidden rounded-md border border-[var(--rule)] bg-[var(--chrome)]">
      <div className="border-b border-[var(--rule)] px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
        New message
      </div>

      {state.ok ? (
        <div className="px-4 py-6">
          <p className="text-[13px] text-[var(--ink)]">Message sent.</p>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            I read everything and usually reply within a couple of days.
          </p>
        </div>
      ) : (
        <form action={formAction}>
          <div className="flex flex-col gap-3 px-4 py-4">
            <Row htmlFor="name" label="Name" error={state.fieldErrors?.name}>
              <input id="name" name="name" required className={field} autoComplete="name" />
            </Row>

            <Row htmlFor="email" label="Email" error={state.fieldErrors?.email}>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={field}
                autoComplete="email"
              />
            </Row>

            <Row htmlFor="message" label="Message" error={state.fieldErrors?.message}>
              <textarea id="message" name="message" required rows={6} className={field} />
            </Row>

            {/* Honeypot: offered to bots, hidden from people and assistive tech. */}
            <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="sm:pl-[6.75rem]">
              <label className="flex items-start gap-2 text-[12px] text-[var(--muted)]">
                <input
                  type="checkbox"
                  name="contactConsent"
                  className="mt-0.5 accent-[var(--accent)]"
                />
                <span>Keep my details on file to reply.</span>
              </label>
            </div>
          </div>

          {/* Status strip: dialogs report what they are doing along the bottom. */}
          <div className="flex items-center justify-between gap-4 border-t border-[var(--rule)] bg-[var(--window)] px-3.5 py-2.5">
            <span className="font-mono text-[11px] text-[var(--faint)]">
              {state.error ?? (pending ? 'Sending…' : 'Ready')}
            </span>
            <button
              type="submit"
              disabled={pending}
              className="rounded-[3px] border border-[var(--rule)] bg-[var(--chrome)] px-4 py-1.5 font-mono text-[11px] text-[var(--ink)] shadow-[0_1px_0_rgba(255,255,255,0.06)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] active:translate-y-px disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
