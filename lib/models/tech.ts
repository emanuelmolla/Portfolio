import mongoose, { Schema } from 'mongoose'
import { z } from 'zod'
import { slugField } from './shared'

/**
 * A lean tagging taxonomy, referenced by work and experience.
 *
 * NOTE what is deliberately absent: `proficiency`. Self-rated skill levels and
 * percentage bars appear on 12.2% of job-seeker portfolios and 0% of respected
 * personal sites, and are the single most condemned item across every source
 * examined. The v1 techstack.jsx had `proficiency: 'Intermediate'` on every
 * entry. It does not survive the migration. If the field does not exist, the
 * temptation to render a bar chart of your own competence dies with it.
 *
 * `rank` replaces v1's two separate arrays (topTechnologies + fullTechStack):
 * null for most, 1..N for the ones worth calling out. A theme can then show
 * three, five, or all of them without the data changing shape.
 */

export const TECH_CATEGORIES = [
  'Language',
  'Framework',
  'Database',
  'Infrastructure',
  'Tool',
] as const

export const zTech = z.object({
  slug: z.string().min(1, 'A slug is required.'),
  name: z.string().min(1, 'A name is required.'),
  category: z.enum(TECH_CATEGORIES),
  /** Year, not a Date: "2024" is the honest precision here. */
  firstEncounter: z.number().int().nullable().default(null),
  /** His own words about why he likes it. The thing no taxonomy can supply. */
  note: z.string().nullable().default(null),
  rank: z.number().int().nullable().default(null),
  icon: z.object({
    simpleIconsSlug: z.string().nullable().default(null),
    devicon: z.string().nullable().default(null),
    color: z.string().nullable().default(null),
  }),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
})
export type Tech = z.infer<typeof zTech>

const TechSchema = new Schema(
  {
    slug: slugField,
    name: { type: String, required: true },
    category: { type: String, enum: TECH_CATEGORIES, required: true },
    firstEncounter: { type: Number, default: null },
    note: { type: String, default: null },
    rank: { type: Number, default: null },
    icon: {
      simpleIconsSlug: { type: String, default: null },
      devicon: { type: String, default: null },
      color: { type: String, default: null },
    },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

TechSchema.index({ rank: 1 })

export const TechModel = mongoose.models.Tech ?? mongoose.model('Tech', TechSchema)
