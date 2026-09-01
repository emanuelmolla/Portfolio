import { unstable_cache } from 'next/cache'
import { connectDB } from '@/lib/db'

/**
 * Shared plumbing for the data access layer.
 *
 * Two jobs: make Mongoose output safe to hand to React, and wrap every read in
 * a tagged cache so an admin save can invalidate exactly what it touched.
 */

/** Cache tags. One per collection, so revalidation is surgical. */
export const TAGS = {
  profile: 'profile',
  page: 'page',
  work: 'work',
  post: 'post',
  experience: 'experience',
  tech: 'tech',
} as const

export type Tag = (typeof TAGS)[keyof typeof TAGS]

/**
 * Mongoose .lean() returns plain objects, but they still contain ObjectId and
 * Date class instances. Dates survive the server/client boundary; ObjectIds do
 * not, and Next fails at runtime with a "only plain objects can be passed"
 * error that points at the component rather than the query. Convert here, once.
 */
export function toPlain<T>(value: T): T {
  if (value === null || value === undefined) return value
  if (value instanceof Date) return value as T
  if (Array.isArray(value)) return value.map(toPlain) as unknown as T

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>

    // ObjectId and Decimal128 both expose a Buffer-backed toString.
    if (obj._bsontype !== undefined) return String(obj) as unknown as T

    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj)) {
      if (k === '__v') continue
      out[k] = toPlain(v)
    }
    return out as T
  }

  return value
}

/**
 * Wrap a read so it connects, runs, and serializes, cached under `tags`.
 *
 * The cache is what makes both drivers work at once: pages are fully static for
 * crawlers, and an admin save calls revalidateTag() so an edit goes live
 * without a redeploy.
 */
export function cachedQuery<Args extends unknown[], Result>(
  keyParts: string[],
  tags: Tag[],
  fn: (...args: Args) => Promise<Result>
) {
  return unstable_cache(
    async (...args: Args) => {
      await connectDB()
      return toPlain(await fn(...args))
    },
    keyParts,
    { tags }
  )
}
