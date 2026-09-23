/**
 * What the resume is called when someone saves it.
 *
 * The default was resume.pdf, which lands in a recruiter's downloads folder next
 * to forty other files called resume.pdf and is indistinguishable from all of
 * them. The name is the one piece of metadata that survives the file being
 * forwarded, renamed in a tracking system, or found again three weeks later.
 *
 * Underscores rather than spaces or dashes: spaces get percent-encoded in the
 * Content-Disposition header and show up mangled in some clients, and underscores
 * read as one token in a file list where dashes read as separate words.
 */
export function resumeFilename(fullName: string | null | undefined): string {
  const base = (fullName ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  return base ? `${base}_resume.pdf` : 'resume.pdf'
}

/**
 * Build the Content-Disposition value.
 *
 * `inline` rather than `attachment`, deliberately. A recruiter clicking a resume
 * link wants to read it, and forcing a download on someone who is skimming is a
 * reason to close the tab. The filename is still honoured when they do save it,
 * which is the part that actually matters, and any link carrying the `download`
 * attribute forces the download from the markup side anyway.
 *
 * Both filename and filename* are emitted: the plain one for old clients, the
 * RFC 5987 encoded one for anything that has to handle a non-ASCII name.
 */
export function contentDisposition(filename: string, forceDownload = false): string {
  const kind = forceDownload ? 'attachment' : 'inline'
  const ascii = filename.replace(/[^\x20-\x7e]/g, '_').replace(/"/g, '')
  return `${kind}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`
}
