import type { ThemeModule } from '@/lib/theme/contract'
import manifest from './manifest'
import { Shell } from './Shell'
import {
  About,
  Contact,
  Home,
  PageView,
  PostIndex,
  PostItem,
  WorkIndex,
  WorkItem,
} from './views'

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
