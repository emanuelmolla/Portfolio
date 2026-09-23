import Link from 'next/link'
import { listWork } from '@/lib/admin/read'
import { StatusBadge } from '@/components/admin/fields'
import { Empty, List, NewButton, PageHeader, formatDate } from '@/components/admin/page-parts'
import { toggleWorkStatus } from './actions'

export const dynamic = 'force-dynamic'

export default async function WorkPage() {
  const work = await listWork()

  return (
    <>
      <PageHeader
        title="Work"
        description="Projects at /work. Not only software: the kind field covers writing, photos and chess without a schema change."
        action={<NewButton href="/admin/work/new" label="New project" />}
      />

      {work.length === 0 ? (
        <Empty>Nothing here yet. Add the two or three projects worth talking about first.</Empty>
      ) : (
        <List>
          {work.map((item) => (
            <li key={item._id} className="flex items-center gap-2 pr-3">
              <Link href={`/admin/work/${item._id}`} className="a-row min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-[14px] font-medium">{item.title}</span>
                  <StatusBadge status={item.status} />
                  {item.featuredOrder !== null && (
                    <span className="a-badge a-badge-live">pinned {item.featuredOrder}</span>
                  )}
                </div>
                <div className="a-hint a-mono mt-1 flex flex-wrap gap-x-3 text-[11px]">
                  <span>/work/{item.slug}</span>
                  <span>{item.kind}</span>
                  <span>{item.lifecycle}</span>
                  {item.startDate && <span>{formatDate(item.startDate)}</span>}
                </div>
              </Link>

              <form action={toggleWorkStatus} className="shrink-0">
                <input type="hidden" name="id" value={item._id} />
                <button type="submit" className="a-btn a-btn-sm">
                  {item.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
              </form>
            </li>
          ))}
        </List>
      )}
    </>
  )
}
