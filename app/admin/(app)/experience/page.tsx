import Link from 'next/link'
import { listExperience } from '@/lib/admin/read'
import { StatusBadge } from '@/components/admin/fields'
import { Empty, List, NewButton, PageHeader, formatDate } from '@/components/admin/page-parts'

export const dynamic = 'force-dynamic'

export default async function ExperiencePage() {
  const entries = await listExperience()

  // Grouped by section, so the screen reads the way the /about page does rather
  // than as one undifferentiated list of jobs, degrees and awards.
  const bySection = entries.reduce<Record<string, typeof entries>>((acc, entry) => {
    ;(acc[entry.section] ??= []).push(entry)
    return acc
  }, {})

  return (
    <>
      <PageHeader
        title="Experience"
        description="Work history, education and awards. The same records the resume will be generated from."
        action={<NewButton href="/admin/experience/new" label="New entry" />}
      />

      {entries.length === 0 ? (
        <Empty>Nothing here yet. Work history and education both live in this collection.</Empty>
      ) : (
        <div className="grid gap-6">
          {Object.entries(bySection).map(([section, items]) => (
            <section key={section}>
              <h2 className="a-label mb-2">{section}</h2>
              <List>
                {items.map((entry) => (
                  <li key={entry._id}>
                    <Link href={`/admin/experience/${entry._id}`} className="a-row">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[14px] font-medium">{entry.role}</span>
                        <span className="a-hint">{entry.org}</span>
                        {entry.current && <span className="a-badge a-badge-live">current</span>}
                        {entry.status !== 'published' && <StatusBadge status={entry.status} />}
                      </div>
                      <div className="a-hint a-mono mt-1 flex flex-wrap gap-x-3 text-[11px]">
                        <span>
                          {formatDate(entry.startDate)}
                          {' to '}
                          {entry.current ? 'present' : formatDate(entry.endDate) || 'unknown'}
                        </span>
                        {entry.employmentType && <span>{entry.employmentType}</span>}
                        {entry.highlights.length > 0 && (
                          <span>
                            {entry.highlights.length}{' '}
                            {entry.highlights.length === 1 ? 'highlight' : 'highlights'}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </List>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
