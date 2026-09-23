'use client'

import { FormShell } from '@/components/admin/FormShell'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { Area, Check, Fieldset, Num, Row, Select, Text, enumOptions } from '@/components/admin/fields'
import { saveTech, deleteTech } from '../actions'

export interface TechFormValues {
  _id?: string
  slug: string
  name: string
  category: string
  firstEncounter: number | null
  note: string | null
  rank: number | null
  icon: { simpleIconsSlug: string | null; devicon: string | null; color: string | null }
  featured: boolean
  order: number
}

export function TechForm({
  values,
  categories,
}: {
  values: TechFormValues
  categories: readonly string[]
}) {
  const isNew = !values._id

  return (
    <FormShell
      action={saveTech}
      saveLabel={isNew ? 'Create entry' : 'Save entry'}
      aside={!isNew && <DeleteButton action={deleteTech} id={values._id as string} />}
    >
      {(err) => (
        <>
          <input type="hidden" name="id" value={values._id ?? ''} />
          <input type="hidden" name="slug" value={values.slug} />

          <Fieldset legend="Technology">
            <Row>
              <Text
                label="Name"
                name="name"
                required
                defaultValue={values.name}
                error={err('name')}
              />
              <Select
                label="Category"
                name="category"
                options={enumOptions(categories)}
                defaultValue={values.category}
                error={err('category')}
              />
            </Row>

            <Area
              label="Note"
              name="note"
              rows={3}
              defaultValue={values.note}
              error={err('note')}
              hint="Why you like it, in your own words. The one thing a taxonomy cannot supply, and the reason this is not just a logo wall."
            />

            <Row cols={3}>
              <Num
                label="First used"
                name="firstEncounter"
                defaultValue={values.firstEncounter}
                error={err('firstEncounter')}
                hint="A year. That is the honest precision."
              />
              <Num
                label="Rank"
                name="rank"
                defaultValue={values.rank}
                error={err('rank')}
                hint="Empty for most. 1, 2, 3 for the ones worth calling out first."
              />
              <Num
                label="Order"
                name="order"
                defaultValue={values.order}
                error={err('order')}
                hint="Position in the full list."
              />
            </Row>

            <Check
              label="Featured"
              name="featured"
              defaultChecked={values.featured}
              hint="A theme may show only featured entries where space is tight."
            />
          </Fieldset>

          <Fieldset
            legend="Icon"
            hint="All optional. Themes look these up by slug rather than storing an image, so there is no asset to keep in sync."
          >
            <Row cols={3}>
              <Text
                label="Simple Icons slug"
                name="icon.simpleIconsSlug"
                mono
                defaultValue={values.icon.simpleIconsSlug}
                error={err('icon.simpleIconsSlug')}
              />
              <Text
                label="Devicon name"
                name="icon.devicon"
                mono
                defaultValue={values.icon.devicon}
                error={err('icon.devicon')}
              />
              <Text
                label="Brand colour"
                name="icon.color"
                mono
                defaultValue={values.icon.color}
                error={err('icon.color')}
                hint="Hex, with the hash."
              />
            </Row>
          </Fieldset>
        </>
      )}
    </FormShell>
  )
}
