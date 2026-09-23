import { notFound } from 'next/navigation'
import { readMessage } from '@/lib/admin/read'
import { markOpened } from '@/lib/admin/messages'
import { PageHeader, formatDateTime } from '@/components/admin/page-parts'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { deleteMessage, setArchived, setRead, setSpam } from '../actions'

export const dynamic = 'force-dynamic'

/**
 * One message.
 *
 * The reply is a mailto: rather than a send form. Sending mail from the site
 * would mean an outbound provider, a from-address that passes SPF and DKIM, and
 * a deliverability problem to own, all so a reply arrives from the same person it
 * would have arrived from anyway. The mail client already does this well.
 */
export default async function MessagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const message = await readMessage(id)
  if (!message) notFound()

  await markOpened(id)

  const subject = encodeURIComponent('Re: your message via emanuelmolla.dev')
  const body = encodeURIComponent(
    `\n\n---\nOn ${formatDateTime(message.createdAt)} you wrote:\n\n${message.message}\n`
  )

  return (
    <>
      <PageHeader
        title={message.name}
        back={{ href: '/admin/messages', label: 'Messages' }}
        description={formatDateTime(message.createdAt)}
      />

      <article className="a-card px-5 py-5">
        <dl className="grid gap-2 text-[13px] sm:grid-cols-[6rem_minmax(0,1fr)]">
          <dt className="a-label">From</dt>
          <dd className="a-mono break-all">{message.email}</dd>

          <dt className="a-label">Consent</dt>
          <dd>
            {message.contactConsent
              ? 'Agreed to their details being kept for a reply.'
              : 'Did not tick the consent box. Reply, then do not retain the address.'}
          </dd>

          {message.sourcePage && (
            <>
              <dt className="a-label">From page</dt>
              <dd className="a-mono break-all">{message.sourcePage}</dd>
            </>
          )}

          {message.meta?.country && (
            <>
              <dt className="a-label">Country</dt>
              <dd className="a-mono">{message.meta.country}</dd>
            </>
          )}
        </dl>

        {/* whitespace-pre-wrap, not a markdown render. This is text a stranger
            typed into a textarea; parsing it as markup would be both wrong and a
            way to get someone else's HTML into the admin. */}
        <p className="mt-5 border-t border-[var(--a-line)] pt-5 text-[14px] leading-relaxed whitespace-pre-wrap">
          {message.message}
        </p>
      </article>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <a
          href={`mailto:${message.email}?subject=${subject}&body=${body}`}
          className="a-btn a-btn-primary"
        >
          Reply
        </a>

        <form action={setRead}>
          <input type="hidden" name="id" value={message._id} />
          <input type="hidden" name="read" value={message.read ? 'false' : 'true'} />
          <button type="submit" className="a-btn">
            Mark {message.read ? 'unread' : 'read'}
          </button>
        </form>

        <form action={setArchived}>
          <input type="hidden" name="id" value={message._id} />
          <input type="hidden" name="archived" value={message.archived ? 'false' : 'true'} />
          <button type="submit" className="a-btn">
            {message.archived ? 'Move to inbox' : 'Archive'}
          </button>
        </form>

        <form action={setSpam}>
          <input type="hidden" name="id" value={message._id} />
          <input type="hidden" name="spam" value={message.spam ? 'false' : 'true'} />
          <button type="submit" className="a-btn">
            {message.spam ? 'Not spam' : 'Spam'}
          </button>
        </form>

        <DeleteButton action={deleteMessage} id={message._id} />
      </div>
    </>
  )
}
