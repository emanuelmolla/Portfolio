import Link from 'next/link'
import { readCounts, listMessages } from '@/lib/admin/read'
import { PageHeader, formatDateTime } from '@/components/admin/page-parts'
import { Diagnostics } from './Diagnostics'

export const dynamic = 'force-dynamic'

/**
 * The dashboard.
 *
 * It answers two questions and no others: is anything waiting for me, and what is
 * unfinished. Counts of things that need no attention are decoration, so drafts
 * are called out and totals are not.
 */
export default async function Dashboard() {
  const [counts, recent] = await Promise.all([readCounts(), listMessages('inbox')])
  const unread = recent.filter((message) => !message.read).slice(0, 5)

  const drafts = counts.work.drafts + counts.posts.drafts + counts.pages.drafts

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Everything on the site is content here. Nothing below needs a deploy to change."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Unread messages" value={counts.unread} href="/admin/messages" />
        <Stat label="Drafts" value={drafts} href={drafts > 0 ? '/admin/posts' : undefined} />
        <Stat label="Published work" value={counts.work.total - counts.work.drafts} href="/admin/work" />
      </div>

      {!counts.hasProfile && (
        <div className="a-notice a-notice-warn mt-5">
          <p className="font-medium">There is no profile record.</p>
          <p className="mt-2">
            Name, headline, links and the resume URL all come from it, and the site falls back to
            seed content without one. Run <code className="a-mono">npm run seed</code> to create it
            from the current content, or <Link href="/admin/profile" className="underline">fill it
            in by hand</Link>.
          </p>
        </div>
      )}

      <section className="mt-7">
        <h2 className="mb-2.5 text-[14px] font-semibold tracking-tight">Recent messages</h2>

        {unread.length === 0 ? (
          <div className="a-card px-5 py-8">
            <p className="a-hint">
              {counts.inbox === 0
                ? 'The inbox is empty.'
                : `Nothing unread. ${counts.inbox} ${counts.inbox === 1 ? 'message' : 'messages'} in the inbox.`}
            </p>
          </div>
        ) : (
          <ul className="a-card a-divide overflow-hidden">
            {unread.map((message) => (
              <li key={message._id}>
                <Link href={`/admin/messages/${message._id}`} className="a-row">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-[14px] font-medium">{message.name}</span>
                    <span className="a-hint a-mono text-[11px]">
                      {formatDateTime(message.createdAt)}
                    </span>
                  </div>
                  <p className="a-hint mt-1 line-clamp-2">{message.message}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-7">
        <h2 className="mb-2.5 text-[14px] font-semibold tracking-tight">Content</h2>
        <ul className="a-card a-divide overflow-hidden">
          <CountRow href="/admin/posts" label="Writing" total={counts.posts.total} drafts={counts.posts.drafts} />
          <CountRow href="/admin/work" label="Work" total={counts.work.total} drafts={counts.work.drafts} />
          <CountRow href="/admin/pages" label="Pages" total={counts.pages.total} drafts={counts.pages.drafts} />
          <CountRow href="/admin/experience" label="Experience" total={counts.experience} />
          <CountRow href="/admin/tech" label="Tech" total={counts.tech} />
        </ul>
      </section>

      <Diagnostics />
    </>
  )
}

function Stat({ label, value, href }: { label: string; value: number; href?: string }) {
  const content = (
    <>
      <div className="a-mono text-[26px] leading-none font-medium">{value}</div>
      <div className="a-hint mt-1.5">{label}</div>
    </>
  )

  if (!href) return <div className="a-card px-4 py-4">{content}</div>

  return (
    <Link href={href} className="a-card block px-4 py-4 transition-colors hover:bg-[var(--a-panel-2)]">
      {content}
    </Link>
  )
}

function CountRow({
  href,
  label,
  total,
  drafts = 0,
}: {
  href: string
  label: string
  total: number
  drafts?: number
}) {
  return (
    <li>
      <Link href={href} className="a-row flex items-center justify-between gap-3">
        <span className="text-[14px]">{label}</span>
        <span className="flex items-center gap-2">
          {drafts > 0 && <span className="a-badge a-badge-draft">{drafts} draft</span>}
          <span className="a-hint a-mono">{total}</span>
        </span>
      </Link>
    </li>
  )
}
