'use client'

import { useRef, useState } from 'react'
import { useUpload } from './useUpload'

/**
 * URL, alt text and intrinsic size for an image.
 *
 * The media schema requires width and height (see lib/models/shared.ts: without
 * them next/image cannot reserve space and the page jumps as the image loads,
 * which is a Core Web Vitals signal working against the ranking this whole
 * rebuild is for). Requiring them is correct. Making a person open the file in
 * another tab to read the pixel size every single time is not.
 *
 * So the browser reads it. Loading the URL into an Image object and reading
 * naturalWidth is exact, needs no server round trip, and is not affected by CORS
 * the way reading pixels would be, because nothing here touches a canvas.
 *
 * It fills in automatically only when the fields are empty, and never overwrites
 * a value that was typed. Deliberate cropping is a real thing and the auto-fill
 * should not fight it.
 *
 * UPLOAD is the primary path now. Pasting a URL still works, for an image that
 * already lives somewhere, but the file picker is what removes the round trip
 * through someone else's dashboard that v1 required. An upload returns its own
 * width and height, so on that path the measuring never happens at all.
 */

export interface ImageValue {
  url: string
  alt: string
  width: number
  height: number
  caption: string | null
}

export function ImageFields({
  prefix,
  legendHint,
  value,
  err,
}: {
  /** Field name prefix: 'coverImage' or 'avatar'. */
  prefix: string
  legendHint?: string
  value: ImageValue | null
  err: (name: string) => string | undefined
}) {
  const [url, setUrl] = useState(value?.url ?? '')
  const [width, setWidth] = useState(value?.width ? String(value.width) : '')
  const [height, setHeight] = useState(value?.height ? String(value.height) : '')
  const [status, setStatus] = useState<string | null>(null)
  const picker = useRef<HTMLInputElement>(null)
  const { upload, busy, error: uploadError } = useUpload()

  const measure = (src: string, force: boolean) => {
    const target = src.trim()
    if (!target) return
    if (!force && width && height) return

    setStatus('Reading the image')

    const img = new window.Image()
    img.onload = () => {
      setWidth(String(img.naturalWidth))
      setHeight(String(img.naturalHeight))
      setStatus(`${img.naturalWidth} by ${img.naturalHeight}`)
    }
    img.onerror = () => {
      setStatus('Could not load that image. Type the size in by hand.')
    }
    img.src = target
  }

  return (
    <>
      {legendHint && <p className="a-hint -mt-1">{legendHint}</p>}

      <div>
        <label className="a-label mb-1.5" htmlFor={`${prefix}.url`}>
          Image URL
        </label>
        <div className="flex items-center gap-2">
          <input
            id={`${prefix}.url`}
            name={`${prefix}.url`}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onBlur={(event) => measure(event.target.value, false)}
            placeholder="Upload, or paste a URL"
            autoComplete="off"
            className="a-input a-mono"
          />
          <input
            ref={picker}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (event) => {
              const files = event.target.files
              if (!files?.length) return
              const [image] = await upload(files)
              // The upload already knows the size, so this path skips measuring.
              if (image) {
                setUrl(image.url)
                setWidth(String(image.width))
                setHeight(String(image.height))
                setStatus(`${image.width} by ${image.height}`)
              }
              event.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => picker.current?.click()}
            disabled={busy}
            className="a-btn a-btn-sm a-btn-primary shrink-0"
          >
            {busy ? 'Uploading' : 'Upload'}
          </button>
          <button
            type="button"
            onClick={() => measure(url, true)}
            disabled={!url.trim()}
            className="a-btn a-btn-sm shrink-0"
          >
            Measure
          </button>
        </div>
        {uploadError && <p className="a-error mt-1.5">{uploadError}</p>}
        {err(`${prefix}.url`) ? (
          <p className="a-error mt-1.5">{err(`${prefix}.url`)}</p>
        ) : (
          <p className="a-hint mt-1.5">
            A path like <code className="a-mono">/me.jpg</code> works for anything in{' '}
            <code className="a-mono">public/</code>. Leave blank for no image.
          </p>
        )}
      </div>

      <div>
        <label className="a-label mb-1.5" htmlFor={`${prefix}.alt`}>
          Alt text
        </label>
        <input
          id={`${prefix}.alt`}
          name={`${prefix}.alt`}
          defaultValue={value?.alt ?? ''}
          autoComplete="off"
          className="a-input"
        />
        {err(`${prefix}.alt`) ? (
          <p className="a-error mt-1.5">{err(`${prefix}.alt`)}</p>
        ) : (
          <p className="a-hint mt-1.5">
            What the image shows, for someone who cannot see it. Not a caption, and not a repeat of
            the title.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="a-label mb-1.5" htmlFor={`${prefix}.width`}>
            Width
          </label>
          <input
            id={`${prefix}.width`}
            name={`${prefix}.width`}
            type="number"
            value={width}
            onChange={(event) => setWidth(event.target.value)}
            className="a-input a-mono"
          />
          {err(`${prefix}.width`) && <p className="a-error mt-1.5">{err(`${prefix}.width`)}</p>}
        </div>

        <div>
          <label className="a-label mb-1.5" htmlFor={`${prefix}.height`}>
            Height
          </label>
          <input
            id={`${prefix}.height`}
            name={`${prefix}.height`}
            type="number"
            value={height}
            onChange={(event) => setHeight(event.target.value)}
            className="a-input a-mono"
          />
          {err(`${prefix}.height`) && <p className="a-error mt-1.5">{err(`${prefix}.height`)}</p>}
        </div>

        <div>
          <label className="a-label mb-1.5" htmlFor={`${prefix}.caption`}>
            Caption
          </label>
          <input
            id={`${prefix}.caption`}
            name={`${prefix}.caption`}
            defaultValue={value?.caption ?? ''}
            autoComplete="off"
            className="a-input"
          />
        </div>
      </div>

      {status && (
        <p aria-live="polite" className="a-hint a-mono -mt-2">
          {status}
        </p>
      )}

      {url.trim() && (
        <div className="rounded border border-[var(--a-line)] bg-[var(--a-panel-2)] p-3">
          {/* A plain img, not next/image. This is an arbitrary URL being checked
              inside an admin screen; routing it through the image optimiser would
              mean configuring a remote-pattern allow-list for every host you ever
              paste from, and optimising a preview nobody but you will see. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="mx-auto max-h-48 w-auto rounded"
            onLoad={(event) => {
              const el = event.currentTarget
              if (!width && !height) {
                setWidth(String(el.naturalWidth))
                setHeight(String(el.naturalHeight))
              }
            }}
          />
        </div>
      )}
    </>
  )
}
