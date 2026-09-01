import { PostModel, type Post } from '@/lib/models'
import { TAGS, cachedQuery } from './_util'

export interface PostFilter {
  tag?: string
  limit?: number
  includeDrafts?: boolean
}

export const getPosts = cachedQuery(
  ['posts', 'list'],
  [TAGS.post],
  async (filter: PostFilter = {}): Promise<Post[]> => {
    const query: Record<string, unknown> = {}
    if (!filter.includeDrafts) query.status = 'published'
    if (filter.tag) query.tags = filter.tag

    let q = PostModel.find(query).sort({ publishedAt: -1 }).lean()
    if (filter.limit) q = q.limit(filter.limit)

    return (await q) as unknown as Post[]
  }
)

export const getPost = cachedQuery(
  ['posts', 'item'],
  [TAGS.post],
  async (slug: string): Promise<Post | null> => {
    const doc = await PostModel.findOne({
      status: 'published',
      $or: [{ slug }, { previousSlugs: slug }],
    }).lean()

    return (doc ?? null) as unknown as Post | null
  }
)

export const getPostSlugs = cachedQuery(
  ['posts', 'slugs'],
  [TAGS.post],
  async (): Promise<string[]> => {
    const docs = await PostModel.find({ status: 'published' }, { slug: 1, _id: 0 }).lean()
    return docs.map((d) => (d as { slug: string }).slug)
  }
)

/** All tags in use, for a tag index. Distinct is cheaper than loading bodies. */
export const getPostTags = cachedQuery(
  ['posts', 'tags'],
  [TAGS.post],
  async (): Promise<string[]> => {
    const tags = await PostModel.distinct('tags', { status: 'published' })
    return (tags as string[]).sort()
  }
)
