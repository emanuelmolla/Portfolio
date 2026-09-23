'use client'

import { FormShell } from '@/components/admin/FormShell'
import { Check, Fieldset } from '@/components/admin/fields'
import { uploadResume } from './actions'

/**
 * Upload form for the resume.
 *
 * The file input is deliberately optional even though this is an upload screen:
 * the indexing checkbox is on the same form, and making it impossible to change
 * that setting without re-picking the PDF would be an odd thing to have to do.
 * The action handles the two cases separately.
 */
export function ResumeForm({
  hasFile,
  indexable,
  maxMb,
}: {
  hasFile: boolean
  indexable: boolean
  maxMb: number
}) {
  return (
    <FormShell action={uploadResume} saveLabel={hasFile ? 'Replace resume' : 'Upload resume'}>
      {(err) => (
        <Fieldset legend="File">
          <div>
            <label className="a-label mb-1.5" htmlFor="file">
              PDF
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept="application/pdf,.pdf"
              className="a-input file:mr-3 file:rounded file:border-0 file:bg-[var(--a-accent-soft)] file:px-3 file:py-1 file:text-[12px] file:text-[var(--a-accent)]"
            />
            {err('file') ? (
              <p className="a-error mt-1.5">{err('file')}</p>
            ) : (
              <p className="a-hint mt-1.5">
                Up to {maxMb}MB. Uploading replaces the current file immediately; there is no
                version history, because nothing needs the old one.
              </p>
            )}
          </div>

          <Check
            label="Let search engines index the PDF"
            name="indexable"
            defaultChecked={indexable}
            hint="Off by default. A resume is a phone number and an email address in plain text, and an indexed PDF is a scrapeable copy of both. The /about page is what should rank for your name anyway: it is HTML, it says more, and it does not hand over a direct line."
          />
        </Fieldset>
      )}
    </FormShell>
  )
}
