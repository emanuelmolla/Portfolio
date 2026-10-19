export const DESKTOP_MIN_WIDTH = 1024
export const THEME_ORDER = ['clean', 'chess', 'terminal', 'desktop'] as const

/** Redirect targets must stay on this origin, including after URL normalization. */
export function safeReturnPath(value: string | null): string {
  if (
    !value ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\r\n]/.test(value)
  )
    return '/'
  const url = new URL(value, 'https://portfolio.invalid')
  return url.origin === 'https://portfolio.invalid'
    ? `${url.pathname}${url.search}${url.hash}`
    : '/'
}
