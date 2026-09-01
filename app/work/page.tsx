import type { Metadata } from 'next'
import { getWork } from '@/lib/content'
import { ThemedPage, resolveView } from '@/components/ThemedPage'

export const revalidate = 3600
export const metadata: Metadata = { title: 'Work' }

export default async function WorkIndexPage() {
  const [items, View] = await Promise.all([getWork({}), resolveView('work', 'summary')])

  return (
    <ThemedPage path="/work">
      <View items={items} heading="Work" />
    </ThemedPage>
  )
}
