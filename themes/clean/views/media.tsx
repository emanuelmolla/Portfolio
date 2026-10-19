import Image from 'next/image'
import type { Media } from '@/lib/models'

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
        <figcaption className="mt-3 text-sm text-[var(--muted)]">
          {media.caption}
        </figcaption>
      )}
    </figure>
  )
}

function ProjectImage({ media }: { media: Media }) {
  return (
    <figure className="clean-project-cover">
      <Image
        src={media.url}
        alt={media.alt}
        width={media.width}
        height={media.height}
        sizes="(min-width: 1024px) 960px, calc(100vw - 48px)"
      />
      {media.caption && <figcaption>{media.caption}</figcaption>}
    </figure>
  )
}

/** Show the actual application immediately; extra images use native disclosure. */
export function Screenshots({ images }: { images: Media[] }) {
  const unique = images.filter(
    (image, index) =>
      images.findIndex((other) => other.url === image.url) === index
  )
  const [lead, ...rest] = unique
  if (!lead) return null

  return (
    <div className="mb-12">
      <ProjectImage media={lead} />
      {rest.length > 0 && (
        <details className="clean-gallery">
          <summary>More screenshots ({rest.length})</summary>
          {rest.map((media) => (
            <ProjectImage key={media.url} media={media} />
          ))}
        </details>
      )}
    </div>
  )
}
