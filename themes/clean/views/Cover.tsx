import Image from 'next/image'
import type { Media } from '@/lib/models'

/**
 * A screenshot on a detail page.
 *
 * next/image rather than a plain img, and the reason is the width and height the
 * media schema insists on: passed through, they let the browser reserve the exact
 * box before a byte of the image arrives, so the text below does not jump when it
 * loads. That is the whole argument for those fields being required, and using an
 * img here would throw it away.
 *
 * `sizes` matches the measured content column (max-w-2xl, 42rem) rather than
 * being left at the default 100vw, which would make Next serve a viewport-wide
 * source for a column half that wide on desktop.
 *
 * Deliberately restrained: a hairline border, a small radius, no shadow and no
 * hover effect. It is evidence that the thing exists, not a gallery.
 */
export function Cover({ media, priority = false }: { media: Media; priority?: boolean }) {
  return (
    <figure className="mb-12">
      <Image
        src={media.url}
        alt={media.alt}
        width={media.width}
        height={media.height}
        sizes="(min-width: 768px) 42rem, 100vw"
        priority={priority}
        className="h-auto w-full rounded border border-[var(--rule)]"
      />
      {media.caption && (
        <figcaption className="mt-2.5 font-mono text-xs text-[var(--faint)]">
          {media.caption}
        </figcaption>
      )}
    </figure>
  )
}
