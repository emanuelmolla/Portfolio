/** Availability is independent of renderer registration. Unknown IDs never pass. */
export const DEFAULT_ENABLED_THEMES = ['clean', 'chess', 'desktop'] as const

export function enabledThemeIds(
  registered: readonly string[],
  stored?: readonly string[] | null
): string[] {
  const selected = stored ?? DEFAULT_ENABLED_THEMES
  return registered.filter((id) => id === 'clean' || selected.includes(id))
}

export function validateEnabledThemes(
  value: unknown,
  registered: readonly string[]
): string[] {
  if (
    !Array.isArray(value) ||
    value.some((id) => typeof id !== 'string' || !registered.includes(id))
  ) {
    throw new Error('Choose only registered themes.')
  }
  if (!value.includes('clean'))
    throw new Error('Minimal must always remain enabled.')
  return enabledThemeIds(registered, value)
}

export function resolveEnabledTheme(
  requested: string | undefined,
  enabled: readonly string[]
): string {
  return requested && enabled.includes(requested) ? requested : 'clean'
}

export function requireThemeDatabase(available: boolean): void {
  if (!available)
    throw new Error(
      'Saving theme settings requires MongoDB. Configure MONGODB_URI first.'
    )
}
