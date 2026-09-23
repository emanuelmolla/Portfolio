import { redirect } from 'next/navigation'
import { auth, isAdminEmail } from '@/auth'

/**
 * The admin gate.
 *
 * THE IMPORTANT PART: gating app/admin/layout.tsx does NOT protect the server
 * actions rendered inside it. A server action compiles to its own POST endpoint
 * with a stable id, callable by anyone who has seen the page source; the layout
 * never runs for that request. So every action calls into this module before it
 * touches data. Forgetting that in one action is the whole hole.
 *
 * The allow-list is re-checked on every request rather than trusted from the
 * session. A JWT stays valid for its full lifetime, so an address removed from
 * ADMIN_EMAILS would otherwise keep working for up to thirty days. Re-checking
 * makes removal take effect on the next request, which is what "revoke" has to
 * mean.
 */

export interface Admin {
  email: string
  name: string | null
  image: string | null
}

export async function getAdmin(): Promise<Admin | null> {
  const session = await auth()
  const email = session?.user?.email

  if (!isAdminEmail(email)) return null

  return {
    email: email as string,
    name: session?.user?.name ?? null,
    image: session?.user?.image ?? null,
  }
}

/** For pages and layouts. Sends an unauthenticated visitor to the login page. */
export async function requireAdmin(from?: string): Promise<Admin> {
  const admin = await getAdmin()
  if (admin) return admin

  const target = from ? `/admin/login?from=${encodeURIComponent(from)}` : '/admin/login'
  redirect(target)
}

/**
 * For server actions. Returns null instead of redirecting, so an action can
 * answer with a form state the caller can render rather than throwing a redirect
 * in the middle of a mutation.
 */
export async function adminOrNull(): Promise<Admin | null> {
  return getAdmin()
}
