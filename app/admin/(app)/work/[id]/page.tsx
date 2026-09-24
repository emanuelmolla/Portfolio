import { notFound } from 'next/navigation'
import {
  DATE_PRECISION,
  LIFECYCLE,
  LINK_KINDS,
  PUBLISH_STATUS,
  WORK_KINDS,
} from '@/lib/models'
import { postOptions, readWork, techOptions } from '@/lib/admin/read'
import { toDayInput } from '@/lib/admin/form'
import { PageHeader } from '@/components/admin/page-parts'
import { WorkForm, type WorkFormValues } from './WorkForm'

export const dynamic = 'force-dynamic'

const blank: WorkFormValues = {
  slug: '',
  kind: 'software',
  title: '',
  summary: '',
  body: '',
  problem: null,
  outcome: null,
  role: null,
  isGroup: false,
  teamSize: null,
  startDate: '',
  endDate: '',
  datePrecision: 'month',
  circa: false,
  dateOverride: null,
  lifecycle: 'shipped',
  status: 'draft',
  publishedAt: '',
  featuredOrder: null,
  techRefs: [],
  tags: [],
  links: [],
  relatedPostRef: null,
  coverImage: null,
  gallery: [],
  details: { kind: 'software' },
  seo: { title: null, description: null, canonicalUrl: null, noindex: false },
}

export default async function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'new'

  const [work, tech, posts] = await Promise.all([
    isNew ? null : readWork(id),
    techOptions(),
    postOptions(),
  ])
  if (!isNew && !work) notFound()

  const values: WorkFormValues = work
    ? {
        _id: work._id,
        slug: work.slug,
        kind: work.kind,
        title: work.title,
        summary: work.summary,
        body: work.body ?? '',
        problem: work.problem,
        outcome: work.outcome,
        role: work.role,
        isGroup: work.isGroup,
        teamSize: work.teamSize,
        startDate: toDayInput(work.startDate),
        endDate: toDayInput(work.endDate),
        datePrecision: work.datePrecision,
        circa: work.circa,
        dateOverride: work.dateOverride,
        lifecycle: work.lifecycle,
        status: work.status,
        publishedAt: toDayInput(work.publishedAt),
        featuredOrder: work.featuredOrder,
        techRefs: (work.techRefs ?? []).map(String),
        tags: work.tags ?? [],
        links: (work.links ?? []).map((link) => ({
          kind: link.kind,
          label: link.label ?? '',
          url: link.url,
        })),
        relatedPostRef: work.relatedPostRef ? String(work.relatedPostRef) : null,
        coverImage: work.coverImage
          ? {
              url: work.coverImage.url,
              alt: work.coverImage.alt,
              width: work.coverImage.width,
              height: work.coverImage.height,
              caption: work.coverImage.caption,
            }
          : null,
        gallery: (work.gallery ?? []).map((m) => ({
          url: m.url,
          alt: m.alt,
          width: m.width,
          height: m.height,
          caption: m.caption,
        })),
        details: (work.details as Record<string, unknown> | null) ?? null,
        seo: {
          title: work.seo?.title ?? null,
          description: work.seo?.description ?? null,
          canonicalUrl: work.seo?.canonicalUrl ?? null,
          noindex: work.seo?.noindex ?? false,
        },
      }
    : blank

  return (
    <>
      <PageHeader
        title={isNew ? 'New project' : work?.title || 'Untitled'}
        back={{ href: '/admin/work', label: 'Work' }}
      />
      <WorkForm
        values={values}
        kinds={WORK_KINDS}
        lifecycles={LIFECYCLE}
        statuses={PUBLISH_STATUS}
        precisions={DATE_PRECISION}
        linkKinds={LINK_KINDS}
        techOptions={tech}
        postOptions={posts}
      />
    </>
  )
}
