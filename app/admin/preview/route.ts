import { NextResponse, type NextRequest } from 'next/server'
import { getAdmin } from '@/lib/admin/session'
import { PREVIEW_COOKIE, mintPreviewToken } from '@/lib/preview'

export const dynamic = 'force-dynamic'

/**
 * Enter preview mode, then go and look at the thing.
 *
 * A route handler rather than a server action because the job is to set a cookie
 * and redirect, which is exactly what a GET with a Set-Cookie does, and it means
 * the Preview button in the admin is an ordinary link.
 *
 * This lives under /admin, so it is disallowed in robots.txt along with
 * everything else there. Which matters less than the signature does: the cookie
 * is what grants draft visibility, and it is minted here and nowhere else.
 */
export async function GET(request: NextRequest) {
  // Not the layout's gate. This is a route handler, so app/admin/(app)/layout.tsx
  // never runs for it, and the check has to be here.
  if (!(await getAdmin())) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  const token = mintPreviewToken()
  if (!token) {
    return new NextResponse(
      'AUTH_SECRET is not set, so the preview cookie cannot be signed.',
      { status: 500 }
    )
  }

  const to = request.nextUrl.searchParams.get('to') ?? '/'

  // Only a path on this site. Without this, /admin/preview?to=https://elsewhere
  // is an open redirect wearing the site's own domain, which is the shape used
  // to make a phishing link look legitimate. Rejecting '//' matters too: a
  // browser reads //evil.com as a protocol-relative URL to another host.
  const target = to.startsWith('/') && !to.startsWith('//') ? to : '/'

  const response = NextResponse.redirect(new URL(target, request.url))

  response.cookies.set(PREVIEW_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 2 * 60 * 60,
  })

  return response
}
