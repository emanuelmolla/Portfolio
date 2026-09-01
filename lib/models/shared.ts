import { Schema } from 'mongoose'
import { z } from 'zod'

/**
 * Shapes embedded across collections. Defined once so a change to how images or
 * SEO metadata work is a change in one file rather than eleven.
 */

/* ---------------------------------------------------------------- media --- */

/**
 * width and height are REQUIRED, not optional. next/image cannot reserve space
 * without intrinsic dimensions, so omitting them produces layout shift on every
 * page with an image, which is a Core Web Vitals signal working directly against
 * the ranking goal. Compute them at upload: computing them later means
 * re-downloading every asset.
 *
 * alt is deliberately separate from caption. IPTC treats Alt Text
 * (Accessibility) and Description as distinct properties because they serve
 * different readers. Merging them, as some CMSs do, is worth not copying.
 */
export const zMedia = z.object({
  url: z.string(),
  alt: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  blurDataURL: z.string().nullable().default(null),
  caption: z.string().nullable().default(null),
})
export type Media = z.infer<typeof zMedia>

export const MediaSchema = new Schema<Media>(
  {
    url: { type: String, required: true },
    alt: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    blurDataURL: { type: String, default: null },
    caption: { type: String, default: null },
  },
  { _id: false }
)

/* ------------------------------------------------------------------ seo --- */

/** Nested from day one. Flattening later means touching every read site. */
export const zSeo = z.object({
  title: z.string().nullable().default(null),
  description: z.string().max(200).nullable().default(null),
  ogImage: zMedia.nullable().default(null),
  canonicalUrl: z.string().nullable().default(null),
  noindex: z.boolean().default(false),
})
export type Seo = z.infer<typeof zSeo>

export const SeoSchema = new Schema<Seo>(
  {
    title: { type: String, default: null },
    description: { type: String, default: null },
    ogImage: { type: MediaSchema, default: null },
    canonicalUrl: { type: String, default: null },
    noindex: { type: Boolean, default: false },
  },
  { _id: false }
)

/* ----------------------------------------------------------------- link --- */

export const LINK_KINDS = [
  'repo',
  'live',
  'demo',
  'writeup',
  'pr',
  'github',
  'linkedin',
  'email',
  'x',
  'lichess',
  'resume',
  'other',
] as const

export const zLink = z.object({
  kind: z.enum(LINK_KINDS),
  label: z.string().nullable().default(null),
  url: z.string(),
})
export type Link = z.infer<typeof zLink>

export const LinkSchema = new Schema<Link>(
  {
    kind: { type: String, enum: LINK_KINDS, required: true },
    label: { type: String, default: null },
    url: { type: String, required: true },
  },
  { _id: false }
)

/* ------------------------------------------------------------ publishing --- */

/**
 * status and publishedAt are SEPARATE fields, deliberately. Overloading
 * "publishedAt is null means draft" makes scheduled publishing impossible and
 * cannot distinguish "never published" from "unpublished". Every mature CMS
 * keeps them apart.
 */
export const PUBLISH_STATUS = ['draft', 'published'] as const
export type PublishStatus = (typeof PUBLISH_STATUS)[number]

export const zPublishStatus = z.enum(PUBLISH_STATUS)

/** Body format discriminator. Markdown today; the field is the escape hatch. */
export const BODY_FORMATS = ['markdown'] as const
export const zBodyFormat = z.enum(BODY_FORMATS).default('markdown')

/* ------------------------------------------------------------------ util --- */

/**
 * Tags are normalized on write. Deduplicating "Next.js" / "nextjs" / "NextJS"
 * across fifty documents later is real work; doing it here costs nothing.
 */
export function normalizeTag(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const zTags = z
  .array(z.string())
  .default([])
  .transform((tags) => Array.from(new Set(tags.map(normalizeTag).filter(Boolean))))

/** Applied to every sluggable collection. See the redirect model for why. */
export const slugField = {
  type: String,
  required: true,
  unique: true,
  index: true,
} as const
