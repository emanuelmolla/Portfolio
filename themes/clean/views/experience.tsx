import type { Experience } from '@/lib/models'
import { renderMarkdown } from '@/lib/markdown'

export function ExperienceView({ experience }: { experience: Experience[] }) {
  const date = (value: Date) =>
    new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    }).format(new Date(value))
  return (
    <section className="clean-experience">
      <h1 className="mb-12 text-4xl font-semibold tracking-tight">
        Experience & education
      </h1>
      <div className="space-y-10">
        {experience.map((item) => (
          <article
            key={item.slug}
            id={item.slug}
            className="border-t border-[var(--rule)] pt-6"
          >
            <p className="text-xs text-[var(--muted)]">
              {item.startDate && date(item.startDate)}
              {item.startDate && ' – '}
              {item.current ? 'Present' : item.endDate && date(item.endDate)}
            </p>
            <h2 className="mt-3 text-xl font-semibold">{item.role}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {item.org}
              {item.location ? ` / ${item.location}` : ''}
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
          </article>
        ))}
      </div>
      {experience.length === 0 && <p>No entries published yet.</p>}
    </section>
  )
}
