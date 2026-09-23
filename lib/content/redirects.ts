import { RedirectModel, type Redirect } from '@/lib/models'
import { connectDB } from '@/lib/db'
import { hasDatabase, toPlain } from './_util'

/**
 * Serving the slug history.
 *
 * Until this existed, renames were only half handled: trackSlugChange wrote
 * Redirect rows and pushed the old slug onto previousSlugs, and nothing read
 * either. The effect was a working old URL that served the same content as the
 * new one, which is the textbook duplicate-content problem. Two URLs returning
 * 200 for the same page split whatever ranking that page had, and Google picks
 * which one to keep.
 *
 * Two mechanisms, in the routes:
 *
 *   1. Matched via previousSlugs -> 308 to the canonical slug. This is the common
 *      case, and it is what turns "the old URL still works" into "the old URL
 *      sends you and the crawler to the real one".
 *
 *   2. No document at all -> look here, for retired pages and v1 paths that have
 *      no live record to attach history to.
 *
 * Not cached, and that is a deliberate trade. This only runs on the path where a
 * lookup already failed, so it costs one query on 404s and nothing at all on
 * every normal request. Caching it would mean a tag to invalidate on every
 * rename for no measurable gain.
 */
export async function findRedirect(path: string): Promise<Redirect | null> {
  if (!hasDatabase()) return null

  try {
    await connectDB()
    const doc = await RedirectModel.findOne({ from: path }).lean()
    return doc ? (toPlain(doc) as unknown as Redirect) : null
  } catch {
    // A redirect lookup must never turn a clean 404 into a 500.
    return null
  }
}
