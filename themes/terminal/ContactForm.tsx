'use client'
import { useActionState } from 'react'
import type { ContactState } from '@/app/contact/actions'

export function ContactForm({
  sendAction,
}: {
  sendAction: (state: ContactState, data: FormData) => Promise<ContactState>
}) {
  const [state, action, pending] = useActionState(sendAction, { ok: false })
  if (state.ok)
    return <p role="status">Message delivered. Thank you for writing.</p>
  return (
    <form action={action} className="terminal-composer">
      <h2>Write a message</h2>
      {(['name', 'email', 'message'] as const).map((field) => (
        <div key={field}>
          <label htmlFor={`terminal-${field}`}>
            {field === 'name'
              ? 'Your name'
              : field === 'email'
                ? 'Reply email'
                : 'Message'}
          </label>
          {field === 'message' ? (
            <textarea
              id={`terminal-${field}`}
              name={field}
              rows={7}
              required
              minLength={10}
              maxLength={5000}
              aria-invalid={!!state.fieldErrors?.[field]}
              aria-describedby={
                state.fieldErrors?.[field]
                  ? `terminal-error-${field}`
                  : undefined
              }
            />
          ) : (
            <input
              id={`terminal-${field}`}
              name={field}
              type={field === 'email' ? 'email' : 'text'}
              autoComplete={field}
              required
              maxLength={field === 'name' ? 120 : 200}
              aria-invalid={!!state.fieldErrors?.[field]}
              aria-describedby={
                state.fieldErrors?.[field]
                  ? `terminal-error-${field}`
                  : undefined
              }
            />
          )}
          {state.fieldErrors?.[field] && (
            <p role="alert" id={`terminal-error-${field}`}>
              {state.fieldErrors[field]}
            </p>
          )}
        </div>
      ))}
      <div hidden>
        <label htmlFor="terminal-website">Website</label>
        <input
          id="terminal-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <label className="terminal-consent">
        <input type="checkbox" name="contactConsent" required /> You may use my
        email to reply.
      </label>
      {state.fieldErrors?.contactConsent && (
        <p role="alert">{state.fieldErrors.contactConsent}</p>
      )}
      {state.fieldErrors?.website && (
        <p role="alert">Unable to send this message.</p>
      )}
      {state.error && <p role="alert">{state.error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
