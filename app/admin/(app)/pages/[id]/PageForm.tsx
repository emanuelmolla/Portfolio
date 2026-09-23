'use client'

import Link from 'next/link'
import { FormShell } from '@/components/admin/FormShell'
import { MarkdownEditor } from '@/components/admin/MarkdownEditor'
import { SlugField } from '@/components/admin/SlugField'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { PreviewLink } from '@/components/admin/PreviewLink'
import { SectionRows, type SectionRow } from '@/components/admin/SectionRows'
import { Check, Fieldset, Num, Row, Select, Text, enumOptions } from '@/components/admin/fields'
import { SeoFieldset } from '../../posts/[id]/PostForm'
import { savePage, deletePage } from '../actions'

export interface PageFormValues {
  _id?: string
  slug: string
  title: string
  body: string
  sections: SectionRow[]
  status: string
  inNav: boolean
  navOrder: number
  showUpdatedAt: boolean
  seo: {
    title: string | null
    description: string | null
    canonicalUrl: string | null
    noindex: boolean
  }
}

export function PageForm({
  values,
  statuses,
}: {
  values: PageFormValues
  statuses: readonly string[]
}) {
  const isNew = !values._id

  return (
    <FormShell
      action={savePage}
      saveLabel={isNew ? 'Create page' : 'Save page'}
      aside={
        !isNew && (
          <>
            <PreviewLink to={`/${values.slug}`} />
            {values.status !== 'draft' && (
              <Link href={`/${values.slug}`} target="_blank" rel="noreferrer" className="a-btn">
                View live
              </Link>
            )}
            <DeleteButton action={deletePage} id={values._id as string} />
          </>
        )
      }
    >
      {(err) => (
        <>
          <input type="hidden" name="id" value={values._id ?? ''} />

          <Fieldset legend="Page">
            <Text
              label="Title"
              name="title"
              required
              defaultValue={values.title}
              error={err('title')}
            />

            <SlugField
              sourceId="title"
              basePath=""
              defaultValue={values.slug}
              original={values._id ? values.slug : null}
              error={err('slug')}
            />
          </Fieldset>

          <MarkdownEditor name="body" defaultValue={values.body} error={err('body')} />

          <Fieldset legend="Structured sections">
            <SectionRows defaultValue={values.sections} />
          </Fieldset>

          <Fieldset legend="Placement">
            <Row cols={3}>
              <Select
                label="Status"
                name="status"
                options={enumOptions(statuses)}
                defaultValue={values.status}
                error={err('status')}
                hint="Unlisted is reachable by URL but absent from nav and feeds."
              />
              <Num
                label="Nav order"
                name="navOrder"
                defaultValue={values.navOrder}
                error={err('navOrder')}
                hint="Lowest first."
              />
              <div className="grid content-start gap-3 pt-5">
                <Check
                  label="Show in navigation"
                  name="inNav"
                  defaultChecked={values.inNav}
                  hint="Nav membership is data, so adding a page needs no deploy."
                />
                <Check
                  label="Show last updated"
                  name="showUpdatedAt"
                  defaultChecked={values.showUpdatedAt}
                  hint="Pages normally hide dates. /now is the exception where a stale date is the point."
                />
              </div>
            </Row>
          </Fieldset>

          <SeoFieldset values={values.seo} err={err} />
        </>
      )}
    </FormShell>
  )
}
