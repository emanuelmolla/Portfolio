'use client'

import Link from 'next/link'
import { FormShell } from '@/components/admin/FormShell'
import { MarkdownEditor } from '@/components/admin/MarkdownEditor'
import { SlugField } from '@/components/admin/SlugField'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { ImageFields } from '@/components/admin/ImageFields'
import { PreviewLink } from '@/components/admin/PreviewLink'
import { Area, Check, Fieldset, Num, Row, Select, Text, enumOptions } from '@/components/admin/fields'
import { savePost, deletePost } from '../actions'

/**
 * The post editor.
 *
 * Enum values arrive as props rather than being imported from @/lib/models.
 * That module pulls in mongoose, and importing it from a client component drags
 * the whole driver into the browser bundle. Passing the arrays down from the
 * server page keeps one source of truth without the import.
 */

export interface PostFormValues {
  _id?: string
  slug: string
  title: string
  excerpt: string
  body: string
  tags: string[]
  status: string
  publishedAt: string
  featuredOrder: number | null
  relatedWorkRef: string | null
  canonicalUrl: string | null
  coverImage: {
    url: string
    alt: string
    width: number
    height: number
    caption: string | null
  } | null
  seo: {
    title: string | null
    description: string | null
    canonicalUrl: string | null
    noindex: boolean
  }
}

export function PostForm({
  values,
  statuses,
  workOptions,
}: {
  values: PostFormValues
  statuses: readonly string[]
  workOptions: { _id: string; title: string }[]
}) {
  const isNew = !values._id

  return (
    <FormShell
      action={savePost}
      saveLabel={isNew ? 'Create post' : 'Save post'}
      aside={
        !isNew && (
          <>
            {/* Preview works whatever the status, which is the point: it is how a
                draft gets looked at in the real theme without being published to
                do it. Save first, though, since it renders what is stored. */}
            <PreviewLink to={`/blog/${values.slug}`} />
            {values.status === 'published' && (
              <Link
                href={`/blog/${values.slug}`}
                target="_blank"
                rel="noreferrer"
                className="a-btn"
              >
                View live
              </Link>
            )}
            <DeleteButton action={deletePost} id={values._id as string} />
          </>
        )
      }
    >
      {(err) => (
        <>
          <input type="hidden" name="id" value={values._id ?? ''} />

          <Fieldset legend="Post">
            <Text
              label="Title"
              name="title"
              required
              defaultValue={values.title}
              error={err('title')}
            />

            <SlugField
              sourceId="title"
              basePath="/blog"
              defaultValue={values.slug}
              original={values._id ? values.slug : null}
              error={err('slug')}
            />

            <Area
              label="Excerpt"
              name="excerpt"
              required
              rows={3}
              defaultValue={values.excerpt}
              error={err('excerpt')}
              hint="One or two sentences. It is the card text on the index and the fallback meta description, so write it for someone who has not opened the post."
            />
          </Fieldset>

          <MarkdownEditor
            name="body"
            defaultValue={values.body}
            error={err('body')}
            hint="Images are inserted as a URL. There is no upload pipeline yet, so host the file somewhere and paste the link."
          />

          <Fieldset legend="Publishing">
            <Row>
              <Select
                label="Status"
                name="status"
                options={enumOptions(statuses)}
                defaultValue={values.status}
                error={err('status')}
                hint="Drafts are invisible to the site and to feeds."
              />
              <Text
                label="Published on"
                name="publishedAt"
                type="date"
                mono
                defaultValue={values.publishedAt}
                error={err('publishedAt')}
                hint="Left empty, it is stamped the first time this is published."
              />
            </Row>

            <Row>
              <Text
                label="Tags"
                name="tags"
                defaultValue={values.tags.join(', ')}
                error={err('tags')}
                hint="Comma separated. Normalised to lowercase dashes on save."
              />
              <Num
                label="Featured order"
                name="featuredOrder"
                defaultValue={values.featuredOrder}
                error={err('featuredOrder')}
                hint="Empty for most posts. A number pins it to the home page, lowest first."
              />
            </Row>

            <Row>
              <Select
                label="Related project"
                name="relatedWorkRef"
                includeBlank
                blankLabel="Not a case study"
                options={workOptions.map((item) => ({ value: item._id, label: item.title }))}
                defaultValue={values.relatedWorkRef}
                error={err('relatedWorkRef')}
                hint="Links this post to a project as its write-up."
              />
              <Text
                label="Canonical URL"
                name="canonicalUrl"
                type="url"
                defaultValue={values.canonicalUrl}
                error={err('canonicalUrl')}
                hint="Only if this was published somewhere else first."
              />
            </Row>
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

/**
 * The SEO block, shared in shape by posts, work and pages.
 *
 * Exported so the other editors render the identical set of fields: SEO
 * overrides that differ per collection are overrides nobody can remember the
 * rules for.
 */
export function SeoFieldset({
  values,
  err,
  prefix = 'seo',
}: {
  values: { title: string | null; description: string | null; canonicalUrl: string | null; noindex: boolean }
  err: (name: string) => string | undefined
  prefix?: string
}) {
  return (
    <Fieldset
      legend="Search and social"
      hint="All optional. Left empty, each falls back to the content above, which is usually the right answer."
    >
      <Row>
        <Text
          label="Title override"
          name={`${prefix}.title`}
          defaultValue={values.title}
          error={err(`${prefix}.title`)}
        />
        <Text
          label="Canonical URL"
          name={`${prefix}.canonicalUrl`}
          type="url"
          defaultValue={values.canonicalUrl}
          error={err(`${prefix}.canonicalUrl`)}
        />
      </Row>

      <Area
        label="Meta description"
        name={`${prefix}.description`}
        rows={2}
        maxLength={200}
        defaultValue={values.description}
        error={err(`${prefix}.description`)}
        hint="Under 160 characters is what actually gets shown in a result."
      />

      <Check
        label="Hide from search engines"
        name={`${prefix}.noindex`}
        defaultChecked={values.noindex}
        hint="Adds noindex. The page stays reachable by anyone with the link."
      />
    </Fieldset>
  )
}
