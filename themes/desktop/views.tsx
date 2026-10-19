import Image from 'next/image'
import Link from 'next/link'
import type {
  Experience,
  Media,
  Page,
  Post,
  Profile,
  Tech,
  Work,
} from '@/lib/models'
import { renderMarkdown } from '@/lib/markdown'
import { formatDate, workDateLine, workRoleLine } from '../clean/format'
import { resumeFilename } from '@/lib/resume'
import { WindowSection } from './Shell'
import { ContactForm } from './ContactForm'
import { Viewer } from './Viewer'
import { DocIcon, FolderIcon, PdfIcon, PersonIcon, MailIcon } from './icons'
import './apps.css'

/**
 * Desktop views: folders list files, files open as documents.
 *
 * Date formatting is shared with the clean theme because turning a Date into
 * "Jul 2025" is a locale decision, not a design one. Everything else here,
 * layout, chrome, hierarchy, is this theme's own.
 */

/**
 * A screenshot, framed as a preview pane.
 *
 * NOT the clean theme's Cover component. Sharing one would be the same mistake
 * the contact form made before it was split: a theme's whole job is to own its
 * own markup, and two themes that render identical chrome are one theme with a
 * different palette. This one sits in a window-coloured frame with a mono
 * filename strip, because in this metaphor an image is a file being previewed.
 *
 * width and height come straight from the media record so the browser reserves
 * the box before the bytes arrive and the document below does not jump.
 *
 * Used by POSTS only. Projects get Viewer instead, which is a window with a
 * filmstrip: a project has a set of screenshots to move through, a post has one
 * cover image sitting in a document.
 *
 * The clean theme renders that same post cover as a full-width cropped banner,
 * which is the bloggy answer. This is the file-manager answer: the image is an
 * attachment in a document, labelled with its filename, sized to itself rather
 * than stretched to the frame.
 */
function Preview({ media, name }: { media: Media; name: string }) {
  return (
    <figure className="mb-8 inline-block max-w-full overflow-hidden rounded-md border border-[var(--rule)] bg-[var(--window)] align-top">
      <div className="border-b border-[var(--rule)] bg-[var(--chrome)] px-3 py-1.5 font-mono text-[11px] text-[var(--muted)]">
        {name}
      </div>
      <Image
        src={media.url}
        alt={media.alt}
        width={media.width}
        height={media.height}
        sizes="(min-width: 640px) 24rem, 100vw"
        className="block h-auto max-h-56 w-auto max-w-[min(24rem,100%)]"
      />
      {media.caption && (
        <figcaption className="border-t border-[var(--rule)] px-3 py-1.5 font-mono text-[11px] text-[var(--faint)]">
          {media.caption}
        </figcaption>
      )}
    </figure>
  )
}

/* --------------------------------------------------------- file listing --- */

interface FileRow {
  href: string
  name: string
  title?: string
  kind: string
  modified: string
  icon: React.ComponentType<{ className?: string }>
}

/**
 * A file-manager list: icon, name, kind, modified. Every row is an anchor, so
 * the metaphor costs nothing in crawlability or keyboard access.
 *
 * Scales with content by construction. Add a fifth project and a fifth row
 * appears; nothing here knows how many there are.
 */
