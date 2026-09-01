import { ProfileModel, type Profile } from '@/lib/models'
import { TAGS, cachedQuery } from './_util'
import { seedProfile } from './_seed'

/**
 * The identity singleton. Fetched on essentially every page, so it is cached
 * hard and revalidated only when the admin saves it.
 */
export const getProfile = cachedQuery(
  ['profile'],
  [TAGS.profile],
  async (): Promise<Profile | null> => {
    const doc = await ProfileModel.findById('me').lean()
    return (doc ?? null) as unknown as Profile | null
  },
  () => seedProfile
)
