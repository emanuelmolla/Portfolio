'use client'

import { useActionState } from 'react'
import { idle } from '@/lib/admin/state'
import { saveThemeSettings } from './actions'

export function SettingsForm({
  enabled,
  canSave,
  themes,
}: {
  enabled: string[]
  canSave: boolean
  themes: { id: string; name: string }[]
}) {
  const [state, action, pending] = useActionState(saveThemeSettings, idle)
  return (
    <form action={action} className="a-panel space-y-5 p-5">
      <fieldset disabled={!canSave || pending} className="space-y-3">
        <legend className="mb-3 font-medium">Public themes</legend>
        <input type="hidden" name="enabledThemes" value="clean" />
        {themes.map(({ id, name }) => (
          <label key={id} className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              name={id === 'clean' ? undefined : 'enabledThemes'}
              value={id}
              defaultChecked={enabled.includes(id)}
              disabled={id === 'clean'}
            />
            {name}
            {id === 'clean' ? ' (always enabled)' : ''}
          </label>
        ))}
      </fieldset>
      {!canSave && (
        <p role="status" className="a-hint">
          Saving theme settings requires MongoDB. Configure MONGODB_URI first.
          Minimal, Clubroom and Desktop are enabled by default; Terminal is
          disabled.
        </p>
      )}
      {state.error && <p role="alert">{state.error}</p>}
      {state.ok && <p role="status">Theme settings saved.</p>}
      <button className="a-btn" type="submit" disabled={!canSave || pending}>
        {pending ? 'Saving…' : 'Save settings'}
      </button>
    </form>
  )
}
