'use client'

import { useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'

/**
 * Two-step delete, in its own form.
 *
 * Its own form because forms cannot nest, and this sits next to the save button
 * of the main edit form.
 *
 * Two-step rather than window.confirm(). A native confirm blocks the whole page,
 * looks like a browser error, and cannot be styled or dismissed with anything but
 * a click. Arming the button in place puts the confirmation where the action is
 * and keeps it cancellable by simply not clicking again. It disarms itself after
 * five seconds so a forgotten armed button is not waiting to be hit later.
 */
export function DeleteButton({
  action,
  id,
  label = 'Delete',
  armedLabel = 'Click again to delete',
}: {
  action: (formData: FormData) => Promise<void>
  id: string
  label?: string
  armedLabel?: string
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <Button label={label} armedLabel={armedLabel} />
    </form>
  )
}

function Button({ label, armedLabel }: { label: string; armedLabel: string }) {
  const { pending } = useFormStatus()
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const timer = setTimeout(() => setArmed(false), 5000)
    return () => clearTimeout(timer)
  }, [armed])

  return (
    <button
      // While unarmed this is a plain button, so the first click cannot submit
      // even if a stray Enter lands on it.
      type={armed ? 'submit' : 'button'}
      disabled={pending}
      onClick={() => {
        if (!armed) setArmed(true)
      }}
      className={`a-btn ${armed ? 'a-btn-danger' : 'a-btn-ghost'}`}
    >
      {pending ? 'Deleting' : armed ? armedLabel : label}
    </button>
  )
}
