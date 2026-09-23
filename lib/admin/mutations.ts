import { updateTag } from 'next/cache'
import { hasDatabase, type Tag } from '@/lib/content/_util'
import { connectDB } from '@/lib/db'
import { RedirectModel } from '@/lib/models'
import { adminOrNull } from './session'

/** Re-exported so actions import one module. Defined in lib/slug.ts because the
 *  client-side slug field needs it too and cannot import mongoose. */
export { slugify } from '@/lib/slug'

/**
 * Shared plumbing for writes.
 *
 * Three things every mutation has to do, factored out so no action can skip one:
 * check authorisation, invalidate exactly the cache tags it touched, and record
 * slug history when a slug changes.
 */

/** Declared in lib/admin/state.ts, which the client forms also import. Anything
 *  with a value export in this file would pull mongoose into the browser. */
export type { ActionState } from './state'
import type { ActionState } from './state'

/**
 * Authorisation plus a usable database, as one check.
 *
 * Called at the top of every action. A server action is a POST endpoint with a
 * predictable id that exists independently of the page that rendered it, so the
 * layout's gate protects nothing here. This is the only thing standing between
 * an unauthenticated request and a write.
 */
export async function guard(): Promise<ActionState | null> {
  const admin = await adminOrNull()
  if (!admin) {
    return { ok: false, error: 'Not signed in. Reload the page and sign in again.' }
  }

  if (!hasDatabase()) {
    return {
      ok: false,
      error: 'No MONGODB_URI is configured, so there is nothing to save to.',
    }
  }

  await connectDB()
  return null
}

/**
 * Invalidate the reads that could now be stale.
 *
 * updateTag, not revalidateTag. In Next 16 those are different things:
 * revalidateTag marks a tag stale against a cache-life profile and the refresh
 * happens in the background, so the very next read can still be the old value.
 * updateTag purges immediately and is documented for exactly this case,
 * read-your-own-writes inside a server action. For a CMS that is not a
 * preference: an editor who saves and then sees the previous version concludes
 * the save failed and saves again.
 *
 * It is only callable from a server action, which every caller here is.
 */
export function revalidate(...tags: Tag[]): void {
  for (const tag of tags) updateTag(tag)
}

export function saved(): ActionState {
  return { ok: true, savedAt: new Date().toISOString() }
}

/**
 * Turn a thrown write error into something readable.
 *
 * The duplicate-key case is worth its own message: every sluggable collection has
 * a unique index on slug, and "E11000 duplicate key error collection" is not a
 * sentence anyone should have to read to learn that two projects are called the
 * same thing.
 */
export function writeError(err: unknown): ActionState {
  const message = err instanceof Error ? err.message : String(err)

  if (message.includes('E11000')) {
    const field = /index: (\w+)_/.exec(message)?.[1] ?? 'slug'
    return {
      ok: false,
      fieldErrors: { [field]: `That ${field} is already used by another entry.` },
    }
  }

  return { ok: false, error: `Save failed: ${message}` }
}

/* ----------------------------------------------------------------- slugs --- */

/**
 * Record a rename so the old URL keeps working.
 *
 * Two mechanisms, deliberately both: the old slug goes into previousSlugs so the
 * document is still findable at its old address, and a Redirect row is written so
 * the old address can 301 to the new one. The first keeps the page alive, the
 * second is what actually transfers accumulated ranking.
 *
 * Returns the previousSlugs array to store. Called before the write, with the
 * document as it currently exists.
 */
export async function trackSlugChange(
  previous: { slug: string; previousSlugs?: string[] } | null,
  nextSlug: string,
  basePath: string
): Promise<string[]> {
  const history = previous?.previousSlugs ?? []
  if (!previous || previous.slug === nextSlug) return history

  const merged = Array.from(new Set([...history, previous.slug])).filter(
    (slug) => slug !== nextSlug
  )

  // Upserted rather than inserted: renaming a → b → a should not leave a
  // redirect pointing at a URL that is live again, and it must not throw on the
  // unique index for `from`.
  await RedirectModel.findOneAndUpdate(
    { from: `${basePath}/${previous.slug}` },
    {
      from: `${basePath}/${previous.slug}`,
      to: `${basePath}/${nextSlug}`,
      statusCode: 301,
      note: 'Recorded automatically on rename.',
    },
    { upsert: true }
  )

  // A redirect whose target is now the live slug is dead weight and, worse, a
  // loop if it were ever followed.
  await RedirectModel.deleteMany({ from: `${basePath}/${nextSlug}` })

  return merged
}

/* ------------------------------------------------------------ publishing --- */

/**
 * The publishedAt rule, in one place.
 *
 * status and publishedAt are separate fields (see lib/models/shared.ts), which
 * leaves one question: what happens to the date when something is published for
 * the first time. Answer: it is stamped now if it is empty, and otherwise left
 * exactly as entered, so backdating stays possible and unpublishing does not
 * erase the original date.
 */
export function resolvePublishedAt(
  status: string,
  entered: Date | null,
  existing: Date | null | undefined
): Date | null {
  if (entered) return entered
  if (existing) return existing
  return status === 'published' ? new Date() : null
}
