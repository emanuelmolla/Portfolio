import type { ThemeModule } from '@/lib/theme/contract'
import manifest from './manifest'
import { Shell } from './Shell'
import {
  Home,
  About,
  WorkIndex,
  WorkItem,
  WorkSummary,
  PostIndex,
  PostItem,
  PostSummary,
  ExperienceView,
  PageView,
  Contact,
} from './views'
const theme: ThemeModule = {
  manifest,
  Shell,
  views: {
    home: Home as never,
    profile: {
      full: About as never,
      summary: About as never,
      inline: About as never,
    },
    page: {
      full: PageView as never,
      summary: PageView as never,
      inline: PageView as never,
    },
    work: {
      full: WorkItem as never,
      summary: WorkIndex as never,
      inline: WorkSummary as never,
    },
    post: {
      full: PostItem as never,
      summary: PostIndex as never,
      inline: PostSummary as never,
    },
    experience: {
      full: ExperienceView as never,
      summary: ExperienceView as never,
      inline: ExperienceView as never,
    },
    contact: {
      full: Contact as never,
      summary: Contact as never,
      inline: Contact as never,
    },
  },
}
export default theme
