import Image from 'next/image'
import Link from 'next/link'
import type { Experience, Page, Post, Profile, Tech, Work } from '@/lib/models'
import { renderMarkdown } from '@/lib/markdown'
import { SectionLabel } from '../Shell'
import { resumeFilename } from '@/lib/resume'
import { formatDate } from '../format'
import { WorkSummary } from './work'
import { PostSummary } from './post'
import { ContactForm } from './ContactForm'

/* ------------------------------------------------------------------ home --- */

/**
 * How Experience rows are grouped on /about.
 *
 * Work and co-op share a heading because a co-op term is a job; splitting them
 * would say more about BCIT's paperwork than about the work. Awards and
 * certificates are deliberately absent: the one award here is already a project
 * and a post, and listing it a third time under its own heading would be the
 * same duplication in a nicer wrapper. Add a group here when there is something
 * real to put in it.
 */
const GROUPS: { heading: string; sections: string[] }[] = [
  { heading: 'Experience', sections: ['work', 'coop'] },
  { heading: 'Education', sections: ['education'] },
]

export function Home({
  profile,
  work,
  posts,
  experience,
}: {
  profile: Profile | null
  work: Work[]
  posts: Post[]
  experience?: Experience[]
}) {
  if (!profile) return null

  const roles = (experience ?? []).filter((e) => e.section === 'work' || e.section === 'coop')

  // Split off the first word rather than trusting givenName/familyName to be
  // filled in. The name is the one field guaranteed to exist.
  const [given, ...rest] = profile.name.split(' ')
  const family = rest.join(' ')

  return (
    <>
      <section className="pt-24 pb-20">
        {/*
          THE NAME IS THE H1, not the headline.

          It used to be the headline, which meant the largest text on the site and
          its single strongest relevance signal both read "Backend developer": a
          job title shared with a million people and attached to nobody. Driver #1
          of this rebuild was being machine-readable as a specific person, and an
          h1 with no name in it works directly against that.

          It is also the plainer human answer. Someone who lands here should leave
          able to say whose site it was.
        */}
        {/*
          Set in the display face rather than the body sans. A name typed in the
          same grotesque as the paragraph under it is not a wordmark, it is just
          large text, which is what made the first version of this look flat.

          The family name takes the muted tone. It is the quietest way to give a
          two-word name some shape without reaching for a second colour, and it
          puts the emphasis on the half people actually say.
        */}
        <h1 className="wordmark mb-3 text-[clamp(2.75rem,7.5vw,4.5rem)] leading-[1.0] tracking-[-0.02em]">
          <span className="text-[var(--ink)]">{given}</span>
          {family && <span className="text-[var(--faint)]"> {family}</span>}
        </h1>

        <p className="mb-7 max-w-[24ch] text-[clamp(1.25rem,3vw,1.625rem)] leading-[1.2] tracking-[-0.025em] text-balance text-[var(--muted)]">
          {profile.headline}
        </p>

        <p className="max-w-[34rem] text-[17px] leading-relaxed text-[var(--muted)]">
          {profile.bio.short}
        </p>

        {/* Resume up front, as a real call to action.
            53.3% of job-seeker portfolios expose a resume and recruiters' own
            systems still want the PDF, so burying it in a footer link costs
            something for no benefit. It is the only filled control on the page,
            which is what makes it read as the primary action without needing a
            colour to shout. */}
        <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
          <a
            href={profile.resumeUrl}
            download={resumeFilename(profile.name)}
            className="inline-flex items-center gap-2.5 border border-[var(--ink)] bg-[var(--ink)] px-5 py-2.5 font-mono text-xs tracking-[0.04em] text-[var(--ground)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)]"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M7 1v9M3.5 6.5 7 10l3.5-3.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M1.5 12.5h11" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            Download resume
          </a>

          <Link
            href="/contact"
            className="font-mono text-xs tracking-[0.04em] text-[var(--muted)] underline decoration-[var(--rule)] underline-offset-[6px] hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
          >
            get in touch
          </Link>
        </div>

        {profile.availability.status !== 'not-looking' && (
          <p className="mt-8 inline-flex items-center gap-2 font-mono text-xs tracking-[0.03em] text-[var(--muted)]">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            {profile.availability.note ??
              (profile.availability.status === 'open'
                ? 'Open to new roles'
                : 'Open to the right role')}
          </p>
        )}
      </section>

      {/* Where he works, above the projects. A current role is the single
          fastest answer to "is this person actually employed doing this", and
          it was previously only reachable on /about. */}
      {roles.length > 0 && (
        <section className="pb-20">
          <SectionLabel>Experience</SectionLabel>
          <div className="flex flex-col gap-6">
            {roles.map((entry) => (
              <div
                key={entry.slug}
                className="grid grid-cols-1 items-baseline gap-x-8 gap-y-1 sm:grid-cols-[minmax(0,1fr)_10rem]"
              >
                <span className="text-[17px] font-medium">{entry.role}</span>
                <span className="tabular whitespace-nowrap font-mono text-xs text-[var(--faint)] sm:text-right">
                  {entry.current
                    ? `${formatDate(entry.startDate, 'month')} to now`
                    : [formatDate(entry.startDate, 'month'), formatDate(entry.endDate, 'month')]
                        .filter(Boolean)
                        .join(' to ')}
                </span>
                <span className="text-[15px] text-[var(--muted)]">
                  {entry.org}
                  {entry.employmentType ? ` · ${entry.employmentType}` : ''}
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/about"
            className="mt-8 inline-block font-mono text-xs text-[var(--muted)] hover:text-[var(--accent)]"
          >
            more about me →
          </Link>
        </section>
      )}

      {work.length > 0 && (
        <section className="pb-20">
          <SectionLabel>Selected work</SectionLabel>
          <div className="flex flex-col gap-11">
            {work.map((item) => (
              <WorkSummary key={item.slug} work={item} />
            ))}
          </div>
          <Link
            href="/work"
            className="mt-10 inline-block font-mono text-xs text-[var(--muted)] hover:text-[var(--accent)]"
          >
            all work →
          </Link>
        </section>
      )}

      {posts.length > 0 && (
        <section className="pb-20">
          <SectionLabel>Selected writing</SectionLabel>
          <div className="flex flex-col gap-7">
            {posts.map((post) => (
              <PostSummary key={post.slug} post={post} />
            ))}
          </div>
          <Link
            href="/blog"
            className="mt-10 inline-block font-mono text-xs text-[var(--muted)] hover:text-[var(--accent)]"
          >
            all writing →
          </Link>
        </section>
      )}
    </>
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
  const rest = tech.filter((t) => t.rank === null)

  return (
    <div className="pt-20 pb-8">
      <div className="mb-18 grid grid-cols-1 items-start gap-14 sm:grid-cols-[15rem_minmax(0,1fr)]">
        {profile.avatar && (
          <div>
            {/*
              One portrait, on this page only, never in the hero. A hero
              portrait is the bootcamp-template signal, and the hero's job is
              the headline: that is the first thing a hiring manager reads.
            */}
            <Image
              src={profile.avatar.url}
              alt={profile.avatar.alt}
              width={profile.avatar.width}
              height={profile.avatar.height}
              sizes="240px"
              className="aspect-square w-full object-cover"
              style={{ objectPosition: '50% 22%' }}
              priority
            />
          </div>
        )}

        <div>
          <h1 className="mb-6 text-3xl font-medium leading-[1.15] tracking-[-0.03em] text-balance sm:text-4xl">
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

      {/*
        Grouped by section, not dumped into one list.

        This used to render every Experience row under a single "Experience"
        heading, which is how an award for a student project ended up sitting
        between a job and a degree. The `section` discriminator exists precisely
        so these are different things; ignoring it and labelling the result
        "Experience" made the label a lie.

        Only non-empty groups render, and they come out in GROUPS order rather
        than data order, so a new entry lands under the right heading on its own
        instead of wherever the sort happened to put it.
      */}
      {GROUPS.map(({ heading, sections }) => {
        const rows = experience.filter((e) => sections.includes(e.section))
        if (rows.length === 0) return null

        return (
        <section key={heading} className="pb-20">
          <SectionLabel>{heading}</SectionLabel>
          <div className="flex flex-col gap-9">
            {rows.map((entry) => (
              <div
                key={entry.slug}
                className="grid grid-cols-1 items-baseline gap-x-8 gap-y-1.5 sm:grid-cols-[minmax(0,1fr)_11rem]"
              >
                <span className="text-[17px] font-medium">{entry.role}</span>
                {/* Month precision, not year. "2021 → 2023" hides whether a
                    two-year entry was two full years or thirteen months, which is
                    the one thing the range is there to answer. The column is
                    widened to fit "Jul 2021 → Jul 2023". */}
                <span className="tabular font-mono text-xs text-[var(--faint)] sm:text-right">
                  {entry.current
                    ? entry.startDate
                      ? `${formatDate(entry.startDate, 'month')} → now`
                      : 'current'
                    : [formatDate(entry.startDate, 'month'), formatDate(entry.endDate, 'month')]
                        .filter(Boolean)
                        .join(' → ')}
                </span>
                <span className="text-[15px] text-[var(--muted)]">
                  {entry.url ? (
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="hover:text-[var(--accent)]"
                    >
                      {entry.org}
                    </a>
                  ) : (
                    entry.org
                  )}
                  {entry.location ? ` · ${entry.location}` : ''}
                </span>
                {/* summary was on the model, editable in the admin, and shown
                    by nothing. A field with no reader is a field that silently
                    swallows whatever gets typed into it.

                    col-start-1 is load-bearing. This is a two-column grid and
                    items flow, so role lands left, the date lands right, the org
                    lands left, and the FOURTH item lands back in the right-hand
                    column: the summary was being squeezed into the nine-rem date
                    slot. Same reason the highlights below need it. */}
                {entry.summary && (
                  <p className="mt-1 max-w-[34rem] text-[15px] leading-relaxed text-[var(--muted)] sm:col-start-1">
                    {entry.summary}
                  </p>
                )}
                {entry.highlights.length > 0 && (
                  <ul className="mt-1 flex max-w-[34rem] flex-col gap-1 text-[15px] text-[var(--muted)] sm:col-start-1">
                    {entry.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
        )
      })}

      {/*
        Rows, not cards. A three-across grid of tiles with an icon in each is the
        v1 treatment and the reason that section read as filler: the layout was
        sized for more content than there was, so it had to be padded with things
        he had not started. Two rows look deliberate at two entries and still look
        right at five.
      */}
      {profile.interests.length > 0 && (
        <section className="pb-20">
          <SectionLabel>Outside work</SectionLabel>
          <ul className="flex flex-col gap-4">
            {profile.interests.map((interest) => (
              <li
                key={interest.name}
                className="grid grid-cols-1 items-baseline gap-x-8 gap-y-1 sm:grid-cols-[9rem_minmax(0,1fr)]"
              >
                <span className="text-[17px] font-medium">
                  {interest.url ? (
                    <a
                      href={interest.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
                    >
                      {interest.name}
                    </a>
                  ) : (
                    interest.name
                  )}
                </span>
                {interest.note && (
                  <span className="text-[15px] leading-relaxed text-[var(--muted)]">
                    {interest.note}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {top.length > 0 && (
        <section className="pb-20">
          <SectionLabel>What I work with</SectionLabel>
          <div className="flex flex-col gap-8">
            {top.map((t) => (
              <div
                key={t.slug}
                className="grid grid-cols-1 items-baseline gap-x-8 gap-y-1.5 sm:grid-cols-[9rem_minmax(0,1fr)]"
              >
                <div>
                  <div className="text-base font-medium">{t.name}</div>
                  {t.firstEncounter && (
                    <div className="tabular font-mono text-[11px] text-[var(--faint)]">
                      since {t.firstEncounter}
                    </div>
                  )}
                </div>
                {/* His own words, not a rewrite, and deliberately no
                    proficiency rating: self-rated skill bars appear on zero
                    respected personal sites. */}
                <p className="max-w-[34rem] text-[15px] text-[var(--muted)]">{t.note}</p>
              </div>
            ))}

            {rest.length > 0 && (
              <div className="grid grid-cols-1 items-baseline gap-x-8 gap-y-1.5 pt-2 sm:grid-cols-[9rem_minmax(0,1fr)]">
                <div className="font-mono text-[11px] text-[var(--faint)]">also</div>
                <ul className="flex max-w-[44rem] flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-[var(--faint)]">
                  {rest.map((t) => (
                    <li key={t.slug}>{t.name.toLowerCase()}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

/* ------------------------------------------------------------ generic page --- */

export function PageView({ page }: { page: Page }) {
  return (
    <article className="pt-20 pb-8">
      <h1 className="mb-8 text-4xl font-medium leading-[1.1] tracking-[-0.03em] text-balance">
        {page.title}
      </h1>

      {page.body && (
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(page.body) }}
        />
      )}

      {page.sections.map((section) => (
        <section key={section.heading} className="mt-12">
          <SectionLabel>{section.heading}</SectionLabel>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(section.body) }}
          />
        </section>
      ))}

      {page.showUpdatedAt && (
        <p className="mt-14 font-mono text-[11px] text-[var(--faint)]">
          last updated {formatDate(new Date(), 'day')}
        </p>
      )}
    </article>
  )
}

/* --------------------------------------------------------------- contact --- */

/**
 * Contact.
 *
 * The email is set at display size and is the loudest thing on the page, which
 * is the point: it is the action a visitor is most likely to want and the one
 * that was previously hardest to spot in a label/value list.
 *
 * The rest are full-width rows with a hairline between them, an arrow that
 * moves on hover, and a tinted hover band, so they read as targets rather than
 * as a definition list. Deliberately not cards: a row of cards is the reflex
 * layout here and it fights the rest of the theme.
 */
/**
 * Contact.
 *
 * Form first, links beneath it. The form is what the page is for; the links
 * are the alternative. Leading with a list of addresses and putting the form
 * underneath reads as though the form is an afterthought.
 *
 * Deliberately not cards. A row of cards is the reflex layout for "make these
 * stand out", and it would fight the typographic character of the theme. Rows
 * with a real hover band, a mono gutter and a directional arrow get the same
 * affordance with none of the template signal.
 */
export function Contact({ profile }: { profile: Profile | null }) {
  if (!profile) return null

  const visible = profile.links.filter((l) => l.visible)

  return (
    <div className="pt-20 pb-8">
      <h1 className="mb-6 text-4xl font-medium leading-[1.1] tracking-[-0.03em]">Contact</h1>
      <p className="prose mb-14 text-[var(--muted)]">
        Email is the fastest way to reach me. The form lands in the same inbox.
      </p>


      <section>
        <SectionLabel>Send a message</SectionLabel>
        <ContactForm />
      </section>

      {visible.length > 0 && (
        <section className="mt-20">
          <SectionLabel>Reach me</SectionLabel>
          <ul className="-mx-3 flex flex-col">
            {visible.map((link) => {
              const isDownload = link.kind === 'resume'
              const isExternal = !isDownload && link.url.startsWith('http')
              return (
                <li key={link.url} className="border-b border-[var(--rule)] last:border-b-0">
                  <a
                    href={link.url}
                    target={isExternal ? '_blank' : undefined}
                    rel="noreferrer noopener"
                    download={isDownload ? resumeFilename(profile.name) : undefined}
                    className="group flex items-center gap-4 rounded px-3 py-4 transition-colors hover:bg-[var(--selection)]"
                  >
                    <span className="w-[5.5rem] shrink-0 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--faint)]">
                      {link.kind}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[17px] text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                      {link.handle ?? link.label ?? link.url}
                    </span>
                    <span
                      aria-hidden
                      className="shrink-0 font-mono text-xs text-[var(--faint)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
                    >
                      {isDownload
                        ? String.fromCharCode(8595)
                        : isExternal
                          ? String.fromCharCode(8599)
                          : String.fromCharCode(8594)}
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}
