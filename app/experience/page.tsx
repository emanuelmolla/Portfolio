import type { Metadata } from 'next'
import { getExperience } from '@/lib/content'
import { ThemedPage, resolveView } from '@/components/ThemedPage'

export const revalidate = 3600
export const metadata: Metadata = {
  title: 'Experience & education',
  alternates: { canonical: '/experience' },
}

export default async function ExperiencePage() {
  const [experience, View] = await Promise.all([
    getExperience(),
    resolveView('experience', 'full'),
  ])
  return (
    <ThemedPage path="/experience">
      <View experience={experience} />
    </ThemedPage>
  )
}
