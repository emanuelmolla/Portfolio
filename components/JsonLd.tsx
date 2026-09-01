/**
 * Renders a JSON-LD block. Null input renders nothing rather than an empty tag,
 * because an empty script element is worse than no markup at all.
 */
export function JsonLd({ data }: { data: unknown }) {
  if (!data) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
