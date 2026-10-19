import Link from 'next/link'
import Image from 'next/image'
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
import { Board } from './Board'
import { ContactForm } from './ContactForm'

function date(value: Date | string | null | undefined, yearOnly = false) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    ...(yearOnly ? {} : { month: 'short' as const }),
    timeZone: 'UTC',
  }).format(new Date(value))
}
function Prose({ body }: { body?: string | null }) {
  return body ? (
    <div
      className="prose chess-prose"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
    />
  ) : null
}
function Photo({
  media,
  portrait = false,
}: {
  media: Media
  portrait?: boolean
}) {
  return (
    <figure className={portrait ? 'chess-portrait' : 'chess-photo'}>
      <Image
        src={media.url}
        alt={media.alt}
        width={media.width}
        height={media.height}
        sizes={
          portrait
            ? '(max-width: 700px) 90vw, 340px'
            : '(max-width: 1000px) 90vw, 900px'
        }
      />
      {media.caption && <figcaption>{media.caption}</figcaption>}
    </figure>
  )
}
function Heading({
  label,
  title,
  children,
}: {
  label: string
  title: string
  children?: React.ReactNode
}) {
  return (
    <header className="chess-heading">
      <span className="chess-eyebrow">{label}</span>
      <h1>{title}</h1>
      {children}
    </header>
  )
}
function Tags({ tags }: { tags: string[] }) {
  return tags.length > 0 ? (
    <ul className="chess-tags" aria-label="Topics">
      {tags.map((tag) => (
        <li key={tag}>{tag}</li>
      ))}
    </ul>
  ) : null
}
function Project({
  item,
  number,
  headingLevel = 3,
}: {
  item: Work
  number: number
  headingLevel?: 2 | 3
}) {
  const Title = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <article
      className={`chess-folio${number % 3 === 0 ? ' chess-folio-octagon' : ''}`}
    >
      <div className="chess-folio-spine" aria-hidden="true">
        {String(number).padStart(2, '0')} / {item.kind}
      </div>
      <div className="chess-folio-page">
        <span className="chess-eyebrow">
          {item.lifecycle}{' '}
          {item.startDate && ` / ${date(item.startDate, true)}`}
        </span>
        <Title className="chess-folio-title">
          <Link href={`/work/${item.slug}`}>{item.title}</Link>
        </Title>
        <p>{item.summary}</p>
        <Tags
          tags={
            item.details?.kind === 'software' ? item.details.stack : item.tags
          }
        />
        <Link className="chess-read-link" href={`/work/${item.slug}`}>
          Open project <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <span className="chess-folio-tab" aria-hidden="true">
        {number % 2 ? '♜' : '♞'}
      </span>
    </article>
  )
}
function Experiences({
  items,
  headingLevel = 3,
}: {
  items: Experience[]
  headingLevel?: 2 | 3
}) {
  const Title = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <div className="chess-scoresheets">
      {items.map((item, i) => (
        <article key={item.slug} id={item.slug} className="chess-scoresheet">
          <div className="chess-sheet-top">
            <span>Record {String(i + 1).padStart(2, '0')}</span>
            <span>{item.section}</span>
          </div>
          <p className="chess-eyebrow">
            {date(item.startDate)}
            {item.startDate && ' – '}
            {item.current ? 'Present' : date(item.endDate)}
          </p>
          <Title className="chess-record-title">{item.role}</Title>
          <p className="chess-organization">
            {item.url ? (
              <a href={item.url} target="_blank" rel="noreferrer">
                {item.org} ↗
              </a>
            ) : (
              item.org
            )}
          </p>
          {(item.location || item.employmentType) && (
            <p className="chess-meta">
              {[item.location, item.employmentType].filter(Boolean).join(' / ')}
            </p>
          )}
          <Prose body={item.summary} />
          {item.highlights.length > 0 && (
            <ul className="chess-highlights">
              {item.highlights.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          )}
          {item.links.length > 0 && (
            <div className="chess-links">
              {item.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.label || link.kind} ↗
                </a>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  )
}
export function Home({
  profile,
  work,
  posts,
  experience,
}: {
  profile: Profile
  work: Work[]
  posts: Post[]
  experience: Experience[]
}) {
  return (
    <>
      <section className="chess-hero">
        <div className="chess-introduction">
          <span className="chess-eyebrow">A seat at my table</span>
          <h1>
            {profile.name}
            <span>{profile.headline}.</span>
          </h1>
          <p className="chess-lead">{profile.bio.short}</p>
          {profile.availability.status !== 'not-looking' && (
            <p className="chess-availability">
              <span aria-hidden="true" />
              {profile.availability.note ||
                (profile.availability.status === 'open'
                  ? 'Open to opportunities'
                  : 'Open to the right opportunity')}
            </p>
          )}
          <div className="chess-actions">
            <Link className="chess-button" href="/work">
              Explore my work <span aria-hidden="true">↗</span>
            </Link>
            <Link className="chess-text-button" href="/about">
              Meet the player →
            </Link>
          </div>
          <p className="chess-hero-caption">
            A developer’s portfolio, with a little room to play.
          </p>
        </div>
        <Board />
      </section>
      {work.length > 0 && (
        <section
          className="chess-section chess-work-table"
          aria-labelledby="selected-work"
        >
          <div className="chess-section-heading">
            <div>
              <span className="chess-eyebrow">On the table</span>
              <h2 id="selected-work">Selected work.</h2>
            </div>
            <Link href="/work">All projects ↗</Link>
          </div>
          <div className="chess-project-grid">
            {work.map((item, i) => (
              <Project key={item.slug} item={item} number={i + 1} />
            ))}
          </div>
        </section>
      )}
      {experience.length > 0 && (
        <section className="chess-section" aria-labelledby="experience">
          <div className="chess-section-heading">
            <div>
              <span className="chess-eyebrow">The scoresheet</span>
              <h2 id="experience">Experience & education.</h2>
            </div>
            <Link href="/experience">Full record ↗</Link>
          </div>
          <Experiences items={experience.slice(0, 3)} />
        </section>
      )}
      {posts.length > 0 && (
        <section className="chess-section">
          <div className="chess-section-heading">
            <div>
              <span className="chess-eyebrow">From the notebook</span>
              <h2>Recent writing.</h2>
            </div>
            <Link href="/blog">All writing ↗</Link>
          </div>
          <PostRows items={posts} />
        </section>
      )}
      <section className="chess-invitation">
        <span aria-hidden="true">♔</span>
        <div>
          <h2>Let’s talk.</h2>
          <p>Have a project in mind, or a question about my work?</p>
        </div>
        <Link className="chess-button" href="/contact">
          Pull up a chair ↗
        </Link>
      </section>
    </>
  )
}
export function WorkIndex({
  items,
  heading,
}: {
  items: Work[]
  heading: string
}) {
  return (
    <>
      <Heading
        label="The project collection"
        title={heading === 'Work' ? 'Work, on the table.' : heading}
      >
        <p>Projects, experiments, and the decisions behind them.</p>
      </Heading>
      {items.length ? (
        <div className="chess-project-grid">
          {items.map((item, i) => (
            <Project
              key={item.slug}
              item={item}
              number={i + 1}
              headingLevel={2}
            />
          ))}
        </div>
      ) : (
        <div className="chess-letter">
          <h2>A space for the next project.</h2>
          <p>Nothing published here yet.</p>
        </div>
      )}
    </>
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
  const links = [...work.links]
  const software = work.details?.kind === 'software' ? work.details : null
  if (software) {
    if (software.liveUrl && !links.some((l) => l.url === software.liveUrl))
      links.push({
        kind: 'live',
        label: 'Visit project',
        url: software.liveUrl,
      })
    if (software.repoUrl && !links.some((l) => l.url === software.repoUrl))
      links.push({ kind: 'repo', label: 'Source code', url: software.repoUrl })
  }
  return (
    <>
      <Link className="chess-back" href="/work">
        ← All projects
      </Link>
      <article className="chess-document">
        <Heading label={`${work.kind} / ${work.lifecycle}`} title={work.title}>
          <p>{work.summary}</p>
        </Heading>
        <dl className="chess-project-facts">
          {work.role && (
            <div>
              <dt>My role</dt>
              <dd>
                {work.role}
                {work.teamSize ? ` / Team of ${work.teamSize}` : ''}
              </dd>
            </div>
          )}
          {work.startDate && (
            <div>
              <dt>Timeline</dt>
              <dd>
                {date(work.startDate, work.datePrecision === 'year')}
                {work.endDate
                  ? ` – ${date(work.endDate, work.datePrecision === 'year')}`
                  : ''}
              </dd>
            </div>
          )}
          {links.length > 0 && (
            <div>
              <dt>Explore</dt>
              <dd className="chess-links">
                {links.map((link) => (
                  <a
                    href={link.url}
                    key={link.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label || link.kind} ↗
                  </a>
                ))}
              </dd>
            </div>
          )}
        </dl>
        {work.coverImage && <Photo media={work.coverImage} />}
        {work.problem && (
          <section className="chess-analysis">
            <span className="chess-eyebrow">The position</span>
            <h2>The problem</h2>
            <Prose body={work.problem} />
          </section>
        )}
        <Prose body={work.body} />
        {software?.architectureNotes && (
          <section className="chess-analysis">
            <h2>Technical decisions</h2>
            <Prose body={software.architectureNotes} />
          </section>
        )}
        {work.outcome && (
          <section className="chess-analysis">
            <span className="chess-eyebrow">The result</span>
            <h2>Outcome</h2>
            <Prose body={work.outcome} />
          </section>
        )}
        <Tags
          tags={
            tech.length
              ? tech.map((t) => t.name)
              : software
                ? software.stack
                : work.tags
          }
        />
        {(work.gallery?.length ?? 0) > 0 && (
          <section className="chess-gallery">
            <h2>A closer look</h2>
            {(work.gallery ?? []).map((media, i) => (
              <Photo media={media} key={`${media.url}-${i}`} />
            ))}
          </section>
        )}
      </article>
      {(adjacent?.prev || adjacent?.next) && (
        <nav aria-label="Other projects" className="chess-adjacent">
          {adjacent.prev && (
            <Link href={`/work/${adjacent.prev.slug}`}>
              ← {adjacent.prev.title}
            </Link>
          )}
          {adjacent.next && (
            <Link href={`/work/${adjacent.next.slug}`}>
              {adjacent.next.title} →
            </Link>
          )}
        </nav>
      )}
    </>
  )
}
function PostRows({
  items,
  headingLevel = 3,
}: {
  items: Post[]
  headingLevel?: 2 | 3
}) {
  const Title = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <div className="chess-notebook">
      {items.map((post, i) => (
        <article key={post.slug} className="chess-notebook-row">
          <span className="chess-row-number" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div>
            <p className="chess-eyebrow">
              {date(post.publishedAt)}
              {post.readingMinutes > 0
                ? ` / ${post.readingMinutes} min read`
                : ''}
            </p>
            <Title className="chess-note-title">
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </Title>
            <p>{post.excerpt}</p>
          </div>
          <Link
            className="chess-row-open"
            href={`/blog/${post.slug}`}
            aria-label={`Read ${post.title}`}
          >
            ↗
          </Link>
        </article>
      ))}
    </div>
  )
}
export function PostIndex({
  items,
  heading,
}: {
  items: Post[]
  heading: string
}) {
  return (
    <>
      <Heading
        label="The analysis notebook"
        title={heading === 'Writing' ? 'Notes from the board.' : heading}
      >
        <p>Things I’m building, learning, and thinking through.</p>
      </Heading>
      {items.length ? (
        <PostRows items={items} headingLevel={2} />
      ) : (
        <div className="chess-letter">
          <p>No notes published yet.</p>
        </div>
      )}
    </>
  )
}
export function PostItem({ post }: { post: Post }) {
  return (
    <>
      <Link className="chess-back" href="/blog">
        ← All writing
      </Link>
      <article className="chess-document chess-article">
        <Heading
          label={`${date(post.publishedAt)}${post.readingMinutes ? ` / ${post.readingMinutes} min read` : ''}`}
          title={post.title}
        >
          <p>{post.excerpt}</p>
        </Heading>
        {post.coverImage && <Photo media={post.coverImage} />}
        <Prose body={post.body} />
        <Tags tags={post.tags} />
      </article>
    </>
  )
}
export function About({
  profile,
  experience,
  tech,
}: {
  profile: Profile
  experience: Experience[]
  tech: Tech[]
}) {
  return (
    <>
      <Heading
        label="The person behind the pieces"
        title="Away from the board."
      />
      <div className="chess-about">
        <article className="chess-letter">
          <h2>{profile.name}</h2>
          <p className="chess-lead">{profile.bio.short}</p>
          <Prose body={profile.bio.long} />
          <div className="chess-actions">
            <Link className="chess-button" href="/contact">
              Say hello ↗
            </Link>
            <a href={profile.resumeUrl} className="chess-text-button">
              Download résumé ↗
            </a>
          </div>
        </article>
        {profile.avatar && <Photo media={profile.avatar} portrait />}
      </div>
      {tech.length > 0 && (
        <section className="chess-section chess-equipment">
          <span className="chess-eyebrow">The toolkit</span>
          <h2>What I work with.</h2>
          <Tags tags={tech.map((t) => t.name)} />
        </section>
      )}
      {experience.length > 0 && (
        <section className="chess-section" id="experience">
          <div className="chess-section-heading">
            <h2>Experience & education.</h2>
            <Link href="/experience">Full record ↗</Link>
          </div>
          <Experiences items={experience} />
        </section>
      )}
      {profile.interests.length > 0 && (
        <section className="chess-letter">
          <span className="chess-eyebrow">Between projects</span>
          <h2>A little more about me.</h2>
          <ul className="chess-interests">
            {profile.interests.map((interest) => (
              <li key={interest.name}>
                <h3>
                  {interest.url ? (
                    <a href={interest.url} target="_blank" rel="noreferrer">
                      {interest.name} ↗
                    </a>
                  ) : (
                    interest.name
                  )}
                </h3>
                {interest.note && <p>{interest.note}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
export function ExperienceView({ experience }: { experience: Experience[] }) {
  return (
    <>
      <Heading
        label="The complete scoresheet"
        title="Experience & education."
      />
      {experience.length ? (
        <Experiences items={experience} headingLevel={2} />
      ) : (
        <div className="chess-letter">
          <p>No entries published yet.</p>
        </div>
      )}
    </>
  )
}
export function PageView({
  page,
}: {
  page: Page & { updatedAt?: Date | string }
}) {
  return (
    <article className="chess-document">
      <Heading label="From the clubroom" title={page.title} />
      {page.showUpdatedAt && page.updatedAt && (
        <p className="chess-meta">Updated {date(page.updatedAt)}</p>
      )}
      <Prose body={page.body} />
      {(page.sections ?? []).map((section, i) => (
        <section key={i}>
          <h2>{section.heading}</h2>
          <Prose body={section.body} />
        </section>
      ))}
    </article>
  )
}
export function Contact({ profile }: { profile: Profile }) {
  const email = profile.links.find((l) => l.kind === 'email' && l.visible)
  return (
    <>
      <Heading label="Your side of the table" title="Let’s make contact.">
        <p>Questions, opportunities, or a good conversation.</p>
      </Heading>
      <div className="chess-contact-layout">
        <ContactForm />
        <aside className="chess-contact-aside">
          <span aria-hidden="true" className="chess-large-knight">
            ♞
          </span>
          <h2>Prefer a direct line?</h2>
          {email && <a href={email.url}>{email.url.replace(/^mailto:/, '')}</a>}
          <p>
            {profile.location.city}, {profile.location.country}
          </p>
          <div className="chess-links">
            {profile.links
              .filter((l) => l.visible && l.kind !== 'email')
              .map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.label || link.kind} ↗
                </a>
              ))}
          </div>
        </aside>
      </div>
    </>
  )
}
