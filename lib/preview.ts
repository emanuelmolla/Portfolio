import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

/**
 * Draft preview.
 *
 * The problem this solves: a draft is invisible to the site by construction, so
 * without this the only way to see a post rendered in the real theme is to
 * publish it. The markdown preview in the editor shows the prose; it does not
 * show the page, the typography, the metadata line or how the thing looks in the
 * desktop theme. Publishing to check is how a half-finished post ends up in a
 * feed for ninety seconds.
 *
 * THE COOKIE IS SIGNED, and that is not optional. Preview state has to live in a
 * cookie for the public routes to see it, and a cookie is a value the client
 * controls: anyone could set preview=1 by hand and read every draft on the site.
 * So the cookie carries an expiry and an HMAC over that expiry, and the routes
 * verify it rather than trusting its presence.
 *
 * httpOnly as well, so a script on the page cannot read or set it, and
 * sameSite=lax so it survives following a link from the admin.
 */

export const PREVIEW_COOKIE = 'preview'

/** Long enough for an editing session, short enough that a forgotten tab expires. */
const TTL_MS = 2 * 60 * 60 * 1000

/**
 * Signed with AUTH_SECRET, which already has to exist for sessions to work. A
 * separate secret would be one more thing to set and one more thing to forget.
 */
function secret(): string | null {
  return process.env.AUTH_SECRET || null
}

function sign(payload: string, key: string): string {
  return createHmac('sha256', key).update(payload).digest('base64url')
}

export function mintPreviewToken(): string | null {
  const key = secret()
  if (!key) return null

  const expires = String(Date.now() + TTL_MS)
  return `${expires}.${sign(expires, key)}`
}

export function verifyPreviewToken(token: string | undefined): boolean {
  const key = secret()
  if (!key || !token) return false

  const [expires, signature] = token.split('.')
  if (!expires || !signature) return false

  const expiry = Number(expires)
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false

  const expected = sign(expires, key)

  // Constant-time comparison. A plain === leaks how many leading bytes matched
  // through timing, which is enough to forge a signature given enough attempts.
  // Buffers must be the same length for timingSafeEqual, hence the length check
  // first; that length is not secret.
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false

  return timingSafeEqual(a, b)
}

/** Read by the public routes to decide whether drafts are visible this request. */
export async function isPreview(): Promise<boolean> {
  const store = await cookies()
  return verifyPreviewToken(store.get(PREVIEW_COOKIE)?.value)
}
