import Link from 'next/link'
import { listPages } from '@/lib/admin/read'
import { StatusBadge } from '@/components/admin/fields'
import { Empty, List, NewButton, PageHeader } from '@/components/admin/page-parts'

export const dynamic = 'force-dynamic'

export default async function PagesPage() {
  const pages = await listPages()

  return (
    <>
      <PageHeader
        title="Pages"
        description="Standing pages at the root: /about, /uses, /now. Kept updated in place rather than dated, which is what separates them from posts."
        action={<NewButton href="/admin/pages/new" label="New page" />}
      />

      {pages.length === 0 ? (
        <Empty>No pages yet. /about is the one every portfolio needs.</Empty>
      ) : (
        <List>
          {pages.map((page) => (
            <li key={page._id}>
              <Link href={`/admin/pages/${page._id}`} className="a-row">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-[14px] font-medium">{page.title}</span>
                  <StatusBadge status={page.status} />
                  {page.inNav && <span className="a-badge">nav {page.navOrder}</span>}
                </div>
                <div className="a-hint a-mono mt-1 text-[11px]">/{page.slug}</div>
              </Link>
            </li>
          ))}
        </List>
      )}
    </>
  )
}
