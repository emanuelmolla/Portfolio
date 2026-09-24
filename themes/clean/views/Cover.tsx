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
 * SIZED BY HEIGHT, NOT WIDTH. A screenshot at full column width is a hero image,
 * and a hero image is the loudest thing on a page about something else. This is
 * supporting evidence: it should say what the thing looks like and then get out
 * of the way of the writing.
 *
 * Capping the height rather than the width is what makes that consistent. These
 * screenshots range from 1.48:1 to 2.42:1, so a fixed max-width would give the
 * squarer ones nearly twice the vertical footprint of the wide ones for no
 * reason anyone chose. A fixed max-height gives every figure the same weight on
 * the page and lets the width fall out of the aspect ratio.
 *
 * A max-width as well, and both are needed. A height cap alone fixes the tall
 * screenshots (1.48:1 drops to about half the column) and does almost nothing to
 * the wide ones: a 2.42:1 banner was already short, so capping its height leaves
 * it at 86% of the column, which still reads as full-bleed. Capped on both axes,
 * every figure lands at 62% of the column or less.
 *
 * Expressed as min(26rem, 100%) rather than two competing max-width classes, so
 * it also shrinks to fit on a phone.
 *
 * `sizes` is the rendered width, not the column width. Capped at 26rem, so
 * telling Next 100vw would have it serve a viewport-wide source for a figure a
 * third that size.
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
        sizes="(min-width: 640px) 26rem, 100vw"
        priority={priority}
        className="h-auto max-h-60 w-auto max-w-[min(26rem,100%)] rounded border border-[var(--rule)]"
      />
      {media.caption && (
        <figcaption className="mt-2.5 font-mono text-xs text-[var(--faint)]">
          {media.caption}
        </figcaption>
      )}
    </figure>
  )
}
