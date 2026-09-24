'use client'

import { useState } from 'react'

/**
 * Things he does that are not work, edited as rows.
 *
 * Same parallel-array contract as LinkRows: every row renders every input,
 * including blank ones, or the columns come apart on read.
 *
 * This exists because adding `interests` to the Profile model without an editor
 * would have been worse than not adding it at all. The save action parses the
 * whole profile and assigns the result, so a field the form does not submit comes
 * back from zod as its default and overwrites what was there. The first profile
 * save would have silently deleted them.
 */

export interface InterestItem {
  name: string
  note: string | null
  url: string | null
}

interface Keyed extends InterestItem {
  key: number
}

let counter = 0

export function InterestRows({
  name = 'interest',
  defaultValue = [],
}: {
  name?: string
  defaultValue?: readonly InterestItem[]
}) {
  const [rows, setRows] = useState<Keyed[]>(() =>
    defaultValue.map((r) => ({ ...r, key: (counter += 1) }))
  )

  const move = (key: number, delta: number) =>
    setRows((c) => {
      const i = c.findIndex((r) => r.key === key)
      const t = i + delta
      if (i === -1 || t < 0 || t >= c.length) return c
      const next = [...c]
      const [item] = next.splice(i, 1)
      next.splice(t, 0, item)
      return next
    })

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="a-label">Outside work</span>
        <button
          type="button"
          className="a-btn a-btn-sm"
          onClick={() =>
            setRows((c) => [...c, { key: (counter += 1), name: '', note: '', url: '' }])
          }
        >
          Add
        </button>
      </div>

      <p className="a-hint mb-2">
        Shown on /about. The link is optional and makes the name clickable, which is the point of
        having one: a chess profile is something a reader can go and look at.
      </p>

      {rows.length === 0 ? (
        <p className="a-hint rounded border border-dashed border-[var(--a-line-strong)] px-3 py-4">
          Nothing listed. The section is hidden entirely when this is empty.
        </p>
      ) : (
        <ul className="grid gap-2">
          {rows.map((row, index) => (
            <li
              key={row.key}
              className="grid gap-2 rounded border border-[var(--a-line)] bg-[var(--a-panel-2)] p-2 sm:grid-cols-[10rem_minmax(0,1fr)_auto]"
            >
              <input
                name={`${name}.name`}
                defaultValue={row.name}
                placeholder="Chess"
                aria-label="Name"
                className="a-input"
              />
              <div className="grid gap-2">
                <input
                  name={`${name}.note`}
                  defaultValue={row.note ?? ''}
                  placeholder="One line. Optional."
                  aria-label="Note"
                  className="a-input"
                />
                <input
                  name={`${name}.url`}
                  defaultValue={row.url ?? ''}
                  placeholder="https://chess.com/member/… (optional)"
                  aria-label="Link"
                  className="a-input a-mono"
                />
              </div>
              <div className="flex items-start gap-1">
                <button
                  type="button"
                  onClick={() => move(row.key, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                  className="a-btn a-btn-sm a-btn-ghost"
                >
                  {'↑'}
                </button>
                <button
                  type="button"
                  onClick={() => move(row.key, 1)}
                  disabled={index === rows.length - 1}
                  aria-label="Move down"
                  className="a-btn a-btn-sm a-btn-ghost"
                >
                  {'↓'}
                </button>
                <button
                  type="button"
                  onClick={() => setRows((c) => c.filter((r) => r.key !== row.key))}
                  aria-label="Remove"
                  className="a-btn a-btn-sm a-btn-ghost"
                >
                  {'×'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
