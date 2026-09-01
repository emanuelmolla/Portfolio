import { ExperienceModel, type Experience } from '@/lib/models'
import { TAGS, cachedQuery } from './_util'
import { seedExperience } from './_seed'

export interface ExperienceFilter {
  section?: Experience['section']
}

export const getExperience = cachedQuery(
  ['experience', 'list'],
  [TAGS.experience],
  async (filter: ExperienceFilter = {}): Promise<Experience[]> => {
    const query: Record<string, unknown> = { status: 'published' }
    if (filter.section) query.section = filter.section

    // current entries first, then most recent. `current` beats date because an
    // ongoing role with a null endDate should not sort below a finished one
    // that happened to start later.
    const docs = await ExperienceModel.find(query)
      .sort({ current: -1, startDate: -1, order: 1 })
      .lean()

    return docs as unknown as Experience[]
  },
  (filter: ExperienceFilter = {}) => {
    const out = seedExperience.filter(
      (e) => e.status === 'published' && (!filter.section || e.section === filter.section)
    )
    return [...out].sort((a, b) => Number(b.current) - Number(a.current) || a.order - b.order)
  }
)
