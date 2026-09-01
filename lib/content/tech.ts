import { TechModel, type Tech } from '@/lib/models'
import { TAGS, cachedQuery } from './_util'
import { seedTech } from './_seed'

export const getTech = cachedQuery(
  ['tech', 'list'],
  [TAGS.tech],
  async (): Promise<Tech[]> => {
    const docs = await TechModel.find().sort({ order: 1, name: 1 }).lean()
    return docs as unknown as Tech[]
  },
  () => [...seedTech].sort((a, b) => a.order - b.order)
)

/**
 * The ones worth calling out, by rank. Replaces v1's separate topTechnologies
 * array: same concept, but a theme can ask for three or eight without the data
 * changing shape.
 */
export const getTopTech = cachedQuery(
  ['tech', 'top'],
  [TAGS.tech],
  async (n: number = 3): Promise<Tech[]> => {
    const docs = await TechModel.find({ rank: { $ne: null } })
      .sort({ rank: 1 })
      .limit(n)
      .lean()

    return docs as unknown as Tech[]
  },
  (n: number = 3) =>
    seedTech.filter((t) => t.rank !== null).sort((a, b) => a.rank! - b.rank!).slice(0, n)
)

/** Resolve the refs stored on work and experience into real records. */
export const getTechByIds = cachedQuery(
  ['tech', 'byIds'],
  [TAGS.tech],
  async (ids: string[]): Promise<Tech[]> => {
    if (ids.length === 0) return []
    const docs = await TechModel.find({ _id: { $in: ids } }).lean()

    // Preserve the order the refs were stored in: Mongo returns $in results in
    // index order, not argument order, and the order on a work item is editorial.
    const byId = new Map(docs.map((d) => [String((d as { _id: unknown })._id), d]))
    return ids.map((id) => byId.get(id)).filter(Boolean) as unknown as Tech[]
  },
  (ids: string[]) =>
    ids.map((id) => seedTech.find((t) => `tech_${t.slug}` === id)).filter(Boolean) as Tech[]
)
