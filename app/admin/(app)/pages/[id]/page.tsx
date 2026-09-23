import { notFound } from 'next/navigation'
import { PAGE_STATUS } from '@/lib/models'
import { readPage } from '@/lib/admin/read'
import { PageHeader } from '@/components/admin/page-parts'
import { PageForm, type PageFormValues } from './PageForm'

export const dynamic = 'force-dynamic'

const blank: PageFormValues = {
  slug: '',
  title: '',
  body: '',
  sections: [],
  status: 'draft',
  inNav: false,
  navOrder: 0,
  showUpdatedAt: false,
  seo: { title: null, description: null, canonicalUrl: null, noindex: false },
}

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'new'

  const page = isNew ? null : await readPage(id)
  if (!isNew && !page) notFound()

  const values: PageFormValues = page
    ? {
        _id: page._id,
        slug: page.slug,
        title: page.title,
        body: page.body ?? '',
        sections: (page.sections ?? []).map((section) => ({
          heading: section.heading,
          body: section.body,
        })),
        status: page.status,
        inNav: page.inNav,
        navOrder: page.navOrder,
        showUpdatedAt: page.showUpdatedAt,
        seo: {
          title: page.seo?.title ?? null,
          description: page.seo?.description ?? null,
          canonicalUrl: page.seo?.canonicalUrl ?? null,
          noindex: page.seo?.noindex ?? false,
        },
      }
    : blank

  return (
    <>
      <PageHeader
        title={isNew ? 'New page' : page?.title || 'Untitled'}
        back={{ href: '/admin/pages', label: 'Pages' }}
      />
      <PageForm values={values} statuses={PAGE_STATUS} />
    </>
  )
}
