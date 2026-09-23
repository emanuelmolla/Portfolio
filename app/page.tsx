import { getExperience, getPosts, getProfile, getWork } from '@/lib/content'
import { ThemedPage, resolveHome } from '@/components/ThemedPage'

/** Regenerate hourly as a floor; admin saves revalidate by tag immediately. */
export const revalidate = 3600

export default async function HomePage() {
  // Featured only on both. Adding a project or a post no longer changes the
  // home page: it appears on /work or /blog, and reaches the home page only by
  // being given a featuredOrder in the CMS.
  const [profile, work, posts, experience, Home] = await Promise.all([
    getProfile(),
    getWork({ featured: true, limit: 4 }),
    getPosts({ featured: true, limit: 3 }),
    getExperience({}),
    resolveHome(),
  ])

  return (
    <ThemedPage path="/">
      <Home profile={profile} work={work} posts={posts} experience={experience} />
    </ThemedPage>
  )
}
