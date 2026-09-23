import mongoose, { Schema } from 'mongoose'
import { z } from 'zod'
import {
  MediaSchema,
  SeoSchema,
  PUBLISH_STATUS,
  slugField,
  zBodyFormat,
  zMedia,
  zPublishStatus,
  zSeo,
  zTags,
} from './shared'

/**
 * Writing. The v1 Blog model does not survive as-is: `content: [String]` (an
 * array of paragraphs) cannot express a heading, a code block, or an image, so
 * every theme would have to invent its own conventions on top of it.
 *
 * Body is a markdown string. Section markers use markdown directives (:::note),
 * which parse into the AST as structured nodes each theme maps to its own
 * components. They are data, not component imports, which is why they stay
 * theme-agnostic where MDX does not: a post containing <Callout> is coupled to
 * one component library forever.
 *
 * For a backend developer this is the most important collection on the site.
 * Systems work has no visual artifact, so the prose is the artifact.
 */

export const zPost = z.object({
  slug: z.string(),
  previousSlugs: z.array(z.string()).default([]),
  title: z.string(),
  excerpt: z.string(),
  body: z.string().default(''),
  bodyFormat: zBodyFormat,
  coverImage: zMedia.nullable().default(null),
  tags: zTags,
  status: zPublishStatus.default('draft'),
  publishedAt: z.date().nullable().default(null),
  /** Computed on save, not at render. */
  readingMinutes: z.number().int().default(0),
  /** Nullable so a pinned post escapes date order. Same mechanism as work. */
  featuredOrder: z.number().int().nullable().default(null),
  /** The other half of the case-study link on work. */
  relatedWorkRef: z.string().nullable().default(null),
  /** Set when cross-posted, so the canonical stays here. */
  canonicalUrl: z.string().nullable().default(null),
  stats: z.object({ views: z.number().default(0), likes: z.number().default(0) }),
  seo: zSeo,
})
export type Post = z.infer<typeof zPost>

const PostSchema = new Schema(
  {
    slug: slugField,
    previousSlugs: { type: [String], default: [], index: true },
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    body: { type: String, default: '' },
    bodyFormat: { type: String, default: 'markdown' },
    coverImage: { type: MediaSchema, default: null },
    tags: { type: [String], default: [], index: true },
    status: { type: String, enum: PUBLISH_STATUS, default: 'draft' },
    publishedAt: { type: Date, default: null },
    readingMinutes: { type: Number, default: 0 },
    featuredOrder: { type: Number, default: null },
    relatedWorkRef: { type: Schema.Types.ObjectId, ref: 'Work', default: null },
    canonicalUrl: { type: String, default: null },
    stats: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
    },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true }
)

PostSchema.index({ status: 1, publishedAt: -1 })

/**
 * ~230 wpm is the commonly cited silent-reading rate for prose.
 * Async (no `next`) rather than callback style: Mongoose 9 resolves the
 * callback overload's second parameter as SaveOptions, so the `next(...)` form
 * does not typecheck.
 */
PostSchema.pre('save', async function () {
  if (this.isModified('body')) {
    const words = String(this.body ?? '').trim().split(/\s+/).filter(Boolean).length
    this.readingMinutes = Math.max(1, Math.round(words / 230))
  }
})

export const PostModel = mongoose.models.Post ?? mongoose.model('Post', PostSchema)
