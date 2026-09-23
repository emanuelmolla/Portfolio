import Link from 'next/link'
import { redirect } from 'next/navigation'
import { adminEmails, authConfigured, configuredProviders } from '@/auth'
import { getAdmin } from '@/lib/admin/session'
import { signInWith } from '../actions'

export const dynamic = 'force-dynamic'

/**
 * Sign-in.
 *
 * Every failure mode says what is actually wrong rather than "authentication
 * failed", because the person reading this is the person who has to fix it. A
 * missing client secret and a non-allow-listed address are the same screen for a
 * visitor and completely different problems for the operator.
 */

const PROVIDER_LABEL: Record<string, string> = {
  google: 'Continue with Google',
  github: 'Continue with GitHub',
}

const ERROR_TEXT: Record<string, string> = {
  AccessDenied:
    'That account is not on the allow-list. Sign in with an address listed in ADMIN_EMAILS, or add this one to it.',
  Configuration:
    'The provider is misconfigured. Check AUTH_SECRET and the client id and secret, then restart the server.',
  Verification: 'That sign-in link has expired. Start again.',
  OAuthAccountNotLinked: 'That address is already associated with a different provider.',
  OAuthCallback:
    'The provider rejected the callback. The usual cause is a redirect URI that is not registered: it has to be this origin plus /api/auth/callback/<provider>.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>
}) {
  // Already signed in: skip the screen. Someone who bookmarked the login page
  // should land in the admin, not be asked to sign in a second time.
  if (await getAdmin()) redirect('/admin')

  const params = await searchParams
  const error = params.error ? (ERROR_TEXT[params.error] ?? `Sign-in failed (${params.error}).`) : null

  const allowCount = adminEmails().length

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div className="a-card px-6 py-7">
        <h1 className="text-[17px] font-semibold tracking-tight">Admin</h1>
        <p className="a-hint mt-1.5">emanuelmolla.dev</p>

        {error && (
          <div role="alert" className="a-notice a-notice-danger mt-5">
            {error}
          </div>
        )}

        {!authConfigured ? (
          <div className="a-notice a-notice-warn mt-5">
            <p className="font-medium">Sign-in is not configured yet.</p>
            <p className="mt-2">
              Set <code className="a-mono">AUTH_SECRET</code> and at least one provider pair (
              <code className="a-mono">AUTH_GOOGLE_ID</code> and{' '}
              <code className="a-mono">AUTH_GOOGLE_SECRET</code>) in{' '}
              <code className="a-mono">.env.local</code>, then restart the dev server.
            </p>
          </div>
        ) : allowCount === 0 ? (
          <div className="a-notice a-notice-warn mt-5">
            <p className="font-medium">The allow-list is empty.</p>
            <p className="mt-2">
              Nobody can sign in until <code className="a-mono">ADMIN_EMAILS</code> contains at
              least one address. An empty list denies everyone on purpose, so that a missing
              variable cannot open the admin to the internet.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-2">
            {configuredProviders.map((provider) => (
              <form key={provider} action={signInWith}>
                <input type="hidden" name="provider" value={provider} />
                <input type="hidden" name="from" value={params.from ?? '/admin'} />
                <button type="submit" className="a-btn a-btn-primary w-full justify-center py-2.5">
                  {PROVIDER_LABEL[provider] ?? `Continue with ${provider}`}
                </button>
              </form>
            ))}
          </div>
        )}

        <p className="a-hint mt-6 leading-relaxed">
          {allowCount > 0 && authConfigured
            ? `${allowCount} ${allowCount === 1 ? 'address is' : 'addresses are'} allowed. Any other account is rejected after the provider signs it in.`
            : 'No passwords are stored here. Identity comes from the provider; access comes from the allow-list.'}
        </p>
      </div>

      <Link href="/" className="a-hint mt-5 text-center hover:underline">
        Back to the site
      </Link>
    </main>
  )
}
