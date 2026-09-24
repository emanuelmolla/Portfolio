import Link from 'next/link'
import type { Media, Tech, Work } from '@/lib/models'
import { renderMarkdown } from '@/lib/markdown'
import { SectionLabel } from '../Shell'
import { Walkthrough } from './media'
import { workDateLine, workRoleLine } from '../format'

/**
 * Work as a typographic index, not a card grid.
 *
 * Two reasons this is a list. Rows are separated by space rather than hairline
 * rules, and there is no 01/02/03 numbering, because these projects are not a
 * sequence and numbering that is not ordinal is decoration dressed up as
 * structure.
 *
 * A third reason used to be stated here and was wrong: that the work is mostly
 * backend so a card grid would want screenshots of UI that does not exist. There
 * are screenshots for every project. They are on the detail pages, which is where
 * a full-width screenshot belongs; whether the index should carry thumbnails as
 * well is a separate design call, not a fact about the data.
 */

export function WorkSummary({ work }: { work: Work }) {
  return (
    <Link
      href={`/work/${work.slug}`}
      className="group grid grid-cols-1 items-baseline gap-x-8 gap-y-2 sm:grid-cols-[minmax(0,1fr)_10rem]"
    >
      <span className="text-xl font-medium tracking-[-0.015em] transition-colors group-hover:text-[var(--accent)]">
        {work.title}
      </span>

      {/* Date alone in the right column, and nowrap.
          It previously carried "date · role" in an 8rem column, which wrapped
          to two lines on anything with a longer range. Dates in a column only
          read as a column if they all sit on one line; the role moved down to
          the meta row where it has the full width. */}
      <span className="tabular whitespace-nowrap font-mono text-xs text-[var(--faint)] sm:text-right">
        {workDateLine(work)}
      </span>

      <p className="max-w-[34rem] text-[15px] leading-relaxed text-[var(--muted)] sm:col-span-1">
        {work.summary}
      </p>

      <ul className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[11px] text-[var(--faint)] sm:col-span-2">
        <li className="text-[var(--muted)]">{workRoleLine(work)}</li>
        {work.details?.kind === 'software' &&
          work.details.stack.slice(0, 5).map((item) => (
            <li key={item} className="before:mr-3 before:content-['·']">
              {item.toLowerCase()}
            </li>
          ))}
      </ul>
    </Link>
  )
}

export function WorkIndex({ items, heading }: { items: Work[]; heading?: string }) {
  return (
    <section className="pt-20 pb-22">
      <SectionLabel as="h1">{heading ?? 'Work'}</SectionLabel>

      {items.length === 0 ? (
        <p className="max-w-[34rem] text-[15px] text-[var(--muted)]">Nothing here yet.</p>
      ) : (
        <div className="flex flex-col gap-11">
          {items.map((work) => (
            <WorkSummary key={work.slug} work={work} />
          ))}
        </div>
      )}
    </section>
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
    <article className="pt-20 pb-8">
      <p className="tabular mb-5 font-mono text-xs text-[var(--faint)]">
        {workDateLine(work)} · {workRoleLine(work)}
        {work.teamSize ? ` · team of ${work.teamSize}` : ''}
      </p>

      <h1 className="mb-6 max-w-[20ch] text-4xl font-medium leading-[1.08] tracking-[-0.035em] text-balance sm:text-5xl">
        {work.title}
      </h1>

      <p className="prose mb-10 text-[17px] leading-relaxed text-[var(--muted)]">
        {work.summary}
      </p>

      {work.links.length > 0 && (
        <ul className="mb-14 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs">
          {work.links.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[var(--ink)] underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
              >
                {link.label ?? link.kind} ↗
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* After the summary and links: what it is, then what it does. The cover
          leads the sequence, so it is prepended rather than shown separately. */}
      <Walkthrough images={[work.coverImage, ...(work.gallery ?? [])].filter(Boolean) as Media[]} />

      {/* Rendered only when written. An empty "Problem" heading is worse than
          no heading, and inventing one would be worse still. */}
      {work.problem && (
        <section className="mb-12">
          <SectionLabel>Why it exists</SectionLabel>
          <p className="prose text-[var(--muted)]">{work.problem}</p>
        </section>
      )}

      {work.outcome && (
        <section className="mb-12">
          <SectionLabel>Outcome</SectionLabel>
          <p className="prose text-[var(--muted)]">{work.outcome}</p>
        </section>
      )}

      {body && (
        <div className="prose mb-12" dangerouslySetInnerHTML={{ __html: body }} />
      )}

      {tech.length > 0 && (
        <section className="mb-12">
          <SectionLabel>Built with</SectionLabel>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-[var(--muted)]">
            {tech.map((t) => (
              <li key={t.slug}>{t.name}</li>
            ))}
          </ul>
        </section>
      )}

      {work.details?.kind === 'software' && work.details.architectureNotes && (
        <section className="mb-12">
          <SectionLabel>How it is put together</SectionLabel>
          <div
            className="prose"
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(work.details.architectureNotes),
            }}
          />
        </section>
      )}

      {/* Neighbours, so a reader who finishes one project has somewhere to go
          other than back. No wrap-around at the ends: a "next" that loops to
          the first item hides the fact that they have seen everything. */}
      {(adjacent?.prev || adjacent?.next) && (
        <nav
          aria-label="More work"
          className="mt-16 grid grid-cols-1 gap-6 border-t border-[var(--rule)] pt-8 sm:grid-cols-2"
        >
          <div>
            {adjacent?.prev && (
              <Link href={`/work/${adjacent.prev.slug}`} className="group block">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--faint)]">
                  Previous
                </span>
                <span className="mt-1 block font-medium transition-colors group-hover:text-[var(--accent)]">
                  {adjacent.prev.title}
                </span>
              </Link>
            )}
          </div>
          <div className="sm:text-right">
            {adjacent?.next && (
              <Link href={`/work/${adjacent.next.slug}`} className="group block">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--faint)]">
                  Next
                </span>
                <span className="mt-1 block font-medium transition-colors group-hover:text-[var(--accent)]">
                  {adjacent.next.title}
                </span>
              </Link>
            )}
          </div>
        </nav>
      )}

      <div className="mt-10">
        <Link
          href="/work"
          className="font-mono text-xs text-[var(--muted)] hover:text-[var(--accent)]"
        >
          ← all work
        </Link>
      </div>
    </article>
  )
}
