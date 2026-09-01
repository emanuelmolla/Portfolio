import type { ContentKind } from '@/lib/theme/contract'
import { getProfile } from './profile'
import { getPage, getNavPages } from './pages'
import { getWork, getWorkItem } from './work'
import { getPosts, getPost } from './posts'
import { getExperience } from './experience'

/**
 * The port.
 *
 * This module is the theme-facing contract. Themes import from here and from
 * nowhere else in the data stack. Freeze this interface before writing themes:
 * once three renderers depend on it, changing a signature means touching all of
 * them.
 *
 * THE RULE: return data, never presentation. No formatted strings, no JSX, no
 * theme-shaped anything. If a function here ever returns `displayDate` or
 * `cardTitle`, presentation has leaked downward and the boundary is broken.
 * Themes format; this layer supplies facts.
 */

/* ------------------------------------------------------- named exports --- */
/* The normal path. A theme that knows what it wants keeps full types.        */

export { getProfile } from './profile'
export { getPage, getNavPages, getPageSlugs } from './pages'
export { getWork, getWorkItem, getWorkSlugs, getAdjacentWork, type WorkFilter } from './work'
export { getPosts, getPost, getPostSlugs, getPostTags, type PostFilter } from './posts'
export { getExperience, type ExperienceFilter } from './experience'
export { getTech, getTopTech, getTechByIds } from './tech'
export { TAGS, type Tag } from './_util'

/* ---------------------------------------------------------- dispatcher --- */

/**
 * The manifest-driven path. A route resolves a ContentKind as a *value* read
 * from a theme manifest, not as a literal, so it cannot call a named function
 * directly.
 *
 * This exists alongside the named exports rather than replacing them: a
 * dispatcher alone would be stringly-typed and would throw away the types that
 * are the main thing this design buys.
 */
export type RouteContext =
  | { mode: 'index'; limit?: number }
  | { mode: 'item'; slug: string }

export async function resolve(kind: ContentKind, ctx: RouteContext): Promise<unknown> {
  switch (kind) {
    case 'profile':
      return getProfile()

    case 'page':
      return ctx.mode === 'item' ? getPage(ctx.slug) : getNavPages()

    case 'work':
      return ctx.mode === 'item' ? getWorkItem(ctx.slug) : getWork({ limit: ctx.limit })

    case 'post':
      return ctx.mode === 'item' ? getPost(ctx.slug) : getPosts({ limit: ctx.limit })

    case 'experience':
      return getExperience()

    case 'contact':
      // Contact has no stored content of its own; the form posts to a route
      // handler and the addresses live on the profile.
      return getProfile()

    default: {
      // Exhaustiveness guard: adding a ContentKind without handling it here is
      // a compile error rather than a silent undefined at runtime.
      const never: never = kind
      throw new Error(`Unhandled content kind: ${String(never)}`)
    }
  }
}
