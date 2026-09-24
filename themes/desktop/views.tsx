import Image from 'next/image'
import Link from 'next/link'
import type { Experience, Media, Page, Post, Profile, Tech, Work } from '@/lib/models'
import { renderMarkdown } from '@/lib/markdown'
import { formatDate, workDateLine, workRoleLine } from '../clean/format'
import { WindowSection } from './Shell'
import { ContactForm } from './ContactForm'
import { DocIcon, PdfIcon, PersonIcon } from './icons'

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
 * Height-capped for the same reason as the clean theme's Cover: a screenshot at
 * full width is a hero, and this is meant to be a preview sitting inside a
 * document, not the point of the page. The frame shrinks to the image rather
 * than the image stretching to the frame, which is also how a real preview pane
 * behaves.
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
    return <p className="px-2 py-6 font-mono text-[12px] text-[var(--faint)]">{empty}</p>
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[30rem]">
        <div className="grid grid-cols-[minmax(0,1fr)_7rem_7rem] gap-4 border-b border-[var(--rule)] px-2 pb-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--faint)]">
          <span>Name</span>
          <span>Kind</span>
          <span className="text-right">Modified</span>
        </div>

        <ul>
          {rows.map((row) => {
            const Icon = row.icon
            return (
              <li key={row.href}>
                <Link
                  href={row.href}
                  className="grid grid-cols-[minmax(0,1fr)_7rem_7rem] items-center gap-4 rounded px-2 py-2 text-[13px] hover:bg-[var(--selection)]"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <span className="truncate text-[var(--ink)]">{row.name}</span>
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
        <h1 className="truncate text-xl font-medium tracking-[-0.02em]">{name}</h1>
        <p className="tabular mt-1 font-mono text-[11px] text-[var(--faint)]">
          {meta.filter(Boolean).join('  ·  ')}
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ home --- */

/**
 * The desktop is not empty. The strongest criticism of OS-simulation
 * portfolios is that the interface becomes the artifact and the person
 * disappears, so recent work sits in plain sight rather than one click deep.
 */
export function Home({
  work,
  profile,
  experience,
}: {
  work: Work[]
  profile: Profile | null
  experience?: Experience[]
}) {
  const roles = (experience ?? []).filter((e) => e.section === 'work' || e.section === 'coop')
  return (
    <div className="rounded-lg border border-[var(--rule)] bg-[var(--window)]/80 p-4 backdrop-blur-sm sm:p-5">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--faint)]">
        Recent work
      </p>
      <FileList
        empty="Empty folder."
        rows={work.map((item) => ({
          href: `/work/${item.slug}`,
          name: `${item.slug}.md`,
          kind: item.kind,
          modified: formatDate(item.startDate, 'month'),
          icon: DocIcon,
        }))}
      />
      {roles.length > 0 && (
        <div className="mt-4 border-t border-[var(--rule)] pt-3">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--faint)]">
            Currently
          </p>
          <ul className="flex flex-col gap-1.5">
            {roles.map((e) => (
              <li key={e.slug} className="flex flex-wrap items-baseline gap-x-2 text-[13px]">
                <span className="text-[var(--ink)]">{e.role}</span>
                <span className="text-[var(--muted)]">{e.org}</span>
                <span className="tabular font-mono text-[11px] text-[var(--faint)]">
                  {e.current ? `${formatDate(e.startDate, 'month')} to now` : formatDate(e.endDate, 'year')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {profile && (
        <p className="mt-4 border-t border-[var(--rule)] pt-3 font-mono text-[11px] text-[var(--faint)]">
          <a href={profile.resumeUrl} download className="hover:text-[var(--accent)]">
            resume.pdf
          </a>
          {' · '}
          {work.length} item{work.length === 1 ? '' : 's'}
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ work --- */

export function WorkIndex({ items }: { items: Work[] }) {
  return (
    <div className="pt-4">
      <p className="mb-4 font-mono text-[11px] text-[var(--muted)]">
        {items.length} item{items.length === 1 ? '' : 's'}
      </p>
      <FileList
        empty="This folder is empty."
        rows={items.map((work) => ({
          href: `/work/${work.slug}`,
          name: `${work.slug}.md`,
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

      <h2 className="mb-3 text-2xl font-medium tracking-[-0.02em]">{work.title}</h2>
      <p className="mb-7 max-w-[42rem] leading-relaxed text-[var(--muted)]">{work.summary}</p>

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

      {work.coverImage && <Preview media={work.coverImage} name={`${work.slug}.png`} />}

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
      {body && <div className="prose mb-10" dangerouslySetInnerHTML={{ __html: body }} />}

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
      <p className="mb-4 font-mono text-[11px] text-[var(--muted)]">
        {items.length} item{items.length === 1 ? '' : 's'}
      </p>
      <FileList
        empty="This folder is empty. Nothing published yet."
        rows={items.map((post) => ({
          href: `/blog/${post.slug}`,
          name: `${post.slug}.md`,
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
      <h2 className="mb-6 text-2xl font-medium tracking-[-0.02em]">{post.title}</h2>
      {post.coverImage && <Preview media={post.coverImage} name={`${post.slug}.png`} />}
      <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
    </article>
  )
}

/* ----------------------------------------------------------------- about --- */

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
        name="about-me.txt"
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
          <p className="mb-4 text-[15px] leading-relaxed text-[var(--ink)]">{profile.bio.short}</p>
          {profile.bio.long && (
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(profile.bio.long) }}
            />
          )}
        </div>
      </div>

      {experience.length > 0 && (
        <WindowSection label="Experience">
          <ul className="flex flex-col gap-5">
            {experience.map((entry) => (
              <li
                key={entry.slug}
                className="grid grid-cols-1 items-baseline gap-x-8 gap-y-1 sm:grid-cols-[minmax(0,1fr)_8rem]"
              >
                <span className="font-medium">{entry.role}</span>
                <span className="tabular font-mono text-[11px] text-[var(--faint)] sm:text-right">
                  {entry.current ? 'current' : formatDate(entry.endDate, 'year')}
                </span>
                <span className="text-sm text-[var(--muted)]">{entry.org}</span>
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
                <span className="max-w-[42rem] text-sm text-[var(--muted)]">{t.note}</span>
              </li>
            ))}
          </ul>
        </WindowSection>
      )}

      <div className="mt-8 border-t border-[var(--rule)] pt-5">
        <a
          href={profile.resumeUrl}
          download
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
      <FileHeader name={`${page.slug}.txt`} meta={[page.title]} />
      {page.body && (
        <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(page.body) }} />
      )}
      {page.sections.map((s) => (
        <WindowSection key={s.heading} label={s.heading}>
          <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(s.body) }} />
        </WindowSection>
      ))}
    </article>
  )
}

/**
 * Contact, as a mail client: composer on the left, contact card on the right.
 *
 * The card is a real <details>. On mobile it starts collapsed behind a
 * "Contact card" row, so the composer is the first thing you see. From the sm
 * breakpoint up, CSS hides the summary and forces the panel visible regardless
 * of open state, which gives a permanently-docked sidebar without duplicating
 * the markup or needing JavaScript.
 */
export function Contact({ profile }: { profile: Profile | null }) {
  if (!profile) return null

  const email =
    profile.links.find((l) => l.kind === 'email')?.handle ?? 'emanuelmolla@outlook.com'
  const visible = profile.links.filter((l) => l.visible)

  return (
    <div className="pt-4">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <ContactForm toName={profile.name} toEmail={email} />
        </div>

        <details
          open
          className="group shrink-0 overflow-hidden rounded-md border border-[var(--rule)] bg-[var(--window)] lg:w-[17rem] [&[open]_summary_svg]:rotate-180 sm:[&>div]:!block sm:[&>summary]:hidden"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 border-b border-[var(--rule)] bg-[var(--chrome)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] [&::-webkit-details-marker]:hidden">
            Contact card
            <svg width="9" height="9" viewBox="0 0 8 8" fill="none" aria-hidden className="transition-transform">
              <path d="M1 2.5 4 5.5 7 2.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </summary>

          <div>
            <div className="hidden border-b border-[var(--rule)] bg-[var(--chrome)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] sm:block">
              Contact card
            </div>

            <div className="flex items-center gap-3 border-b border-[var(--rule)] px-4 py-4">
              {profile.avatar && (
                <Image
                  src={profile.avatar.url}
                  alt={profile.avatar.alt}
                  width={profile.avatar.width}
                  height={profile.avatar.height}
                  sizes="48px"
                  className="h-12 w-12 shrink-0 rounded-full object-cover"
                  style={{ objectPosition: '50% 22%' }}
                />
              )}
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-[var(--ink)]">
                  {profile.name}
                </p>
                <p className="truncate text-[12px] text-[var(--muted)]">{profile.headline}</p>
              </div>
            </div>

            <ul className="flex flex-col py-1">
              {visible.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target={link.url.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer noopener"
                    download={link.kind === 'resume' ? true : undefined}
                    className="flex items-baseline gap-3 px-4 py-2 text-[13px] hover:bg-[var(--selection)]"
                  >
                    <span className="w-[4.25rem] shrink-0 font-mono text-[11px] text-[var(--faint)]">
                      {link.kind}
                    </span>
                    <span className="truncate text-[var(--muted)]">
                      {link.handle ?? link.label ?? link.url}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <p className="border-t border-[var(--rule)] px-4 py-2.5 font-mono text-[11px] text-[var(--faint)]">
              {profile.location.city}, {profile.location.region}
            </p>
          </div>
        </details>
      </div>
    </div>
  )
}
