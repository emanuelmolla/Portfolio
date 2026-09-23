/**
 * Text to slug.
 *
 * Its own module because both a server action and a client component need it, and
 * lib/admin/mutations.ts imports mongoose and next/cache, neither of which can
 * cross into a client bundle.
 *
 * Accents are decomposed and stripped rather than dropped, so "Café" becomes
 * "cafe" and not "caf". Slugs are URLs and URLs are permanent, so getting this
 * wrong once means owning a redirect forever.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
