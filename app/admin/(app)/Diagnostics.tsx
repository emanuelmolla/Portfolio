import { adminEmails, configuredProviders } from '@/auth'
import { hasDatabase } from '@/lib/content/_util'
import { emailConfigured, notificationRecipient } from '@/lib/email'
import { readResumeMeta } from '@/lib/admin/read'
import { TestEmailButton } from './TestEmailButton'

/**
 * What is wired up and what is not.
 *
 * Every line here is something that fails QUIETLY when it is missing: the site
 * silently serves seed content with no database, notification email silently goes
 * nowhere with no API key, the resume silently downloads under the wrong name
 * with nothing uploaded. None of those announce themselves, so they get one
 * screen that does.
 */
export async function Diagnostics() {
  const resume = await readResumeMeta()
  const recipient = notificationRecipient()
  const email = emailConfigured()

  const checks: { label: string; ok: boolean; detail: string }[] = [
    {
      label: 'Database',
      ok: hasDatabase(),
      detail: hasDatabase()
        ? 'Connected. The site reads from Mongo.'
        : 'No MONGODB_URI. The site is serving seed content and nothing can be saved.',
    },
    {
      label: 'Sign-in',
      ok: configuredProviders.length > 0 && adminEmails().length > 0,
      detail:
        configuredProviders.length === 0
          ? 'No provider configured.'
          : `${configuredProviders.join(' and ')}, ${adminEmails().length} address${
              adminEmails().length === 1 ? '' : 'es'
            } allowed.`,
    },
    {
      label: 'Notifications',
      ok: email,
      detail: email
        ? `Contact form messages are emailed to ${recipient}.`
        : 'No RESEND_API_KEY or CONTACT_FROM_EMAIL. Messages are still stored, they just do not reach your inbox.',
    },
    {
      label: 'Resume',
      ok: Boolean(resume),
      detail: resume
        ? `${(resume.size / 1024).toFixed(0)} KB, served under your name.`
        : 'Nothing uploaded. /resume forwards to the committed copy, which downloads as resume.pdf.',
    },
  ]

  return (
    <section className="mt-7">
      <h2 className="mb-2.5 text-[14px] font-semibold tracking-tight">Setup</h2>

      <div className="a-card overflow-hidden">
        <ul className="a-divide">
          {checks.map((check) => (
            <li key={check.label} className="flex items-start gap-3 px-4 py-2.5">
              <span
                aria-hidden
                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                  check.ok ? 'bg-[var(--a-accent)]' : 'bg-[var(--a-warn)]'
                }`}
              />
              <span className="min-w-0">
                <span className="block text-[13px] font-medium">
                  {check.label}
                  {/* The dot is decorative, so the state is also in text. */}
                  <span className="sr-only">: {check.ok ? 'ready' : 'not configured'}</span>
                </span>
                <span className="a-hint mt-0.5 block">{check.detail}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="border-t border-[var(--a-line)] bg-[var(--a-panel-2)] px-4 py-2.5">
          <TestEmailButton disabled={!email} />
        </div>
      </div>
    </section>
  )
}
