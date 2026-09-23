import { notFound } from 'next/navigation'
import { readRedirect } from '@/lib/admin/read'
import { PageHeader } from '@/components/admin/page-parts'
import { RedirectForm, type RedirectFormValues } from './RedirectForm'

export const dynamic = 'force-dynamic'

const blank: RedirectFormValues = { from: '', to: '', statusCode: 301, note: null }

export default async function EditRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'new'

  const entry = isNew ? null : await readRedirect(id)
  if (!isNew && !entry) notFound()

  const values: RedirectFormValues = entry
    ? {
        _id: entry._id,
        from: entry.from,
        to: entry.to,
        statusCode: entry.statusCode,
        note: entry.note,
      }
    : blank

  return (
    <>
      <PageHeader
        title={isNew ? 'New redirect' : entry?.from || 'Redirect'}
        back={{ href: '/admin/redirects', label: 'Redirects' }}
      />
      <RedirectForm values={values} />
    </>
  )
}
