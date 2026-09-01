import type { Metadata } from 'next'
import { getExperience, getProfile, getTech } from '@/lib/content'
import { ThemedPage, resolveView } from '@/components/ThemedPage'
import { profilePageJsonLd } from '@/lib/jsonld'
import { JsonLd } from '@/components/JsonLd'

export const revalidate = 3600
export const metadata: Metadata = {
  title: 'About',
  alternates: { canonical: '/about' },
}

export default async function AboutPage() {
  const [profile, experience, tech, View] = await Promise.all([
    getProfile(),
    getExperience({}),
    getTech(),
    resolveView('profile', 'full'),
  ])

  return (
    <ThemedPage path="/about">
      <JsonLd data={profilePageJsonLd(profile)} />
      <View profile={profile} experience={experience} tech={tech} />
    </ThemedPage>
  )
}
