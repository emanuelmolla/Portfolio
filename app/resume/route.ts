import { createHash } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { connectDB } from '@/lib/db'
import { hasDatabase } from '@/lib/content/_util'
import { getProfile } from '@/lib/content'
import { ResumeModel } from '@/lib/models'
import { contentDisposition, resumeFilename } from '@/lib/resume'

export const dynamic = 'force-dynamic'

/**
 * The resume, served with a name worth saving.
 *
 * At /resume rather than /resume.pdf because a file in public/ is served by the
 * static handler before any route runs, so a route at that path could never take
 * over. The extension is not doing any work anyway: Content-Type says what it is
 * and Content-Disposition says what to call it.
 *
 * ?download=1 forces a save instead of opening in the viewer, for the places a
 * link wants to be unambiguous.
 */
export async function GET(request: NextRequest) {
  const forceDownload = request.nextUrl.searchParams.get('download') !== null

  if (!hasDatabase()) return fallback(request)

  await connectDB()
  const doc = await ResumeModel.findById('current').lean<{
    data: Buffer
    contentType: string
    size: number
    indexable: boolean
    updatedAt: Date
  }>()

  // Nothing uploaded yet: hand off to whatever is in public/, so the link in the
  // header is never dead. The filename is wrong on that path, which is the whole
  // reason this route exists, but a working link with a dull name beats a 404.
  if (!doc?.data) return fallback(request)

  const profile = await getProfile()
  const filename = resumeFilename(profile?.name)

  /**
   * ETag from the content, so a re-upload invalidates it and an unchanged file
   * costs a 304 instead of a few hundred kilobytes. Weak comparison is fine here
   * because nothing is doing byte-range requests against a resume.
   */
  const etag = `"${createHash('sha1').update(doc.data).digest('hex').slice(0, 24)}"`

  if (request.headers.get('if-none-match') === etag) {
    return new NextResponse(null, { status: 304, headers: { ETag: etag } })
  }

  const headers = new Headers({
    'Content-Type': doc.contentType || 'application/pdf',
    'Content-Length': String(doc.size),
    'Content-Disposition': contentDisposition(filename, forceDownload),
    ETag: etag,
    // must-revalidate rather than a long max-age: an updated resume has to be the
    // one people get immediately, and the ETag makes revalidation nearly free.
    'Cache-Control': 'public, max-age=0, must-revalidate',
  })

  // A resume is a phone number and an email address in plain text. Whether that
  // gets crawled is a real decision, so it is a stored setting rather than a
  // default nobody chose. See lib/models/resume.ts for why it starts closed.
  if (!doc.indexable) headers.set('X-Robots-Tag', 'noindex, noarchive')

  return new NextResponse(new Uint8Array(doc.data), { status: 200, headers })
}

/** Relative to the request, so this is correct on localhost and on a preview. */
function fallback(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL('/resume.pdf', request.url), 307)
}
