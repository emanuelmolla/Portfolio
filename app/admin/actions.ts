'use server'

import { signIn, signOut } from '@/auth'

/**
 * Sign-in and sign-out as server actions, so the login page is a form post
 * rather than an onClick. It works without JavaScript and there is no client
 * bundle for the one screen that exists to be reached before anything is loaded.
 */

export async function signInWith(formData: FormData): Promise<void> {
  const provider = String(formData.get('provider') ?? '')
  const from = String(formData.get('from') ?? '/admin')

  // The redirect target is constrained to a path inside /admin. Passing a caller
  // supplied value straight into redirectTo is an open redirect: a crafted link
  // could bounce a successful sign-in to an external page.
  const safe = from.startsWith('/admin') && !from.startsWith('//') ? from : '/admin'

  await signIn(provider, { redirectTo: safe })
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: '/admin/login' })
}
