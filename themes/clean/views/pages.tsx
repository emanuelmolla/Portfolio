import Image from 'next/image'
import Link from 'next/link'
import type { Experience, Page, Post, Profile, Tech, Work } from '@/lib/models'
import { renderMarkdown } from '@/lib/markdown'
import { SectionLabel } from '../Shell'
import { formatDate } from '../format'
import { WorkSummary } from './work'
import { PostSummary } from './post'
import { ContactForm } from './ContactForm'

/* ------------------------------------------------------------------ home --- */

export function Home({
  profile,
  work,
  posts,
}: {
  profile: Profile | null
  work: Work[]
  posts: Post[]
}) {
  if (!profile) return null

  return (
    <>
      <section className="pt-24 pb-20">
        <h1 className="mb-8 max-w-[22ch] text-[clamp(2.25rem,6vw,3.75rem)] font-medium leading-[1.05] tracking-[-0.035em] text-balance">
          {profile.headline}
        </h1>
        <p className="max-w-[34rem] text-[17px] leading-relaxed text-[var(--muted)]">
          {profile.bio.short}
        </p>

        {profile.availability.status !== 'not-looking' && (
          <p className="mt-10 inline-flex items-center gap-2 font-mono text-xs tracking-[0.03em] text-[var(--muted)]">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
            />
            {profile.availability.note ??
              (profile.availability.status === 'open'
                ? 'Open to new roles'
                : 'Open to the right role')}
          </p>
        )}
      </section>

      {work.length > 0 && (
        <section className="pb-22">
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
        <section className="pb-22">
          <SectionLabel>Writing</SectionLabel>
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

      {experience.length > 0 && (
        <section className="pb-20">
          <SectionLabel>Experience</SectionLabel>
          <div className="flex flex-col gap-9">
            {experience.map((entry) => (
              <div
                key={entry.slug}
                className="grid grid-cols-1 items-baseline gap-x-8 gap-y-1.5 sm:grid-cols-[minmax(0,1fr)_9rem]"
              >
                <span className="text-[17px] font-medium">{entry.role}</span>
                <span className="tabular font-mono text-xs text-[var(--faint)] sm:text-right">
                  {entry.current
                    ? entry.startDate
                      ? `${formatDate(entry.startDate, 'year')} → now`
                      : 'current'
                    : [formatDate(entry.startDate, 'year'), formatDate(entry.endDate, 'year')]
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
                {entry.highlights.length > 0 && (
                  <ul className="mt-1 flex max-w-[34rem] flex-col gap-1 text-[15px] text-[var(--muted)] sm:col-span-1">
                    {entry.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
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

export function Contact({ profile }: { profile: Profile | null }) {
  if (!profile) return null
  const visible = profile.links.filter((l) => l.visible)

  return (
    <div className="pt-20 pb-8">
      <h1 className="mb-8 text-4xl font-medium leading-[1.1] tracking-[-0.03em]">
        Contact
      </h1>
      <p className="prose mb-10 text-[var(--muted)]">
        Send a message here, or use any of the links below. I read everything.
      </p>

      <div className="mb-14">
        <ContactForm />
      </div>

      <ul className="flex flex-col gap-4">
        {visible.map((link) => (
          <li
            key={link.url}
            className="grid grid-cols-1 items-baseline gap-x-8 sm:grid-cols-[7rem_minmax(0,1fr)]"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--faint)]">
              {link.kind}
            </span>
            <a
              href={link.url}
              target={link.url.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer noopener"
              className="text-[15px] underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
            >
              {link.handle ?? link.label ?? link.url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
