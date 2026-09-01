/**
 * Seeds MongoDB from lib/content/_seed.ts and migrates v1 content in place.
 *
 *   npm run seed            write seed content, migrate v1 blogs
 *   npm run seed -- --dry   report what would happen, change nothing
 *
 * Idempotent: every write is an upsert keyed on slug, so running it twice is
 * the same as running it once. That matters because the v1 blog migration is
 * the kind of thing you want to be able to re-run after fixing a mapping.
 *
 * Requires MONGODB_URI. Point it at the same Atlas cluster v1 uses: the old
 * Blog and Message collections are read in place, not copied from elsewhere.
 */

import mongoose from 'mongoose'
import { connectDB } from '../lib/db'
import {
  ExperienceModel,
  PageModel,
  PostModel,
  ProfileModel,
  TechModel,
  WorkModel,
} from '../lib/models'
import {
  seedExperience,
  seedPages,
  seedProfile,
  seedTech,
  seedWork,
} from '../lib/content/_seed'

const DRY = process.argv.includes('--dry')

function log(action: string, detail: string) {
  console.log(`${DRY ? '[dry] ' : ''}${action.padEnd(10)} ${detail}`)
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set. Put it in .env.local and re-run.')
    process.exit(1)
  }

  await connectDB()
  console.log(`connected${DRY ? ' (dry run, nothing will be written)' : ''}\n`)

  /* --- tech first: work references it, so the ids have to exist ---------- */
  const techIdBySlug = new Map<string, mongoose.Types.ObjectId>()

  for (const tech of seedTech) {
    log('tech', tech.slug)
    if (DRY) continue

    const doc = await TechModel.findOneAndUpdate(
      { slug: tech.slug },
      { $set: tech },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    techIdBySlug.set(tech.slug, doc._id)
  }

  /* --- profile: a singleton, always _id "me" ---------------------------- */
  log('profile', seedProfile.name)
  if (!DRY) {
    await ProfileModel.findByIdAndUpdate(
      'me',
      { $set: seedProfile },
      { upsert: true, setDefaultsOnInsert: true }
    )
  }

  /* --- work: resolve the tech_<slug> placeholders into real ObjectIds ---- */
  for (const work of seedWork) {
    const refs = (work.techRefs ?? [])
      .map((placeholder) => techIdBySlug.get(String(placeholder).replace(/^tech_/, '')))
      .filter(Boolean)

    log('work', `${work.slug} (${refs.length} tech refs)`)
    if (DRY) continue

    await WorkModel.findOneAndUpdate(
      { slug: work.slug },
      { $set: { ...work, techRefs: refs } },
      { upsert: true, setDefaultsOnInsert: true }
    )
  }

  for (const entry of seedExperience) {
    log('experience', entry.slug)
    if (DRY) continue
    await ExperienceModel.findOneAndUpdate(
      { slug: entry.slug },
      { $set: entry },
      { upsert: true, setDefaultsOnInsert: true }
    )
  }

  for (const page of seedPages) {
    log('page', page.slug)
    if (DRY) continue
    await PageModel.findOneAndUpdate(
      { slug: page.slug },
      { $set: page },
      { upsert: true, setDefaultsOnInsert: true }
    )
  }

  /* --- v1 blogs -> posts ------------------------------------------------- */
  await migrateBlogs()

  console.log('\ndone')
  await mongoose.disconnect()
}

/**
 * The v1 Blog model stored `content: [String]`, an array of paragraphs. That
 * cannot express a heading, a code block or an image, which is why it does not
 * survive. Joining with blank lines turns each element into a markdown
 * paragraph, which is lossless for what v1 could actually represent.
 *
 * The old collection is read, never written or dropped. Nothing is destroyed
 * here, so this is safe to run against production data.
 */
async function migrateBlogs() {
  const legacy = mongoose.connection.collection('blogs')
  const count = await legacy.countDocuments()

  if (count === 0) {
    console.log('\nno v1 blogs found (collection empty or absent)')
    return
  }

  console.log(`\nmigrating ${count} v1 blog(s)`)

  const docs = await legacy.find({}).toArray()

  for (const doc of docs) {
    const slug = String(doc.slug ?? '').trim()
    if (!slug) {
      log('skip', `blog ${String(doc._id)} has no slug`)
      continue
    }

    const paragraphs: string[] = Array.isArray(doc.content) ? doc.content : []
    const body = paragraphs.filter(Boolean).join('\n\n')

    const post = {
      slug,
      title: doc.title ?? slug,
      excerpt: (paragraphs[0] ?? '').slice(0, 180),
      body,
      bodyFormat: 'markdown' as const,
      coverImage: doc.image
        ? {
            url: String(doc.image),
            alt: String(doc.title ?? ''),
            // v1 stored a bare URL with no dimensions. They are required, so
            // this is flagged rather than guessed: a wrong aspect ratio causes
            // exactly the layout shift the field exists to prevent.
            width: 1200,
            height: 630,
            blurDataURL: null,
            caption: null,
          }
        : null,
      tags: [],
      status: doc.published ? ('published' as const) : ('draft' as const),
      publishedAt: doc.createdAt ?? null,
      stats: { views: Number(doc.views ?? 0), likes: Number(doc.likes ?? 0) },
    }

    log('post', `${slug} (${post.status}, ${paragraphs.length} paragraphs)`)
    if (DRY) continue

    await PostModel.findOneAndUpdate(
      { slug },
      { $set: post },
      { upsert: true, setDefaultsOnInsert: true }
    )
  }

  if (docs.some((d) => d.image)) {
    console.log(
      '\nNOTE: v1 blog cover images had no stored dimensions. They default to\n' +
        '1200x630 here. Fix any that are not that ratio, or images will shift\n' +
        'the layout as they load.'
    )
  }
}

main().catch(async (err) => {
  console.error(err)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
