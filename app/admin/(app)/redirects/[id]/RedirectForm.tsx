'use client'

import { FormShell } from '@/components/admin/FormShell'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { Fieldset, Row, Select, Text } from '@/components/admin/fields'
import { saveRedirect, deleteRedirect } from '../actions'

export interface RedirectFormValues {
  _id?: string
  from: string
  to: string
  statusCode: number
  note: string | null
}

export function RedirectForm({ values }: { values: RedirectFormValues }) {
  const isNew = !values._id

  return (
    <FormShell
      action={saveRedirect}
      saveLabel={isNew ? 'Create redirect' : 'Save redirect'}
      aside={!isNew && <DeleteButton action={deleteRedirect} id={values._id as string} />}
    >
      {(err) => (
        <>
          <input type="hidden" name="id" value={values._id ?? ''} />

          <Fieldset legend="Redirect">
            <Text
              label="From"
              name="from"
              required
              mono
              defaultValue={values.from}
              error={err('from')}
              hint="A path on this site, like /old-project. It is matched exactly, so no wildcards."
            />

            <Text
              label="To"
              name="to"
              required
              mono
              defaultValue={values.to}
              error={err('to')}
              hint="A path, or a full URL if the destination is somewhere else."
            />

            <Row>
              <Select
                label="Kind"
                name="statusCode"
                options={[
                  { value: '301', label: '301 permanent' },
                  { value: '302', label: '302 temporary' },
                ]}
                defaultValue={String(values.statusCode)}
                error={err('statusCode')}
                hint="Permanent is what transfers ranking. Temporary is for a move you intend to undo, and search engines keep the old URL indexed."
              />
              <Text
                label="Note"
                name="note"
                defaultValue={values.note}
                error={err('note')}
                hint="Why this exists, for the version of you reading it in two years."
              />
            </Row>
          </Fieldset>
        </>
      )}
    </FormShell>
  )
}
