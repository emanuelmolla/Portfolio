# Admin

The CMS at `/admin`. Everything the site renders is editable here, so changing
content is an edit rather than a deploy.

---

## Getting it running

Three things, in this order. Nothing works until the first one is done.

### 1. Database

Put the Atlas connection string in `.env.local`:

```
MONGODB_URI=mongodb+srv://…
```

Then import the existing content:

```
npm run seed -- --dry    # report what would happen, change nothing
npm run seed             # do it
```

The seed writes the profile, work, tech, experience and pages from
`lib/content/_seed.ts`, migrates the v1 blog posts out of the old `Blog`
collection, and imports `public/resume.pdf`. It is idempotent: every write is an
upsert keyed on slug, so running it twice is the same as running it once.

Until `MONGODB_URI` is set, the site serves seed content, every admin list is
empty, and every save refuses with a message saying so.

### 2. Sign-in

```
AUTH_SECRET=          # openssl rand -base64 32
ADMIN_EMAILS=         # comma separated, the addresses allowed in
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
```

Google credentials come from the Cloud Console under **APIs & Services →
Credentials → Create credentials → OAuth client ID → Web application**. The
authorised redirect URIs must include **both**, exactly:

```
http://localhost:3000/api/auth/callback/google
https://emanuelmolla.dev/api/auth/callback/google
```

GitHub is optional and identical in shape (`AUTH_GITHUB_ID` /
`AUTH_GITHUB_SECRET`, callback `/api/auth/callback/github`). A provider is only
registered when both of its variables are present, so leaving GitHub empty just
means no GitHub button.

**An empty `ADMIN_EMAILS` denies everyone.** That is deliberate. Treating "unset"
as "allow all" would turn one missing environment variable into a public admin.

### 3. Email (optional)

```
RESEND_API_KEY=
CONTACT_FROM_EMAIL="Portfolio <site@emanuelmolla.dev>"
CONTACT_TO_EMAIL=     # optional, defaults to the first ADMIN_EMAILS entry
```

`CONTACT_FROM_EMAIL` must be on a domain verified in Resend. Messages are stored
whether or not this is configured; the email is a notification, never a
dependency. **The dashboard has a "Send a test email" button** — use it, because
the failure is otherwise silent by design.

Replies work from your normal mail client: the notification sets `reply_to` to
the visitor's address, so hitting Reply reaches them directly. There is no send
form in the admin, deliberately.

The dashboard's **Setup** panel shows which of these three are live.

---

## What is where

| Screen | Edits |
|---|---|
| Messages | Contact form submissions. Inbox, archive, spam, delete |
| Writing | Blog posts at `/blog` |
| Work | Projects at `/work`. Software, writing, photo, chess |
| Experience | Work history, education, awards. The resume's source records |
| Tech | The tagging taxonomy behind work and experience |
| Pages | Standing pages at the root: `/about`, `/uses`, `/now` |
| Profile | Name, headline, bio, links, availability. One record, always |
| Resume | The PDF, and whether crawlers may index it |
| Redirects | Slug history. Mostly writes itself |

The public `/about` page is the **Profile** record plus Experience plus Tech.
There is no separate About page to edit.

---

## Things worth knowing

**Preview.** Every post, project and page has a Preview button that opens it in
the real theme even while it is a draft. This is how a draft gets looked at
without being published to look at it. Save first; it renders what is stored. A
warning strip across the top says you are in preview, and exits.

The preview cookie is **signed**. Setting `preview=1` by hand does nothing.

**Renaming a slug.** Saving a rename keeps the old URL working and writes a 301
to the new one, automatically. The form warns before you do it. Nothing that
already links to the page breaks.

**Drafts and publishing.** `status` and `publishedAt` are separate fields.
Publishing something with no date stamps it now; publishing something with a date
leaves it alone, so backdating works and unpublishing does not erase the original
date. The list screens have a Publish/Unpublish button so you do not have to open
the record.

**Featured order.** Empty for almost everything. A number pins an item to the home
page, lowest first. That is how "Selected work" and "Selected writing" are chosen.

**Images.** Enter a URL and the width and height fill themselves in; the Measure
button redoes it. Both are required because the page has to reserve the space
before the image loads, otherwise the layout jumps as it arrives. There is no
upload pipeline yet — host the file and paste the link, or put it in `public/`
and use a path like `/me.jpg`.

**The editor.** Markdown with a toolbar, `Cmd`/`Ctrl` + `B`, `I`, `K`, and a split
preview. The preview is rendered by importing the exact function the site uses, so
it is not an approximation — what is on the right is what ships. `Ctrl+Z` works
through toolbar edits.

**Unsaved changes.** The save bar says "Unsaved changes" and the browser warns
before you close the tab. It does **not** catch clicking a link in the sidebar,
which the App Router gives no way to intercept. The marker in the save bar is what
covers that.

**Tech before work.** A project references tech records rather than listing names,
so add those first or the picker is empty.

**No proficiency field.** Deliberately absent from the schema, so there is no way
to render a bar chart of your own competence. Use `rank` for the few worth calling
out first.

---

## How it is built

```
auth.ts                     providers + the email allow-list
lib/admin/session.ts        the gate
lib/admin/read.ts           uncached reads, drafts included
lib/admin/mutations.ts      guard, revalidation, slug history
lib/admin/form.ts           FormData to typed values
app/admin/(app)/*/actions.ts  one save action per collection
components/admin/           the form primitives and the editor
```

**The security model, stated once.** The layout at `app/admin/(app)/layout.tsx`
gates what *renders*. It does **not** protect server actions: those compile to
their own POST endpoints with stable ids that exist independently of the page that
rendered them, and the layout never runs for those requests. So **every action
calls `guard()` first**. Forgetting that in one action is the whole hole. The same
applies to the route handlers under `app/admin/preview/`, which check
`getAdmin()` themselves.

The allow-list is re-checked on every request rather than trusted from the
session, so removing an address from `ADMIN_EMAILS` takes effect on the next
request instead of whenever a thirty-day JWT happens to expire.

**Reads are split on purpose.** `lib/content/` is cached and filters to
published — that is what the public site uses, and it cannot reach a draft by
construction rather than by remembering to pass a flag. `lib/admin/read.ts` is
uncached and includes drafts. An editor reading through the public cache would
show the version before the save it just made, which reads as "the save did not
work" and invites a second save on stale data.

Saves call `updateTag`, not `revalidateTag`. In Next 16 those differ:
`revalidateTag` marks a tag stale against a cache profile and refreshes in the
background, so the next read can still be the old value. `updateTag` purges
immediately. For a CMS that is not a preference.

---

## Not built

- **Asset uploads.** Images are URLs. The resume is the only file upload, and it
  goes into the database rather than a blob store.
- **Version history.** No drafts-of-drafts, no revert. Saving replaces.
- **Multiple users.** Single-user assumptions throughout, deliberately.
- **Scheduled publishing.** `publishedAt` can be set in the future, but nothing
  flips the status when that time arrives.
- **Analytics.** The v1 `Visit` model was not carried over.
- **An auto-reply to whoever sends a message.** Easy to add, risks looking like
  spam, so it is a decision rather than an omission.
