import { PageModel, PostModel, WorkModel, type Page, type Post, type Work } from '@/lib/models'
import { connectDB } from '@/lib/db'
import { toPlain, hasDatabase } from './_util'
import { seedPages, seedPosts, seedWork } from './_seed'

/**
 * Slug reads that include drafts, for preview mode only.
 *
 * Two things separate these from the functions next to them in this directory,
 * and both are deliberate:
 *
 *   NOT CACHED. A preview exists to show the current state of something being
 *   edited. Serving it from unstable_cache would show the version before the
 *   last save, which is the one thing a preview must never do.
 *
 *   NO STATUS FILTER. That is the entire point.
 *
 * These are reachable only from a route that has already verified a signed
 * preview cookie (lib/preview.ts). Nothing in themes/ imports this module, and
 * nothing should: the public reads in this directory are the ones that are safe
 * by construction, and these are the ones that are safe by check.
 */

export async function previewPost(slug: string): Promise<Post | null> {
  if (!hasDatabase()) {
    return seedPosts.find((p) => p.slug === slug || p.previousSlugs.includes(slug)) ?? null
  }

  await connectDB()
  const doc = await PostModel.findOne({ $or: [{ slug }, { previousSlugs: slug }] }).lean()
  return doc ? (toPlain(doc) as unknown as Post) : null
}

export async function previewWork(slug: string): Promise<Work | null> {
  if (!hasDatabase()) {
    return seedWork.find((w) => w.slug === slug || w.previousSlugs.includes(slug)) ?? null
  }

  await connectDB()
  const doc = await WorkModel.findOne({ $or: [{ slug }, { previousSlugs: slug }] }).lean()
  return doc ? (toPlain(doc) as unknown as Work) : null
}

export async function previewPage(slug: string): Promise<Page | null> {
  if (!hasDatabase()) {
    return seedPages.find((p) => p.slug === slug || p.previousSlugs.includes(slug)) ?? null
  }

  await connectDB()
  const doc = await PageModel.findOne({ $or: [{ slug }, { previousSlugs: slug }] }).lean()
  return doc ? (toPlain(doc) as unknown as Page) : null
}
