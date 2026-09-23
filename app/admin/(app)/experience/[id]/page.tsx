import { notFound } from 'next/navigation'
import { LINK_KINDS, PUBLISH_STATUS, SECTIONS, SORT_MODES } from '@/lib/models'
import { readExperience, techOptions } from '@/lib/admin/read'
import { toDayInput } from '@/lib/admin/form'
import { PageHeader } from '@/components/admin/page-parts'
import { ExperienceForm, type ExperienceFormValues } from './ExperienceForm'

export const dynamic = 'force-dynamic'

const blank: ExperienceFormValues = {
  slug: '',
  section: 'work',
  sortMode: 'date-desc',
  org: '',
  role: '',
  location: null,
  employmentType: null,
  url: null,
  startDate: '',
  endDate: '',
  current: false,
  summary: null,
  highlights: [],
  techRefs: [],
  links: [],
  order: 0,
  status: 'published',
}

export default async function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const isNew = id === 'new'

  const [entry, tech] = await Promise.all([
    isNew ? null : readExperience(id),
    techOptions(),
  ])
  if (!isNew && !entry) notFound()

  const values: ExperienceFormValues = entry
    ? {
        _id: entry._id,
        slug: entry.slug,
        section: entry.section,
        sortMode: entry.sortMode,
        org: entry.org,
        role: entry.role,
        location: entry.location,
        employmentType: entry.employmentType,
        url: entry.url,
        startDate: toDayInput(entry.startDate),
        endDate: toDayInput(entry.endDate),
        current: entry.current,
        summary: entry.summary,
        highlights: entry.highlights ?? [],
        techRefs: (entry.techRefs ?? []).map(String),
        links: (entry.links ?? []).map((link) => ({
          kind: link.kind,
          label: link.label ?? '',
          url: link.url,
        })),
        order: entry.order,
        status: entry.status,
      }
    : blank

  return (
    <>
      <PageHeader
        title={isNew ? 'New entry' : `${entry?.role} at ${entry?.org}`}
        back={{ href: '/admin/experience', label: 'Experience' }}
      />
      <ExperienceForm
        values={values}
        sections={SECTIONS}
        sortModes={SORT_MODES}
        statuses={PUBLISH_STATUS}
        linkKinds={LINK_KINDS}
        techOptions={tech}
      />
    </>
  )
}
