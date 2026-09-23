import Link from 'next/link'
import type { ReactNode } from 'react'

/** Shared furniture for the list and edit screens. Server components. */

export function PageHeader({
  title,
  description,
  back,
  action,
}: {
  title: string
  description?: string
  /** A breadcrumb to the collection, on edit screens. */
  back?: { href: string; label: string }
  action?: ReactNode
}) {
  return (
    <header className="mb-5">
      {back && (
        <Link href={back.href} className="a-hint hover:text-[var(--a-ink)]">
          {'←'} {back.label}
        </Link>
      )}
      <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[19px] leading-tight font-semibold tracking-tight">{title}</h1>
          {description && <p className="a-hint mt-1 max-w-prose">{description}</p>}
        </div>
        {action}
      </div>
    </header>
  )
}

export function NewButton({ href, label = 'New' }: { href: string; label?: string }) {
  return (
    <Link href={href} className="a-btn a-btn-primary">
      {label}
    </Link>
  )
}

/**
 * The empty state.
 *
 * It says what to do next rather than only that there is nothing. "No posts yet"
 * is a fact; a button to write one is a screen.
 */
export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="a-card px-5 py-10 text-center">
      <p className="a-hint mx-auto max-w-sm leading-relaxed">{children}</p>
    </div>
  )
}

/** A bordered, divided list. Rows are links; the whole row is the target. */
export function List({ children }: { children: ReactNode }) {
  return <ul className="a-card a-divide overflow-hidden">{children}</ul>
}

export function Meta({ children }: { children: ReactNode }) {
  return <span className="a-hint a-mono text-[11px]">{children}</span>
}

/**
 * Dates in the admin are formatted with an explicit locale and UTC.
 *
 * Without both, the server and client render different strings for the same
 * Date and React reports a hydration mismatch. en-CA also gives the ISO-shaped
 * yyyy-mm-dd, which sorts visually and is unambiguous in a table.
 */
export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(date)
}
