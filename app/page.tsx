import { getPosts, getProfile, getWork } from '@/lib/content'
import { ThemedPage, resolveHome } from '@/components/ThemedPage'

/** Regenerate hourly as a floor; admin saves revalidate by tag immediately. */
export const revalidate = 3600

export default async function HomePage() {
  const [profile, work, posts, Home] = await Promise.all([
    getProfile(),
    getWork({ featured: true, limit: 4 }),
    getPosts({ limit: 3 }),
    resolveHome(),
  ])

  return (
    <ThemedPage path="/">
      <Home profile={profile} work={work} posts={posts} />
    </ThemedPage>
  )
}
