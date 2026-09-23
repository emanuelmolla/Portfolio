/**
 * Model barrel.
 *
 * Importing this registers every schema with Mongoose, which matters because
 * populate() on a ref fails if the referenced model has not been registered in
 * the current process yet. Serverless makes that easy to trip over: a cold
 * container may only have imported one model file.
 *
 * lib/content imports from here. Nothing above lib/content should.
 */

export * from './shared'

export { ProfileModel, zProfile, type Profile, AVAILABILITY } from './profile'
export {
  WorkModel,
  zWork,
  type Work,
  WORK_KINDS,
  LIFECYCLE,
  DATE_PRECISION,
  type WorkKind,
} from './work'
export { PostModel, zPost, type Post } from './post'
export {
  ExperienceModel,
  zExperience,
  type Experience,
  SECTIONS,
  SORT_MODES,
} from './experience'
export { TechModel, zTech, type Tech, TECH_CATEGORIES } from './tech'
export { PageModel, zPage, type Page, PAGE_STATUS } from './page'
export { RedirectModel, zRedirect, type Redirect } from './redirect'
export { MessageModel, zMessageInput, type MessageInput } from './message'
export { ResumeModel, MAX_RESUME_BYTES, looksLikePdf } from './resume'