function FileList({ rows, empty }: { rows: FileRow[]; empty: string }) {
  if (rows.length === 0) {
    return (
      <p className="px-2 py-6 font-mono text-[12px] text-[var(--faint)]">
        {empty}
      </p>
    )
  }

  return (
    <div className="desktop-filelist">
      <div>
        <div className="desktop-file-columns">
          <span>Name</span>
          <span>Kind</span>
          <span>Date</span>
        </div>

        <ul>
          {rows.map((row) => {
            const Icon = row.icon
            return (
              <li key={row.href}>
                <Link href={row.href} className="desktop-file-row">
                  <span className="desktop-file-name">
                    <Icon />
                    <span>
                      <strong>{row.title ?? row.name}</strong>
                      {row.title && <small>{row.name}</small>}
                    </span>
                  </span>
                  <span className="truncate font-mono text-[11px] text-[var(--muted)]">
                    {row.kind}
                  </span>
                  <span className="tabular text-right font-mono text-[11px] text-[var(--faint)]">
                    {row.modified}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

/** The header strip an opened document carries: name, kind, dates. */
function FileHeader({
  name,
  meta,
  icon: Icon = DocIcon,
}: {
  name: string
  meta: string[]
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="mb-7 flex items-start gap-3 border-b border-[var(--rule)] pb-5">
      <Icon className="mt-0.5 h-8 w-8 shrink-0 text-[var(--accent)]" />
      <div className="min-w-0">
        <h1 className="[overflow-wrap:anywhere] text-xl font-medium tracking-[-0.02em]">
          {name}
        </h1>
        <p className="tabular mt-1 font-mono text-[11px] text-[var(--faint)]">
          {meta.filter(Boolean).join('  ·  ')}
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ home --- */

/** The shell is the desktop landing view; no folder opens automatically. */
export function Home() {
  return null
}

/* ------------------------------------------------------------------ work --- */

export function WorkIndex({ items }: { items: Work[] }) {
  return (
    <div className="pt-4">
      {/* The folder name IS the page heading here. It was a bare paragraph, so
          this view shipped without an h1. Same look, correct element. */}
      <header className="desktop-folder-heading">
        <FolderIcon />
        <div>
          <h1>Projects</h1>
          <p>
            {items.length} project{items.length === 1 ? '' : 's'} in this folder
          </p>
        </div>
      </header>
      <FileList
        empty="This folder is empty."
        rows={items.map((work) => ({
          href: `/work/${work.slug}`,
          name: `${work.slug}.md`,
          title: work.title,
          kind: work.kind,
          modified: formatDate(work.startDate, 'month'),
          icon: DocIcon,
        }))}
      />
    </div>
  )
}

export function WorkItem({
  work,
  tech,
  adjacent,
}: {
  work: Work
  tech: Tech[]
  adjacent?: { prev: Work | null; next: Work | null }
}) {
  const body = renderMarkdown(work.body)

  return (
    <article className="pt-4">
      <FileHeader
        name={`${work.slug}.md`}
        meta={[workDateLine(work), workRoleLine(work), work.lifecycle]}
      />

      <h2 className="mb-3 text-2xl font-medium tracking-[-0.02em]">
        {work.title}
      </h2>
      <p className="mb-7 max-w-[42rem] leading-relaxed text-[var(--muted)]">
        {work.summary}
      </p>

      {work.links.length > 0 && (
        <ul className="mb-9 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs">
          {work.links.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[var(--ink)] underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)]"
              >
                {link.label ?? link.kind} ↗
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* A viewer, not the single Preview pane the posts use. A project is a
          running application, so its screenshots are a set you look through;
          a post has one cover and that is a different object. */}
      <Viewer
        images={
          [work.coverImage, ...(work.gallery ?? [])].filter(Boolean) as Media[]
        }
        name={`${work.slug}/screenshots`}
      />

      {work.problem && (
        <WindowSection label="Why it exists">
          <p className="prose text-[var(--muted)]">{work.problem}</p>
        </WindowSection>
      )}
      {work.outcome && (
        <WindowSection label="Outcome">
          <p className="prose text-[var(--muted)]">{work.outcome}</p>
        </WindowSection>
      )}
      {body && (
        <div
          className="prose mb-10"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      )}

      {tech.length > 0 && (
        <WindowSection label="Built with">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-[var(--muted)]">
            {tech.map((t) => (
              <li key={t.slug}>{t.name}</li>
            ))}
          </ul>
        </WindowSection>
      )}

      {(adjacent?.prev || adjacent?.next) && (
        <nav
          aria-label="More work"
          className="mt-10 flex items-center justify-between gap-4 border-t border-[var(--rule)] pt-5 font-mono text-[11px]"
        >
          <span>
            {adjacent?.prev && (
              <Link
                href={`/work/${adjacent.prev.slug}`}
                className="text-[var(--muted)] hover:text-[var(--accent)]"
              >
                ← {adjacent.prev.slug}.md
              </Link>
            )}
          </span>
          <span>
            {adjacent?.next && (
              <Link
                href={`/work/${adjacent.next.slug}`}
                className="text-[var(--muted)] hover:text-[var(--accent)]"
              >
                {adjacent.next.slug}.md →
              </Link>
            )}
          </span>
        </nav>
      )}
    </article>
  )
}

/* ------------------------------------------------------------------ post --- */

export function PostIndex({ items }: { items: Post[] }) {
  return (
    <div className="pt-4">
      <header className="desktop-folder-heading">
        <FolderIcon />
        <div>
          <h1>Writing</h1>
          <p>
            {items.length} published document{items.length === 1 ? '' : 's'}
          </p>
        </div>
      </header>
      <FileList
        empty="This folder is empty. Nothing published yet."
        rows={items.map((post) => ({
          href: `/blog/${post.slug}`,
          name: `${post.slug}.md`,
          title: post.title,
          kind: 'post',
          modified: formatDate(post.publishedAt, 'month'),
          icon: DocIcon,
        }))}
      />
    </div>
  )
}

export function PostItem({ post }: { post: Post }) {
  return (
    <article className="pt-4">
      <FileHeader
        name={`${post.slug}.md`}
        meta={[
          formatDate(post.publishedAt, 'day'),
          post.readingMinutes ? `${post.readingMinutes} min` : '',
        ]}
      />
      <h2 className="mb-6 text-2xl font-medium tracking-[-0.02em]">
        {post.title}
      </h2>
      {post.coverImage && (
        <Preview media={post.coverImage} name={`${post.slug}.png`} />
      )}
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }}
      />
    </article>
  )
}

/* ----------------------------------------------------------------- about --- */

/**
 * Experience groupings for this theme.
 *
 * Deliberately duplicated rather than imported from the clean theme. The split
 * (work and co-op together, education apart) is the same editorial judgement,
 * but the labels are this theme's vocabulary, and one theme reaching into
 * another for a constant is how the two quietly become one theme again.
 */
const GROUPS: { label: string; sections: string[] }[] = [
  { label: 'Experience', sections: ['work', 'coop'] },
  { label: 'Education', sections: ['education'] },
]

export function About({
  profile,
  experience,
  tech,
}: {
  profile: Profile | null
  experience: Experience[]
  tech: Tech[]
}) {
  if (!profile) return null
  const top = tech.filter((t) => t.rank !== null)

  return (
    <div className="pt-4">
      <FileHeader
        name="about-me.md"
        meta={[profile.location.city, profile.headline]}
        icon={PersonIcon}
      />

      <div className="mb-10 flex flex-col gap-7 sm:flex-row sm:items-start">
        {profile.avatar && (
          <Image
            src={profile.avatar.url}
            alt={profile.avatar.alt}
            width={profile.avatar.width}
            height={profile.avatar.height}
            sizes="176px"
            className="aspect-square w-44 shrink-0 rounded-md border border-[var(--rule)] object-cover"
            style={{ objectPosition: '50% 22%' }}
          />
        )}
        <div>
          <p className="mb-4 text-[15px] leading-relaxed text-[var(--ink)]">
            {profile.bio.short}
          </p>
          {profile.bio.long && (
            <div
              className="prose"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(profile.bio.long),
              }}
            />
          )}
        </div>
      </div>

      {/* Grouped, for the same reason the clean theme groups: one list labelled
          "Experience" put a degree and a student award next to a job. The
          headings are this theme's own, lowercased to match its chrome. */}
      {GROUPS.map(({ label, sections }) => {
        const rows = experience.filter((e) => sections.includes(e.section))
        if (rows.length === 0) return null

        return (
          <WindowSection key={label} label={label}>
            <ul className="flex flex-col gap-5">
              {rows.map((entry) => (
                <li
                  key={entry.slug}
                  className="grid grid-cols-1 items-baseline gap-x-8 gap-y-1 sm:grid-cols-[minmax(0,1fr)_8rem]"
                >
                  <span className="font-medium">{entry.role}</span>
                  <span className="tabular font-mono text-[11px] text-[var(--faint)] sm:text-right">
                    {entry.current
                      ? 'current'
                      : formatDate(entry.endDate, 'year')}
                  </span>
                  <span className="text-sm text-[var(--muted)]">
                    {entry.org}
                  </span>
                  {entry.summary && (
                    <span className="max-w-[40rem] text-sm text-[var(--faint)] sm:col-start-1">
                      {entry.summary}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </WindowSection>
        )
      })}

      {/* Listed in this theme's vocabulary: lowercased mono entries in a window
          section, not the clean theme's typographic rows. Same facts, and no
          shared markup, which is the whole reason there are two themes. */}
      {profile.interests.length > 0 && (
        <WindowSection label="Outside work">
          <ul className="flex flex-col gap-2.5">
            {profile.interests.map((interest) => (
              <li
                key={interest.name}
                className="flex flex-wrap items-baseline gap-x-3 text-[13px]"
              >
                <span className="font-mono text-[var(--ink)]">
                  {interest.url ? (
                    <a
                      href={interest.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)]"
                    >
                      {interest.name.toLowerCase()}
                    </a>
                  ) : (
                    interest.name.toLowerCase()
                  )}
                </span>
                {interest.note && (
                  <span className="text-[var(--muted)]">{interest.note}</span>
                )}
              </li>
            ))}
          </ul>
        </WindowSection>
      )}

      {top.length > 0 && (
        <WindowSection label="What I work with">
          <ul className="flex flex-col gap-4">
            {top.map((t) => (
              <li
                key={t.slug}
                className="grid grid-cols-1 items-baseline gap-x-8 gap-y-1 sm:grid-cols-[8rem_minmax(0,1fr)]"
              >
                <span className="font-medium">{t.name}</span>
                <span className="max-w-[42rem] text-sm text-[var(--muted)]">
                  {t.note}
                </span>
              </li>
            ))}
          </ul>
        </WindowSection>
      )}

      <div className="mt-8 border-t border-[var(--rule)] pt-5">
        <a
          href={profile.resumeUrl}
          download={resumeFilename(profile.name)}
          className="inline-flex items-center gap-2 font-mono text-[11px] text-[var(--muted)] hover:text-[var(--accent)]"
        >
          <PdfIcon className="h-4 w-4" />
          resume.pdf
        </a>
      </div>
    </div>
  )
}

/* ------------------------------------------------------- page and contact --- */

export function PageView({ page }: { page: Page }) {
  return (
    <article className="pt-4">
      <FileHeader name={`${page.slug}.md`} meta={[page.title]} />
      {page.body && (
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(page.body) }}
        />
      )}
      {page.sections.map((s) => (
        <WindowSection key={s.heading} label={s.heading}>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(s.body) }}
          />
        </WindowSection>
      ))}
    </article>
  )
}

/** Contact details sit beside the composer when the window has room. */
export function Contact({ profile }: { profile: Profile | null }) {
  if (!profile) return null
  const emailLink = profile.links.find((link) => link.kind === 'email')
  const email =
    emailLink?.handle ?? emailLink?.url.replace(/^mailto:/, '') ?? ''
  return (
    <section className="desktop-mail-app">
      <header className="desktop-folder-heading">
        <MailIcon />
        <div>
          <h1>Mail</h1>
          <p>Compose a message to {profile.name}</p>
        </div>
      </header>
      <div className="desktop-mail-layout">
        <ContactForm toName={profile.name} toEmail={email} />
        <aside className="desktop-contact-card" aria-label="Contact card">
          <h2>{profile.name}</h2>
          <p>{profile.headline}</p>
          <dl className="desktop-contact-details">
            <div>
              <dt>Location</dt>
              <dd>
                {[profile.location.city, profile.location.region]
                  .filter(Boolean)
                  .join(', ')}
              </dd>
            </div>
            {profile.links
              .filter((link) => link.visible)
              .map((link) => (
                <div key={link.url}>
                  <dt>{link.label || link.kind}</dt>
                  <dd>
                    <a
                      className={
                        link.kind === 'email'
                          ? 'desktop-contact-email'
                          : undefined
                      }
                      href={link.url}
                      target={
                        link.url.startsWith('http') ? '_blank' : undefined
                      }
                      rel="noreferrer noopener"
                      download={
                        link.kind === 'resume'
                          ? resumeFilename(profile.name)
                          : undefined
                      }
                    >
                      {link.handle ||
                        (link.kind === 'email'
                          ? link.url.replace(/^mailto:/, '')
                          : link.kind === 'resume'
                            ? 'Download PDF'
                            : link.url)}
                    </a>
                  </dd>
                </div>
              ))}
          </dl>
        </aside>
      </div>
    </section>
  )
}
