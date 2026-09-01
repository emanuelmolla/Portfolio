import mongoose, { Schema } from 'mongoose'
import { z } from 'zod'

/**
 * Slug history.
 *
 * This is the cheapest and highest-value item in the entire schema, and the
 * only one that is genuinely unrecoverable if skipped. Rename a slug without a
 * 301 and you burn whatever ranking that URL accumulated. Worse, old slugs
 * cannot be reconstructed after the fact: once a document is saved under a new
 * slug with no record of the old one, the information is simply gone.
 *
 * Every sluggable collection also carries `previousSlugs`, so lookups can fall
 * back locally. This collection is for redirects that do not correspond to a
 * live document (retired pages, restructured URLs, v1 paths).
 */

export const zRedirect = z.object({
  from: z.string(),
  to: z.string(),
  statusCode: z.union([z.literal(301), z.literal(302)]).default(301),
  note: z.string().nullable().default(null),
})
export type Redirect = z.infer<typeof zRedirect>

const RedirectSchema = new Schema(
  {
    from: { type: String, required: true, unique: true, index: true },
    to: { type: String, required: true },
    statusCode: { type: Number, enum: [301, 302], default: 301 },
    note: { type: String, default: null },
  },
  { timestamps: true }
)

export const RedirectModel =
  mongoose.models.Redirect ?? mongoose.model('Redirect', RedirectSchema)
