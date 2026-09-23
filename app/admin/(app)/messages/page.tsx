import Link from 'next/link'
import { listMessages, type MessageBox } from '@/lib/admin/read'
import { Empty, List, PageHeader, formatDateTime } from '@/components/admin/page-parts'

export const dynamic = 'force-dynamic'

/**
 * The inbox.
 *
 * This is the one screen v1's admin already had, and the one thing here that is
 * genuinely load-bearing: it is where a message from someone reading the site
 * actually arrives.
 */

const BOXES: { key: MessageBox; label: string }[] = [
  { key: 'inbox', label: 'Inbox' },
  { key: 'archived', label: 'Archived' },
  { key: 'spam', label: 'Spam' },
]

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ box?: string }>
}) {
  const params = await searchParams
  const box: MessageBox =
    params.box === 'archived' || params.box === 'spam' ? params.box : 'inbox'

  const messages = await listMessages(box)

  return (
    <>
      <PageHeader title="Messages" description="Submissions from the contact form." />

      <div className="mb-4 flex gap-1">
        {BOXES.map((item) => (
          <Link
            key={item.key}
            href={item.key === 'inbox' ? '/admin/messages' : `/admin/messages?box=${item.key}`}
            aria-current={box === item.key ? 'page' : undefined}
            className={`a-btn a-btn-sm ${box === item.key ? 'a-btn-primary' : 'a-btn-ghost'}`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {messages.length === 0 ? (
        <Empty>
          {box === 'inbox'
            ? 'Nothing here. Messages sent through the contact form land in this list.'
            : `Nothing in ${box}.`}
        </Empty>
      ) : (
        <List>
          {messages.map((message) => (
            <li key={message._id}>
              <Link href={`/admin/messages/${message._id}`} className="a-row">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="flex items-center gap-2 text-[14px]">
                    {/* Weight carries unread rather than a dot, so the list stays
                        scannable at a glance without a legend. */}
                    <span className={message.read ? '' : 'font-semibold'}>{message.name}</span>
                    {!message.read && <span className="a-badge a-badge-unread">new</span>}
                  </span>
                  <span className="a-hint a-mono text-[11px]">
                    {formatDateTime(message.createdAt)}
                  </span>
                </div>
                <p className="a-hint mt-1 line-clamp-2">{message.message}</p>
                <p className="a-hint a-mono mt-1 text-[11px]">{message.email}</p>
              </Link>
            </li>
          ))}
        </List>
      )}
    </>
  )
}
