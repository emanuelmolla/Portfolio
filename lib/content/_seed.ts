import type { Experience, Page, Post, Profile, Tech, Work } from '@/lib/models'

/**
 * Real v1 content, promoted out of code and into data.
 *
 * Everything here came from the v1 app at tag `v1-final`: src/data/projects.jsx,
 * src/data/techstack.jsx, and the identity strings that were scattered across
 * components/Home.jsx, apps/Contact/ContactCard.jsx and apps/Me/components/*.
 * The prose is Emanuel's own, not rewritten.
 *
 * Two uses, one source:
 *   1. `npm run seed` writes these into MongoDB.
 *   2. When MONGODB_URI is unset, lib/content serves them directly so the site
 *      runs with no database configured.
 *
 * Nothing here is invented. Where a real value is unknown it is left null or
 * empty rather than filled in.
 */

const T = (slug: string) => `tech_${slug}`

export const seedTech: Tech[] = [
  {
    slug: 'nodejs',
    name: 'Node.js',
    category: 'Framework',
    firstEncounter: 2024,
    note: 'My favorite for backend framework Express, REST APIs, and full control with npm.',
    rank: 1,
    icon: { simpleIconsSlug: 'nodedotjs', devicon: 'nodejs', color: '#5FA04E' },
    featured: true,
    order: 1,
  },
  {
    slug: 'python',
    name: 'Python',
    category: 'Language',
    firstEncounter: 2022,
    note: "Clean syntax and quick to prototype with. I use it for interview prep. It's just satisfying to work with.",
    rank: 2,
    icon: { simpleIconsSlug: 'python', devicon: 'python', color: '#3776AB' },
    featured: true,
    order: 2,
  },
  {
    slug: 'mongodb',
    name: 'MongoDB',
    category: 'Database',
    firstEncounter: 2024,
    note: 'Love how intuitive it is to work with documents, especially alongside Node.js.',
    rank: 3,
    icon: { simpleIconsSlug: 'mongodb', devicon: 'mongodb', color: '#47A248' },
    featured: true,
    order: 3,
  },
  {
    slug: 'javascript',
    name: 'JavaScript',
    category: 'Language',
    firstEncounter: 2023,
    note: "Started with vanilla JS, now can't imagine web dev without it.",
    rank: null,
    icon: { simpleIconsSlug: 'javascript', devicon: 'javascript', color: '#F7DF1E' },
    featured: false,
    order: 10,
  },
  {
    slug: 'typescript',
    name: 'TypeScript',
    category: 'Language',
    firstEncounter: 2025,
    note: 'The stack I am committing to. Types catch the mistakes I actually make.',
    rank: null,
    icon: { simpleIconsSlug: 'typescript', devicon: 'typescript', color: '#3178C6' },
    featured: false,
    order: 11,
  },
  {
    slug: 'react',
    name: 'React',
    category: 'Framework',
    firstEncounter: 2024,
    note: 'Hooks changed everything, functional components are so clean.',
    rank: null,
    icon: { simpleIconsSlug: 'react', devicon: 'react', color: '#61DAFB' },
    featured: false,
    order: 12,
  },
  {
    slug: 'express',
    name: 'Express',
    category: 'Framework',
    firstEncounter: 2025,
    note: 'Minimal and unopinionated, perfect for learning backend concepts.',
    rank: null,
    icon: { simpleIconsSlug: 'express', devicon: 'express', color: '#000000' },
    featured: false,
    order: 13,
  },
  {
    slug: 'tailwind',
    name: 'Tailwind CSS',
    category: 'Framework',
    firstEncounter: 2024,
    note: 'Utility-first changed how I think about styling.',
    rank: null,
    icon: { simpleIconsSlug: 'tailwindcss', devicon: 'tailwindcss', color: '#06B6D4' },
    featured: false,
    order: 14,
  },
  {
    slug: 'cpp',
    name: 'C++',
    category: 'Language',
    firstEncounter: 2020,
    note: 'First love in programming. A very strict one.',
    rank: null,
    icon: { simpleIconsSlug: 'cplusplus', devicon: 'cplusplus', color: '#00599C' },
    featured: false,
    order: 15,
  },
  {
    slug: 'postgresql',
    name: 'PostgreSQL',
    category: 'Database',
    firstEncounter: null,
    note: 'Learning next. Relational modelling and the query planner.',
    rank: null,
    icon: { simpleIconsSlug: 'postgresql', devicon: 'postgresql', color: '#4169E1' },
    featured: false,
    order: 16,
  },
  {
    slug: 'git',
    name: 'Git',
    category: 'Tool',
    firstEncounter: 2023,
    note: 'Every single project.',
    rank: null,
    icon: { simpleIconsSlug: 'git', devicon: 'git', color: '#F05032' },
    featured: false,
    order: 17,
  },
  {
    slug: 'nextjs',
    name: 'Next.js',
    category: 'Framework',
    firstEncounter: 2025,
    note: 'What this site runs on. Server components and rendering that crawlers can read.',
    rank: null,
    icon: { simpleIconsSlug: 'nextdotjs', devicon: 'nextjs', color: '#000000' },
    featured: false,
    order: 18,
  },
] as unknown as Tech[]

