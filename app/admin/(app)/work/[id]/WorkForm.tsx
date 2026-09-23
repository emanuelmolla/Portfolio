'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FormShell } from '@/components/admin/FormShell'
import { MarkdownEditor } from '@/components/admin/MarkdownEditor'
import { SlugField } from '@/components/admin/SlugField'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { ImageFields } from '@/components/admin/ImageFields'
import { PreviewLink } from '@/components/admin/PreviewLink'
import { LinkRows, type LinkRow } from '@/components/admin/LinkRows'
import {
  Area,
  Check,
  Fieldset,
  MultiSelect,
  Num,
  Row,
  Select,
  Text,
  enumOptions,
} from '@/components/admin/fields'
import { SeoFieldset } from '../../posts/[id]/PostForm'
import { saveWork, deleteWork } from '../actions'

export interface WorkFormValues {
  _id?: string
  slug: string
  kind: string
  title: string
  summary: string
  body: string
  problem: string | null
  outcome: string | null
  role: string | null
  isGroup: boolean
  teamSize: number | null
  startDate: string
  endDate: string
  datePrecision: string
  circa: boolean
  dateOverride: string | null
  lifecycle: string
  status: string
  publishedAt: string
  featuredOrder: number | null
  techRefs: string[]
  tags: string[]
  links: LinkRow[]
  relatedPostRef: string | null
  coverImage: {
    url: string
    alt: string
    width: number
    height: number
    caption: string | null
  } | null
  details: Record<string, unknown> | null
  seo: {
    title: string | null
    description: string | null
    canonicalUrl: string | null
    noindex: boolean
  }
}

