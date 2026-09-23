import { AVAILABILITY, LINK_KINDS } from '@/lib/models'
import { readProfile } from '@/lib/admin/read'
import { toDayInput } from '@/lib/admin/form'
import { Notice } from '@/components/admin/fields'
import { PageHeader } from '@/components/admin/page-parts'
import { ProfileForm, type ProfileFormValues } from './ProfileForm'

export const dynamic = 'force-dynamic'

/**
 * A singleton, so there is no list and no id in the URL. Opening /admin/profile
 * when no record exists renders the form empty rather than a 404: the way to
 * create the one profile is to fill in the one form.
 */

const blank: ProfileFormValues = {
  name: '',
  givenName: '',
  familyName: '',
  alternateName: null,
  headline: '',
  bio: { short: '', long: '' },
  location: { city: '', region: null, country: '' },
  avatar: null,
  links: [],
  availability: { status: 'not-looking', availableFrom: '', note: null },
  resumeUrl: '/resume',
  knowsAbout: [],
  knowsLanguage: [],
  inLanguage: 'en',
  seo: { title: null, description: null, canonicalUrl: null, noindex: false },
}

export default async function ProfilePage() {
  const profile = await readProfile()

  const values: ProfileFormValues = profile
    ? {
        name: profile.name,
        givenName: profile.givenName,
        familyName: profile.familyName,
        alternateName: profile.alternateName,
        headline: profile.headline,
        bio: { short: profile.bio.short, long: profile.bio.long ?? '' },
        location: {
          city: profile.location.city,
          region: profile.location.region,
          country: profile.location.country,
        },
        avatar: profile.avatar
          ? {
              url: profile.avatar.url,
              alt: profile.avatar.alt,
              width: profile.avatar.width,
              height: profile.avatar.height,
              caption: profile.avatar.caption,
            }
          : null,
        links: (profile.links ?? []).map((link) => ({
          kind: link.kind,
          label: link.label ?? '',
          url: link.url,
          handle: link.handle ?? '',
          visible: link.visible,
        })),
        availability: {
          status: profile.availability.status,
          availableFrom: toDayInput(profile.availability.availableFrom),
          note: profile.availability.note,
        },
        resumeUrl: profile.resumeUrl,
        knowsAbout: profile.knowsAbout ?? [],
        knowsLanguage: profile.knowsLanguage ?? [],
        inLanguage: profile.inLanguage,
        seo: {
          title: profile.seo?.title ?? null,
          description: profile.seo?.description ?? null,
          canonicalUrl: profile.seo?.canonicalUrl ?? null,
          noindex: profile.seo?.noindex ?? false,
        },
      }
    : blank

  return (
    <>
      <PageHeader
        title="Profile"
        description="One record, always. Name, headline, links and the resume URL all come from here, which is why changing a handle is an edit rather than a deploy."
      />

      {!profile && (
        <div className="mb-5">
          <Notice tone="warn">
            No profile record exists yet, so the site is falling back to seed content. Saving this
            form creates it. Running <code className="a-mono">npm run seed</code> instead fills it
            in from the content already written, which is less typing.
          </Notice>
        </div>
      )}

      <ProfileForm values={values} availability={AVAILABILITY} linkKinds={LINK_KINDS} />
    </>
  )
}
