'use client'

import { useState } from 'react'

/**
 * Talking to /api/admin/upload.
 *
 * A hook rather than a component, because two very different controls need it:
 * the single cover-image field and the multi-file gallery. Sharing the fetch and
 * the state without sharing the markup is the whole reason this is not a component.
 */

export interface UploadedImage {
  url: string
  width: number
  height: number
  bytes: number
  format: string
}

export function useUpload() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function upload(files: FileList | File[]): Promise<UploadedImage[]> {
    const list = Array.from(files)
    if (list.length === 0) return []

    setBusy(true)
    setError(null)

    const form = new FormData()
    // One request for the whole selection. The endpoint reports per-file
    // results, so one rejected file does not lose the rest.
    for (const file of list) form.append('file', file)

    try {
      const response = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const data = (await response.json()) as {
        images?: UploadedImage[]
        errors?: string[]
        error?: string
      }

      if (!response.ok) {
        setError(data.error ?? `Upload failed (${response.status}).`)
        return []
      }

      if (data.errors?.length) setError(data.errors.join(' '))
      return data.images ?? []
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      return []
    } finally {
      setBusy(false)
    }
  }

  return { upload, busy, error }
}
