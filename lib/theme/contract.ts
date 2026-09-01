import { z } from 'zod'

/**
 * The contract between content and themes.
 *
 * Content is stored once; each theme is a completely different renderer of it.
 * The only things a theme and the data layer agree on are the two closed
 * vocabularies below. Keep them small: the moment a theme-specific value appears
 * here (a "chessSquare" render context, say), that theme has leaked into the
 * contract and every other theme inherits a concept it does not use.
 */

/** How a piece of content is being shown. Deliberately tiny (cf. Drupal view modes). */
export const RenderContext = z.enum(['full', 'summary', 'inline'])
export type RenderContext = z.infer<typeof RenderContext>

/** What is being shown. Adding one here forces every theme to declare a position. */
export const ContentKind = z.enum([
  'profile',
  'page',
  'work',
  'post',
  'experience',
  'contact',
])
export type ContentKind = z.infer<typeof ContentKind>

/**
 * A theme declares its own settings schema; the platform stores the values
 * (keyed by theme id, in themeConfig). Values never live in content documents,
 * so deleting a theme deletes exactly one document and orphans nothing.
 */
const ThemeSetting = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('select'),
    label: z.string(),
    options: z.array(z.string()),
    default: z.string(),
  }),
  z.object({ type: z.literal('boolean'), label: z.string(), default: z.boolean() }),
  z.object({ type: z.literal('color'), label: z.string(), default: z.string() }),
  z.object({ type: z.literal('text'), label: z.string(), default: z.string() }),
])

export const ThemeManifest = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  version: z.string(),
  description: z.string(),

  /**
   * Capability declaration: which kinds this theme renders, in which contexts.
   * partialRecord, not record: in zod 4 a record keyed by an enum requires every
   * key, which would make `omits` meaningless.
   */
  renders: z.partialRecord(ContentKind, z.array(RenderContext)),

  /** Kinds this theme deliberately does not surface, so a gap is a decision not a bug. */
  omits: z.array(ContentKind).default([]),

  /**
   * The theme declares a URL *shape* per kind. The platform owns the router.
   * Themes never define routes directly: that is what keeps URLs stable across
   * a theme switch, and Next.js forbids it anyway (two route groups resolving to
   * the same path is a build error).
   */
  routes: z
    .partialRecord(
      ContentKind,
      z.object({ pattern: z.string(), indexPattern: z.string().optional() })
    )
    .default({}),

  settings: z.record(z.string(), ThemeSetting).default({}),

  /** Exactly one theme is canonical. It owns the bare URLs and is what crawlers get. */
  canonical: z.boolean().default(false),
})
export type ThemeManifest = z.infer<typeof ThemeManifest>

/**
 * The anti-drift check. Every ContentKind must be either rendered or explicitly
 * omitted by every theme. Run this in CI: when a new content type is added, the
 * build fails on all themes until each one either implements it or declines it.
 * Silent gaps are the failure mode of multi-renderer systems.
 */
export function assertThemeCoverage(manifest: ThemeManifest): void {
  const declared = new Set([...Object.keys(manifest.renders), ...manifest.omits])
  const missing = ContentKind.options.filter((kind) => !declared.has(kind))

  if (missing.length > 0) {
    throw new Error(
      `Theme "${manifest.id}" declares neither renders nor omits for: ${missing.join(', ')}. ` +
        `Add each to renders (with its RenderContexts) or to omits.`
    )
  }
}
