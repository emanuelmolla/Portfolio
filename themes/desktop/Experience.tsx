import type { Experience } from '@/lib/models'
import { renderMarkdown } from '@/lib/markdown'

export function ExperienceView({ experience }: { experience: Experience[] }) {
  return (
    <section className="mx-auto max-w-3xl p-6 sm:p-10">
      <p className="font-mono text-xs text-[var(--muted)]">
        experience / records
      </p>
      <h1 className="mt-3 mb-8 text-3xl font-semibold">
        Experience & education
      </h1>
      {experience.map((item) => (
        <article
          key={item.slug}
          id={item.slug}
          className="mb-5 overflow-hidden rounded border border-[var(--rule)]"
        >
          <header className="flex flex-wrap justify-between gap-2 border-b border-[var(--rule)] bg-[var(--chrome)] px-4 py-2 font-mono text-[11px]">
            <span>
              {item.section} / {item.slug}
            </span>
            <span>{item.current ? 'Current' : 'Completed'}</span>
          </header>
          <div className="p-5">
            <h2 className="text-xl font-semibold">{item.role}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {item.org}
              {item.location ? ` / ${item.location}` : ''}
            </p>
            <p className="mt-2 font-mono text-xs text-[var(--muted)]">
              {item.startDate && new Date(item.startDate).getUTCFullYear()}
              {item.startDate && ' – '}
              {item.current
                ? 'Present'
                : item.endDate && new Date(item.endDate).getUTCFullYear()}
            </p>
            {item.summary && (
              <div
                className="prose mt-5"
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
