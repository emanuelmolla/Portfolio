'use client'

import { useActionState } from 'react'
import { idle } from '@/lib/admin/state'
import { testEmail } from './diagnostics-actions'

/**
 * Proves the email configuration works without waiting for a stranger to use the
 * contact form.
 *
 * Worth a button because the failure is silent by design: sendContactNotification
 * never throws, so a wrong API key or an unverified sending domain shows up as
 * messages that arrive in the inbox and never in your mail. This is the only
 * thing that surfaces that before it matters.
 */
export function TestEmailButton({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState(testEmail, idle)

  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <button type="submit" disabled={disabled || pending} className="a-btn a-btn-sm">
        {pending ? 'Sending' : 'Send a test email'}
      </button>

      {state.error && <span className="a-error">{state.error}</span>}
      {state.ok && <span className="a-hint text-[var(--a-accent)]">{state.message}</span>}
    </form>
  )
}
