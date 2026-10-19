import Link from 'next/link'
import Image from 'next/image'
import type {
  Experience,
  Page,
  Post,
  Profile,
  Tech,
  Work,
  Media,
} from '@/lib/models'
import { renderMarkdown } from '@/lib/markdown'
import { submitMessage } from '@/app/contact/actions'
import { ContactForm } from './ContactForm'

function Prose({ body }: { body?: string | null }) {
  return body ? (
    <div
      className="terminal-prose"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
    />
  ) : null
}
function Photo({ media }: { media?: Media | null }) {
  return media ? (
    <figure>
      <Link href={media.url}>
        <Image
          src={media.url}
          alt={media.alt}
          width={media.width}
          height={media.height}
          loading="lazy"
        />
      </Link>
      {media.caption && <figcaption>{media.caption}</figcaption>}
    </figure>
  ) : null
}
function ProfileLinks({ profile }: { profile: Profile }) {
  return (
    <ul className="terminal-links">
      <li>
        <Link href={profile.resumeUrl}>Download resume</Link>
      </li>
      {profile.links
        .filter((link) => link.visible)
        .map((link) => (
          <li key={link.url}>
            <Link href={link.url}>{link.label || link.kind}</Link>
          </li>
        ))}
    </ul>
  )
}
export function Home({
  profile,
  work = [],
  posts = [],
  experience = [],
}: {
  profile: Profile | null
  work: Work[]
  posts: Post[]
  experience?: Experience[]
}) {
  return (
    <>
      <section>
        <h1>{profile?.name ?? 'Portfolio'}</h1>
        {profile && (
          <>
            <p className="terminal-lead">{profile.headline}</p>
            <p>{profile.bio.short}</p>
            <p>
              {profile.location.city}, {profile.location.country}
            </p>
            {profile.availability.note && <p>{profile.availability.note}</p>}
            <ProfileLinks profile={profile} />
            <Link href="/about">Read about me</Link>
          </>
        )}
      </section>
      <section>
        <h2>Work /</h2>
        <WorkList items={work} />
        <Link href="/work">All work</Link>
      </section>
      <section>
        <h2>Writing /</h2>
        <PostList items={posts} />
        <Link href="/blog">All writing</Link>
      </section>
      {experience.length > 0 && (
        <section>
          <h2>Experience /</h2>
          <Experiences items={experience} />
          <Link href="/experience">Full experience</Link>
        </section>
      )}
    </>
  )
}
export function About({
  profile,
  experience = [],
  tech = [],
}: {
  profile: Profile
  experience?: Experience[]
  tech?: Tech[]
}) {
  return (
    <article>
      <h1>About {profile.name}</h1>
      <p className="terminal-lead">{profile.headline}</p>
      <p>{profile.bio.short}</p>
      <Prose body={profile.bio.long} />
      <ProfileLinks profile={profile} />
      {tech.length > 0 && (
        <section>
          <h2>Toolkit</h2>
          <p>{tech.map((item) => item.name).join(', ')}</p>
        </section>
      )}
      <section>
        <h2>Experience & education</h2>
        <Experiences items={experience} />
      </section>
      {profile.interests.length > 0 && (
        <section>
          <h2>Interests</h2>
          <ul>
            {profile.interests.map((interest) => (
              <li key={interest.name}>
                {interest.url ? (
                  <Link href={interest.url}>{interest.name}</Link>
                ) : (
                  interest.name
                )}
                {interest.note && <p>{interest.note}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
export function WorkSummary({ work }: { work: Work }) {
  return (
    <article className="terminal-entry">
      <h2>
        <Link href={`/work/${work.slug}`}>{work.title}</Link>
      </h2>
      <p>{work.summary}</p>
      {work.role && <p className="terminal-meta">{work.role}</p>}
    </article>
  )
}
function WorkList({ items }: { items: Work[] }) {
  return items.length ? (
    <div>
      {items.map((work) => (
        <WorkSummary key={work.slug} work={work} />
      ))}
    </div>
  ) : (
    <p>No work published yet.</p>
  )
}
export function WorkIndex(props: {
  items?: Work[]
  work?: Work
  heading?: string
}) {
  return props.work ? (
    <WorkSummary work={props.work} />
  ) : (
    <section>
      <h1>{props.heading ?? 'Work'}</h1>
      <WorkList items={props.items ?? []} />
    </section>
  )
}
export function WorkItem({
  work,
  tech = [],
  adjacent,
}: {
  work: Work
  tech?: Tech[]
  adjacent?: { prev: Work | null; next: Work | null }
}) {
  return (
    <article>
      <h1>{work.title}</h1>
      <p className="terminal-lead">{work.summary}</p>
      {work.role && (
        <p>
          {work.role}
          {work.teamSize ? ` / team of ${work.teamSize}` : ''}
        </p>
      )}
      <ul className="terminal-links">
        {work.links.map((link) => (
          <li key={link.url}>
            <Link href={link.url}>{link.label || link.kind}</Link>
          </li>
        ))}
      </ul>
      <Photo media={work.coverImage} />
      {work.problem && (
        <section>
          <h2>Why it exists</h2>
          <Prose body={work.problem} />
        </section>
      )}
      <Prose body={work.body} />
      {work.outcome && (
        <section>
          <h2>Outcome</h2>
          <Prose body={work.outcome} />
        </section>
      )}
      {work.details?.kind === 'software' && (
        <section>
          <h2>Implementation</h2>
          <p>{work.details.stack.join(', ')}</p>
          <Prose body={work.details.architectureNotes} />
          {work.details.repoUrl && (
            <p>
              <Link href={work.details.repoUrl}>Source code</Link>
            </p>
          )}
          {work.details.liveUrl && (
            <p>
              <Link href={work.details.liveUrl}>Live project</Link>
            </p>
          )}
        </section>
      )}
      {tech.length > 0 && (
        <p>Built with: {tech.map((item) => item.name).join(', ')}</p>
      )}
      {work.gallery?.map((media) => (
        <Photo key={media.url} media={media} />
      ))}
      <nav aria-label="More work" className="terminal-links">
        {adjacent?.prev && (
          <Link href={`/work/${adjacent.prev.slug}`}>
            Previous: {adjacent.prev.title}
          </Link>
        )}
        {adjacent?.next && (
          <Link href={`/work/${adjacent.next.slug}`}>
            Next: {adjacent.next.title}
          </Link>
        )}
        <Link href="/work">All work</Link>
      </nav>
    </article>
  )
}
export function PostSummary({ post }: { post: Post }) {
  return (
    <article className="terminal-entry">
      <h2>
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>
      {post.excerpt && <p>{post.excerpt}</p>}
    </article>
  )
}
function PostList({ items }: { items: Post[] }) {
  return items.length ? (
    <div>
      {items.map((post) => (
        <PostSummary key={post.slug} post={post} />
      ))}
    </div>
  ) : (
    <p>No writing published yet.</p>
  )
}
export function PostIndex(props: {
  items?: Post[]
  post?: Post
  heading?: string
}) {
  return props.post ? (
    <PostSummary post={props.post} />
  ) : (
    <section>
      <h1>{props.heading ?? 'Writing'}</h1>
      <PostList items={props.items ?? []} />
    </section>
  )
}
export function PostItem({ post }: { post: Post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      {post.publishedAt && (
        <p className="terminal-meta">
          {date(post.publishedAt)}
          {post.readingMinutes ? ` / ${post.readingMinutes} min read` : ''}
        </p>
      )}
      <Photo media={post.coverImage} />
      <Prose body={post.body} />
      <Link href="/blog">All writing</Link>
    </article>
  )
}
function date(value: Date | string) {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(value))
}
function Experiences({ items }: { items: Experience[] }) {
  return items.length ? (
    <div>
      {items.map((item) => (
        <article className="terminal-entry" key={item.slug} id={item.slug}>
          <h3>{item.role}</h3>
          <p>
            {item.url ? <Link href={item.url}>{item.org}</Link> : item.org}
            {item.location && ` / ${item.location}`}
          </p>
          <p className="terminal-meta">
            {item.startDate && date(item.startDate)}
            {item.startDate && ' to '}
            {item.current ? 'Present' : item.endDate && date(item.endDate)}
          </p>
          <Prose body={item.summary} />
          <ul>
            {item.highlights.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
          {item.links.map((link) => (
            <p key={link.url}>
              <Link href={link.url}>{link.label || link.kind}</Link>
            </p>
          ))}
        </article>
      ))}
    </div>
  ) : (
    <p>No experience published yet.</p>
  )
}
export function ExperienceView({
  experience = [],
}: {
  experience: Experience[]
}) {
  return (
    <section>
      <h1>Experience & education</h1>
      <Experiences items={experience} />
    </section>
  )
}
export function PageView({
  page,
}: {
  page: Page & { updatedAt?: Date | string }
}) {
  return (
    <article>
      <h1>{page.title}</h1>
      {page.showUpdatedAt && page.updatedAt && (
        <p className="terminal-meta">Updated {date(page.updatedAt)}</p>
      )}
      <Prose body={page.body} />
      {page.sections.map((section, index) => (
        <section key={index}>
          <h2>{section.heading}</h2>
          <Prose body={section.body} />
        </section>
      ))}
    </article>
  )
}
export function Contact({ profile }: { profile: Profile }) {
  const email = profile.links.find(
    (link) => link.kind === 'email' && link.visible
  )
  return (
    <section>
      <h1>Contact {profile.name}</h1>
      <p>
        {profile.location.city}, {profile.location.country}
      </p>
      {email && (
        <p>
          Email: <a href={email.url}>{email.url.replace(/^mailto:/, '')}</a>
        </p>
      )}
      <ProfileLinks profile={profile} />
      <ContactForm sendAction={submitMessage} />
    </section>
  )
}
