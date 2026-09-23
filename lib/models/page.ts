import mongoose, { Schema } from 'mongoose'
import { z } from 'zod'
import { SeoSchema, slugField, zBodyFormat, zSeo } from './shared'

/**
 * The generic slash page: /about, /colophon, /uses, /interests, /now, and the
 * roughly fifty other documented slash-page types. ONE collection, not a model
 * per page. Adding /blogroll later is a row, not a migration.
 *
 * IndieWeb draws the distinction this collection exists to honour: a page "is
 * usually primarily known by its name ... and kept updated in place, in
 * contrast to posts which are primarily datetime-based". Pages do not show a
 * published date, do not carry dates in the URL, and are not in feeds.
 */

export const PAGE_STATUS = ['draft', 'published', 'unlisted'] as const

export const zPage = z.object({
  slug: z.string().min(1, 'A slug is required.'),
  previousSlugs: z.array(z.string()).default([]),
  title: z.string().min(1, 'A title is required.'),
  body: z.string().default(''),
  bodyFormat: zBodyFormat,

  /** Optional structured variant, useful for /uses where rows beat prose. */
  sections: z
    .array(z.object({ heading: z.string(), body: z.string(), order: z.number().int().default(0) }))
    .default([]),

  status: z.enum(PAGE_STATUS).default('draft'),

  /**
   * Nav membership is DATA, not code. Pages "appear only in navigation or not
   * at all", and being able to add one without a deploy is the entire point of
   * having a CMS at all.
   */
  inNav: z.boolean().default(false),
  navOrder: z.number().int().default(0),

  /**
   * Pages usually hide dates, but /now and /changelog must show one, and a
   * stale visible date is the honesty mechanism that makes /now worth having.
   * One boolean settles the argument instead of a special case per slug.
   */
  showUpdatedAt: z.boolean().default(false),

  seo: zSeo,
})
export type Page = z.infer<typeof zPage>

const PageSchema = new Schema(
  {
    slug: slugField,
    previousSlugs: { type: [String], default: [], index: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    bodyFormat: { type: String, default: 'markdown' },
    sections: {
      type: [{ heading: String, body: String, order: { type: Number, default: 0 }, _id: false }],
      default: [],
    },
    status: { type: String, enum: PAGE_STATUS, default: 'draft' },
    inNav: { type: Boolean, default: false },
    navOrder: { type: Number, default: 0 },
    showUpdatedAt: { type: Boolean, default: false },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true }
)

PageSchema.index({ status: 1, inNav: 1, navOrder: 1 })

export const PageModel = mongoose.models.Page ?? mongoose.model('Page', PageSchema)
