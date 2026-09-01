import type { Metadata } from 'next'
import { getProfile } from '@/lib/content'
import { ThemedPage, resolveView } from '@/components/ThemedPage'

export const revalidate = 3600
export const metadata: Metadata = {
  title: 'Contact',
  alternates: { canonical: '/contact' },
}

export default async function ContactPage() {
  const [profile, View] = await Promise.all([getProfile(), resolveView('contact', 'full')])

  return (
    <ThemedPage path="/contact">
      <View profile={profile} />
    </ThemedPage>
  )
}
