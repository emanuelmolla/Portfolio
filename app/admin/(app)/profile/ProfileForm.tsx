'use client'

import { FormShell } from '@/components/admin/FormShell'
import { LinkRows, type LinkRow } from '@/components/admin/LinkRows'
import {
  Area,
  Fieldset,
  Num,
  Row,
  Select,
  Text,
  enumOptions,
} from '@/components/admin/fields'
import { SeoFieldset } from '../posts/[id]/PostForm'
import { saveProfile } from './actions'

export interface ProfileFormValues {
  name: string
  givenName: string
  familyName: string
  alternateName: string | null
  headline: string
  bio: { short: string; long: string }
  location: { city: string; region: string | null; country: string }
  avatar: {
    url: string
    alt: string
    width: number
    height: number
    caption: string | null
  } | null
  links: LinkRow[]
  availability: { status: string; availableFrom: string; note: string | null }
  resumeUrl: string
  knowsAbout: string[]
  knowsLanguage: string[]
  inLanguage: string
  seo: {
    title: string | null
    description: string | null
    canonicalUrl: string | null
    noindex: boolean
  }
}

export function ProfileForm({
  values,
  availability,
  linkKinds,
}: {
  values: ProfileFormValues
  availability: readonly string[]
  linkKinds: readonly string[]
}) {
  return (
    <FormShell action={saveProfile} saveLabel="Save profile">
      {(err) => (
        <>
          <Fieldset
            legend="Identity"
            hint="Field names follow schema.org/Person, so the JSON-LD on /about is close to a straight dump of this record. Real name in Name, handles in Also known as, which is what Google's ProfilePage documentation asks for."
          >
            <Row cols={3}>
              <Text
                label="Full name"
                name="name"
                required
                defaultValue={values.name}
                error={err('name')}
              />
              <Text
                label="Given name"
                name="givenName"
                defaultValue={values.givenName}
                error={err('givenName')}
              />
              <Text
                label="Family name"
                name="familyName"
                defaultValue={values.familyName}
                error={err('familyName')}
              />
            </Row>

            <Text
              label="Also known as"
              name="alternateName"
              defaultValue={values.alternateName}
              error={err('alternateName')}
              hint="A handle, if you go by one."
            />

            <Text
              label="Headline"
              name="headline"
              required
              defaultValue={values.headline}
              error={err('headline')}
              hint="Stated plainly. The first thing a hiring manager reads."
            />
          </Fieldset>

          <Fieldset legend="Bio">
            <Area
              label="Short bio"
              name="bio.short"
              required
              rows={2}
              maxLength={155}
              defaultValue={values.bio.short}
              error={err('bio.short')}
              hint="155 characters at most, because it doubles as the site's meta description."
            />
            <Area
              label="Long bio"
              name="bio.long"
              rows={8}
              code
              defaultValue={values.bio.long}
              error={err('bio.long')}
              hint="Markdown. This is the body of /about."
            />
          </Fieldset>

          <Fieldset legend="Location and languages">
            <Row cols={3}>
              <Text
                label="City"
                name="location.city"
                required
                defaultValue={values.location.city}
                error={err('location.city')}
              />
              <Text
                label="Region"
                name="location.region"
                defaultValue={values.location.region}
                error={err('location.region')}
              />
              <Text
                label="Country"
                name="location.country"
                required
                defaultValue={values.location.country}
                error={err('location.country')}
              />
            </Row>

            <Row>
              <Text
                label="Languages"
                name="knowsLanguage"
                defaultValue={values.knowsLanguage.join(', ')}
                error={err('knowsLanguage')}
                hint="Comma separated."
              />
              <Text
                label="Site language"
                name="inLanguage"
                mono
                defaultValue={values.inLanguage}
                error={err('inLanguage')}
                hint="A BCP 47 tag, usually en."
              />
            </Row>

            <Text
              label="Knows about"
              name="knowsAbout"
              defaultValue={values.knowsAbout.join(', ')}
              error={err('knowsAbout')}
              hint="Comma separated subjects, emitted in the Person JSON-LD. Keep it to things you would defend in an interview."
            />
          </Fieldset>

          <Fieldset legend="Availability">
            <Row cols={3}>
              <Select
                label="Status"
                name="availability.status"
                options={enumOptions(availability, {
                  open: 'open to work',
                  selective: 'selectively looking',
                  'not-looking': 'not looking',
                })}
                defaultValue={values.availability.status}
                error={err('availability.status')}
              />
              <Text
                label="Available from"
                name="availability.availableFrom"
                type="date"
                mono
                defaultValue={values.availability.availableFrom}
                error={err('availability.availableFrom')}
              />
              <Text
                label="Resume URL"
                name="resumeUrl"
                mono
                defaultValue={values.resumeUrl}
                error={err('resumeUrl')}
                hint="Recruiters' systems still want a PDF."
              />
            </Row>

            <Text
              label="Note"
              name="availability.note"
              defaultValue={values.availability.note}
              error={err('availability.note')}
              hint="One line, shown next to the status."
            />
          </Fieldset>

          <Fieldset legend="Links">
            <LinkRows
              kinds={linkKinds}
              defaultValue={values.links}
              withHandle
              hint="These are the site's contact links and the sameAs values in the JSON-LD, so each URL must be the full address rather than a handle. Order is the order of the rows."
            />
          </Fieldset>

          <Fieldset
            legend="Photo"
            hint="Width and height are required if a URL is set, so the page reserves the space before the image loads."
          >
            <Text
              label="Image URL"
              name="avatar.url"
              defaultValue={values.avatar?.url}
              error={err('avatar.url')}
              hint="A path like /me.jpg works if the file is in public/."
            />
            <Text
              label="Alt text"
              name="avatar.alt"
              defaultValue={values.avatar?.alt}
              error={err('avatar.alt')}
            />
            <Row cols={3}>
              <Num
                label="Width"
                name="avatar.width"
                defaultValue={values.avatar?.width}
                error={err('avatar.width')}
              />
              <Num
                label="Height"
                name="avatar.height"
                defaultValue={values.avatar?.height}
                error={err('avatar.height')}
              />
              <Text
                label="Caption"
                name="avatar.caption"
                defaultValue={values.avatar?.caption}
                error={err('avatar.caption')}
              />
            </Row>
          </Fieldset>

          <SeoFieldset values={values.seo} err={err} />
        </>
      )}
    </FormShell>
  )
}
