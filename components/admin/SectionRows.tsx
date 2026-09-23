'use client'

import { useState } from 'react'

/**
 * Repeatable heading-and-body sections for a page.
 *
 * The structured alternative to one markdown body, for pages where rows beat
 * prose. /uses is the case it exists for: a list of hardware, editor and
 * services reads as a set of labelled blocks, not as an essay.
 *
 * Same parallel-array naming as LinkRows, and `order` is row position rather
 * than a number to type.
 */

export interface SectionRow {
  heading: string
  body: string
}

interface Keyed extends SectionRow {
  key: number
}

let counter = 0

export function SectionRows({
  name = 'section',
  defaultValue = [],
}: {
  name?: string
  defaultValue?: readonly SectionRow[]
}) {
  const [rows, setRows] = useState<Keyed[]>(() =>
    defaultValue.map((row) => ({ ...row, key: (counter += 1) }))
  )

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="a-label">Sections</span>
        <button
          type="button"
          className="a-btn a-btn-sm"
          onClick={() => setRows((c) => [...c, { key: (counter += 1), heading: '', body: '' }])}
        >
          Add section
        </button>
      </div>

      <p className="a-hint mb-2">
        Optional and separate from the body above. Use one or the other: a page with both renders
        the body and then the sections, which is rarely what anyone means.
      </p>

      {rows.length === 0 ? (
        <p className="a-hint rounded border border-dashed border-[var(--a-line-strong)] px-3 py-4">
          No sections. This page is just its body.
        </p>
      ) : (
        <ul className="grid gap-2">
          {rows.map((row, index) => (
            <li key={row.key} className="rounded border border-[var(--a-line)] bg-[var(--a-panel-2)] p-2">
              <div className="flex items-center gap-2">
                <input
                  name={`${name}.heading`}
                  defaultValue={row.heading}
                  placeholder="Heading"
                  aria-label="Section heading"
                  className="a-input"
                />
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={index === 0}
                    className="a-btn a-btn-sm a-btn-ghost"
                    onClick={() =>
                      setRows((c) => {
                        const next = [...c]
                        const [item] = next.splice(index, 1)
                        next.splice(index - 1, 0, item)
                        return next
                      })
                    }
                  >
                    {'↑'}
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={index === rows.length - 1}
                    className="a-btn a-btn-sm a-btn-ghost"
                    onClick={() =>
                      setRows((c) => {
                        const next = [...c]
                        const [item] = next.splice(index, 1)
                        next.splice(index + 1, 0, item)
                        return next
                      })
                    }
                  >
                    {'↓'}
                  </button>
                  <button
                    type="button"
                    aria-label="Remove section"
                    className="a-btn a-btn-sm a-btn-ghost"
                    onClick={() => setRows((c) => c.filter((r) => r.key !== row.key))}
                  >
                    {'×'}
                  </button>
                </div>
              </div>

              <textarea
                name={`${name}.body`}
                defaultValue={row.body}
                rows={3}
                placeholder="Markdown"
                aria-label="Section body"
                className="a-textarea a-code mt-2"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
