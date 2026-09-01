import type { Metadata } from 'next'
import { getPosts } from '@/lib/content'
import { ThemedPage, resolveView } from '@/components/ThemedPage'

export const revalidate = 3600
export const metadata: Metadata = { title: 'Writing' }

export default async function BlogIndexPage() {
  const [items, View] = await Promise.all([getPosts({}), resolveView('post', 'summary')])

  return (
    <ThemedPage path="/blog">
      <View items={items} heading="Writing" />
    </ThemedPage>
  )
}
