import { requireAdmin } from '@/lib/admin/session'
import { hasDatabase } from '@/lib/content/_util'
import { getEnabledThemeIds } from '@/lib/theme/settings'
import { themes } from '@/themes/registry'
import { PageHeader } from '@/components/admin/page-parts'
import { SettingsForm } from './SettingsForm'

export default async function SettingsPage() {
  await requireAdmin('/admin/settings')
  const enabled = await getEnabledThemeIds()
  return (
    <>
      <PageHeader
        title="Settings"
        description="Choose which themes visitors can use. Minimal is the canonical default and always stays enabled."
      />
      <SettingsForm
        enabled={enabled}
        canSave={hasDatabase()}
        themes={Object.values(themes).map(({ id, name }) => ({ id, name }))}
      />
    </>
  )
}
