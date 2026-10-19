'use client'

import { useActionState } from 'react'
import { submitMessage } from '@/app/contact/actions'

export function ContactForm() {
  const [state, action, pending] = useActionState(submitMessage, { ok: false })
  if (state.ok)
    return (
      <div className="chess-letter" role="status">
        <span className="chess-eyebrow">Delivered</span>
        <h2>Message received.</h2>
        <p>Thank you for writing. I’ll get back to you.</p>
      </div>
    )
  return (
    <form action={action} className="chess-letter chess-contact-form">
      <span className="chess-eyebrow">Correspondence / New message</span>
      <h2>A note across the table.</h2>
      {state.fieldErrors && (
        <p role="alert" className="chess-form-error">
          That didn’t send. Check your details and try again.
        </p>
      )}
      {(['name', 'email', 'message'] as const).map((field) => (
        <div key={field} className="chess-form-field">
          <label htmlFor={`chess-${field}`}>
            {field === 'name'
              ? 'Your name'
              : field === 'email'
                ? 'Email address'
                : 'What’s on your mind?'}
          </label>
          {field === 'message' ? (
            <textarea
              id={`chess-${field}`}
              name={field}
              rows={6}
              required
              minLength={10}
              maxLength={5000}
              aria-invalid={!!state.fieldErrors?.[field]}
              aria-describedby={
                state.fieldErrors?.[field] ? `chess-error-${field}` : undefined
              }
            />
          ) : (
            <input
              id={`chess-${field}`}
              name={field}
              type={field === 'email' ? 'email' : 'text'}
              autoComplete={field}
              required
              maxLength={field === 'name' ? 120 : 200}
              aria-invalid={!!state.fieldErrors?.[field]}
              aria-describedby={
                state.fieldErrors?.[field] ? `chess-error-${field}` : undefined
              }
            />
          )}
          {state.fieldErrors?.[field] && (
            <p className="chess-form-error" id={`chess-error-${field}`}>
              {state.fieldErrors[field]}
            </p>
          )}
        </div>
      ))}
      <div hidden aria-hidden="true">
        <label htmlFor="chess-website">Website</label>
        <input
          id="chess-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <label className="chess-consent">
        <input type="checkbox" name="contactConsent" required /> You may use my
        email to reply to this message.
      </label>
      {state.fieldErrors?.contactConsent && (
        <p role="alert" className="chess-form-error">
          {state.fieldErrors.contactConsent}
        </p>
      )}
      {state.error && (
        <p role="alert" className="chess-form-error">
          {state.error}
        </p>
      )}
      <button type="submit" className="chess-button" disabled={pending}>
        {pending ? 'Sending your note…' : 'Send message ↗'}
      </button>
    </form>
  )
}
