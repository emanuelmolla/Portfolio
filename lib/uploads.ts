import { createHash } from 'node:crypto'

/**
 * Image uploads.
 *
 * ONE seam. Everything above this file asks for `uploadImage(file)` and gets back
 * a url plus real dimensions; nothing above it knows who stores the bytes. That
 * matters because the host is genuinely undecided: Cloudinary today because the
 * existing images are already there and its response carries width and height,
 * Cloudflare R2 plausibly later since the study tool and the Vivid sites already
 * live on Cloudflare. Swapping means writing a second `upload*` function here and
 * changing one call, because Media.url is only ever a string and the schema has
 * no opinion about who serves it.
 *
 * WHY SIGNED AND NOT AN UNSIGNED PRESET. Every tutorial reaches for an unsigned
 * upload preset because it needs no backend. It also means the preset name sits
 * in the page source, and anyone who reads it can upload into the account for as
 * long as it exists. The signature is computed here, on the server, from a secret
 * that never reaches the browser, and the route that calls this is admin-gated.
 */

export interface UploadResult {
  url: string
  width: number
  height: number
  bytes: number
  format: string
}

export type Uploaded = { ok: true; image: UploadResult } | { ok: false; error: string }

/**
 * Vercel caps a serverless function's request body at 4.5MB, so anything larger
 * is rejected by the platform before this code runs and the editor would see a
 * generic network failure instead of a reason. Refusing it here, under that
 * ceiling, is the difference between a message and a mystery.
 */
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024

/**
 * Magic bytes, not the Content-Type the browser sent.
 *
 * File.type is derived from the extension on most platforms, so it is a claim
 * about the filename rather than about the contents. Same reasoning as the resume
 * PDF check, and the same reason it is worth doing: renaming notes.txt to
 * shot.png is enough to pass a MIME check.
 */
export function imageFormat(bytes: Uint8Array): string | null {
  const b = bytes
  if (b.length < 12) return null

  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png'
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg'
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return 'gif'

  // RIFF....WEBP
  const riff = String.fromCharCode(b[0], b[1], b[2], b[3])
  const webp = String.fromCharCode(b[8], b[9], b[10], b[11])
  if (riff === 'RIFF' && webp === 'WEBP') return 'webp'

  // ....ftypavif / ftypheic
  const brand = String.fromCharCode(b[4], b[5], b[6], b[7], b[8], b[9], b[10], b[11])
  if (brand.startsWith('ftyp') && /avif|heic|mif1/.test(brand)) return 'avif'

  return null
}

export function uploadsConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  )
}

export function cloudName(): string {
  return process.env.CLOUDINARY_CLOUD_NAME ?? ''
}

/** Everything the site uploads goes here, so it is separable from v1's files. */
const FOLDER = 'portfolio'

export async function uploadImage(file: File): Promise<Uploaded> {
  if (!uploadsConfigured()) {
    return { ok: false, error: 'Uploads are not configured. See CLOUDINARY_* in .env.example.' }
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      error: `That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is ${
        MAX_IMAGE_BYTES / 1024 / 1024
      }MB.`,
    }
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const format = imageFormat(bytes)
  if (!format) {
    return {
      ok: false,
      error: 'That is not an image. The file does not begin like a PNG, JPEG, GIF, WebP or AVIF, whatever it is named.',
    }
  }

  /**
   * Cloudinary's signature is a SHA-1 over the parameters that are being sent,
   * sorted by key, joined as k=v&k=v, with the API secret appended. Only the
   * params included in the string may be sent; adding one without signing it is
   * rejected, which is the point.
   */
  const timestamp = Math.floor(Date.now() / 1000)
  const signed: Record<string, string> = { folder: FOLDER, timestamp: String(timestamp) }
  const toSign = Object.keys(signed)
    .sort()
    .map((k) => `${k}=${signed[k]}`)
    .join('&')
  const signature = createHash('sha1')
    .update(toSign + process.env.CLOUDINARY_API_SECRET)
    .digest('hex')

  const form = new FormData()
  form.append('file', new Blob([bytes as unknown as BlobPart], { type: file.type || `image/${format}` }), file.name)
  form.append('api_key', process.env.CLOUDINARY_API_KEY as string)
  form.append('timestamp', String(timestamp))
  form.append('folder', FOLDER)
  form.append('signature', signature)

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName()}/image/upload`,
      { method: 'POST', body: form, signal: AbortSignal.timeout(30_000) }
    )

    const data = (await response.json()) as {
      secure_url?: string
      width?: number
      height?: number
      bytes?: number
      format?: string
      error?: { message?: string }
    }

    if (!response.ok || !data.secure_url) {
      return { ok: false, error: data.error?.message ?? `Upload failed (${response.status}).` }
    }

    // width and height come back from the store, which is the whole reason this
    // provider was chosen: the media schema requires them and nobody has to read
    // them off the file by hand.
    if (!data.width || !data.height) {
      return { ok: false, error: 'The upload returned no dimensions, so it cannot be stored.' }
    }

    return {
      ok: true,
      image: {
        url: data.secure_url,
        width: data.width,
        height: data.height,
        bytes: data.bytes ?? file.size,
        format: data.format ?? format,
      },
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}
