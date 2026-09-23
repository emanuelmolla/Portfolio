'use client'

import { useActionState, type ReactNode } from 'react'
import { FormError } from './fields'
import { idle, type ActionState } from '@/lib/admin/state'

/**
 * The wrapper every edit form uses.
 *
 * It owns three things that would otherwise be copy-pasted nine times: the
 * action state, the whole-form error banner, and the save bar with its pending
 * and saved-at states.
 *
 * `children` is a function rather than nodes because the field errors live in
 * state here and have to reach inputs rendered by the caller. It receives an
 * accessor keyed by input name, so a field writes error={err('slug')} and the
 * dotted paths from nested zod schemas ('bio.short') work without translation.
 */

export type ErrorLookup = (name: string) => string | undefined

export function FormShell({
  action,
  children,
  saveLabel = 'Save',
  aside,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>
  children: (err: ErrorLookup) => ReactNode
  saveLabel?: string
  /** Rendered next to the save button: a view link, a delete button. */
  aside?: ReactNode
}) {
  const [state, formAction, pending] = useActionState(action, idle)

  const err: ErrorLookup = (name) => state.fieldErrors?.[name]

  return (
    <form action={formAction} className="grid gap-5 pb-24">
      {/* Above the fields, because a message about the form as a whole that sits
          below the fold is a message nobody reads. */}
      <FormError message={state.error} />

      {children(err)}

      <SaveBar pending={pending} state={state} label={saveLabel} aside={aside} />
    </form>
  )
}

/**
 * Sticky, at the bottom.
 *
 * A long form has its save button several screens below the field being edited.
 * Sticky costs one line of CSS and removes a scroll to the bottom from every
 * single edit.
 */
function SaveBar({
  pending,
  state,
  label,
  aside,
}: {
  pending: boolean
  state: ActionState
  label: string
  aside?: ReactNode
}) {
  return (
    <div className="sticky bottom-0 -mx-4 mt-1 border-t border-[var(--a-line)] bg-[var(--a-bg)]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="a-btn a-btn-primary">
          {pending ? 'Saving' : label}
        </button>

        {aside}

        <span aria-live="polite" className="a-hint">
          {pending
            ? 'Writing to the database'
            : state.savedAt
              ? `Saved at ${new Date(state.savedAt).toLocaleTimeString()}`
              : ''}
        </span>
      </div>
    </div>
  )
}
