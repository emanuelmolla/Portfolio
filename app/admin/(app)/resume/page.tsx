import { MAX_RESUME_BYTES } from '@/lib/models'
import { readProfile, readResumeMeta } from '@/lib/admin/read'
import { resumeFilename } from '@/lib/resume'
import { Notice } from '@/components/admin/fields'
import { PageHeader, formatDateTime } from '@/components/admin/page-parts'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { ResumeForm } from './ResumeForm'
import { removeResume } from './actions'

export const dynamic = 'force-dynamic'

export default async function ResumePage() {
  const [meta, profile] = await Promise.all([readResumeMeta(), readProfile()])
  const filename = resumeFilename(profile?.name)

  return (
    <>
      <PageHeader
        title="Resume"
        description="The PDF behind every resume link on the site. Stored in the database rather than committed to the repository, so updating it is an upload and not a deploy."
      />

      {meta ? (
        <div className="a-card mb-5 px-5 py-4">
          <dl className="grid gap-2 text-[13px] sm:grid-cols-[8rem_minmax(0,1fr)]">
            <dt className="a-label">Downloads as</dt>
            <dd className="a-mono">{filename}</dd>

            <dt className="a-label">Uploaded as</dt>
            <dd className="a-mono break-all">{meta.originalName ?? 'unknown'}</dd>

            <dt className="a-label">Size</dt>
            <dd className="a-mono">{(meta.size / 1024).toFixed(0)} KB</dd>

            <dt className="a-label">Updated</dt>
            <dd className="a-mono">{formatDateTime(meta.updatedAt)}</dd>

            <dt className="a-label">Indexing</dt>
            <dd>{meta.indexable ? 'Crawlers may index it' : 'Hidden from crawlers'}</dd>
          </dl>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--a-line)] pt-4">
            {/* Plain anchors, not <Link>. /resume is a route handler returning a
                PDF, so there is no React tree to navigate to: a client-side
                transition would fetch an RSC payload that does not exist. The
                lint rule assumes any internal href is a page. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/resume" target="_blank" rel="noreferrer" className="a-btn">
              View
            </a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/resume?download" className="a-btn">
              Download
            </a>
            <DeleteButton action={removeResume} id="current" label="Remove" />
          </div>
        </div>
      ) : (
        <div className="mb-5">
          <Notice tone="warn">
            <p className="font-medium">No resume uploaded.</p>
            <p className="mt-2">
              Until one is, <code className="a-mono">/resume</code> forwards to the copy committed
              at <code className="a-mono">public/resume.pdf</code>, which downloads under that
              name. Uploading here is what makes it save as{' '}
              <code className="a-mono">{filename}</code>. Running{' '}
              <code className="a-mono">npm run seed</code> imports the committed file for you.
            </p>
          </Notice>
        </div>
      )}

      <ResumeForm
        hasFile={Boolean(meta)}
        indexable={meta?.indexable ?? false}
        maxMb={MAX_RESUME_BYTES / 1024 / 1024}
      />

      <div className="mt-5">
        <Notice>
          The name comes from the profile, so it tracks whatever{' '}
          <strong>{profile?.name || 'Name'}</strong> is set to rather than being typed twice. One
          file called <code className="a-mono">resume.pdf</code> in a recruiter&apos;s downloads
          folder is indistinguishable from the forty others already in it.
        </Notice>
      </div>
    </>
  )
}