export function WorkForm({
  values,
  kinds,
  lifecycles,
  statuses,
  precisions,
  linkKinds,
  techOptions,
  postOptions,
}: {
  values: WorkFormValues
  kinds: readonly string[]
  lifecycles: readonly string[]
  statuses: readonly string[]
  precisions: readonly string[]
  linkKinds: readonly string[]
  techOptions: { _id: string; name: string; category: string }[]
  postOptions: { _id: string; title: string }[]
}) {
  const isNew = !values._id

  // The only controlled field on the form. `details` is a discriminated union, so
  // which sub-fields exist depends on this value, and rendering all five sets at
  // once would offer inputs that are thrown away on save.
  const [kind, setKind] = useState(values.kind)

  const detail = (key: string): string =>
    values.details && values.details.kind === kind ? String(values.details[key] ?? '') : ''

  const detailList = (key: string): string => {
    if (!values.details || values.details.kind !== kind) return ''
    const value = values.details[key]
    return Array.isArray(value) ? value.join(', ') : ''
  }

  return (
    <FormShell
      action={saveWork}
      saveLabel={isNew ? 'Create project' : 'Save project'}
      aside={
        !isNew && (
          <>
            <PreviewLink to={`/work/${values.slug}`} />
            {values.status === 'published' && (
              <Link href={`/work/${values.slug}`} target="_blank" rel="noreferrer" className="a-btn">
                View live
              </Link>
            )}
            <DeleteButton action={deleteWork} id={values._id as string} />
          </>
        )
      }
    >
      {(err) => (
        <>
          <input type="hidden" name="id" value={values._id ?? ''} />

          <Fieldset legend="Project">
            <Row>
              <Text
                label="Title"
                name="title"
                required
                defaultValue={values.title}
                error={err('title')}
              />
              <Select
                label="Kind"
                name="kind"
                options={enumOptions(kinds)}
                defaultValue={kind}
                onChange={setKind}
                error={err('kind')}
                hint="Decides which extra fields apply below."
              />
            </Row>

            <SlugField
              sourceId="title"
              basePath="/work"
              defaultValue={values.slug}
              original={values._id ? values.slug : null}
              error={err('slug')}
            />

            <Area
              label="Summary"
              name="summary"
              required
              rows={2}
              defaultValue={values.summary}
              error={err('summary')}
              hint="One or two sentences, card sized. What it is, for someone who has never heard of it."
            />
          </Fieldset>

          <Fieldset
            legend="Problem and outcome"
            hint="Both optional, and both are the fields most portfolios skip. An empty outcome is fine; an invented number is not."
          >
            <Area
              label="Problem"
              name="problem"
              rows={3}
              defaultValue={values.problem}
              error={err('problem')}
              hint="What was actually wrong, before the project existed."
            />
            <Area
              label="Outcome"
              name="outcome"
              rows={3}
              defaultValue={values.outcome}
              error={err('outcome')}
              hint="What changed. Only what you can point at."
            />
          </Fieldset>

          <MarkdownEditor
            name="body"
            label="Case study"
            defaultValue={values.body}
            error={err('body')}
            hint="The long version. Optional, and worth writing for the two or three projects that carry the portfolio."
          />

          <Fieldset legend={`${kind} details`}>
            {kind === 'software' && (
              <>
                <Text
                  label="Stack"
                  name="details.stack"
                  defaultValue={detailList('stack')}
                  hint="Comma separated. Free text, separate from the tech records below."
                />
                <Row>
                  <Text
                    label="Repository URL"
                    name="details.repoUrl"
                    type="url"
                    defaultValue={detail('repoUrl')}
                  />
                  <Text
                    label="Live URL"
                    name="details.liveUrl"
                    type="url"
                    defaultValue={detail('liveUrl')}
                  />
                </Row>
                <Area
                  label="Architecture notes"
                  name="details.architectureNotes"
                  rows={3}
                  defaultValue={detail('architectureNotes')}
                  hint="How it is put together and why. The part a repository link does not communicate."
                />
              </>
            )}

            {kind === 'writing' && (
              <Row cols={3}>
                <Text label="Outlet" name="details.outlet" defaultValue={detail('outlet')} />
                <Text
                  label="Published in"
                  name="details.publishedIn"
                  defaultValue={detail('publishedIn')}
                />
                <Num
                  label="Word count"
                  name="details.wordCount"
                  defaultValue={detail('wordCount')}
                />
              </Row>
            )}

            {kind === 'photo' && (
              <Text
                label="Locations"
                name="details.locationsShot"
                defaultValue={detailList('locationsShot')}
                hint="Comma separated."
              />
            )}

            {kind === 'chess' && (
              <p className="a-hint">
                Game and event references need collections that do not exist yet. Nothing to fill in
                here until the chess theme is built.
              </p>
            )}

            {kind === 'other' && (
              <Text
                label="Medium"
                name="details.medium"
                defaultValue={detail('medium')}
                hint="Free text. A real medium reads like a sentence, not an enum."
              />
            )}
          </Fieldset>

          <Fieldset legend="Credit and dates">
            <Row cols={3}>
              <Text label="Role" name="role" defaultValue={values.role} error={err('role')} />
              <Num
                label="Team size"
                name="teamSize"
                defaultValue={values.teamSize}
                error={err('teamSize')}
              />
              <Select
                label="Lifecycle"
                name="lifecycle"
                options={enumOptions(lifecycles)}
                defaultValue={values.lifecycle}
                error={err('lifecycle')}
                hint="The project's own state, not whether it is published."
              />
            </Row>

            <Check
              label="Group project"
              name="isGroup"
              defaultChecked={values.isGroup}
              hint="Saying so is better than being asked in an interview."
            />

            <Row cols={3}>
              <Text
                label="Start"
                name="startDate"
                type="date"
                mono
                defaultValue={values.startDate}
                error={err('startDate')}
              />
              <Text
                label="End"
                name="endDate"
                type="date"
                mono
                defaultValue={values.endDate}
                error={err('endDate')}
                hint="Empty means ongoing."
              />
              <Select
                label="Date precision"
                name="datePrecision"
                options={enumOptions(precisions)}
                defaultValue={values.datePrecision}
                error={err('datePrecision')}
                hint="How much of the date to show."
              />
            </Row>

            <Row>
              <Check
                label="Approximate"
                name="circa"
                defaultChecked={values.circa}
                hint="Renders as circa rather than an exact date."
              />
              <Text
                label="Date override"
                name="dateOverride"
                defaultValue={values.dateOverride}
                error={err('dateOverride')}
                hint="Replaces the formatted date entirely, for the odd case the fields cannot express."
              />
            </Row>
          </Fieldset>

          <Fieldset legend="Publishing">
            <Row cols={3}>
              <Select
                label="Status"
                name="status"
                options={enumOptions(statuses)}
                defaultValue={values.status}
                error={err('status')}
              />
              <Text
                label="Published on"
                name="publishedAt"
                type="date"
                mono
                defaultValue={values.publishedAt}
                error={err('publishedAt')}
              />
              <Num
                label="Featured order"
                name="featuredOrder"
                defaultValue={values.featuredOrder}
                error={err('featuredOrder')}
                hint="A number pins it to the home page."
              />
            </Row>

            <Row>
              <Text
                label="Tags"
                name="tags"
                defaultValue={values.tags.join(', ')}
                error={err('tags')}
                hint="Comma separated."
              />
              <Select
                label="Case study post"
                name="relatedPostRef"
                includeBlank
                blankLabel="No write-up"
                options={postOptions.map((item) => ({ value: item._id, label: item.title }))}
                defaultValue={values.relatedPostRef}
                error={err('relatedPostRef')}
              />
            </Row>

            <MultiSelect
              label="Technologies"
              name="techRefs"
              options={techOptions.map((item) => ({
                value: item._id,
                label: `${item.name} · ${item.category}`,
              }))}
              defaultValue={values.techRefs}
              error={err('techRefs')}
              hint={
                techOptions.length === 0
                  ? 'No tech records yet. Add them under Tech first.'
                  : 'Ctrl or Cmd to select several.'
              }
            />
          </Fieldset>

          <Fieldset legend="Links">
            <LinkRows
              kinds={linkKinds}
              defaultValue={values.links}
              hint="Repository, live site, demo video, write-up. The ones a reader will actually click."
            />
          </Fieldset>

          <Fieldset legend="Cover image">
            <ImageFields
              prefix="coverImage"
              value={values.coverImage}
              err={err}
              legendHint="Optional. The size fills itself in once a URL is entered; it is required because the page has to reserve the space before the image arrives."
            />
          </Fieldset>

          <SeoFieldset values={values.seo} err={err} />
        </>
      )}
    </FormShell>
  )
}
