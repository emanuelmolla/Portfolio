import { NextResponse, type NextRequest } from 'next/server'
import { PREVIEW_COOKIE } from '@/lib/preview'

export const dynamic = 'force-dynamic'

/**
 * Leave preview mode.
 *
 * No admin check, deliberately. Clearing a cookie takes privileges away, and
 * requiring a session to give up access would mean someone whose session had
 * expired could not exit a mode they can no longer use anyway.
 */
export async function GET(request: NextRequest) {
  const to = request.nextUrl.searchParams.get('to') ?? '/'
  const target = to.startsWith('/') && !to.startsWith('//') ? to : '/'

  const response = NextResponse.redirect(new URL(target, request.url))
  response.cookies.delete(PREVIEW_COOKIE)
  return response
}
