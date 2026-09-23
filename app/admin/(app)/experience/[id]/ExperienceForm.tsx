'use client'

import { FormShell } from '@/components/admin/FormShell'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { LinkRows, type LinkRow } from '@/components/admin/LinkRows'
import {
  Area,
  Check,
  Fieldset,
  ListArea,
  MultiSelect,
  Num,
  Row,
  Select,
  Text,
  enumOptions,
} from '@/components/admin/fields'
import { saveExperience, deleteExperience } from '../actions'

export interface ExperienceFormValues {
  _id?: string
  slug: string
  section: string
  sortMode: string
  org: string
  role: string
  location: string | null
  employmentType: string | null
  url: string | null
  startDate: string
  endDate: string
  current: boolean
  summary: string | null
  highlights: string[]
  techRefs: string[]
  links: LinkRow[]
  order: number
  status: string
}

export function ExperienceForm({
  values,
  sections,
  sortModes,
  statuses,
  linkKinds,
  techOptions,
}: {
  values: ExperienceFormValues
  sections: readonly string[]
  sortModes: readonly string[]
  statuses: readonly string[]
  linkKinds: readonly string[]
  techOptions: { _id: string; name: string; category: string }[]
}) {
  const isNew = !values._id

  return (
    <FormShell
      action={saveExperience}
      saveLabel={isNew ? 'Create entry' : 'Save entry'}
      aside={!isNew && <DeleteButton action={deleteExperience} id={values._id as string} />}
    >
      {(err) => (
        <>
          <input type="hidden" name="id" value={values._id ?? ''} />
          <input type="hidden" name="slug" value={values.slug} />

          <Fieldset
            legend="Entry"
            hint="Field names follow the JSON Resume schema, so the resume PDF can eventually be generated from these records instead of maintained as a second document that drifts."
          >
            <Row>
              <Text
                label="Organisation"
                name="org"
                required
                defaultValue={values.org}
                error={err('org')}
              />
              <Text
                label="Role"
                name="role"
                required
                defaultValue={values.role}
                error={err('role')}
              />
            </Row>

            <Row cols={3}>
              <Select
                label="Section"
                name="section"
                options={enumOptions(sections)}
                defaultValue={values.section}
                error={err('section')}
              />
              <Text
                label="Location"
                name="location"
                defaultValue={values.location}
                error={err('location')}
              />
              <Text
                label="Employment type"
                name="employmentType"
                defaultValue={values.employmentType}
                error={err('employmentType')}
                hint="Free text. A run that changed shape is still one entry."
              />
            </Row>

            <Text
              label="Organisation URL"
              name="url"
              type="url"
              defaultValue={values.url}
              error={err('url')}
            />
          </Fieldset>

          <Fieldset legend="Dates">
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
                hint="Ignored while Current is ticked."
              />
              <div className="pt-5">
                <Check
                  label="Current"
                  name="current"
                  defaultChecked={values.current}
                  hint="Sorts above finished roles regardless of start date."
                />
              </div>
            </Row>
          </Fieldset>

          <Fieldset legend="What you did">
            <Area
              label="Summary"
              name="summary"
              rows={3}
              defaultValue={values.summary}
              error={err('summary')}
              hint="One paragraph. What the role actually was."
            />
            <ListArea
              label="Highlights"
              name="highlights"
              rows={6}
              defaultValue={values.highlights}
              error={err('highlights')}
              hint="One bullet per line. These are the resume bullets, so write them as such."
            />
            <MultiSelect
              label="Technologies"
              name="techRefs"
              options={techOptions.map((item) => ({
                value: item._id,
                label: `${item.name} · ${item.category}`,
              }))}
              defaultValue={values.techRefs}
              error={err('techRefs')}
            />
          </Fieldset>

          <Fieldset legend="Links">
            <LinkRows kinds={linkKinds} defaultValue={values.links} />
          </Fieldset>

          <Fieldset legend="Display">
            <Row cols={3}>
              <Select
                label="Status"
                name="status"
                options={enumOptions(statuses)}
                defaultValue={values.status}
                error={err('status')}
              />
              <Select
                label="Sort mode"
                name="sortMode"
                options={enumOptions(sortModes)}
                defaultValue={values.sortMode}
                error={err('sortMode')}
                hint="Sorting is per section, not global."
              />
              <Num
                label="Order"
                name="order"
                defaultValue={values.order}
                error={err('order')}
                hint="Breaks ties within the same date."
              />
            </Row>
          </Fieldset>
        </>
      )}
    </FormShell>
  )
}
