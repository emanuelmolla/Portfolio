import type { ThemeModule } from '@/lib/theme/contract'
import manifest from './manifest'
import { Shell } from './Shell'
import {
  Home,
  About,
  WorkIndex,
  WorkItem,
  PostIndex,
  PostItem,
  PageView,
  Contact,
  ExperienceView,
} from './views'

const theme: ThemeModule = {
  manifest,
  Shell,
  views: {
    home: Home as never,
    profile: { full: About as never },
    page: { full: PageView as never },
    work: { full: WorkItem as never, summary: WorkIndex as never },
    post: { full: PostItem as never, summary: PostIndex as never },
    experience: { full: ExperienceView as never },
    contact: { full: Contact as never },
  },
}
export default theme
