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

/** No connection string configured means we run off the seed module. */
export function hasDatabase(): boolean {
  return Boolean(process.env.MONGODB_URI)
}

/**
 * Wrap a read so it connects, runs, and serializes, cached under `tags`.
 *
 * The cache is what makes both drivers work at once: pages are fully static for
 * crawlers, and an admin save calls revalidateTag() so an edit goes live
 * without a redeploy.
 *
 * `seed` is the no-database path. It is not a mock: it returns the same real
 * content that `npm run seed` writes into Mongo, from lib/content/_seed.ts.
 * This exists so the site runs on a fresh clone with no configuration, which
 * matters for reviewing design work. The moment MONGODB_URI is set, this branch
 * is dead and every read goes to the database.
 */
export function cachedQuery<Args extends unknown[], Result>(
  keyParts: string[],
  tags: Tag[],
  fn: (...args: Args) => Promise<Result>,
  seed?: (...args: Args) => Result
) {
  return unstable_cache(
    async (...args: Args) => {
      if (!hasDatabase()) {
        if (!seed) {
          throw new Error(
            `No MONGODB_URI and no seed fallback for [${keyParts.join('/')}]. ` +
              `Either set MONGODB_URI in .env.local or add a seed resolver.`
          )
        }
        return toPlain(seed(...args))
      }

      await connectDB()
      return toPlain(await fn(...args))
    },
    keyParts,
    { tags }
  )
}
