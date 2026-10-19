import type { Experience } from '@/lib/models'
import { renderMarkdown } from '@/lib/markdown'
import { formatDate } from '../clean/format'
import { FolderIcon } from './icons'

export function ExperienceView({ experience }: { experience: Experience[] }) {
  return (
    <section>
      <header className="desktop-folder-heading">
        <FolderIcon />
        <div>
          <h1>Experience & education</h1>
          <p>{experience.length} records</p>
        </div>
      </header>
      {experience.map((item) => (
        <article key={item.slug} id={item.slug} className="desktop-record">
          <header>
            <span>{item.slug}.md</span>
            <span>{item.section}</span>
          </header>
          <div className="desktop-record-body">
            <h2>{item.role}</h2>
            <dl>
              <dt>Organization</dt>
              <dd>{item.org}</dd>
              {item.location && (
                <>
                  <dt>Location</dt>
                  <dd>{item.location}</dd>
                </>
              )}
              <dt>Period</dt>
              <dd>
                {formatDate(item.startDate, 'month')} to{' '}
                {item.current ? 'Present' : formatDate(item.endDate, 'month')}
              </dd>
            </dl>
            {item.summary && (
              <div
                className="prose"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(item.summary),
                }}
              />
            )}
            {item.highlights.length > 0 && (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
                {item.highlights.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            )}
          </div>
        </article>
      ))}
      {experience.length === 0 && <p>No records found.</p>}
    </section>
  )
}
