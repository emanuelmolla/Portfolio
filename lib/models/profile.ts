import mongoose, { Schema, type InferSchemaType } from 'mongoose'
import { z } from 'zod'
import { LinkSchema, MediaSchema, SeoSchema, zLink, zMedia, zSeo } from './shared'

/**
 * The identity document. A singleton, always _id: "me".
 *
 * This exists because the v1 site hardcoded identity across fourteen places in
 * component files, six of them referencing a GitHub handle that no longer
 * exists. Changing a username should be an edit, not a deploy. That is the
 * whole reason for this rewrite, so this is the model that earns it.
 *
 * Field names lean on schema.org/Person so the JSON-LD for the /about page is
 * close to a straight dump. Person is not a rich result, but ProfilePage is the
 * one Google-blessed way to say "this page is about this specific human", which
 * is the entity-understanding half of ranking for your own name.
 */

export const AVAILABILITY = ['open', 'selective', 'not-looking'] as const

export const zProfile = z.object({
  name: z.string().min(1, 'A name is required.'),
  givenName: z.string(),
  familyName: z.string(),
  /** Google's ProfilePage docs: real name in `name`, handles in `alternateName`. */
  alternateName: z.string().nullable().default(null),

  /** Stated plainly. The first thing a hiring manager reads. */
  headline: z.string().min(1, 'A headline is required. It is the first thing a hiring manager reads.'),

  bio: z.object({
    /** Doubles as the meta description, hence the cap. */
    short: z.string().min(1, 'A short bio is required. It doubles as the meta description.').max(155, 'Keep this under 155 characters.'),
    long: z.string().default(''),
  }),

  location: z.object({
    city: z.string().min(1, 'Which city?'),
    region: z.string().nullable().default(null),
    country: z.string().min(1, 'Which country?'),
  }),

  avatar: zMedia.nullable().default(null),

  /** url is the schema.org sameAs value, so it must be a full URL, not a handle. */
  links: z
    .array(zLink.extend({ handle: z.string().nullable().default(null), order: z.number().default(0), visible: z.boolean().default(true) }))
    .default([]),

  availability: z.object({
    status: z.enum(AVAILABILITY).default('not-looking'),
    availableFrom: z.date().nullable().default(null),
    note: z.string().nullable().default(null),
  }),

  /**
   * A link field, not a generated document. Recruiters' systems still want a PDF.
   * Defaults to /resume, the route handler, rather than to the static file: that
   * is what serves it under a name worth saving. See lib/resume.ts.
   */
  resumeUrl: z.string().default('/resume'),

  knowsAbout: z.array(z.string()).default([]),
  knowsLanguage: z.array(z.string()).default([]),

  /** i18n is deliberately not built. This keeps the JSON-LD complete anyway. */
  inLanguage: z.string().default('en'),

  seo: zSeo,
})
export type ProfileInput = z.input<typeof zProfile>
export type Profile = z.infer<typeof zProfile>

const ProfileSchema = new Schema(
  {
    _id: { type: String, default: 'me' },
    name: { type: String, required: true },
    givenName: String,
    familyName: String,
    alternateName: { type: String, default: null },
    headline: { type: String, required: true },
    bio: {
      short: { type: String, required: true },
      long: { type: String, default: '' },
    },
    location: {
      city: String,
      region: { type: String, default: null },
      country: String,
    },
    avatar: { type: MediaSchema, default: null },
    links: [
      {
        ...LinkSchema.obj,
        handle: { type: String, default: null },
        order: { type: Number, default: 0 },
        visible: { type: Boolean, default: true },
        _id: false,
      },
    ],
    availability: {
      status: { type: String, enum: AVAILABILITY, default: 'not-looking' },
      availableFrom: { type: Date, default: null },
      note: { type: String, default: null },
    },
    resumeUrl: { type: String, default: '/resume' },
    knowsAbout: { type: [String], default: [] },
    knowsLanguage: { type: [String], default: [] },
    inLanguage: { type: String, default: 'en' },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true, _id: false }
)

export type ProfileDoc = InferSchemaType<typeof ProfileSchema>

/** models[...] guard: without it, hot reload redefines the model and throws. */
export const ProfileModel =
  mongoose.models.Profile ?? mongoose.model('Profile', ProfileSchema)
