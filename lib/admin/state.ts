/**
 * The shape a server action hands back to a form.
 *
 * Its own module with NO imports, because both sides need it: the actions that
 * produce it are server-only and import mongoose, while FormShell consumes it in
 * the browser. Declaring it next to the mutations meant the client bundle pulled
 * in lib/db and the whole MongoDB driver to get one empty object, which fails the
 * build outright.
 *
 * The rule this encodes: a module imported from a client component may not touch
 * anything server-only, and `import type` is not enough on its own, because a
 * value export from the same file drags the module in at runtime.
 */

export interface ActionState {
  ok: boolean
  /** Whole-form failure: not signed in, no database, write rejected. */
  error?: string
  /** Keyed by input name, including dotted paths like 'bio.short'. */
  fieldErrors?: Record<string, string>
  /** ISO timestamp, so the form can say when rather than just that. */
  savedAt?: string
  /** Set by delete actions so the list can confirm what went. */
  message?: string
}

/** The initial value for useActionState: nothing attempted yet. */
export const idle: ActionState = { ok: false }
