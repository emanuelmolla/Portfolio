import type { ThemeModule } from '@/lib/theme/contract'
import manifest from './manifest'
import { Shell } from './Shell'
import { WorkIndex, WorkItem } from './views/work'
import { PostIndex, PostItem } from './views/post'
import { About, Contact, Home, PageView } from './views/pages'

/**
 * The clean theme: the canonical renderer.
 *
 * Being canonical means two obligations. It owns the indexed URLs, so it is
 * what Googlebot receives. And it is the bottom of the fallback cascade, so it
 * must render every ContentKind: when another theme omits one, that route falls
 * back here rather than 404ing.
 */
const theme: ThemeModule = {
  manifest,
  Shell: Shell as ThemeModule['Shell'],
  views: {
    home: Home as never,
    profile: { full: About as never },
    page: { full: PageView as never },
    work: { full: WorkItem as never, summary: WorkIndex as never },
    post: { full: PostItem as never, summary: PostIndex as never },
    experience: { full: About as never },
    contact: { full: Contact as never },
  },
}

export default theme
