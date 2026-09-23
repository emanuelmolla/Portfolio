import mongoose, { Schema } from 'mongoose'
import { z } from 'zod'
import {
  LinkSchema,
  MediaSchema,
  SeoSchema,
  PUBLISH_STATUS,
  slugField,
  zLink,
  zMedia,
  zSeo,
  zTags,
  zPublishStatus,
  zBodyFormat,
} from './shared'

/**
 * Everything Emanuel has made. One collection, discriminated by `kind`.
 *
 * Not just software: the site has to be able to present chess, writing, or
 * photography without a schema change. Every system built for creatives lands
 * on this shape (Artwork Archive has one Piece with a 26-value type enum, Adobe
 * Portfolio explicitly merged Project and Page, schema.org makes
 * SoftwareSourceCode and VisualArtwork siblings under CreativeWork).
 *
 * The rule for future kinds: discriminate when the difference is FIELDS, split
 * into a new collection when the difference is LIFECYCLE or QUERY SHAPE. Only
 * `event` fails that test, because "upcoming, ascending, expiring" is a
 * different query than "recent, descending, permanent".
 */

export const WORK_KINDS = ['software', 'writing', 'photo', 'chess', 'other'] as const
export type WorkKind = (typeof WORK_KINDS)[number]

/** The project's own lifecycle. A different axis from draft-vs-published. */
export const LIFECYCLE = ['active', 'shipped', 'archived', 'experiment'] as const

export const DATE_PRECISION = ['day', 'month', 'year'] as const

const zDetails = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('software'),
    stack: z.array(z.string()).default([]),
    architectureNotes: z.string().nullable().default(null),
    repoUrl: z.string().nullable().default(null),
    liveUrl: z.string().nullable().default(null),
  }),
  z.object({
    kind: z.literal('writing'),
    outlet: z.string().nullable().default(null),
    publishedIn: z.string().nullable().default(null),
    wordCount: z.number().int().nullable().default(null),
  }),
  z.object({
    kind: z.literal('photo'),
    galleryRef: z.string().nullable().default(null),
    locationsShot: z.array(z.string()).default([]),
  }),
  z.object({
    kind: z.literal('chess'),
    gameRefs: z.array(z.string()).default([]),
    eventRef: z.string().nullable().default(null),
  }),
  z.object({
    kind: z.literal('other'),
    /** Free text, never an enum. A real medium reads "two spotlights, tripod, gobos". */
    medium: z.string().nullable().default(null),
    dimensions: z
      .object({ h: z.number(), w: z.number(), d: z.number().nullable(), unit: z.string() })
      .nullable()
      .default(null),
  }),
])

export const zWork = z.object({
  slug: z.string().min(1, 'A slug is required.'),
  /** Renaming a slug without a 301 burns accumulated ranking, and old slugs
   *  cannot be reconstructed after the fact. One array now, unrecoverable later. */
  previousSlugs: z.array(z.string()).default([]),

  kind: z.enum(WORK_KINDS),
  title: z.string().min(1, 'A title is required.'),
  /** Card-safe, one or two sentences. */
  summary: z.string().min(1, 'Write a one-line summary. It is the card text on the index.'),
  body: z.string().default(''),
  bodyFormat: zBodyFormat,

  /**
   * problem and outcome appear on 2.8% and 10% of real portfolios respectively,
   * while every advice source demands them. That gap is the opportunity. They
   * are nullable on purpose: an empty outcome beats a fabricated metric.
   */
  problem: z.string().nullable().default(null),
  outcome: z.string().nullable().default(null),

  role: z.string().nullable().default(null),
  isGroup: z.boolean().default(false),
  teamSize: z.number().int().nullable().default(null),

  /** Real Dates. Display strings cannot be sorted, filtered, or emitted as JSON-LD. */
  startDate: z.date().nullable().default(null),
  endDate: z.date().nullable().default(null),
  datePrecision: z.enum(DATE_PRECISION).default('month'),
  circa: z.boolean().default(false),
  dateOverride: z.string().nullable().default(null),

  lifecycle: z.enum(LIFECYCLE).default('shipped'),
  status: zPublishStatus.default('draft'),
  publishedAt: z.date().nullable().default(null),

  /** Nullable so a pinned item can escape chronological order. */
  featuredOrder: z.number().int().nullable().default(null),

  /** ObjectIds, never slugs: relations keyed on slug break on any rename. */
  techRefs: z.array(z.string()).default([]),
  tags: zTags,

  links: z.array(zLink).default([]),
  coverImage: zMedia.nullable().default(null),
  mediaRefs: z.array(z.string()).default([]),

  /** The case-study link. The single highest-value relationship in the model. */
  relatedPostRef: z.string().nullable().default(null),

  details: zDetails.nullable().default(null),
  seo: zSeo,
})
export type Work = z.infer<typeof zWork>

const WorkSchema = new Schema(
  {
    slug: slugField,
    previousSlugs: { type: [String], default: [], index: true },

    kind: { type: String, enum: WORK_KINDS, required: true, index: true },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    body: { type: String, default: '' },
    bodyFormat: { type: String, default: 'markdown' },

    problem: { type: String, default: null },
    outcome: { type: String, default: null },

    role: { type: String, default: null },
    isGroup: { type: Boolean, default: false },
    teamSize: { type: Number, default: null },

    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    datePrecision: { type: String, enum: DATE_PRECISION, default: 'month' },
    circa: { type: Boolean, default: false },
    dateOverride: { type: String, default: null },

    lifecycle: { type: String, enum: LIFECYCLE, default: 'shipped' },
    status: { type: String, enum: PUBLISH_STATUS, default: 'draft' },
    publishedAt: { type: Date, default: null },

    featuredOrder: { type: Number, default: null },

    techRefs: [{ type: Schema.Types.ObjectId, ref: 'Tech' }],
    tags: { type: [String], default: [], index: true },

    links: { type: [LinkSchema], default: [] },
    coverImage: { type: MediaSchema, default: null },
    mediaRefs: [{ type: Schema.Types.ObjectId, ref: 'Image' }],

    relatedPostRef: { type: Schema.Types.ObjectId, ref: 'Post', default: null },

    /** Mixed, validated by the zod discriminated union above rather than by Mongoose. */
    details: { type: Schema.Types.Mixed, default: null },

    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true }
)

/**
 * kind is the FIRST key in every compound index. Without that, a query for one
 * kind scans documents of every other kind, which is the single way this
 * one-collection design goes wrong at scale.
 */
WorkSchema.index({ kind: 1, status: 1, publishedAt: -1 })
WorkSchema.index({ kind: 1, featuredOrder: 1 })

export const WorkModel = mongoose.models.Work ?? mongoose.model('Work', WorkSchema)
