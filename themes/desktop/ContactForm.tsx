'use client'

import { useActionState } from 'react'
import { submitMessage, type ContactState } from '@/app/contact/actions'

const initial: ContactState = { ok: false }

export function ContactForm({
  toName,
  toEmail,
}: {
  toName: string
  toEmail: string
}) {
  const [state, action, pending] = useActionState(submitMessage, initial)
  if (state.ok)
    return (
      <section className="desktop-composer" role="status">
        <header>Sent</header>
        <div className="desktop-mail-body">Message sent to {toName}.</div>
      </section>
    )
  return (
    <form
      action={action}
      className="desktop-composer"
      aria-label="New message"
      aria-busy={pending}
    >
      <header>New message</header>
      <div className="desktop-mail-field">
        <span>To</span>
        <span>
          {toName}
          <br />
          <small>{toEmail}</small>
        </span>
      </div>
      {(['name', 'email'] as const).map((field) => (
        <div className="desktop-mail-field" key={field}>
          <label htmlFor={`desktop-${field}`}>
            {field === 'name' ? 'From' : 'Reply to'}
          </label>
          <div>
            <input
              id={`desktop-${field}`}
              name={field}
              type={field === 'email' ? 'email' : 'text'}
              required
              autoComplete={field}
              placeholder={field === 'name' ? 'Your name' : 'you@example.com'}
              aria-invalid={!!state.fieldErrors?.[field]}
              aria-describedby={
                state.fieldErrors?.[field]
                  ? `desktop-${field}-error`
                  : undefined
              }
            />
            {state.fieldErrors?.[field] && (
              <p id={`desktop-${field}-error`} className="desktop-mail-error">
                {state.fieldErrors[field]}
              </p>
            )}
          </div>
        </div>
      ))}
      <div className="desktop-mail-body">
        <label htmlFor="desktop-message">Message</label>
        <textarea
          id="desktop-message"
          name="message"
          required
          rows={9}
          placeholder="Write your message…"
          aria-invalid={!!state.fieldErrors?.message}
          aria-describedby={
            state.fieldErrors?.message ? 'desktop-message-error' : undefined
          }
        />
        {state.fieldErrors?.message && (
          <p id="desktop-message-error" className="desktop-mail-error">
            {state.fieldErrors.message}
          </p>
        )}
      </div>
      <div aria-hidden className="desktop-honeypot">
        <label htmlFor="desktop-website">Website</label>
        <input
          id="desktop-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <footer className="desktop-mail-footer">
        <label>
          <input type="checkbox" name="contactConsent" /> Keep my details to
          reply
        </label>
        <button type="submit" disabled={pending}>
          {pending ? 'Sending…' : 'Send message'}
        </button>
        <p role="status" aria-live="polite">
          {state.error ??
            state.fieldErrors?.website ??
            state.fieldErrors?.contactConsent ??
            ''}
        </p>
      </footer>
    </form>
  )
}