export const seedProfile: Profile = {
  name: 'Emanuel Molla',
  givenName: 'Emanuel',
  familyName: 'Molla',
  alternateName: 'emanuelmolla',
  headline: 'Backend developer',
  bio: {
    /**
     * Does NOT restate the headline. The home page now renders name, then
     * headline, then this, so a bio opening with "Backend developer" would print
     * the same two words twice in a row, three lines apart.
     *
     * It is no longer the meta description either: seo.description below is set
     * explicitly, so the page copy can read naturally while the search snippet
     * still carries the name and the role together.
     */
    short:
      'Computer Systems Technology at BCIT, based in Vancouver, working mostly on the server side.',
    long: [
      'I love solving real problems with code, building tools that help people, and constantly learning how technology works behind the scenes.',
      '',
      'I grew up in Ethiopia, where I developed my love for learning and problem-solving. At 21 I moved to Canada, and I could not be more grateful for the journey.',
      '',
      'My faith through the Ethiopian Orthodox Church plays a huge role in shaping who I am. It guides my values, keeps me grounded, and reminds me to approach life with gratitude and purpose.',
    ].join('\n'),
  },
  location: { city: 'Vancouver', region: 'BC', country: 'Canada' },
  avatar: {
    url: '/image.jpg',
    alt: 'Emanuel Molla',
    width: 3024,
    height: 4032,
    blurDataURL: null,
    caption: null,
  },
  links: [
    { kind: 'github', label: 'GitHub', url: 'https://github.com/emanuelmolla', handle: 'emanuelmolla', order: 1, visible: true },
    { kind: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/emanuel-molla', handle: 'emanuel-molla', order: 2, visible: true },
    { kind: 'email', label: 'Email', url: 'mailto:emanuelmolla@outlook.com', handle: 'emanuelmolla@outlook.com', order: 3, visible: true },
    { kind: 'resume', label: 'Resume', url: '/resume', handle: null, order: 4, visible: true },
  ],
  availability: { status: 'selective', availableFrom: null, note: null },
  resumeUrl: '/resume',
  knowsAbout: ['Backend development', 'REST APIs', 'Node.js', 'MongoDB', 'Systems design'],
  knowsLanguage: ['en', 'am'],
  inLanguage: 'en',
  seo: {
    title: 'Emanuel Molla',
    /**
     * Leads with the name. This is the snippet under the blue link, and the
     * search that matters most for a personal site is someone typing the name
     * after reading it on a resume. Pairing the name with the role in one
     * sentence is what ties the two together for a reader skimming results.
     */
    description:
      'Emanuel Molla is a backend developer in Vancouver, studying Computer Systems Technology at BCIT.',
    ogImage: null,
    canonicalUrl: null,
    noindex: false,
  },
} as unknown as Profile

export const seedWork: Work[] = [
  {
    slug: 'vivid-africa',
    previousSlugs: [],
    kind: 'software',
    title: 'Vivid Africa',
    summary:
      'A safari and tour operator site running in production for a client. Server-rendered on Cloudflare Workers, with a Postgres-backed admin the owner runs himself.',
    body: [
      'A working site for a real operator, not a demo. Destinations, categories, journal entries, media and enquiries are all content the owner edits himself, so a price change or a new destination is an edit rather than a call to me.',
      '',
      '## The sibling sites',
      '',
      'Two more sites for the same operator run on the same stack and the same deployment setup. They are separate sites with their own content and their own domains rather than one site with a theme switch:',
      '',
      '- [Priceless Ethiopia Tours](https://pricelessethiopiatours.com)',
      '- [Ethiopia Birding and Trekking](https://ethiopiabirdingandtrekking.com), live since September 2026',
      '',
      'Running three of them is what turned this from a website into a pipeline: each environment migrates its own database from CI, each contact form posts to its own Worker, and a build check fails rather than shipping content that is not ready.',
      '',
      '## Notes',
      '',
      'Next.js SSR on Cloudflare Workers does not fit inside the free plan: its 10ms CPU limit is below what server rendering needs, and the pages that broke were the quiet ones nobody clicks until they do. That is a hosting decision with a real answer rather than a bug.',
    ].join('\n'),
    bodyFormat: 'markdown',
    problem:
      'A tour operator whose enquiries and itineraries lived in email and social posts, with no site he could update himself.',
    outcome:
      'Live and serving enquiries. The owner manages destinations, journal entries and media without touching code, and two sibling sites now run on the same setup.',
    role: 'Solo Developer',
    isGroup: false,
    teamSize: null,
    startDate: new Date('2026-05-16'),
    endDate: null,
    datePrecision: 'month',
    circa: false,
    dateOverride: null,
    lifecycle: 'active',
    status: 'published',
    publishedAt: new Date('2026-05-16'),
    featuredOrder: 1,
    techRefs: [T('nextjs'), T('typescript'), T('postgresql'), T('tailwind')],
    tags: ['client-work', 'production'],
    links: [{ kind: 'live', label: 'vivid.africa', url: 'https://vivid.africa' }],
    coverImage: null,
    gallery: [],
    mediaRefs: [],
    relatedPostRef: null,
    details: {
      kind: 'software',
      stack: [
        'Next.js',
        'TypeScript',
        'Cloudflare Workers',
        'Neon Postgres',
        'Tailwind CSS',
        'Resend',
      ],
      architectureNotes:
        'Server-rendered on Cloudflare Workers with Neon Postgres behind it. Each environment migrates its own database from CI, and each site posts its contact form to its own Worker.',
      repoUrl: null,
      liveUrl: 'https://vivid.africa',
    },
    seo: { title: null, description: null, ogImage: null, canonicalUrl: null, noindex: false },
  },
  {
    slug: 'kiyas-study-tool',
    previousSlugs: [],
    kind: 'software',
    title: "Kiya's Study Tool",
    summary:
      'A study tool I built for myself and still use. Notes, worked problems, flashcards and quizzes for a course, in one place instead of five.',
    body: [
      'I built this because my own course material was spread across PDFs, notebooks and half-finished quiz apps, and none of it was in the same place when I actually sat down to study. It went to beta in the summer and I have been using it since.',
      '',
      'It stayed because I kept using it. As of this term it holds more than one course, which is what forced the recent work: content that assumed a single course had to learn to belong to one.',
      '',
      '## The part worth talking about',
      '',
      'Everything is a page, and a page is one of four kinds: a note, a worked problem, a flashcard deck, or a quiz. They share one table and one set of routes rather than four of each, so adding a kind is a discriminator and a renderer instead of a migration.',
      '',
      'Content is published over an HTTP API with per-user keys, which means study material can be written wherever it already lives and pushed in, rather than typed into a form.',
    ].join('\n'),
    bodyFormat: 'markdown',
    problem:
      'My own course material lived in PDFs, notebooks and separate apps, so revising meant reassembling it every time.',
    outcome:
      'In use for more than one course, and still maintained because I am still the person using it.',
    role: 'Architecture, data model and ongoing maintenance',
    isGroup: false,
    teamSize: null,
    startDate: new Date('2026-05-30'),
    endDate: null,
    datePrecision: 'month',
    circa: false,
    dateOverride: null,
    lifecycle: 'active',
    status: 'published',
    publishedAt: new Date('2026-05-30'),
    featuredOrder: 2,
    techRefs: [T('nextjs'), T('typescript'), T('postgresql'), T('tailwind')],
    tags: ['side-project'],
    links: [{ kind: 'live', label: 'kst.molla.dev', url: 'https://kst.molla.dev' }],
    coverImage: null,
    gallery: [],
    mediaRefs: [],
    relatedPostRef: null,
    details: {
      kind: 'software',
      stack: ['Next.js', 'TypeScript', 'Neon Postgres', 'NextAuth', 'Cloudflare R2'],
      architectureNotes:
        'Polymorphic pages: note, worked problem, flashcard and quiz share one table and one set of routes, discriminated by kind. Content is published through an HTTP API with per-user keys.',
      repoUrl: null,
      liveUrl: 'https://kst.molla.dev',
    },
    seo: { title: null, description: null, ogImage: null, canonicalUrl: null, noindex: false },
  },
  {
    slug: 'devnest',
    previousSlugs: [],
    kind: 'software',
    title: 'DevNest',
    summary:
      'Sprint-based project management with task tracking, notes and goals. Uses the Gemini API to generate sprint tasks and feature plans.',
    body: '',
    bodyFormat: 'markdown',
    problem: null,
    outcome: null,
    role: 'Solo Developer',
    isGroup: false,
    teamSize: null,
    startDate: new Date('2025-07-01'),
    endDate: null,
    datePrecision: 'month',
    circa: false,
    dateOverride: null,
    lifecycle: 'active',
    status: 'published',
    publishedAt: new Date('2025-07-01'),
    featuredOrder: 3,
    techRefs: [T('express'), T('mongodb'), T('react'), T('nodejs')],
    tags: ['side-project'],
    links: [
      { kind: 'repo', label: 'Repository', url: 'https://github.com/emanuelmolla/DevNest' },
      { kind: 'live', label: 'Live', url: 'https://devnest.molla.dev' },
    ],
    coverImage: {
      url: 'https://res.cloudinary.com/dbcdlkfty/image/upload/v1755926825/DevNestLanding_falgbg.png',
      alt: 'The DevNest landing page: sprint board with task columns.',
      // Real pixel dimensions, read from the file rather than assumed.
      width: 1479,
      height: 998,
      blurDataURL: null,
      caption: null,
    },
    mediaRefs: [],
    relatedPostRef: null,
    details: {
      kind: 'software',
      stack: ['React', 'Express', 'MongoDB', 'Gemini API', 'JWT', 'Auth0', 'Node.js', 'Tailwind CSS'],
      architectureNotes: null,
      repoUrl: 'https://github.com/emanuelmolla/DevNest',
      liveUrl: 'https://devnest.molla.dev',
    },
    seo: { title: null, description: null, ogImage: null, canonicalUrl: null, noindex: false },
  },
  {
    slug: 'scholiast',
    previousSlugs: [],
    kind: 'software',
    title: 'Scholiast',
    summary:
      'A student productivity platform with flashcards, resource management and weekly goal tracking. I built the backend.',
    body: '',
    bodyFormat: 'markdown',
    problem: null,
    outcome: null,
    role: 'Backend Developer',
    isGroup: true,
    teamSize: null,
    startDate: new Date('2025-05-01'),
    endDate: null,
    datePrecision: 'month',
    circa: false,
    dateOverride: null,
    lifecycle: 'shipped',
    status: 'published',
    publishedAt: new Date('2025-05-01'),
    featuredOrder: 4,
    techRefs: [T('nodejs'), T('express'), T('mongodb'), T('react')],
    tags: ['team-project'],
    links: [
      { kind: 'repo', label: 'Repository', url: 'https://github.com/emanuelmolla/Scholiast' },
      { kind: 'live', label: 'Live', url: 'https://sholiast.webios.link' },
      { kind: 'demo', label: 'Demo video', url: 'https://youtu.be/aUjmIdcZkuk' },
    ],
    coverImage: {
      url: 'https://res.cloudinary.com/dbcdlkfty/image/upload/v1751948132/scholiast_fqni1l.png',
      alt: 'The Scholiast study dashboard showing flashcards and weekly goals.',
      // Real pixel dimensions, read from the file rather than assumed.
      width: 1826,
      height: 1198,
      blurDataURL: null,
      caption: null,
    },
    mediaRefs: [],
    relatedPostRef: null,
    details: {
      kind: 'software',
      stack: ['React', 'Express', 'Node.js', 'MongoDB', 'Auth0', 'Gemini API', 'Tailwind CSS'],
      architectureNotes: null,
      repoUrl: 'https://github.com/emanuelmolla/Scholiast',
      liveUrl: 'https://sholiast.webios.link',
    },
    seo: { title: null, description: null, ogImage: null, canonicalUrl: null, noindex: false },
  },
  {
    slug: 'bookpinion-api',
    previousSlugs: [],
    kind: 'software',
    title: 'BookPinion API',
    summary:
      'A REST API for managing book reviews. Advanced book search, review storage, and role-based access control.',
    body: '',
    bodyFormat: 'markdown',
    problem: null,
    outcome: null,
    role: 'Solo Developer',
    isGroup: false,
    teamSize: null,
    startDate: new Date('2025-06-01'),
    endDate: null,
    datePrecision: 'month',
    circa: false,
    dateOverride: null,
    lifecycle: 'shipped',
    status: 'published',
    publishedAt: new Date('2025-06-01'),
    featuredOrder: 5,
    techRefs: [T('nodejs'), T('express'), T('mongodb')],
    tags: ['api'],
    links: [
      { kind: 'repo', label: 'Repository', url: 'https://github.com/emanuelmolla/BookPinion-API' },
      { kind: 'live', label: 'Live', url: 'https://bookpinion-api.onrender.com' },
    ],
    coverImage: {
      url: 'https://res.cloudinary.com/dbcdlkfty/image/upload/v1751948333/bookPinion_o5ojtv.png',
      alt: 'The BookPinion API documentation page listing the review endpoints.',
      // Real pixel dimensions, read from the file rather than assumed.
      width: 1826,
      height: 1198,
      blurDataURL: null,
      caption: null,
    },
    mediaRefs: [],
    relatedPostRef: null,
    details: {
      kind: 'software',
      stack: ['Node.js', 'Express', 'MongoDB', 'JWT', 'Mongoose'],
      architectureNotes: null,
      repoUrl: 'https://github.com/emanuelmolla/BookPinion-API',
      liveUrl: 'https://bookpinion-api.onrender.com',
    },
    seo: { title: null, description: null, ogImage: null, canonicalUrl: null, noindex: false },
  },
  {
    slug: 'portfolio',
    previousSlugs: [],
    kind: 'software',
    title: 'This site',
    summary:
      'A server-rendered portfolio with a content model that any number of themes can render. The desktop theme here is the previous version of this site, rebuilt.',
    body: '',
    bodyFormat: 'markdown',
    problem: null,
    outcome: null,
    role: 'Designer & Developer',
    isGroup: false,
    teamSize: null,
    startDate: new Date('2025-06-25'),
    endDate: null,
    datePrecision: 'day',
    circa: false,
    dateOverride: null,
    lifecycle: 'active',
    status: 'published',
    publishedAt: new Date('2025-06-25'),
    featuredOrder: 6,
    techRefs: [T('nextjs'), T('typescript'), T('mongodb'), T('tailwind')],
    tags: ['side-project'],
    links: [
      { kind: 'repo', label: 'Repository', url: 'https://github.com/emanuelmolla/Portfolio' },
      { kind: 'live', label: 'Live', url: 'https://emanuelmolla.dev' },
    ],
    coverImage: {
      url: 'https://res.cloudinary.com/dbcdlkfty/image/upload/v1751948436/port_r5p04y.png',
      alt: 'The v1 portfolio rendered as a desktop, with app icons and a dock.',
      // Real pixel dimensions, read from the file rather than assumed.
      width: 1721,
      height: 1186,
      blurDataURL: null,
      caption: null,
    },
    mediaRefs: [],
    relatedPostRef: null,
    details: {
      kind: 'software',
      stack: ['Next.js', 'TypeScript', 'MongoDB', 'Tailwind CSS'],
      architectureNotes: null,
      repoUrl: 'https://github.com/emanuelmolla/Portfolio',
      liveUrl: 'https://emanuelmolla.dev',
    },
    seo: { title: null, description: null, ogImage: null, canonicalUrl: null, noindex: false },
  },
] as unknown as Work[]

export const seedExperience: Experience[] = [
  {
    slug: 'caracal',
    section: 'work',
    sortMode: 'date-desc',
    org: 'Caracal',
    role: 'Software Developer',
    location: null,
    // One entry, not three. The arrangement changed (part-time, then full-time
    // through the co-op term, then part-time again) but the employer and the
    // work did not. Splitting a continuous run into three rows makes a long
    // tenure read as three short jobs, which is strictly worse.
    employmentType: 'Part-time, full-time during co-op',
    url: null,
    startDate: new Date('2025-11-01'),
    endDate: null,
    current: true,
    summary: null,
    highlights: [],
    techRefs: [],
    links: [],
    order: 1,
    status: 'published',
  },
  {
    slug: 'bcit-cst',
    section: 'education',
    sortMode: 'date-desc',
    org: 'British Columbia Institute of Technology',
    role: 'Computer Systems Technology',
    location: 'Burnaby, BC',
    employmentType: null,
    url: 'https://www.bcit.ca',
    // January 2025, confirmed from his own post "Starting My Journey at BCIT".
    startDate: new Date('2025-01-01'),
    endDate: null,
    current: true,
    summary: null,
    highlights: [],
    techRefs: [],
    links: [],
    order: 2,
    status: 'published',
  },
  {
    slug: 'bahir-dar-university',
    section: 'education',
    sortMode: 'date-desc',
    org: 'Bahir Dar University',
    role: 'Studied in Ethiopia',
    location: 'Bahir Dar, Ethiopia',
    employmentType: null,
    url: null,
    startDate: null,
    endDate: null,
    current: false,
    summary: null,
    highlights: [],
    techRefs: [T('cpp')],
    links: [],
    order: 4,
    status: 'published',
  },
] as unknown as Experience[]

/**
 * Empty for now. /about, /work, /blog and /contact are core content kinds with
 * their own routes, so they are not Page rows. This collection is for the
 * genuinely arbitrary ones (/uses, /colophon, /now) which are added from the
 * admin without a deploy. That is the whole point of the collection existing.
 */
export const seedPages: Page[] = []

/**
 * Real posts, pulled from the live v1 API (api.emanuelmolla.dev/blogs/public)
 * on 2026-08-31. Bodies were `content: [String]` arrays of paragraphs; joining
 * with blank lines makes each a markdown paragraph, which is lossless for what
 * v1 could represent. Inline JSX anchors were converted to markdown links.
 *
 * Nothing here is written by anyone but Emanuel.
 */
export const seedPosts: Post[] = [
  {
    slug: "devnest",
    previousSlugs: [],
    title: "DevNest: My 6-Week Journey Building a Sprint Planner",
    excerpt: "Over 6 weeks and 4 iterations, I built DevNest, a sprint-based project management app designed for developers. What started as a simple task manager grew into a tool with JWT/",
    body: "Over 6 weeks and 4 iterations, I built **DevNest**, a sprint-based project management app designed for developers. What started as a simple task manager grew into a tool with **JWT/Auth0 authentication,** Markdown notes, and **Gemini API** integration for auto-generating sprint tasks and feature goals.\n\nThis project taught me to think more like an engineer, making system design decisions, structuring a database that could scale, and balancing frontend vs backend responsibilities. Just as importantly, I learned to accept user feedback and turn it into real improvements, which made DevNest better after each iteration.\n\nA big thank-you to everyone who tested and shared feedback, you helped shape this project into something I\u2019m proud of.\n\n\ud83d\udc49 Try it live: [https://devnest.molla.dev](https://devnest.molla.dev)",
    bodyFormat: 'markdown',
    coverImage: {
      url: "https://res.cloudinary.com/dbcdlkfty/image/upload/v1755934899/landing_hhto35.png",
      alt: "DevNest: My 6-Week Journey Building a Sprint Planner",
      // Real pixel dimensions, read from the file. v1 stored a bare URL
      // with no dimensions and the migration assumed 1200x630, which none
      // of these are: a wrong ratio causes exactly the layout shift the
      // required width/height exists to prevent.
      width: 1477,
      height: 793,
      blurDataURL: null,
      caption: null,
    },
    tags: [],
    status: 'published',
    publishedAt: new Date('2025-08-13T07:33:21.466Z'),
    readingMinutes: 1,
    featuredOrder: 1,
    relatedWorkRef: null,
    canonicalUrl: null,
    stats: { views: 49, likes: 27 },
    seo: { title: null, description: null, ogImage: null, canonicalUrl: null, noindex: false },
  },
  {
    slug: "scholiast-bcit-award",
    previousSlugs: [],
    title: "Scholiast: Winning at Innovation and Teamwork",
    excerpt: "June 30th was a huge day for our team, our project Scholiast officially made it into the BCIT spotlight.",
    body: "June 30th was a huge day for our team, our project *Scholiast* officially made it into the BCIT spotlight.\n\nWe were awarded **Most Innovative** and **Best Teamwork** out of all the student projects this term. Competing against some really talented teams, winning 2 out of 3 award categories was surreal.\n\nScholiast is a productivity-focused learning assistant. It transforms raw study materials into quizzes, flashcards, and structured summaries using active recall and spaced repetition. We built it from the ground up with React on the frontend and Express on the backend.\n\nPersonally, I focused heavily on the backend: designing RESTful API routes, managing database logic, and ensuring smooth communication between the client and server. It was my first time owning an entire backend module in a real group setting.\n\nWhat made this project so memorable wasn\u2019t just the tech, it was the team. Everyone pushed their limits, communicated well, and stayed committed till the last sprint. We weren\u2019t just coding, we were building something real together.\n\nScholiast taught me a lot about what it takes to work in a high-performing team, and I\u2019ll carry those lessons into every future project I touch.\n\nProject Demo: [https://youtu.be/aUjmIdcZkuk ](https://youtu.be/aUjmIdcZkuk)",
    bodyFormat: 'markdown',
    coverImage: {
      url: "https://res.cloudinary.com/dbcdlkfty/image/upload/v1752438250/bcit-news_mc0xee.png",
      alt: "Scholiast: Winning at Innovation and Teamwork",
      // Real pixel dimensions, read from the file. v1 stored a bare URL
      // with no dimensions and the migration assumed 1200x630, which none
      // of these are: a wrong ratio causes exactly the layout shift the
      // required width/height exists to prevent.
      width: 1648,
      height: 709,
      blurDataURL: null,
      caption: null,
    },
    tags: [],
    status: 'published',
    publishedAt: new Date('2025-06-30T20:19:02.936Z'),
    readingMinutes: 1,
    featuredOrder: 2,
    relatedWorkRef: null,
    canonicalUrl: null,
    stats: { views: 110, likes: 64 },
    seo: { title: null, description: null, ogImage: null, canonicalUrl: null, noindex: false },
  },
  {
    slug: "starting-my-journey-at-bcit-where-learning-gets-real",
    previousSlugs: [],
    title: "Starting My Journey at BCIT: Where Learning Gets Real",
    excerpt: "In January 2025, I began the Computer Systems Technology program at BCIT, and it\u2019s already been a game-changer.",
    body: "In January 2025, I began the Computer Systems Technology program at BCIT, and it\u2019s already been a game-changer.\n\nAfter years of theory and self-taught projects, I wanted something more practical. BCIT delivered. From day one, it\u2019s been about building real projects, working in teams, and solving problems that feel like actual industry work.\n\nThe program is fast-paced and intense, but that\u2019s what I love about it. Every deadline, bug, and group project is helping me grow into the developer I want to become.\n\nWhat really stands out is how the instructors focus on why things work, not just how to use them. You\u2019re expected to think deeply and take ownership of your learning, and that\u2019s exactly what I was looking for.\n\nThis is just the beginning, but I\u2019m already confident: I\u2019m in the right place.",
    bodyFormat: 'markdown',
    coverImage: {
      url: "https://res.cloudinary.com/dbcdlkfty/image/upload/v1752264749/bcit_blog_ywskd4.png",
      alt: "Starting My Journey at BCIT: Where Learning Gets Real",
      // Real pixel dimensions, read from the file. v1 stored a bare URL
      // with no dimensions and the migration assumed 1200x630, which none
      // of these are: a wrong ratio causes exactly the layout shift the
      // required width/height exists to prevent.
      width: 1949,
      height: 805,
      blurDataURL: null,
      caption: null,
    },
    tags: [],
    status: 'published',
    publishedAt: new Date('2025-02-11T19:57:18.859Z'),
    readingMinutes: 1,
    featuredOrder: null,
    relatedWorkRef: null,
    canonicalUrl: null,
    stats: { views: 66, likes: 46 },
    seo: { title: null, description: null, ogImage: null, canonicalUrl: null, noindex: false },
  },
] as unknown as Post[]
