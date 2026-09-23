import mongoose, { Schema } from 'mongoose'

/**
 * The resume PDF itself, stored as bytes.
 *
 * WHY IN THE DATABASE and not in a blob store. This is one file of a few hundred
 * kilobytes, replaced a handful of times a year, read rarely and cacheable at the
 * edge. Putting it in Vercel Blob or R2 would mean another account, another token
 * to rotate, another vendor in the deploy, and a second place where "the current
 * resume" might live. BSON documents can hold 16MB, so a 200KB PDF is not close
 * to a limit, and the file moves with any database dump instead of being the one
 * thing a backup quietly misses.
 *
 * That reasoning would invert at, say, a gallery of photographs. Binaries in the
 * primary database is a bad default and a good exception; this is the exception.
 * It also survives the move to Postgres unchanged, as a bytea column.
 *
 * A singleton, always _id 'current'. Uploading replaces it. There is no version
 * history because there is no question a previous resume answers.
 */

const ResumeSchema = new Schema(
  {
    _id: { type: String, default: 'current' },

    /** The PDF. Never selected by list queries; see lib/admin/read.ts. */
    data: { type: Buffer, required: true },

    contentType: { type: String, default: 'application/pdf' },
    size: { type: Number, required: true },

    /** What the file was called when uploaded. Shown in the admin, never served. */
    originalName: { type: String, default: null },

    /**
     * Whether crawlers may index the PDF.
     *
     * Defaults to false, which is the cautious answer rather than the obvious
     * one. A resume carries a phone number and an email address in plain text,
     * and an indexed PDF is a scrapeable copy of both. The /about page is the
     * thing that should rank for his name; it is HTML, it is richer, and it does
     * not hand over a direct line.
     */
    indexable: { type: Boolean, default: false },
  },
  { timestamps: true, _id: false }
)

export const ResumeModel = mongoose.models.Resume ?? mongoose.model('Resume', ResumeSchema)

/** The largest upload accepted. Well under the BSON limit, and no resume is bigger. */
export const MAX_RESUME_BYTES = 5 * 1024 * 1024

/**
 * Every PDF starts with the bytes %PDF-.
 *
 * Checked instead of trusting the browser's Content-Type, which is derived from
 * the file extension on most platforms and is therefore a claim about the name
 * rather than about the contents. Renaming notes.txt to notes.pdf is enough to
 * pass a MIME check and not enough to pass this one.
 */
export function looksLikePdf(bytes: Uint8Array): boolean {
  return (
    bytes.length > 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  )
}
