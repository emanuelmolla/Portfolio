'use server'

import { updateTag, revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin/session'
import { saved, type ActionState } from '@/lib/admin/mutations'
import { persistEnabledThemes, THEME_SETTINGS_TAG } from '@/lib/theme/settings'
import { hasDatabase } from '@/lib/content/_util'
import { validateEnabledThemes } from '@/lib/theme/policy'
import { themes } from '@/themes/registry'

export async function saveThemeSettings(
  _prev: ActionState,
  form: FormData
): Promise<ActionState> {
  await requireAdmin('/admin/settings')
  if (!hasDatabase())
    return {
      ok: false,
      error:
        'Saving theme settings requires MongoDB. Configure MONGODB_URI first.',
    }
  let enabled: string[]
  try {
    enabled = validateEnabledThemes(
      form.getAll('enabledThemes'),
      Object.keys(themes)
    )
  } catch {
    return {
      ok: false,
      error: 'Choose only registered themes and keep Minimal enabled.',
    }
  }
  try {
    await persistEnabledThemes(enabled)
  } catch {
    return {
      ok: false,
      error:
        'Could not save theme settings. Check the MongoDB connection and try again.',
    }
  }
  updateTag(THEME_SETTINGS_TAG)
  revalidatePath('/', 'layout')
  return saved()
}
