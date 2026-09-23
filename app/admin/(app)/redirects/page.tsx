import Link from 'next/link'
import { listRedirects } from '@/lib/admin/read'
import { Empty, List, NewButton, PageHeader } from '@/components/admin/page-parts'

export const dynamic = 'force-dynamic'

export default async function RedirectsPage() {
  const redirects = await listRedirects()

  return (
    <>
      <PageHeader
        title="Redirects"
        description="Most of these write themselves when a slug is renamed. This is for the ones nothing can infer: retired pages, hand-restructured URLs, v1 paths."
        action={<NewButton href="/admin/redirects/new" label="New redirect" />}
      />

      {redirects.length === 0 ? (
        <Empty>
          Nothing here. Renaming a slug adds one automatically, so an empty list means nothing has
          moved yet.
        </Empty>
      ) : (
        <List>
          {redirects.map((entry) => (
            <li key={entry._id}>
              <Link href={`/admin/redirects/${entry._id}`} className="a-row">
                <div className="a-mono flex flex-wrap items-center gap-2 text-[13px]">
                  <span>{entry.from}</span>
                  <span className="text-[var(--a-faint)]">{'→'}</span>
                  <span className="text-[var(--a-muted)]">{entry.to}</span>
                  {entry.statusCode !== 301 && (
                    <span className="a-badge">{entry.statusCode}</span>
                  )}
                </div>
                {entry.note && <p className="a-hint mt-1">{entry.note}</p>}
              </Link>
            </li>
          ))}
        </List>
      )}
    </>
  )
}
