/**
 * The strip that says this page is not what the public sees.
 *
 * Fixed to the top and deliberately loud. The failure it prevents is looking at a
 * draft, believing it is live, and moving on: every preview system that renders
 * indistinguishably from production eventually produces that mistake.
 *
 * It is not part of any theme. A theme decides how the site looks; this is the
 * tool speaking over the top of it, so it uses the admin's accent and sits above
 * everything.
 */
export function PreviewBanner({ status, path }: { status: string; path: string }) {
  const isDraft = status === 'draft'

  return (
    <div className="sticky top-0 z-[100] flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-[#8a5a00] px-4 py-1.5 text-center text-[12px] text-white">
      <span>
        <strong>Preview.</strong>{' '}
        {isDraft
          ? 'This is a draft. Nobody else can see this page.'
          : `This is published, and shown here with status ${status}.`}
      </span>
      <a
        href={`/admin/preview/exit?to=${encodeURIComponent(path)}`}
        className="underline underline-offset-2 hover:no-underline"
      >
        Exit preview
      </a>
    </div>
  )
}
