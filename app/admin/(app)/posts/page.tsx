import Link from 'next/link'
import { listPosts } from '@/lib/admin/read'
import { StatusBadge } from '@/components/admin/fields'
import { Empty, List, NewButton, PageHeader, formatDate } from '@/components/admin/page-parts'
import { togglePostStatus } from './actions'

export const dynamic = 'force-dynamic'

export default async function PostsPage() {
  const posts = await listPosts()

  return (
    <>
      <PageHeader
        title="Writing"
        description="Posts at /blog. For a backend portfolio this is the part that shows the thinking, because the systems work has no screenshot."
        action={<NewButton href="/admin/posts/new" label="New post" />}
      />

      {posts.length === 0 ? (
        <Empty>
          Nothing written yet. A post is the one artifact that can show how you reason about a
          problem, which a repository link cannot.
        </Empty>
      ) : (
        <List>
          {posts.map((post) => (
            <li key={post._id} className="flex items-center gap-2 pr-3">
              <Link href={`/admin/posts/${post._id}`} className="a-row min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-[14px] font-medium">{post.title}</span>
                  <StatusBadge status={post.status} />
                  {post.featuredOrder !== null && (
                    <span className="a-badge">pinned {post.featuredOrder}</span>
                  )}
                </div>
                <div className="a-hint a-mono mt-1 flex flex-wrap gap-x-3 text-[11px]">
                  <span>/blog/{post.slug}</span>
                  {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
                  {post.readingMinutes ? <span>{post.readingMinutes} min</span> : null}
                </div>
              </Link>

              {/* Publishing is the one thing worth doing without opening the post,
                  so it is the one thing on the row. */}
              <form action={togglePostStatus} className="shrink-0">
                <input type="hidden" name="id" value={post._id} />
                <button type="submit" className="a-btn a-btn-sm">
                  {post.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
              </form>
            </li>
          ))}
        </List>
      )}
    </>
  )
}
