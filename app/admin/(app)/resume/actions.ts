'use server'

import { MAX_RESUME_BYTES, ResumeModel, looksLikePdf } from '@/lib/models'
import { TAGS } from '@/lib/content/_util'
import { flag } from '@/lib/admin/form'
import { guard, revalidate, saved, writeError, type ActionState } from '@/lib/admin/mutations'

/**
 * Replace the stored resume.
 *
 * Validation happens on the BYTES, not on the metadata the browser supplied.
 * File.type comes from the operating system's guess based on the extension, so
 * it is a claim about the filename. looksLikePdf reads the actual header.
 */
export async function uploadResume(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const blocked = await guard()
  if (blocked) return blocked

  const file = formData.get('file')
  const indexable = flag(formData, 'indexable')

  // No new file chosen: this was a save of the indexing setting alone.
  if (!(file instanceof File) || file.size === 0) {
    try {
      const existing = await ResumeModel.findById('current')
      if (!existing) {
        return { ok: false, fieldErrors: { file: 'Choose a PDF to upload.' } }
      }

      existing.indexable = indexable
      await existing.save()
      revalidate(TAGS.profile)
      return saved()
    } catch (err) {
      return writeError(err)
    }
  }

  if (file.size > MAX_RESUME_BYTES) {
    return {
      ok: false,
      fieldErrors: {
        file: `That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is ${MAX_RESUME_BYTES / 1024 / 1024}MB.`,
      },
    }
  }

  const bytes = new Uint8Array(await file.arrayBuffer())

  if (!looksLikePdf(bytes)) {
    return {
      ok: false,
      fieldErrors: {
        file: 'That is not a PDF. The file does not start with the bytes every PDF starts with, whatever it is named.',
      },
    }
  }

  try {
    const doc = (await ResumeModel.findById('current')) ?? new ResumeModel({ _id: 'current' })

    doc.data = Buffer.from(bytes)
    doc.contentType = 'application/pdf'
    doc.size = bytes.byteLength
    doc.originalName = file.name
    doc.indexable = indexable
    await doc.save()

    // The profile tag, because the resume link is rendered from the profile and
    // the download name is derived from the profile's name.
    revalidate(TAGS.profile)
  } catch (err) {
    return writeError(err)
  }

  return saved()
}

export async function removeResume(): Promise<void> {
  const blocked = await guard()
  if (blocked) throw new Error(blocked.error ?? 'Not allowed')

  await ResumeModel.deleteOne({ _id: 'current' })
  revalidate(TAGS.profile)
}
