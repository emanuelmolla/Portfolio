import Link from 'next/link'
import type { Post } from '@/lib/models'
import { renderMarkdown } from '@/lib/markdown'
import { SectionLabel } from '../Shell'
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
 * Renders nothing when there are no posts.
 *
 * An empty section advertises abandonment, and "coming soon" placeholders were
 * one of the clearest tells in the portfolio research. A missing section is
 * better than a hollow one.
 */
export function PostIndex({ items, heading }: { items: Post[]; heading?: string }) {
  if (items.length === 0) return null

  return (
    <section className="pb-22">
      <SectionLabel>{heading ?? 'Writing'}</SectionLabel>
      <div className="flex flex-col gap-7">
        {items.map((post) => (
          <PostSummary key={post.slug} post={post} />
        ))}
      </div>
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
