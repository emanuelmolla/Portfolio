import { NextResponse, type NextRequest } from 'next/server'
import { SCHEME_COOKIE, THEME_COOKIE } from '@/lib/theme/resolve'
import { themes } from '@/themes/registry'

/**
 * Sets the theme and/or colour-scheme cookie, then redirects back.
 *
 * Deliberately a route handler reached by a plain <a href>, not a client-side
 * toggle. Three reasons:
 *  - it works with JavaScript disabled,
 *  - the switcher is a real link, which is the same rule the chess and desktop
 *    themes have to follow for navigation anyway,
 *  - the ?theme= parameter never survives the redirect, so it cannot linger in
 *    history, get shared, or get indexed as a duplicate URL.
 */

const ONE_YEAR = 60 * 60 * 24 * 365

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const theme = searchParams.get('theme')
  const scheme = searchParams.get('scheme')

  // Only ever redirect to a path on this site. Taking the raw parameter would
  // turn this into an open redirect.
  const rawFrom = searchParams.get('from') ?? '/'
  const from = rawFrom.startsWith('/') && !rawFrom.startsWith('//') ? rawFrom : '/'

  const response = NextResponse.redirect(new URL(from, request.nextUrl.origin))

  if (theme && theme in themes) {
    response.cookies.set(THEME_COOKIE, theme, {
      path: '/',
      maxAge: ONE_YEAR,
      sameSite: 'lax',
      httpOnly: false,
    })
  }

  if (scheme === 'light' || scheme === 'dark' || scheme === 'system') {
    if (scheme === 'system') {
      response.cookies.delete(SCHEME_COOKIE)
    } else {
      response.cookies.set(SCHEME_COOKIE, scheme, {
        path: '/',
        maxAge: ONE_YEAR,
        sameSite: 'lax',
        httpOnly: false,
      })
    }
  }

  return response
}
