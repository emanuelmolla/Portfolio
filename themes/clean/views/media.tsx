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

/* ------------------------------------------------------------- plates ---- */

/**
 * A project's screenshots, as numbered plates.
 *
 * DELIBERATELY NOT a carousel, and not the horizontal strip this replaced. That
 * strip was a widget: a thing you poke at, which is the desktop theme's job and
 * not this one's. The clean theme is a printed page, so a sequence of images is a
 * sequence of plates with their captions set in the margin, and you walk through
 * the application by reading down.
 *
 * The contrast with the other theme is the point. Desktop gets a stateful viewer
 * window with a filmstrip and an index. This has no state and no JavaScript at
 * all, and the two share nothing but the data.
 *
 * Captions hang in the left margin on wide screens, which is the convention this
 * borrows and the reason it reads as considered rather than assembled. The clean
 * shell is 60rem wide while its prose sits at 34rem, so that margin already
 * exists; this uses it instead of letting it stay empty.
 *
 * Plates are NOT cropped to a common aspect. A cropped screenshot is a screenshot
 * with its edges removed, and the edges of an interface are where the navigation
 * lives. They share a max height and keep their own widths.
 */
function Plates({ images }: { images: Media[] }) {
  if (images.length === 0) return null

  const many = images.length > 1

  return (
    <section className="mb-14" aria-label="Screenshots">
      {images.map((media, i) => (
        <figure
          key={media.url}
          className="mb-10 grid gap-3 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-6"
        >
          {/* The margin column. On a phone this stacks above the image, which is
              the right fallback: a caption beside a full-width image would leave
              neither enough room. */}
          <figcaption className="font-mono text-[11px] leading-relaxed text-[var(--faint)] sm:pt-1 sm:text-right">
            {/* Numbered only when there is a sequence to number. "fig 01" against
                a single image is ceremony. */}
            {many && (
              <span className="tabular block text-[var(--muted)]">
                fig {String(i + 1).padStart(2, '0')}
              </span>
            )}
            {media.caption && <span className="block sm:mt-1">{media.caption}</span>}
          </figcaption>

          <Image
            src={media.url}
            alt={media.alt}
            width={media.width}
            height={media.height}
            sizes="(min-width: 640px) 34rem, 100vw"
            className="h-auto max-h-[22rem] w-auto max-w-full rounded border border-[var(--rule)]"
          />
        </figure>
      ))}
    </section>
  )
}

/* -------------------------------------------------------- disclosure ---- */

/**
 * Screenshots, folded away behind a disclosure.
 *
 * The plates are good and they are also a lot of page. A project detail in this
 * theme is meant to read as writing, and four screenshots stacked above the prose
 * turns it into a slide deck with paragraphs attached. So the default state is
 * closed, and opening it is a decision the reader makes.
 *
 * The lure is a row of thumbnails rather than a bare button. "Show screenshots"
 * on its own is a label nobody has a reason to trust; a stack of real frames
 * says what is behind it and roughly how much, which is the whole job of a
 * teaser. They are overlapped slightly so the group reads as one deck instead of
 * three separate pictures.
 *
 * <details>, not useState. No JavaScript, no hydration, works before the bundle
 * arrives and works without it, which is the same principle the appearance menu
 * follows. It also means the full-size images inside stay unfetched while it is
 * closed: they are lazy by default and a closed disclosure never brings them into
 * view, so the teaser costs three thumbnails and nothing else.
 *
 * The desktop theme does the opposite on purpose: its Viewer is open, stateful
 * and immediate, because there a set of screenshots is an application you are
 * already looking at.
 */
export function Screenshots({ images }: { images: Media[] }) {
  if (images.length === 0) return null

  const count = images.length
  const teasers = images.slice(0, 3)

  return (
    <details className="group mb-14">
      <summary className="inline-flex cursor-pointer list-none items-center gap-4 rounded px-1 py-1 transition-colors hover:text-[var(--accent)] [&::-webkit-details-marker]:hidden">
        <span className="flex shrink-0 items-center">
          {teasers.map((media, i) => (
            <Image
              key={media.url}
              src={media.url}
              alt=""
              width={media.width}
              height={media.height}
              sizes="72px"
              aria-hidden
              // `relative` is load-bearing: z-index is ignored on a statically
              // positioned element, so without it the frames stack in DOM order
              // and the deck reads back-to-front.
              className={`relative h-10 w-14 rounded-[3px] border border-[var(--rule)] bg-[var(--raised)] object-cover object-left-top ${
                i > 0 ? '-ml-6' : ''
              }`}
              style={{ zIndex: teasers.length - i }}
            />
          ))}
        </span>

        <span className="font-mono text-xs tracking-[0.04em] text-[var(--muted)] group-hover:text-[var(--accent)]">
          <span className="group-open:hidden">
            Show {count} screenshot{count === 1 ? '' : 's'}
          </span>
          <span className="hidden group-open:inline">Hide screenshots</span>
        </span>
      </summary>

      <div className="pt-10">
        <Plates images={images} />
      </div>
    </details>
  )
}
