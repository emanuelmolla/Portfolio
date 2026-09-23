'use client'

import { useEffect, useRef, useState } from 'react'
import { slugify } from '@/lib/slug'

/**
 * The slug input, with a live URL preview and a rename warning.
 *
 * Controlled rather than uncontrolled, unlike every other field: the preview and
 * the rename warning both have to react as the value changes, and there is no way
 * to do that from defaultValue.
 *
 * Auto-fill only happens while the field is empty and untouched. Silently
 * rewriting a slug because the title was edited is the behaviour that renames a
 * live URL by accident, which is precisely the thing redirects exist to clean up
 * after.
 */
export function SlugField({
  name = 'slug',
  sourceId,
  defaultValue = '',
  original,
  basePath,
  error,
}: {
  name?: string
  /** id of the input to derive from, usually 'title'. */
  sourceId: string
  defaultValue?: string
  /** The stored slug, when editing. Omitted when creating. */
  original?: string | null
  /** Where this slug lives: '/work', '/blog', '' for top-level pages. */
  basePath: string
  error?: string
}) {
  const [value, setValue] = useState(defaultValue)
  const touched = useRef(defaultValue !== '')

  // Derive from the source field as it is typed, until the slug is edited by
  // hand. A listener on the DOM node rather than lifting the title into state:
  // the title stays an ordinary uncontrolled input that way, and this component
  // does not need to own it.
  useEffect(() => {
    const source = document.getElementById(sourceId) as HTMLInputElement | null
    if (!source) return

    const sync = () => {
      if (touched.current) return
      setValue(slugify(source.value))
    }

    source.addEventListener('input', sync)
    return () => source.removeEventListener('input', sync)
  }, [sourceId])

  const renamed = Boolean(original) && value !== original
  const url = `${basePath}/${value || '…'}`.replace('//', '/')

  return (
    <div>
      <label className="a-label mb-1.5" htmlFor={name}>
        Slug
        <span aria-hidden className="ml-1 text-[var(--a-danger)]">
          *
        </span>
      </label>

      <div className="flex items-center gap-2">
        <input
          id={name}
          name={name}
          required
          value={value}
          onChange={(event) => {
            touched.current = true
            setValue(event.target.value)
          }}
          // Normalised on blur rather than on every keystroke, so typing a space
          // between two words does not immediately become a dash under the cursor.
          onBlur={(event) => setValue(slugify(event.target.value))}
          className="a-input a-mono"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          className="a-btn a-btn-sm shrink-0"
          onClick={() => {
            const source = document.getElementById(sourceId) as HTMLInputElement | null
            if (source) {
              touched.current = true
              setValue(slugify(source.value))
            }
          }}
        >
          From title
        </button>
      </div>

      {error ? (
        <p className="a-error mt-1.5">{error}</p>
      ) : (
        <p className="a-hint a-mono mt-1.5">{url}</p>
      )}

      {renamed && (
        <p className="a-notice a-notice-warn mt-2">
          Renaming from <span className="a-mono">{original}</span>. Saving keeps the old URL
          working and writes a 301 to the new one, so nothing that already links here breaks.
        </p>
      )}
    </div>
  )
}
