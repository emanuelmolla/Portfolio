import Image from 'next/image'
import type { Media } from '@/lib/models'

/**
 * How the clean theme handles pictures. TWO treatments, because the two content
 * types are doing different jobs with them.
 *
 * A post's image is decoration on an article: it sets a mood above the headline
 * and then the writing takes over. That is a BANNER.
 *
 * A project's images are the evidence. The thing is a running application and a
 * single still frame understates it, so they are a sequence you move through.
 * That is a WALKTHROUGH.
 *
 * Rendering both as one centred figure, which is what this file replaced, made
 * them look like the same thing placed in two places, which is exactly the
 * "out of place" complaint. The old Cover component is gone.
 */

/* ------------------------------------------------------------- banner ---- */

/**
 * A post banner, at the full width of the content column.
 *
 * Cropped to a FIXED 16:6 through object-cover rather than run at each image's
 * own aspect ratio. Blog covers arrive at whatever shape they were saved at, and
 * letting each one set its own height means the masthead jumps around between
 * posts. A constant band is what makes a series of posts look like a publication
 * rather than a folder of files.
 *
 * The crop is a real cost: anything important at the top or bottom of the source
 * is lost. It is the right trade for cover art and the wrong one for a
 * screenshot, which is why the walkthrough below does not crop.
 */
export function Banner({ media }: { media: Media }) {
  return (
    <figure className="mb-12">
      <div className="relative aspect-[16/6] w-full overflow-hidden rounded-md bg-[var(--raised)]">
        <Image
          src={media.url}
          alt={media.alt}
          fill
          sizes="(min-width: 1024px) 60rem, 100vw"
          priority
          className="object-cover"
        />
      </div>
      {media.caption && (
        <figcaption className="mt-2.5 font-mono text-xs text-[var(--faint)]">
          {media.caption}
        </figcaption>
      )}
    </figure>
  )
}

/* -------------------------------------------------------- walkthrough ---- */

/**
 * A project's screenshots, as a horizontal strip you scroll through.
 *
 * CSS scroll-snap, no JavaScript and no carousel library. The strip is a real
 * overflow container, so it works with a trackpad, a touch swipe, shift-scroll
 * and the keyboard, and it still works with JS disabled. A library would add
 * bundle weight to reimplement scrolling, worse.
 *
 * Slides are NOT cropped: a screenshot cropped to a common aspect is a screenshot
 * with its edges cut off, and the edges of an interface are where the navigation
 * lives. They share a height and keep their own widths, which is the same rule
 * the detail figures use.
 *
 * A single image renders as a single image, with no strip affordances, because a
 * carousel of one is a lie about how much there is to see.
 */
export function Walkthrough({ images }: { images: Media[] }) {
  if (images.length === 0) return null

  if (images.length === 1) {
    const only = images[0]
    return (
      <figure className="mb-12">
        <Image
          src={only.url}
          alt={only.alt}
          width={only.width}
          height={only.height}
          sizes="(min-width: 640px) 36rem, 100vw"
          className="h-auto max-h-72 w-auto max-w-full rounded border border-[var(--rule)]"
        />
        {only.caption && (
          <figcaption className="mt-2.5 font-mono text-xs text-[var(--faint)]">
            {only.caption}
          </figcaption>
        )}
      </figure>
    )
  }

  return (
    <section className="mb-12" aria-label="Screenshots">
      <div
        // -mx and px let the strip bleed to the edges on a phone while the first
        // slide still lines up with the text above it.
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6"
        tabIndex={0}
      >
        {images.map((media, i) => (
          <figure key={media.url} className="shrink-0 snap-start">
            <Image
              src={media.url}
              alt={media.alt}
              width={media.width}
              height={media.height}
              sizes="(min-width: 640px) 34rem, 85vw"
              className="h-auto max-h-72 w-auto rounded border border-[var(--rule)]"
            />
            <figcaption className="mt-2 flex items-baseline gap-2 font-mono text-[11px] text-[var(--faint)]">
              <span className="tabular">
                {i + 1}/{images.length}
              </span>
              {media.caption && <span className="text-[var(--muted)]">{media.caption}</span>}
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="mt-1 font-mono text-[11px] text-[var(--faint)]">Scroll for more</p>
    </section>
  )
}
