import type { Work } from '@/lib/models'

/**
 * Formatting lives in the theme, never in lib/content.
 *
 * That is the boundary rule: the data layer supplies facts (a Date, a
 * precision, a null endDate) and each theme decides how to say them. A
 * different theme can render the same record as "2025" or "Jul 2025 → now"
 * without the data changing.
 */

/**
 * FORMATTED IN UTC, and this is not a detail.
 *
 * Dates are stored as UTC midnight: `new Date('2025-01-01')` is parsed as UTC by
 * spec, and lib/admin/form.ts writes them that way on purpose so the admin's
 * date inputs round-trip exactly. Formatting them in the VIEWER's timezone then
 * subtracts the offset, so for anyone west of Greenwich a date on the first of a
 * month silently lands on the last day of the previous one.
 *
 * That was live: Emanuel's BCIT start is stored as 2025-01-01 and rendered as
 * "2024" in Vancouver, quietly aging his degree by a year. Every date on the
 * site had the same fault; only the ones on a boundary showed it.
 *
 * Pinning the timezone also makes the server and client agree, which is what
 * stops a hydration mismatch on any date rendered in both.
 */
const UTC = { timeZone: 'UTC' } as const

const MONTH = new Intl.DateTimeFormat('en-CA', { month: 'short', year: 'numeric', ...UTC })
const YEAR = new Intl.DateTimeFormat('en-CA', { year: 'numeric', ...UTC })
const DAY = new Intl.DateTimeFormat('en-CA', { day: 'numeric', month: 'short', year: 'numeric', ...UTC })

export function formatDate(
  value: Date | string | null | undefined,
  precision: 'day' | 'month' | 'year' = 'month'
): string {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''

  if (precision === 'day') return DAY.format(d)
  if (precision === 'year') return YEAR.format(d)
  return MONTH.format(d)
}

/**
 * A work item's date line. dateOverride wins when set, because "19th Century"
 * and "c. 1998" are claims no Date can carry.
 */
export function workDateLine(work: Work): string {
  if (work.dateOverride) return work.dateOverride

  const start = formatDate(work.startDate, work.datePrecision)
  if (!start) return ''

  const prefix = work.circa ? 'c. ' : ''
  if (!work.endDate) {
    return work.lifecycle === 'active' ? `${prefix}${start} → now` : `${prefix}${start}`
  }

  const end = formatDate(work.endDate, work.datePrecision)
  return end && end !== start ? `${prefix}${start} → ${end}` : `${prefix}${start}`
}

/** "solo" / "team" reads better than a boolean, and role wins when it exists. */
export function workRoleLine(work: Work): string {
  if (work.role) return work.role.toLowerCase()
  return work.isGroup ? 'team' : 'solo'
}

export function yearOf(value: Date | string | null | undefined): string {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? '' : String(d.getFullYear())
}
