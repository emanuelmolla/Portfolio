/**
 * Desktop iconography.
 *
 * Hand-drawn geometric glyphs rather than emoji. Emoji used as UI iconography
 * is one of the clearest generated-design tells, and it also renders
 * differently on every platform, which is the opposite of what an OS metaphor
 * needs.
 *
 * All of them are 32x32, single stroke weight, currentColor, so they inherit
 * theme tokens and stay coherent in light and dark.
 */

type IconProps = { className?: string }

const base = 'shrink-0'

export function FolderIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={`${base} ${className}`} aria-hidden fill="none">
      <path
        d="M3 8.5A2.5 2.5 0 0 1 5.5 6h6.2a2 2 0 0 1 1.5.7l1.6 1.8h11.7A2.5 2.5 0 0 1 29 11v13a2.5 2.5 0 0 1-2.5 2.5h-21A2.5 2.5 0 0 1 3 24z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M3 13h26" stroke="currentColor" strokeWidth="1.6" opacity="0.5" />
    </svg>
  )
}

export function DocIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={`${base} ${className}`} aria-hidden fill="none">
      <path
        d="M7 4.5h11L25 11v16.5A2 2 0 0 1 23 29.5H9a2 2 0 0 1-2-2z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M18 4.5V11h7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11 17h10M11 21h10M11 25h6" stroke="currentColor" strokeWidth="1.6" opacity="0.55" />
    </svg>
  )
}

export function PdfIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={`${base} ${className}`} aria-hidden fill="none">
      <path
        d="M7 3.5h11L25 10v18.5A1.5 1.5 0 0 1 23.5 30h-15A1.5 1.5 0 0 1 7 28.5z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M18 3.5V10h7" stroke="currentColor" strokeWidth="1.6" />
      <text
        x="16"
        y="24"
        textAnchor="middle"
        fontSize="7.5"
        fontFamily="var(--font-mono)"
        fill="currentColor"
      >
        PDF
      </text>
    </svg>
  )
}

export function PersonIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={`${base} ${className}`} aria-hidden fill="none">
      <circle cx="16" cy="11" r="5.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5.5 28c0-5.8 4.7-10.5 10.5-10.5S26.5 22.2 26.5 28"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  )
}

export function MailIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={`${base} ${className}`} aria-hidden fill="none">
      <rect x="3.5" y="7.5" width="25" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4.5 9.5 11.5 8 11.5-8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export function LinkIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={`${base} ${className}`} aria-hidden fill="none">
      <path
        d="M13.5 18.5a5.5 5.5 0 0 0 8 .4l3.6-3.6a5.5 5.5 0 0 0-7.8-7.8l-2 2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M18.5 13.5a5.5 5.5 0 0 0-8-.4l-3.6 3.6a5.5 5.5 0 0 0 7.8 7.8l2-2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  )
}

export function GridIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={`${base} ${className}`} aria-hidden fill="none">
      <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="18" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="5" y="18" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="18" y="18" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}
