import { notFound } from 'next/navigation'
import { TECH_CATEGORIES } from '@/lib/models'
import { readTech } from '@/lib/admin/read'
import { PageHeader } from '@/components/admin/page-parts'
import { TechForm, type TechFormValues } from './TechForm'

export const dynamic = 'force-dynamic'

const blank: TechFormValues = {
  slug: '',
  name: '',
  category: 'Language',
  firstEncounter: null,
  note: null,
  rank: null,
  icon: { simpleIconsSlug: null, devicon: null, color: null },
  featured: false,
  order: 0,
}

export default async function EditTechPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'new'

  const tech = isNew ? null : await readTech(id)
  if (!isNew && !tech) notFound()

  const values: TechFormValues = tech
    ? {
        _id: tech._id,
        slug: tech.slug,
        name: tech.name,
        category: tech.category,
        firstEncounter: tech.firstEncounter,
        note: tech.note,
        rank: tech.rank,
        icon: {
          simpleIconsSlug: tech.icon?.simpleIconsSlug ?? null,
          devicon: tech.icon?.devicon ?? null,
          color: tech.icon?.color ?? null,
        },
        featured: tech.featured,
        order: tech.order,
      }
    : blank

  return (
    <>
      <PageHeader
        title={isNew ? 'New technology' : tech?.name || 'Untitled'}
        back={{ href: '/admin/tech', label: 'Tech' }}
      />
      <TechForm values={values} categories={TECH_CATEGORIES} />
    </>
  )
}
