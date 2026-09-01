import { WorkModel, type Work, type WorkKind } from '@/lib/models'
import { TAGS, cachedQuery } from './_util'

/**
 * Reads for the work collection.
 *
 * Every filter is a parameter rather than a separate function, because that is
 * what lets each theme ask for what it wants from one contract: the clean theme
 * calls getWork({ featured: true, limit: 4 }), the chess theme calls
 * getWork({ kind: 'chess' }), the desktop theme calls getWork({}).
 */

export interface WorkFilter {
  kind?: WorkKind
  featured?: boolean
  tag?: string
  limit?: number
  /** Drafts are never returned unless explicitly asked for, by the admin. */
  includeDrafts?: boolean
}

export const getWork = cachedQuery(
  ['work', 'list'],
  [TAGS.work],
  async (filter: WorkFilter = {}): Promise<Work[]> => {
    const query: Record<string, unknown> = {}

    if (!filter.includeDrafts) query.status = 'published'
    if (filter.kind) query.kind = filter.kind
    if (filter.tag) query.tags = filter.tag
    if (filter.featured) query.featuredOrder = { $ne: null }

    let q = WorkModel.find(query)
      // featuredOrder ascending puts pinned items first; nulls sort last in
      // Mongo ascending order, so unpinned work falls through to date order.
      .sort({ featuredOrder: 1, startDate: -1 })
      .lean()

    if (filter.limit) q = q.limit(filter.limit)

    return (await q) as unknown as Work[]
  }
)

export const getWorkItem = cachedQuery(
  ['work', 'item'],
  [TAGS.work],
  async (slug: string): Promise<Work | null> => {
    const doc = await WorkModel.findOne({
      status: 'published',
      // previousSlugs is matched too, so a renamed item stays reachable at its
      // old URL rather than 404ing while the redirect is sorted out.
      $or: [{ slug }, { previousSlugs: slug }],
    }).lean()

    return (doc ?? null) as unknown as Work | null
  }
)

/** Slugs for generateStaticParams. Cheap projection, no bodies. */
export const getWorkSlugs = cachedQuery(
  ['work', 'slugs'],
  [TAGS.work],
  async (): Promise<string[]> => {
    const docs = await WorkModel.find({ status: 'published' }, { slug: 1, _id: 0 }).lean()
    return docs.map((d) => (d as { slug: string }).slug)
  }
)
