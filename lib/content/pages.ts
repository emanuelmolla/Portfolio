import { PageModel, type Page } from '@/lib/models'
import { TAGS, cachedQuery } from './_util'
import { seedPages } from './_seed'

export const getPage = cachedQuery(
  ['pages', 'item'],
  [TAGS.page],
  async (slug: string): Promise<Page | null> => {
    const doc = await PageModel.findOne({
      // 'unlisted' is included: the page is reachable by URL, just absent from
      // nav and feeds. That is what unlisted means, as distinct from draft.
      status: { $in: ['published', 'unlisted'] },
      $or: [{ slug }, { previousSlugs: slug }],
    }).lean()

    return (doc ?? null) as unknown as Page | null
  },
  (slug: string) =>
    seedPages.find((p) => p.slug === slug || p.previousSlugs.includes(slug)) ?? null
)

/** Nav membership is data. This is what makes adding a page a CMS edit. */
export const getNavPages = cachedQuery(
  ['pages', 'nav'],
  [TAGS.page],
  async (): Promise<Pick<Page, 'slug' | 'title' | 'navOrder'>[]> => {
    const docs = await PageModel.find(
      { status: 'published', inNav: true },
      { slug: 1, title: 1, navOrder: 1, _id: 0 }
    )
      .sort({ navOrder: 1 })
      .lean()

    return docs as unknown as Pick<Page, 'slug' | 'title' | 'navOrder'>[]
  },
  () =>
    seedPages
      .filter((p) => p.status === 'published' && p.inNav)
      .sort((a, b) => a.navOrder - b.navOrder)
      .map(({ slug, title, navOrder }) => ({ slug, title, navOrder }))
)

export const getPageSlugs = cachedQuery(
  ['pages', 'slugs'],
  [TAGS.page],
  async (): Promise<string[]> => {
    const docs = await PageModel.find({ status: 'published' }, { slug: 1, _id: 0 }).lean()
    return docs.map((d) => (d as { slug: string }).slug)
  },
  () => seedPages.map((p) => p.slug)
)
