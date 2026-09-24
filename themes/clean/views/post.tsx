import Link from 'next/link'
import type { Post } from '@/lib/models'
import { renderMarkdown } from '@/lib/markdown'
import { SectionLabel } from '../Shell'
import { Cover } from './Cover'
import { formatDate } from '../format'

export function PostSummary({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid grid-cols-1 items-baseline gap-x-8 gap-y-1 sm:grid-cols-[minmax(0,1fr)_8rem]"
    >
      <span className="text-[17px] font-medium transition-colors group-hover:text-[var(--accent)]">
        {post.title}
      </span>
      <span className="tabular font-mono text-xs text-[var(--faint)] sm:text-right">
        {formatDate(post.publishedAt, 'month')}
      </span>
      {post.excerpt && (
        <p className="max-w-[34rem] text-[15px] leading-relaxed text-[var(--muted)]">
          {post.excerpt}
        </p>
      )}
    </Link>
  )
}

/**
 * The dedicated /blog page.
 *
 * Note the difference from the home page, which hides its writing section
 * entirely when empty: a hollow section on a page about something else
 * advertises abandonment, but a page the visitor navigated to deliberately
 * must say something. A blank page reads as broken.
 *
 * What it must not say is "coming soon", which was one of the clearest tells
 * in the research. Stating the position plainly is honest and costs nothing.
 */
export function PostIndex({ items, heading }: { items: Post[]; heading?: string }) {
  return (
    <section className="pt-20 pb-22">
      <SectionLabel as="h1">{heading ?? 'Writing'}</SectionLabel>

      {items.length === 0 ? (
        <p className="max-w-[34rem] text-[15px] leading-relaxed text-[var(--muted)]">
          Nothing published here yet. Most of what I build is backend work, so writing it
          up is the only way to show it. That is the next thing on the list.
        </p>
      ) : (
        <div className="flex flex-col gap-7">
          {items.map((post) => (
            <PostSummary key={post.slug} post={post} />
          ))}
        </div>
      )}
    </section>
  )
}

export function PostItem({ post }: { post: Post }) {
  return (
    <article className="pt-20 pb-8">
      <p className="tabular mb-5 font-mono text-xs text-[var(--faint)]">
        {formatDate(post.publishedAt, 'day')}
        {post.readingMinutes ? ` · ${post.readingMinutes} min read` : ''}
      </p>

      <h1 className="mb-8 max-w-[24ch] text-4xl font-medium leading-[1.1] tracking-[-0.03em] text-balance">
        {post.title}
      </h1>

      {post.coverImage && <Cover media={post.coverImage} priority />}

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }}
      />

      <div className="mt-16">
        <Link
          href="/blog"
          className="font-mono text-xs text-[var(--muted)] hover:text-[var(--accent)]"
        >
          ← all writing
        </Link>
      </div>
    </article>
  )
}
