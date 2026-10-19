import { unstable_cache } from 'next/cache'
import { hasDatabase } from '@/lib/content/_util'
import { connectDB } from '@/lib/db'
import { ThemeSettingsModel } from '@/lib/models/theme-settings'
import { themes } from '@/themes/registry'
import {
  enabledThemeIds,
  requireThemeDatabase,
  validateEnabledThemes,
} from './policy'

export const THEME_SETTINGS_TAG = 'theme-settings'
const registered = Object.keys(themes)

const loadSettings = unstable_cache(
  async () => {
    await connectDB()
    const doc = await ThemeSettingsModel.findById('site').lean<{
      enabledThemes: string[]
    }>()
    return enabledThemeIds(registered, doc?.enabledThemes)
  },
  ['theme-settings-v1', ...registered],
  { tags: [THEME_SETTINGS_TAG] }
)

export async function getEnabledThemeIds(): Promise<string[]> {
  return hasDatabase() ? loadSettings() : enabledThemeIds(registered)
}

/** Caller must authenticate; the admin action owns cache invalidation. */
export async function persistEnabledThemes(value: unknown): Promise<void> {
  requireThemeDatabase(hasDatabase())
  const enabledThemes = validateEnabledThemes(value, registered)
  await connectDB()
  await ThemeSettingsModel.findOneAndUpdate(
    { _id: 'site' },
    { $set: { enabledThemes } },
    { upsert: true, runValidators: true }
  )
}
