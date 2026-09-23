import type { ZodError } from 'zod'

/**
 * FormData to typed values.
 *
 * Every field arrives as a string, and the zod schemas in lib/models want Dates,
 * numbers, booleans, arrays and nulls. Doing that conversion inline in each
 * action produces six subtly different opinions about what an empty string means,
 * so it is done here once.
 *
 * THE RULE: empty string becomes null, never "" and never undefined. The models
 * use `.nullable()` throughout, so null is the value that means "not set". An
 * empty string would store a real value that renders as a blank line.
 */

function raw(fd: FormData, key: string): string {
  const value = fd.get(key)
  return typeof value === 'string' ? value : ''
}

/** Required text. Trimmed, but returned even if blank so zod reports the error. */
export function text(fd: FormData, key: string): string {
  return raw(fd, key).trim()
}

/** Optional text. Blank becomes null. */
export function optText(fd: FormData, key: string): string | null {
  const value = raw(fd, key).trim()
  return value === '' ? null : value
}

/** Body copy: trimmed at the ends only. Interior whitespace is meaningful. */
export function body(fd: FormData, key: string): string {
  return raw(fd, key).replace(/^\s+|\s+$/g, '')
}

/**
 * An unchecked checkbox sends nothing at all, so absence is false. This is why
 * checkbox state cannot be diffed against a default without also sending a
 * hidden field, and why every boolean here defaults to false rather than to the
 * schema default.
 */
export function flag(fd: FormData, key: string): boolean {
  const value = raw(fd, key)
  return value === 'on' || value === 'true' || value === '1'
}

/** Optional integer. Blank and unparseable both become null. */
export function optInt(fd: FormData, key: string): number | null {
  const value = raw(fd, key).trim()
  if (value === '') return null
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) ? n : null
}

export function int(fd: FormData, key: string, fallback = 0): number {
  return optInt(fd, key) ?? fallback
}

/**
 * A <input type="date"> value, as UTC midnight.
 *
 * UTC rather than local, deliberately. `new Date('2026-03-01')` is already
 * parsed as UTC by spec, while `new Date(2026, 2, 1)` is local; mixing the two
 * is how a date silently becomes the day before for anyone west of Greenwich.
 * Everything here writes UTC and toDayInput reads it back with UTC getters, so
 * the round trip is exact.
 */
export function day(fd: FormData, key: string): Date | null {
  const value = raw(fd, key).trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

/** The inverse of day(). Feeds a Date back into <input type="date">. */
export function toDayInput(value: Date | string | null | undefined): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

/**
 * One item per line.
 *
 * Newlines rather than commas for anything whose values can contain a comma,
 * which is most prose. Resume highlights are the case that decides it: "Cut p99
 * latency from 400ms to 90ms, mostly by batching" is one bullet, not two.
 */
export function lines(fd: FormData, key: string): string[] {
  return raw(fd, key)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

/** Comma or newline separated. For short tokens: tags, stack entries, languages. */
export function tokens(fd: FormData, key: string): string[] {
  return raw(fd, key)
    .split(/[,\n]/)
    .map((token) => token.trim())
    .filter(Boolean)
}

/**
 * Repeating groups, read as parallel arrays.
 *
 * Rows are named `link.kind`, `link.url`, `link.label` and read with getAll(),
 * which keeps document order. That avoids index bookkeeping in the client: adding
 * or removing a row is appending to or splicing an array, with no need to
 * renumber `link[3].url` into `link[2].url`.
 *
 * Alignment holds only if every row renders every input, including the blank
 * ones, which the row components below do. A row whose `required` field is empty
 * is dropped, which is how a half-filled trailing row disappears on save.
 */
export function rows<F extends Record<string, string>>(
  fd: FormData,
  fields: F,
  required: keyof F
): Record<keyof F, string>[] {
  // The generic is bound to `fields` rather than to `required`, deliberately.
  // Writing it as <K extends string>(fields: Record<K, string>, required: K) lets
  // TypeScript infer K from the narrower of the two, which is the single literal
  // in `required`, so the result comes back typed as Record<'url', string> and
  // every other column is reported as not existing.
  type K = keyof F
  const keys = Object.keys(fields) as K[]
  const columns = new Map<K, string[]>()

  for (const key of keys) {
    columns.set(
      key,
      fd.getAll(fields[key]).map((value) => (typeof value === 'string' ? value.trim() : ''))
    )
  }

  const length = Math.max(...keys.map((key) => columns.get(key)?.length ?? 0), 0)
  const out: Record<K, string>[] = []

  for (let i = 0; i < length; i += 1) {
    const row = {} as Record<K, string>
    for (const key of keys) row[key] = columns.get(key)?.[i] ?? ''
    if (row[required] === '') continue
    out.push(row)
  }

  return out
}

/* ------------------------------------------------------------------ zod --- */

/**
 * Flatten a ZodError into the shape the form components read.
 *
 * Paths are joined with dots so a nested failure lands on the right input:
 * ['bio','short'] becomes 'bio.short', which is also the input's name.
 */
export function zodFieldErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {}

  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : 'form'
    // First error per field wins. Showing three messages under one input is
    // noise; the first is the one to fix.
    if (!(key in out)) out[key] = issue.message
  }

  return out
}

/* -------------------------------------------------------- sub-documents --- */

/**
 * SEO overrides, read from the four inputs the forms render.
 *
 * Every field is nullable: an empty SEO title means "fall back to the content
 * title", which is what the routes already do. Storing the content title here as
 * well would create a second copy that silently stops matching the first.
 */
export function parseSeo(fd: FormData, prefix = 'seo') {
  return {
    title: optText(fd, `${prefix}.title`),
    description: optText(fd, `${prefix}.description`),
    ogImage: null,
    canonicalUrl: optText(fd, `${prefix}.canonicalUrl`),
    noindex: flag(fd, `${prefix}.noindex`),
  }
}

/**
 * An image, from a URL plus its intrinsic size.
 *
 * Width and height are required by the media schema on purpose: next/image
 * cannot reserve space without them, and the layout shift that follows is a Core
 * Web Vitals signal working against the ranking this whole rebuild is for.
 *
 * So a partly filled image is rejected here with a message that says which half
 * is missing, rather than being handed to zod, which would report it as
 * "expected number, received NaN" on a field the form does not name.
 */
export function parseMedia(
  fd: FormData,
  prefix: string
): { value: null; error?: Record<string, string> } | { value: Record<string, unknown> } {
  const url = optText(fd, `${prefix}.url`)
  if (!url) return { value: null }

  const width = optInt(fd, `${prefix}.width`)
  const height = optInt(fd, `${prefix}.height`)
  const alt = optText(fd, `${prefix}.alt`)

  if (!width || !height) {
    return {
      value: null,
      error: {
        [`${prefix}.width`]:
          'An image needs its real pixel width and height, or the page shifts as it loads.',
      },
    }
  }

  if (!alt) {
    return {
      value: null,
      error: { [`${prefix}.alt`]: 'Describe the image. It is read aloud and shown if it fails to load.' },
    }
  }

  return {
    value: {
      url,
      alt,
      width,
      height,
      blurDataURL: null,
      caption: optText(fd, `${prefix}.caption`),
    },
  }
}

/** Every value posted under one name. Multi-selects and checkbox groups. */
export function many(fd: FormData, key: string): string[] {
  return fd
    .getAll(key)
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean)
}
