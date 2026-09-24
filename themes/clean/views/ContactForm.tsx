'use client'

import { useActionState } from 'react'
import { submitMessage, type ContactState } from '@/app/contact/actions'

/**
 * The clean theme's contact form.
 *
 * Deliberately owned by this theme rather than shared. The server action is
 * shared, because validating and storing a message is logic; how the form LOOKS
 * is presentation, and presentation belongs to a theme. A form component imported
 * by every theme is the same leak as a formatted date coming out of the data
 * layer.
 *
 * FLOATING LABELS, and the reason is a real bug rather than fashion.
 *
 * The previous version put a small mono label above an input that had no box, no
 * background and no placeholder: just a hairline underneath. So the only thing on
 * screen that looked like an object was the label, and the field itself was
 * invisible. Emanuel clicked the labels repeatedly and concluded nothing was
 * happening. The click was in fact focusing the input, which is worse than it
 * failing, because the caret appeared somewhere he was not looking.
 *
 * Now the label starts where the text will be, so the thing that looks like a
 * field is the field, and it rises out of the way once there is content. Two
 * details make that work:
 *
 *   - `placeholder=" "`, a single space. :placeholder-shown is the only way CSS
 *     can ask "is this empty", and an input with no placeholder attribute never
 *     matches it. The space is invisible and never shown, because the label is
 *     sitting on top of it.
 *   - `pointer-events-none` on the label. It overlaps the input, so without this
 *     it would swallow exactly the clicks that are aimed at the field, which is
 *     the original complaint reintroduced in a new shape.
 *
 * No JavaScript: it is peer-placeholder-shown and peer-focus. The state lives in
 * the input, which is where it already was.
 */

const initial: ContactState = { ok: false }

const group = 'relative'

/** Top padding leaves the raised label its own line. */
const field =
  'peer w-full border-0 border-b border-[var(--rule)] bg-transparent px-0 pt-6 pb-2 text-[15px] ' +
  'text-[var(--ink)] outline-none transition-colors focus:border-[var(--accent)]'

/**
 * Resting state reads as placeholder text sitting on the type line. Raised state
 * is the mono uppercase label the rest of the theme uses, so the field ends up
 * looking like it always did once it has something in it.
 */
const floating =
  'pointer-events-none absolute left-0 top-6 text-[15px] text-[var(--faint)] ' +
  'transition-all duration-150 ease-out ' +
  'peer-focus:top-0 peer-focus:font-mono peer-focus:text-[11px] peer-focus:uppercase ' +
  'peer-focus:tracking-[0.1em] peer-focus:text-[var(--accent)] ' +
  'peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:font-mono ' +
  'peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:uppercase ' +
  'peer-[:not(:placeholder-shown)]:tracking-[0.1em]'

const error = 'mt-1.5 text-xs text-[var(--accent)]'

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
      <div className={group}>
        <input
          id="name"
          name="name"
          required
          placeholder=" "
          autoComplete="name"
          className={field}
        />
        <label className={floating} htmlFor="name">
          Your name
        </label>
        {state.fieldErrors?.name && <p className={error}>{state.fieldErrors.name}</p>}
      </div>

      <div className={group}>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder=" "
          autoComplete="email"
          className={field}
        />
        <label className={floating} htmlFor="email">
          Your email
        </label>
        {state.fieldErrors?.email && <p className={error}>{state.fieldErrors.email}</p>}
      </div>

      <div className={group}>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder=" "
          className={`${field} resize-y`}
        />
        <label className={floating} htmlFor="message">
          Your message
        </label>
        {state.fieldErrors?.message && <p className={error}>{state.fieldErrors.message}</p>}
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
