'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { Media } from '@/lib/models'

/**
 * Project screenshots, as an image viewer.
 *
 * DELIBERATELY NOT the clean theme's Walkthrough. That one is a scroll strip:
 * editorial, you drag through it, the captions are numbered like plates in a
 * book. This is an application window with a title bar, a filmstrip and a status
 * line, because in this theme a set of screenshots is a folder you opened in a
 * viewer.
 *
 * Both show the same images. Neither shares a line of markup with the other, and
 * that is the point of having themes: they should disagree about how to present
 * the same fact. The versions before this were one figure component used twice,
 * which is one theme wearing two palettes.
 *
 * A client component, unlike almost everything else here, because selecting a
 * frame is genuine interaction. It degrades honestly without JavaScript: the
 * first image is server-rendered inside the frame, and the filmstrip is simply
 * inert.
 */
export function Viewer({ images, name }: { images: Media[]; name: string }) {
  const [index, setIndex] = useState(0)
  if (images.length === 0) return null

  const current = images[Math.min(index, images.length - 1)]
  const step = (delta: number) =>
    setIndex((i) => (i + delta + images.length) % images.length)

  return (
    <section
      aria-label="Screenshots"
      className="mb-8 overflow-hidden rounded-md border border-[var(--rule)] bg-[var(--window)]"
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') step(-1)
        if (event.key === 'ArrowRight') step(1)
      }}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-[var(--rule)] bg-[var(--chrome)] px-3 py-1.5">
        <span aria-hidden className="h-2 w-2 rounded-full bg-[var(--accent)]" />
        <span className="truncate font-mono text-[11px] text-[var(--muted)]">{name}</span>
      </div>

      {/* Frame. A fixed band so switching images does not resize the window,
          which is what a real viewer does: the window stays, the content fits
          inside it. object-contain because a screenshot must not be cropped. */}
      <div className="relative flex h-[16rem] items-center justify-center bg-[var(--ground)] p-3 sm:h-[20rem]">
        <Image
          key={current.url}
          src={current.url}
          alt={current.alt}
          width={current.width}
          height={current.height}
          sizes="(min-width: 640px) 40rem, 100vw"
          className="max-h-full w-auto max-w-full object-contain"
        />

        {images.length > 1 && (
          <>
            <ViewerButton side="left" onClick={() => step(-1)} label="Previous screenshot" />
            <ViewerButton side="right" onClick={() => step(1)} label="Next screenshot" />
          </>
        )}
      </div>

      {/* Filmstrip */}
      {images.length > 1 && (
        <ul className="flex gap-1.5 overflow-x-auto border-t border-[var(--rule)] bg-[var(--chrome)] px-2 py-2">
          {images.map((media, i) => (
            <li key={media.url} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Screenshot ${i + 1}`}
                aria-current={i === index}
                className={`block h-11 w-16 overflow-hidden rounded-[3px] border transition-colors ${
                  i === index
                    ? 'border-[var(--accent)]'
                    : 'border-[var(--rule)] opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={media.url}
                  alt=""
                  width={media.width}
                  height={media.height}
                  sizes="64px"
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Status line. The dimensions are read off the record, so they cost
          nothing and are the kind of thing a viewer actually shows. */}
      <div className="flex items-center justify-between gap-3 border-t border-[var(--rule)] bg-[var(--chrome)] px-3 py-1.5 font-mono text-[11px] text-[var(--faint)]">
        <span className="truncate">{current.caption ?? current.alt}</span>
        <span className="tabular shrink-0">
          {images.length > 1 && `${index + 1} of ${images.length}  ·  `}
          {current.width}×{current.height}
        </span>
      </div>
    </section>
  )
}

function ViewerButton({
  side,
  onClick,
  label,
}: {
  side: 'left' | 'right'
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 -translate-y-1/2 rounded-[3px] border border-[var(--rule)] bg-[var(--chrome)]/90 px-2 py-3 font-mono text-[12px] text-[var(--muted)] backdrop-blur-sm hover:text-[var(--accent)] ${
        side === 'left' ? 'left-2' : 'right-2'
      }`}
    >
      {side === 'left' ? '‹' : '›'}
    </button>
  )
}
