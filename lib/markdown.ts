import { marked } from 'marked'

/**
 * Markdown to HTML.
 *
 * Body content is a markdown string rather than structured blocks or MDX. The
 * multi-theme constraint is what decides this: markdown parses to a tree that
 * each theme maps to its own components, and it stays complete at rest. MDX
 * does not: the moment a post contains <Callout>, that post is coupled to one
 * component library and a redesign means editing content instead of themes.
 *
 * Section markers use markdown directives (:::note) when we need them, because
 * they parse as data rather than as component imports.
 */

marked.setOptions({
  gfm: true,
  breaks: false,
})

export function renderMarkdown(source: string | null | undefined): string {
  if (!source) return ''
  return marked.parse(source, { async: false })
}

/** First paragraph, plain text. Used where an excerpt is missing. */
export function excerptFrom(source: string | null | undefined, max = 180): string {
  if (!source) return ''
  const firstPara = source.split(/\n\s*\n/)[0] ?? ''
  const plain = firstPara
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_`>]/g, '')
    .trim()

  return plain.length > max ? `${plain.slice(0, max).trimEnd()}…` : plain
}
