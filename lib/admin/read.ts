import { connectDB } from '@/lib/db'
import { toPlain, hasDatabase } from '@/lib/content/_util'
import {
  ExperienceModel,
  MessageModel,
  PageModel,
  PostModel,
  ProfileModel,
  TechModel,
  WorkModel,
  type Experience,
  type Page,
  type Post,
  type Profile,
  type Tech,
  type Work,
} from '@/lib/models'

/**
 * Reads for the admin. Separate from lib/content for two reasons, both of which
 * would be bugs if this shared that module:
 *
 *   1. NOT CACHED. lib/content wraps every read in unstable_cache so the public
 *      site is static. An editor that reads through the same cache shows the
 *      version before the save it just made, which reads as "the save did not
 *      work" and invites a second save on stale data.
 *
 *   2. DRAFTS INCLUDED. Every public read filters status: 'published'. The whole
 *      point of a draft is that this is the only place it is visible.
 *
 * Nothing here is exported to themes. The public site cannot reach drafts by
 * construction rather than by remembering to pass a flag.
 */

/** A stored document: the validated shape plus what Mongo adds. */
export type Doc<T> = T & {
  _id: string
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Without a connection string there is nothing to read. Returning empty rather
 * than throwing keeps the admin navigable so the UI can explain the situation,
 * which is more useful than a stack trace on every screen.
 */
async function ready(): Promise<boolean> {
  if (!hasDatabase()) return false
  await connectDB()
  return true
}

/* -------------------------------------------------------------- profile --- */

export async function readProfile(): Promise<Doc<Profile> | null> {
  if (!(await ready())) return null
  const doc = await ProfileModel.findById('me').lean()
  return doc ? (toPlain(doc) as unknown as Doc<Profile>) : null
}

/* ----------------------------------------------------------------- work --- */

export async function listWork(): Promise<Doc<Work>[]> {
  if (!(await ready())) return []
  const docs = await WorkModel.find()
    // Same order the public index uses, so "first in the list" means the same
    // thing in both places. Drafts sort in among the rest rather than into their
    // own block: a draft that will be pinned should preview where it will land.
    .sort({ featuredOrder: 1, startDate: -1 })
    .lean()
  return toPlain(docs) as unknown as Doc<Work>[]
}

export async function readWork(id: string): Promise<Doc<Work> | null> {
  if (!(await ready())) return null
  const doc = await WorkModel.findById(id).lean()
  return doc ? (toPlain(doc) as unknown as Doc<Work>) : null
}

/* ---------------------------------------------------------------- posts --- */

export async function listPosts(): Promise<Doc<Post>[]> {
  if (!(await ready())) return []
  const docs = await PostModel.find().sort({ publishedAt: -1, updatedAt: -1 }).lean()
  return toPlain(docs) as unknown as Doc<Post>[]
}

export async function readPost(id: string): Promise<Doc<Post> | null> {
  if (!(await ready())) return null
  const doc = await PostModel.findById(id).lean()
  return doc ? (toPlain(doc) as unknown as Doc<Post>) : null
}

/* ---------------------------------------------------------------- pages --- */

export async function listPages(): Promise<Doc<Page>[]> {
  if (!(await ready())) return []
  const docs = await PageModel.find().sort({ navOrder: 1, title: 1 }).lean()
  return toPlain(docs) as unknown as Doc<Page>[]
}

export async function readPage(id: string): Promise<Doc<Page> | null> {
  if (!(await ready())) return null
  const doc = await PageModel.findById(id).lean()
  return doc ? (toPlain(doc) as unknown as Doc<Page>) : null
}

/* ----------------------------------------------------------- experience --- */

export async function listExperience(): Promise<Doc<Experience>[]> {
  if (!(await ready())) return []
  const docs = await ExperienceModel.find()
    .sort({ current: -1, startDate: -1, order: 1 })
    .lean()
  return toPlain(docs) as unknown as Doc<Experience>[]
}

export async function readExperience(id: string): Promise<Doc<Experience> | null> {
  if (!(await ready())) return null
  const doc = await ExperienceModel.findById(id).lean()
  return doc ? (toPlain(doc) as unknown as Doc<Experience>) : null
}

/* ----------------------------------------------------------------- tech --- */

export async function listTech(): Promise<Doc<Tech>[]> {
  if (!(await ready())) return []
  const docs = await TechModel.find().sort({ rank: 1, order: 1, name: 1 }).lean()
  return toPlain(docs) as unknown as Doc<Tech>[]
}

export async function readTech(id: string): Promise<Doc<Tech> | null> {
  if (!(await ready())) return null
  const doc = await TechModel.findById(id).lean()
  return doc ? (toPlain(doc) as unknown as Doc<Tech>) : null
}

/* ------------------------------------------------------------- messages --- */

export interface StoredMessage {
  _id: string
  name: string
  email: string
  message: string
  contactConsent: boolean
  read: boolean
  archived: boolean
  spam: boolean
  sourcePage: string | null
  referrer: string | null
  meta: { userAgent: string | null; country: string | null }
  createdAt: Date
}

export type MessageBox = 'inbox' | 'archived' | 'spam'

export async function listMessages(box: MessageBox = 'inbox'): Promise<StoredMessage[]> {
  if (!(await ready())) return []

  const query =
    box === 'inbox'
      ? { archived: false, spam: false }
      : box === 'archived'
        ? { archived: true, spam: false }
        : { spam: true }

  const docs = await MessageModel.find(query).sort({ createdAt: -1 }).limit(200).lean()
  return toPlain(docs) as unknown as StoredMessage[]
}

export async function readMessage(id: string): Promise<StoredMessage | null> {
  if (!(await ready())) return null
  const doc = await MessageModel.findById(id).lean()
  return doc ? (toPlain(doc) as unknown as StoredMessage) : null
}

/* ------------------------------------------------------------ dashboard --- */

export interface AdminCounts {
  unread: number
  inbox: number
  work: { total: number; drafts: number }
  posts: { total: number; drafts: number }
  pages: { total: number; drafts: number }
  experience: number
  tech: number
  hasProfile: boolean
}

/**
 * All the dashboard numbers in one round trip.
 *
 * countDocuments rather than fetching and measuring length: the counts are the
 * only thing wanted, and pulling every post body across the wire to call .length
 * on the array is the kind of waste that is invisible at three posts and obvious
 * at three hundred.
 */
export async function readCounts(): Promise<AdminCounts> {
  const empty: AdminCounts = {
    unread: 0,
    inbox: 0,
    work: { total: 0, drafts: 0 },
    posts: { total: 0, drafts: 0 },
    pages: { total: 0, drafts: 0 },
    experience: 0,
    tech: 0,
    hasProfile: false,
  }

  if (!(await ready())) return empty

  const [
    unread,
    inbox,
    workTotal,
    workDrafts,
    postTotal,
    postDrafts,
    pageTotal,
    pageDrafts,
    experience,
    tech,
    profile,
  ] = await Promise.all([
    MessageModel.countDocuments({ read: false, archived: false, spam: false }),
    MessageModel.countDocuments({ archived: false, spam: false }),
    WorkModel.countDocuments(),
    WorkModel.countDocuments({ status: 'draft' }),
    PostModel.countDocuments(),
    PostModel.countDocuments({ status: 'draft' }),
    PageModel.countDocuments(),
    PageModel.countDocuments({ status: 'draft' }),
    ExperienceModel.countDocuments(),
    TechModel.countDocuments(),
    ProfileModel.countDocuments({ _id: 'me' }),
  ])

  return {
    unread,
    inbox,
    work: { total: workTotal, drafts: workDrafts },
    posts: { total: postTotal, drafts: postDrafts },
    pages: { total: pageTotal, drafts: pageDrafts },
    experience,
    tech,
    hasProfile: profile > 0,
  }
}

/**
 * Tech records for the reference pickers on work and experience. Projected down
 * to what a picker needs, because a <select> does not care about icons or notes.
 */
export async function techOptions(): Promise<{ _id: string; name: string; category: string }[]> {
  if (!(await ready())) return []
  const docs = await TechModel.find({}, { name: 1, category: 1 }).sort({ name: 1 }).lean()
  return toPlain(docs) as unknown as { _id: string; name: string; category: string }[]
}

/** Posts for the case-study link on work, and work for the reverse link. */
export async function postOptions(): Promise<{ _id: string; title: string }[]> {
  if (!(await ready())) return []
  const docs = await PostModel.find({}, { title: 1 }).sort({ title: 1 }).lean()
  return toPlain(docs) as unknown as { _id: string; title: string }[]
}

export async function workOptions(): Promise<{ _id: string; title: string }[]> {
  if (!(await ready())) return []
  const docs = await WorkModel.find({}, { title: 1 }).sort({ title: 1 }).lean()
  return toPlain(docs) as unknown as { _id: string; title: string }[]
}
