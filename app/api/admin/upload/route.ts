import { NextResponse } from 'next/server'
import { getAdmin } from '@/lib/admin/session'
import { uploadImage } from '@/lib/uploads'

export const dynamic = 'force-dynamic'

/**
 * The one upload endpoint.
 *
 * A route handler rather than a server action, for one concrete reason: server
 * actions are capped at the `bodySizeLimit` in next.config (6MB, set there for
 * the resume) and that limit is global to all of them. A route handler takes the
 * multipart body directly and keeps file size a property of this endpoint rather
 * than of every form in the admin.
 *
 * Gated here, explicitly. app/admin/(app)/layout.tsx never runs for a route
 * handler, so its check protects nothing at this address. Without this line the
 * endpoint would accept uploads from anyone who found the URL.
 *
 * Accepts several files in one request, because adding screenshots to a project
 * is naturally a multi-select and uploading them one at a time is the friction
 * this whole thing exists to remove. Each result is reported separately so one
 * bad file does not discard four good ones.
 */
export async function POST(request: Request) {
  if (!(await getAdmin())) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }

  const form = await request.formData()
  const files = form.getAll('file').filter((f): f is File => f instanceof File && f.size > 0)

  if (files.length === 0) {
    return NextResponse.json({ error: 'No file received.' }, { status: 400 })
  }

  const results = await Promise.all(files.map((file) => uploadImage(file)))

  return NextResponse.json({
    images: results.flatMap((r) => (r.ok ? [r.image] : [])),
    errors: results.flatMap((r) => (r.ok ? [] : [r.error])),
  })
}
