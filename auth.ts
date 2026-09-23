import NextAuth, { type NextAuthConfig } from 'next-auth'
import type { Provider } from 'next-auth/providers'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'

/**
 * Admin authentication.
 *
 * There is no user table, no password, no sign-up and no reset flow. Identity is
 * delegated entirely to Google (and GitHub, if configured) and authorisation is a
 * static allow-list of email addresses read from the environment. For a
 * single-person site that is strictly better than owning credentials: the v1 API
 * stored a password hash and a JWT secret, which is two things to leak for zero
 * benefit over an OAuth redirect.
 *
 * Several addresses are allowed rather than one, so losing access to a single
 * account is an inconvenience rather than a lockout.
 *
 * Sessions are JWTs in a cookie, not rows in Mongo. With one user there is
 * nothing to gain from a session collection, and it keeps the login path off the
 * database entirely: if Atlas is down, the admin still signs in and can see that
 * it is down.
 */

/* ------------------------------------------------------------ allow-list --- */

/**
 * ADMIN_EMAILS is comma-separated. ADMIN_EMAIL (singular) is still read so an
 * older environment keeps working.
 */
export function adminEmails(): string[] {
  const raw = [process.env.ADMIN_EMAILS, process.env.ADMIN_EMAIL]
    .filter(Boolean)
    .join(',')

  return raw
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const list = adminEmails()
  // An empty allow-list denies everyone. The alternative, treating "unset" as
  // "allow all", turns one missing environment variable into a public admin.
  if (list.length === 0) return false
  return list.includes(email.trim().toLowerCase())
}

/* ------------------------------------------------------------- providers --- */

/**
 * A provider is registered only when its credentials are present, so a missing
 * GitHub app does not break Google sign-in. `configuredProviders` is exported
 * because the login page needs to know which buttons to draw: offering a button
 * that cannot work is worse than offering none.
 */
function buildProviders(): { providers: Provider[]; ids: string[] } {
  const providers: Provider[] = []
  const ids: string[] = []

  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push(
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
        // Always show the account chooser. Without this, Google silently reuses
        // whichever account the browser last used, which is exactly wrong when
        // the point of the allow-list is being able to pick a different address.
        authorization: { params: { prompt: 'select_account' } },
      })
    )
    ids.push('google')
  }

  if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
    providers.push(
      GitHub({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
      })
    )
    ids.push('github')
  }

  return { providers, ids }
}

const built = buildProviders()

export const configuredProviders = built.ids

/** True when sign-in can actually complete. The login page reports this plainly. */
export const authConfigured = built.ids.length > 0 && Boolean(process.env.AUTH_SECRET)

/* ---------------------------------------------------------------- config --- */

const config: NextAuthConfig = {
  providers: built.providers,

  // No adapter, so this is already the default. Stated anyway: it is the reason
  // there is no Session or Account collection to reason about.
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 },

  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },

  /**
   * Set explicitly rather than relying on AUTH_URL or Vercel detection. Without
   * it, Auth.js refuses to run on localhost with an UntrustedHost error that is
   * genuinely confusing the first time. Safe here because the app is served from
   * one known host and nothing downstream trusts the Host header.
   */
  trustHost: true,

  callbacks: {
    /**
     * The authorisation gate. Returning false sends the visitor back to the
     * login page with error=AccessDenied.
     *
     * email_verified is checked for Google because an unverified address on an
     * OAuth profile proves nothing about who controls it. GitHub's provider
     * already resolves the primary verified address via /user/emails, so its
     * profile email is trustworthy by the time it reaches here.
     */
    signIn({ account, profile, user }) {
      if (account?.provider === 'google') {
        if (profile?.email_verified !== true) return false
        return isAdminEmail(profile.email)
      }

      return isAdminEmail(user?.email ?? profile?.email ?? null)
    },

    /** Carry the email on the token so the gate can re-check it per request. */
    jwt({ token, user }) {
      if (user?.email) token.email = user.email
      return token
    },

    session({ session, token }) {
      if (session.user && token.email) session.user.email = token.email
      return session
    },
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth(config)
