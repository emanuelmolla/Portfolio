/**
 * Open a page in preview mode, in a new tab.
 *
 * A plain anchor rather than next/link, because the destination is a route
 * handler that sets a cookie and redirects. A client-side navigation would ask
 * for an RSC payload, get a redirect, and never apply the Set-Cookie that is the
 * entire purpose of the request.
 *
 * New tab so the editor is still there to go back to. Preview is for checking,
 * not for leaving.
 */
export function PreviewLink({ to, label = 'Preview' }: { to: string; label?: string }) {
  return (
    <a
      href={`/admin/preview?to=${encodeURIComponent(to)}`}
      target="_blank"
      rel="noreferrer"
      className="a-btn"
    >
      {label}
    </a>
  )
}
