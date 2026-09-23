import Link from 'next/link'
import { listTech } from '@/lib/admin/read'
import { Empty, List, NewButton, PageHeader } from '@/components/admin/page-parts'

export const dynamic = 'force-dynamic'

export default async function TechPage() {
  const tech = await listTech()

  return (
    <>
      <PageHeader
        title="Tech"
        description="The tagging taxonomy behind projects and experience. There is no proficiency field on purpose, so there is no way to render a bar chart of your own skill."
        action={<NewButton href="/admin/tech/new" label="New technology" />}
      />

      {tech.length === 0 ? (
        <Empty>
          Nothing here yet. Add these before projects, since a project references them rather than
          listing names.
        </Empty>
      ) : (
        <List>
          {tech.map((item) => (
            <li key={item._id}>
              <Link href={`/admin/tech/${item._id}`} className="a-row flex items-center gap-3">
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-medium">{item.name}</span>
                    {item.rank !== null && (
                      <span className="a-badge a-badge-live">rank {item.rank}</span>
                    )}
                    {item.featured && <span className="a-badge">featured</span>}
                  </span>
                  {item.note && <span className="a-hint mt-1 line-clamp-1 block">{item.note}</span>}
                </span>
                <span className="a-hint a-mono shrink-0 text-[11px]">{item.category}</span>
              </Link>
            </li>
          ))}
        </List>
      )}
    </>
  )
}
