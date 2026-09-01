import mongoose, { Schema } from 'mongoose'
import { z } from 'zod'
import { LinkSchema, PUBLISH_STATUS, zLink, zPublishStatus } from './shared'

/**
 * Work history, education, awards. One collection with a `section`
 * discriminator rather than five collections, by the same rule as work.
 *
 * Field names deliberately track the JSON Resume schema (work[] = name /
 * position / startDate / endDate / summary / highlights, education[] =
 * institution / area / studyType). Staying that shape means the resume can
 * eventually be GENERATED from this data instead of maintained separately,
 * which is the difference between updating one record and updating two
 * documents that drift apart.
 */

export const SECTIONS = ['work', 'education', 'coop', 'award', 'certificate', 'volunteer'] as const

/**
 * Per-section, because sorting is not universal: the CAA standard lists
 * collections alphabetically while everything else runs reverse-chronological.
 */
export const SORT_MODES = ['date-desc', 'alpha'] as const

export const zExperience = z.object({
  slug: z.string(),
  section: z.enum(SECTIONS),
  sortMode: z.enum(SORT_MODES).default('date-desc'),

  org: z.string(),
  role: z.string(),
  location: z.string().nullable().default(null),
  employmentType: z.string().nullable().default(null),
  url: z.string().nullable().default(null),

  startDate: z.date().nullable().default(null),
  /** null means ongoing. Never a "Present" string: that cannot be sorted. */
  endDate: z.date().nullable().default(null),
  current: z.boolean().default(false),

  summary: z.string().nullable().default(null),
  /** Resume-style bullets. The same records that feed the PDF. */
  highlights: z.array(z.string()).default([]),

  techRefs: z.array(z.string()).default([]),
  links: z.array(zLink).default([]),

  order: z.number().int().default(0),
  status: zPublishStatus.default('published'),
})
export type Experience = z.infer<typeof zExperience>

const ExperienceSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    section: { type: String, enum: SECTIONS, required: true, index: true },
    sortMode: { type: String, enum: SORT_MODES, default: 'date-desc' },

    org: { type: String, required: true },
    role: { type: String, required: true },
    location: { type: String, default: null },
    employmentType: { type: String, default: null },
    url: { type: String, default: null },

    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    current: { type: Boolean, default: false },

    summary: { type: String, default: null },
    highlights: { type: [String], default: [] },

    techRefs: [{ type: Schema.Types.ObjectId, ref: 'Tech' }],
    links: { type: [LinkSchema], default: [] },

    order: { type: Number, default: 0 },
    status: { type: String, enum: PUBLISH_STATUS, default: 'published' },
  },
  { timestamps: true }
)

ExperienceSchema.index({ section: 1, startDate: -1 })

export const ExperienceModel =
  mongoose.models.Experience ?? mongoose.model('Experience', ExperienceSchema)
