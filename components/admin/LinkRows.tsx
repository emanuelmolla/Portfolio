'use client'

import { useState } from 'react'

/**
 * Repeatable link rows.
 *
 * Inputs are named as PARALLEL ARRAYS ('link.kind', 'link.url', ...) and read
 * with FormData.getAll(), which preserves document order. The alternative,
 * indexed names like link[2].url, means renumbering every row after the one that
 * was removed, which is bookkeeping that exists only to be got wrong.
 *
 * The consequence: every row must render every input, including blank ones, or the
 * columns come apart. Which is also why `visible` is a select and not a checkbox.
 * An unchecked checkbox submits NOTHING, so one hidden row would shift every
 * following row's flag up by one. A select always submits a value.
 */

export interface LinkRow {
  kind: string
  label: string
  url: string
  handle?: string
  visible?: boolean
}

interface Keyed extends LinkRow {
  key: number
}

let counter = 0
function nextKey(): number {
  counter += 1
  return counter
}

export function LinkRows({
  name = 'link',
  kinds,
  defaultValue = [],
  withHandle = false,
  hint,
}: {
  name?: string
  kinds: readonly string[]
  defaultValue?: readonly LinkRow[]
  /** Profile links carry a display handle and a visibility flag; work links do not. */
  withHandle?: boolean
  hint?: string
}) {
  const [rows, setRows] = useState<Keyed[]>(() =>
    defaultValue.map((row) => ({ ...row, key: nextKey() }))
  )

  const add = () =>
    setRows((current) => [
      ...current,
      {
        key: nextKey(),
        kind: kinds[0] ?? 'other',
        label: '',
        url: '',
        handle: '',
        visible: true,
      },
    ])

  const remove = (key: number) => setRows((current) => current.filter((row) => row.key !== key))

  const move = (key: number, delta: number) =>
    setRows((current) => {
      const index = current.findIndex((row) => row.key === key)
      const target = index + delta
      if (index === -1 || target < 0 || target >= current.length) return current
      const next = [...current]
      const [item] = next.splice(index, 1)
      next.splice(target, 0, item)
      return next
    })

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="a-label">Links</span>
        <button type="button" onClick={add} className="a-btn a-btn-sm">
          Add link
        </button>
      </div>

      {hint && <p className="a-hint mb-2">{hint}</p>}

      {rows.length === 0 ? (
        <p className="a-hint rounded border border-dashed border-[var(--a-line-strong)] px-3 py-4">
          No links.
        </p>
      ) : (
        <ul className="grid gap-2">
          {rows.map((row, index) => (
            <li
              key={row.key}
              className="grid gap-2 rounded border border-[var(--a-line)] bg-[var(--a-panel-2)] p-2 sm:grid-cols-[8rem_minmax(0,1fr)_auto]"
            >
              <select
                name={`${name}.kind`}
                defaultValue={row.kind}
                aria-label="Link kind"
                className="a-select"
              >
                {kinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {kind}
                  </option>
                ))}
              </select>

              <div className="grid gap-2">
                <input
                  name={`${name}.url`}
                  defaultValue={row.url}
                  placeholder="https://"
                  aria-label="URL"
                  autoComplete="off"
                  className="a-input a-mono"
                />

                <div className={`grid gap-2 ${withHandle ? 'sm:grid-cols-3' : ''}`}>
                  <input
                    name={`${name}.label`}
                    defaultValue={row.label}
                    placeholder="Label (optional)"
                    aria-label="Label"
                    autoComplete="off"
                    className="a-input"
                  />

                  {withHandle && (
                    <>
                      <input
                        name={`${name}.handle`}
                        defaultValue={row.handle ?? ''}
                        placeholder="Handle, e.g. @emanuel"
                        aria-label="Handle"
                        autoComplete="off"
                        className="a-input"
                      />
                      <select
                        name={`${name}.visible`}
                        defaultValue={row.visible === false ? 'no' : 'yes'}
                        aria-label="Shown on the site"
                        className="a-select"
                      >
                        <option value="yes">Shown</option>
                        <option value="no">Hidden</option>
                      </select>
                    </>
                  )}
                </div>
              </div>

              {/* Order is row position, not a number to type. The site reads these
                  top to bottom, so the list is the ordering control. */}
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
                  onClick={() => remove(row.key)}
                  aria-label="Remove link"
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
