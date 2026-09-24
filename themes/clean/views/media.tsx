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
 * A project's screenshots, stacked, once the reader has asked for them.
 *
 * REWRITTEN. The first version hung each caption in the left margin, which is a
 * lovely convention and was the wrong bet here: it reserved a fixed column for
 * text that mostly does not exist. None of the migrated images carry a caption,
 * and a single screenshot gets no figure number either, so the usual case
 * rendered an empty column, a gap, and a screenshot shunted seven rem to the
 * right of nothing. A layout that only looks right when every optional field is
 * filled in is a layout that is usually wrong.
 *
 * So the caption sits UNDER the image and the whole line is dropped when there is
 * nothing to say. No reserved space, nothing to leave hanging.
 *
 * They are also allowed to be big now. The earlier sizing fought to keep images
 * from dominating a page nobody asked to be shown images on; behind a disclosure
 * that argument is gone. Someone who clicked "show screenshots" wants to see the
 * screenshots, so they run the full width of the column at their own aspect.
 */
function Plates({ images }: { images: Media[] }) {
  if (images.length === 0) return null
  const many = images.length > 1

  return (
    <div aria-label="Screenshots">
      {images.map((media, i) => {
        const label = [many ? `fig ${String(i + 1).padStart(2, '0')}` : null, media.caption]
          .filter(Boolean)
          .join('  ·  ')

        return (
          <figure key={media.url} className="mb-12 last:mb-0">
            <Image
              src={media.url}
              alt={media.alt}
              width={media.width}
              height={media.height}
              sizes="(min-width: 768px) 44rem, 100vw"
              className="h-auto w-full max-w-[44rem] rounded border border-[var(--rule)]"
            />
            {/* Dropped entirely when empty, rather than rendered blank. */}
            {label && (
              <figcaption className="mt-2.5 font-mono text-[11px] text-[var(--faint)]">
                {label}
              </figcaption>
            )}
          </figure>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------- disclosure ---- */

/**
 * How the closed stack sits.
 *
 * Static class strings, one per depth, because Tailwind scans source text: a
 * template literal like `rotate-[${n}deg]` produces no CSS at all. Inline styles
 * would work for the resting state and cannot express the hover, which is the
 * half that makes it feel like a physical pile.
 *
 * The angles are uneven on purpose. Three prints dropped on a desk do not land
 * at -5, 0 and +5; a regular fan reads as a widget, and the point here is that it
 * reads as a handful of photographs.
 */
const STACK = [
  'z-30 [transform:rotate(-3deg)] group-hover:[transform:rotate(-8deg)_translateX(-10px)_translateY(-2px)]',
  'z-20 [transform:rotate(7deg)_translateX(13px)] group-hover:[transform:rotate(14deg)_translateX(26px)]',
  'z-10 [transform:rotate(-13deg)_translateX(25px)] group-hover:[transform:rotate(-20deg)_translateX(46px)_translateY(2px)]',
]

/**
 * Screenshots, folded away behind a pile of photographs.
 *
 * The plates are good and they are also a lot of page. A project detail in this
 * theme is meant to read as writing, and four screenshots stacked above the prose
 * turns it into a slide deck with paragraphs attached. So the default is closed,
 * and opening it is the reader's decision.
 *
 * The lure is a scattered stack rather than a neat row, because a neat row of
 * thumbnails is a filmstrip, and a filmstrip is what the desktop theme uses. This
 * needed to say "there is a set of pictures here" in a way that belongs to a
 * page rather than to an application: slightly rotated, overlapping, shadowed,
 * like prints left in a pile. They fan apart on hover, which is the only
 * animation on the page and the only thing that needs to suggest it opens.
 *
 * <details>, not useState. No JavaScript, no hydration, works before the bundle
 * arrives and without it, the same principle the appearance menu follows. It also
 * keeps the full-size images unfetched while closed: they are lazy by default and
 * a closed disclosure never brings them into view, so the teaser costs three
 * thumbnails and nothing else.
 *
 * The desktop theme does the opposite deliberately: its Viewer is open, stateful
 * and immediate, because there a set of screenshots is an application you are
 * already looking at.
 */
export function Screenshots({ images }: { images: Media[] }) {
  if (images.length === 0) return null

  const count = images.length
  const teasers = images.slice(0, 3)

  return (
    <details className="group mb-14">
      <summary className="inline-flex cursor-pointer list-none items-center gap-5 py-1 [&::-webkit-details-marker]:hidden">
        {/* The stage is larger than the prints so the rotated corners and the
            hover spread have somewhere to go without being clipped. */}
        <span className="relative h-[4.5rem] w-32 shrink-0" aria-hidden>
          {teasers.map((media, i) => (
            <Image
              key={media.url}
              src={media.url}
              alt=""
              width={media.width}
              height={media.height}
              sizes="96px"
              className={`absolute top-3 left-4 h-12 w-[4.5rem] rounded-[3px] border border-[var(--rule)] bg-[var(--raised)] object-cover object-left-top shadow-[0_2px_8px_rgba(0,0,0,0.13)] transition-transform duration-200 ease-out ${STACK[i]}`}
            />
          ))}
        </span>

        <span className="font-mono text-xs tracking-[0.04em] text-[var(--muted)] transition-colors group-hover:text-[var(--accent)]">
          <span className="group-open:hidden">
            {count} screenshot{count === 1 ? '' : 's'}
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
