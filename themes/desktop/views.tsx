import Image from 'next/image'
import Link from 'next/link'
import type { Experience, Page, Post, Profile, Tech, Work } from '@/lib/models'
import { renderMarkdown } from '@/lib/markdown'
import { formatDate, workDateLine, workRoleLine } from '../clean/format'
import { WindowSection } from './Shell'
import { ContactForm } from './ContactForm'

/**
 * Desktop views.
 *
 * Formatting helpers are shared with the clean theme because turning a Date
 * into "Jul 2025 → now" is not a design decision, it is a locale decision.
 * Layout, chrome and hierarchy are entirely this theme's own.
 */

/* ------------------------------------------------------------------ home --- */

/**
 * The desktop is not empty. The strongest criticism of OS-simulation
 * portfolios is that the interface becomes the artifact and the person
 * disappears, so the work is listed here in plain sight rather than hidden one
 * click deep behind a dock icon.
 */
export function Home({ work, profile }: { work: Work[]; profile: Profile | null }) {
  return (
    <div className="rounded-lg border border-[var(--rule)] bg-[var(--window)]/80 p-5 backdrop-blur-sm sm:p-7">
      <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--faint)]">
        Recent work
      </p>
      <ul className="flex flex-col gap-4">
        {work.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/work/${item.slug}`}
              className="group grid grid-cols-1 items-baseline gap-x-6 gap-y-0.5 sm:grid-cols-[minmax(0,1fr)_7rem]"
            >
              <span className="font-medium transition-colors group-hover:text-[var(--accent)]">
                {item.title}
              </span>
              <span className="tabular font-mono text-[11px] text-[var(--faint)] sm:text-right">
                {workDateLine(item)}
              </span>
              <span className="max-w-[46rem] text-sm text-[var(--muted)]">{item.summary}</span>
            </Link>
          </li>
        ))}
      </ul>

      {profile && (
        <p className="mt-6 border-t border-[var(--rule)] pt-4 font-mono text-[11px] text-[var(--faint)]">
          {profile.location.city}, {profile.location.region} · open a window from the dock
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ work --- */

export function WorkIndex({ items }: { items: Work[] }) {
  return (
    <WindowSection label="Work">
      <ul className="flex flex-col gap-8">
        {items.map((work) => (
          <li key={work.slug}>
            <Link
              href={`/work/${work.slug}`}
              className="group grid grid-cols-1 items-baseline gap-x-8 gap-y-1.5 sm:grid-cols-[minmax(0,1fr)_9rem]"
            >
              <span className="text-lg font-medium transition-colors group-hover:text-[var(--accent)]">
                {work.title}
              </span>
              <span className="tabular font-mono text-[11px] text-[var(--faint)] sm:text-right">
                {workDateLine(work)} · {workRoleLine(work)}
              </span>
              <p className="max-w-[42rem] text-sm leading-relaxed text-[var(--muted)]">
                {work.summary}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </WindowSection>
  )
}

export function WorkItem({ work, tech }: { work: Work; tech: Tech[] }) {
  const body = renderMarkdown(work.body)

  return (
    <article className="pt-6">
      <p className="tabular mb-3 font-mono text-[11px] text-[var(--faint)]">
        {workDateLine(work)} · {workRoleLine(work)}
      </p>
      <h1 className="mb-5 text-3xl font-medium leading-tight tracking-[-0.03em]">{work.title}</h1>
      <p className="mb-8 max-w-[42rem] leading-relaxed text-[var(--muted)]">{work.summary}</p>

      {work.links.length > 0 && (
        <ul className="mb-10 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs">
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

      <Link href="/work" className="font-mono text-xs text-[var(--muted)] hover:text-[var(--accent)]">
        ← all work
      </Link>
    </article>
  )
}

/* ------------------------------------------------------------------ post --- */

export function PostIndex({ items }: { items: Post[] }) {
  if (items.length === 0) {
    return (
      <WindowSection label="Writing">
        <p className="font-mono text-xs text-[var(--faint)]">Nothing published yet.</p>
      </WindowSection>
    )
  }

  return (
    <WindowSection label="Writing">
      <ul className="flex flex-col gap-6">
        {items.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group grid grid-cols-1 items-baseline gap-x-8 gap-y-1 sm:grid-cols-[minmax(0,1fr)_7rem]"
            >
              <span className="font-medium transition-colors group-hover:text-[var(--accent)]">
                {post.title}
              </span>
              <span className="tabular font-mono text-[11px] text-[var(--faint)] sm:text-right">
                {formatDate(post.publishedAt, 'month')}
              </span>
              {post.excerpt && (
                <p className="max-w-[42rem] text-sm text-[var(--muted)]">{post.excerpt}</p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </WindowSection>
  )
}

export function PostItem({ post }: { post: Post }) {
  return (
    <article className="pt-6">
      <p className="tabular mb-3 font-mono text-[11px] text-[var(--faint)]">
        {formatDate(post.publishedAt, 'day')}
        {post.readingMinutes ? ` · ${post.readingMinutes} min` : ''}
      </p>
      <h1 className="mb-8 text-3xl font-medium leading-tight tracking-[-0.03em]">{post.title}</h1>
      <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
      <div className="mt-12">
        <Link href="/blog" className="font-mono text-xs text-[var(--muted)] hover:text-[var(--accent)]">
          ← all writing
        </Link>
      </div>
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
    <div className="pt-6">
      <div className="mb-12 flex flex-col gap-8 sm:flex-row sm:items-start">
        {profile.avatar && (
          <Image
            src={profile.avatar.url}
            alt={profile.avatar.alt}
            width={profile.avatar.width}
            height={profile.avatar.height}
            sizes="180px"
            className="aspect-square w-44 shrink-0 rounded-md object-cover"
            style={{ objectPosition: '50% 22%' }}
          />
        )}
        <div>
          <h1 className="mb-4 text-2xl font-medium leading-snug tracking-[-0.02em]">
            {profile.bio.short}
          </h1>
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
          <ul className="flex flex-col gap-6">
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
          <ul className="flex flex-col gap-5">
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
    </div>
  )
}

/* ------------------------------------------------------- page and contact --- */

export function PageView({ page }: { page: Page }) {
  return (
    <article className="pt-6">
      <h1 className="mb-6 text-3xl font-medium leading-tight tracking-[-0.03em]">{page.title}</h1>
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

export function Contact({ profile }: { profile: Profile | null }) {
  if (!profile) return null

  return (
    <div className="pt-6">
      <h1 className="mb-6 text-3xl font-medium tracking-[-0.03em]">Contact</h1>
      <p className="prose mb-8 text-[var(--muted)]">
        Send a message here, or use any of the links below. I read everything.
      </p>
      <div className="mb-12">
        <ContactForm />
      </div>
      <ul className="flex flex-col gap-3">
        {profile.links
          .filter((l) => l.visible)
          .map((link) => (
            <li
              key={link.url}
              className="grid grid-cols-1 items-baseline gap-x-6 sm:grid-cols-[6rem_minmax(0,1fr)]"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--faint)]">
                {link.kind}
              </span>
              <a
                href={link.url}
                target={link.url.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer noopener"
                className="underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)]"
              >
                {link.handle ?? link.label ?? link.url}
              </a>
            </li>
          ))}
      </ul>
    </div>
  )
}
