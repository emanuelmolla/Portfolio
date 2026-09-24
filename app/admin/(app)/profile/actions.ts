'use server'

import { ProfileModel, zProfile } from '@/lib/models'
import { TAGS } from '@/lib/content/_util'
import {
  body,
  day,
  optText,
  parseMedia,
  parseSeo,
  rows,
  text,
  tokens,
  zodFieldErrors,
} from '@/lib/admin/form'
import { guard, revalidate, saved, writeError, type ActionState } from '@/lib/admin/mutations'

/**
 * The identity singleton.
 *
 * Always _id: 'me', so this is an upsert and there is no create screen, no list
 * and no delete. That is the whole shape of the record: there is exactly one
 * person this site is about.
 *
 * This is the collection that justifies the rewrite. The v1 site hardcoded name,
 * headline, links and a GitHub handle across fourteen component files, six of
 * them pointing at a username that no longer exists. Changing a handle should be
 * an edit, not a deploy.
 */
export async function saveProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const blocked = await guard()
  if (blocked) return blocked

  const avatar = parseMedia(formData, 'avatar')
  if ('error' in avatar && avatar.error) return { ok: false, fieldErrors: avatar.error }

  const parsed = zProfile.safeParse({
    name: text(formData, 'name'),
    givenName: text(formData, 'givenName'),
    familyName: text(formData, 'familyName'),
    alternateName: optText(formData, 'alternateName'),

    headline: text(formData, 'headline'),

    bio: {
      short: text(formData, 'bio.short'),
      long: body(formData, 'bio.long'),
    },

    location: {
      city: text(formData, 'location.city'),
      region: optText(formData, 'location.region'),
      country: text(formData, 'location.country'),
    },

    avatar: avatar.value,

    // Order is row position in the form rather than a number to type, so
    // reordering the list is dragging a row up, not renumbering five fields.
    links: rows(
      formData,
      {
        kind: 'link.kind',
        label: 'link.label',
        url: 'link.url',
        handle: 'link.handle',
        visible: 'link.visible',
      },
      'url'
    ).map((row, index) => ({
      kind: row.kind,
      label: row.label || null,
      url: row.url,
      handle: row.handle || null,
      order: index,
      visible: row.visible !== 'no',
    })),

    availability: {
      status: text(formData, 'availability.status') || 'not-looking',
      availableFrom: day(formData, 'availability.availableFrom'),
      note: optText(formData, 'availability.note'),
    },

    resumeUrl: text(formData, 'resumeUrl') || '/resume',

    /**
     * Parsed here for the same reason links are: zProfile gives `interests` a
     * default of [], and the doc is written with Object.assign, so a field the
     * form does not send is not "left alone", it is overwritten with the empty
     * default. Adding a model field without adding it here deletes it on the
     * next save.
     */
    interests: rows(
      formData,
      { name: 'interest.name', note: 'interest.note', url: 'interest.url' },
      'name'
    ).map((row) => ({
      name: row.name,
      note: row.note || null,
      url: row.url || null,
    })),

    knowsAbout: tokens(formData, 'knowsAbout'),
    knowsLanguage: tokens(formData, 'knowsLanguage'),
    inLanguage: text(formData, 'inLanguage') || 'en',

    seo: parseSeo(formData),
  })

  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) }

  try {
    // findById then save, rather than findOneAndUpdate with upsert, so a partial
    // write cannot drop fields the form does not render.
    const doc = (await ProfileModel.findById('me')) ?? new ProfileModel({ _id: 'me' })
    Object.assign(doc, parsed.data)
    await doc.save()

    // Every tag: the profile appears in the shell of every page, so nothing
    // cached is guaranteed to be unaffected by a change to it.
    revalidate(TAGS.profile, TAGS.page, TAGS.work, TAGS.post, TAGS.experience, TAGS.tech)
  } catch (err) {
    return writeError(err)
  }

  return saved()
}
