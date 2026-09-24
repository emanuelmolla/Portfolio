'use client'

import { useRef, useState } from 'react'
import { useUpload } from './useUpload'

/**
 * Repeating image rows for a project's screenshots.
 *
 * Same parallel-array contract as LinkRows, with the same consequence: every row
 * renders every input, including blank ones, or the columns come apart on read.
 *
 * Each row measures its own dimensions from the URL, for the reason ImageFields
 * does: the media schema requires real width and height so the page can reserve
 * the box, and making someone open each file to read its pixel size is the kind
 * of friction that means the gallery never gets filled in.
 */

export interface GalleryItem {
  url: string
  alt: string
  width: number
  height: number
  caption: string | null
}

interface Keyed extends GalleryItem {
  key: number
}

let counter = 0

export function GalleryRows({
  name = 'gallery',
  defaultValue = [],
}: {
  name?: string
  defaultValue?: readonly GalleryItem[]
}) {
  const [rows, setRows] = useState<Keyed[]>(() =>
    defaultValue.map((r) => ({ ...r, key: (counter += 1) }))
  )
  const picker = useRef<HTMLInputElement>(null)
  const { upload, busy, error: uploadError } = useUpload()

  const patch = (key: number, next: Partial<GalleryItem>) =>
    setRows((c) => c.map((r) => (r.key === key ? { ...r, ...next } : r)))

  const measure = (key: number, url: string) => {
    if (!url.trim()) return
    const img = new window.Image()
    img.onload = () => patch(key, { width: img.naturalWidth, height: img.naturalHeight })
    img.src = url.trim()
  }

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
        <span className="a-label">Screenshots</span>
        <span className="flex items-center gap-2">
          {/* Multi-select, because adding screenshots to a project is naturally a
              handful at once and one-at-a-time is the friction this replaces.
              Each upload appends a row already filled in, dimensions included. */}
          <input
            ref={picker}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={async (event) => {
              const files = event.target.files
              if (!files?.length) return
              const images = await upload(files)
              setRows((c) => [
                ...c,
                ...images.map((image) => ({
                  key: (counter += 1),
                  url: image.url,
                  alt: '',
                  width: image.width,
                  height: image.height,
                  caption: '' as string | null,
                })),
              ])
              event.target.value = ''
            }}
          />
          <button
            type="button"
            className="a-btn a-btn-sm a-btn-primary"
            disabled={busy}
            onClick={() => picker.current?.click()}
          >
            {busy ? 'Uploading' : 'Upload screenshots'}
          </button>
          <button
            type="button"
            className="a-btn a-btn-sm"
            onClick={() =>
              setRows((c) => [
                ...c,
                { key: (counter += 1), url: '', alt: '', width: 0, height: 0, caption: '' as string | null },
              ])
            }
          >
            Add by URL
          </button>
        </span>
      </div>

      {uploadError && <p className="a-error mb-2">{uploadError}</p>}

      <p className="a-hint mb-2">
        Extra images beyond the cover. The cover leads the sequence, so do not repeat it here.
        Order is the order of the rows. Sizes fill themselves in from the URL.
      </p>

      {rows.length === 0 ? (
        <p className="a-hint rounded border border-dashed border-[var(--a-line-strong)] px-3 py-4">
          No extra screenshots. The project shows its cover image alone.
        </p>
      ) : (
        <ul className="grid gap-2">
          {rows.map((row, index) => (
            <li
              key={row.key}
              className="rounded border border-[var(--a-line)] bg-[var(--a-panel-2)] p-2"
            >
              <div className="flex items-start gap-2">
                {row.url.trim() ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={row.url}
                    alt=""
                    className="h-14 w-20 shrink-0 rounded border border-[var(--a-line)] object-cover"
                    onLoad={(e) => {
                      const el = e.currentTarget
                      if (!row.width || !row.height) {
                        patch(row.key, { width: el.naturalWidth, height: el.naturalHeight })
                      }
                    }}
                  />
                ) : (
                  <div className="h-14 w-20 shrink-0 rounded border border-dashed border-[var(--a-line-strong)]" />
                )}

                <div className="grid min-w-0 flex-1 gap-2">
                  <input
                    name={`${name}.url`}
                    value={row.url}
                    onChange={(e) => patch(row.key, { url: e.target.value })}
                    onBlur={(e) => measure(row.key, e.target.value)}
                    placeholder="https://"
                    aria-label="Screenshot URL"
                    className="a-input a-mono"
                  />
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_5rem_5rem]">
                    <input
                      name={`${name}.alt`}
                      value={row.alt}
                      onChange={(e) => patch(row.key, { alt: e.target.value })}
                      placeholder="Alt text"
                      aria-label="Alt text"
                      className="a-input"
                    />
                    <input
                      name={`${name}.caption`}
                      value={row.caption ?? ''}
                      onChange={(e) => patch(row.key, { caption: e.target.value })}
                      placeholder="Caption (optional)"
                      aria-label="Caption"
                      className="a-input"
                    />
                    <input
                      name={`${name}.width`}
                      type="number"
                      value={row.width || ''}
                      onChange={(e) => patch(row.key, { width: Number(e.target.value) })}
                      aria-label="Width"
                      className="a-input a-mono"
                    />
                    <input
                      name={`${name}.height`}
                      type="number"
                      value={row.height || ''}
                      onChange={(e) => patch(row.key, { height: Number(e.target.value) })}
                      aria-label="Height"
                      className="a-input a-mono"
                    />
                  </div>
                </div>

                <div className="flex shrink-0 items-start gap-1">
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
                    aria-label="Remove screenshot"
                    className="a-btn a-btn-sm a-btn-ghost"
                  >
                    {'×'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
