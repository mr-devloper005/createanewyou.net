import Link from 'next/link'
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Download,
  FileText,
  Layers,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { getTaskConfig } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditablePostImage, postHref } from '@/editable/cards/PostCards'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { EditableReveal } from '@/editable/shell/EditableReveal'

/*
  Home sections — reference: visiomate.webflow.io.
  Section order: Hero → trusted metrics band → featured library grid →
  How it works → Feature showcase → Latest additions rail → CTA band.
  All framing centers on the Reference Library (renamed pdf task). No
  profile promotion, no profile cards.
*/

const REFERENCE_LIBRARY_LABEL = 'Reference Library'
const REFERENCE_ITEM_LABEL = 'reference'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

function getExcerpt(post?: SitePost | null, limit = 140) {
  const content =
    post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    post?.summary ||
    ''
  const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}…` : clean
}

function categoryOf(post?: SitePost | null) {
  const content =
    post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Guide'
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

/* -------------------------- HERO -------------------------- */
export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const feature = pool[0]
  const supporting = pool.slice(1, 4)
  const heroTitle =
    pagesContent.home.hero.title?.join(' ') ||
    `Everything worth referencing — in one calm ${REFERENCE_LIBRARY_LABEL}.`

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_-10%,var(--slot4-accent-soft)_0%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-[var(--slot4-warm-accent-soft)] opacity-70 blur-3xl"
      />

      <div className={`${dc.shell.section} relative pt-16 pb-14 sm:pt-24 sm:pb-20 lg:pt-28 lg:pb-24`}>
        <EditableReveal className="mx-auto max-w-4xl text-center" index={0}>
          <span className={dc.badge.accentPill}>
            <Sparkles className="h-3.5 w-3.5" />
            <span>{pagesContent.home.hero.badge || 'The reference-first way to research'}</span>
          </span>
          <h1 className={`${dc.type.heroTitle} mt-6 text-[var(--slot4-page-text)]`}>{heroTitle}</h1>
          <p className={`${dc.type.lead} mx-auto mt-6 max-w-2xl`}>
            {pagesContent.home.hero.description ||
              `Browse a growing ${REFERENCE_LIBRARY_LABEL} of guides, reports and downloadable references — thoughtfully organized, easy to cite, and quiet on the eyes.`}
          </p>

          <form action="/search" className="mx-auto mt-8 flex w-full max-w-xl items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white p-2 shadow-[0_20px_60px_rgba(105,80,232,0.14)]">
            <div className="flex flex-1 items-center gap-3 pl-4">
              <Search className="h-4 w-4 shrink-0 text-[var(--slot4-muted-text)]" />
              <input
                name="q"
                placeholder={
                  pagesContent.home.hero.searchPlaceholder || `Search the ${REFERENCE_LIBRARY_LABEL}`
                }
                className="w-full bg-transparent py-2.5 text-sm text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-muted-text)]"
              />
            </div>
            <button className={dc.button.primary}>Search</button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-[var(--slot4-muted-text)]">
            <span>Popular:</span>
            {['Guides', 'Reports', 'Playbooks', 'Frameworks'].map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="rounded-full border border-[var(--editable-border)] bg-white px-3 py-1 text-xs font-medium text-[var(--slot4-muted-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
              >
                {tag}
              </Link>
            ))}
          </div>
        </EditableReveal>

        {/* Hero preview mosaic (real dynamic posts, not stock) */}
        {feature ? (
          <EditableReveal
            className="relative mx-auto mt-14 grid max-w-6xl gap-4 sm:mt-20 sm:grid-cols-[1.55fr_1fr]"
            index={1}
          >
            <Link
              href={postHref(primaryTask, feature, primaryRoute)}
              className="group relative block overflow-hidden rounded-[2rem] border border-[var(--editable-border)] bg-white shadow-[0_30px_80px_rgba(105,80,232,0.16)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--slot4-media-bg)]">
                <img
                  src={getEditablePostImage(feature)}
                  alt={feature.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-[var(--slot4-accent)]">
                  <FileText className="h-3 w-3" /> {REFERENCE_LIBRARY_LABEL}
                </span>
              </div>
              <div className="p-6 sm:p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--slot4-accent)]">
                  Featured {REFERENCE_ITEM_LABEL} · {categoryOf(feature)}
                </p>
                <h3 className="editable-display mt-3 text-2xl font-medium leading-snug tracking-[-0.015em] sm:text-[1.75rem]">
                  {feature.title}
                </h3>
                <p className="mt-3 line-clamp-2 text-[15px] leading-6 text-[var(--slot4-muted-text)]">
                  {getExcerpt(feature, 180)}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--slot4-accent)]">
                  Open the reference <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>

            <div className="grid gap-4">
              {supporting.length ? (
                supporting.map((post) => (
                  <Link
                    key={post.id || post.slug}
                    href={postHref(primaryTask, post, primaryRoute)}
                    className="group flex items-center gap-4 rounded-2xl border border-[var(--editable-border)] bg-white p-4 transition duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(105,80,232,0.14)]"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--slot4-media-bg)]">
                      <img
                        src={getEditablePostImage(post)}
                        alt={post.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--slot4-accent)]">
                        {categoryOf(post)}
                      </p>
                      <h4 className="editable-display mt-1.5 line-clamp-2 text-base font-medium leading-snug tracking-[-0.005em]">
                        {post.title}
                      </h4>
                    </div>
                    <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-[var(--slot4-muted-text)] transition group-hover:text-[var(--slot4-accent)]" />
                  </Link>
                ))
              ) : null}
            </div>
          </EditableReveal>
        ) : null}
      </div>
    </section>
  )
}

/* ------------------ TRUSTED / STATS BAND ------------------ */
export function EditableStoryRail({ posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const total = pool.length
  const categories = Array.from(new Set(pool.map((post) => categoryOf(post)).filter(Boolean))).length

  const stats = [
    { value: total > 0 ? `${total}+` : '—', label: `Curated ${REFERENCE_ITEM_LABEL} entries` },
    { value: categories > 0 ? `${categories}` : '—', label: 'Topics & categories' },
    { value: '100%', label: 'Downloadable & citeable' },
    { value: '24/7', label: 'Open access — no wall' },
  ]

  return (
    <section className={`${dc.shell.section} ${dc.shell.sectionYSm}`}>
      <EditableReveal
        className="grid gap-8 rounded-[2rem] border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-8 sm:p-10 md:grid-cols-4"
      >
        {stats.map((stat, i) => (
          <EditableReveal
            key={stat.label}
            index={i}
            className="flex flex-col items-start"
          >
            <span className="editable-display text-4xl font-medium tracking-[-0.02em] text-[var(--slot4-accent)] sm:text-5xl">
              {stat.value}
            </span>
            <span className="mt-2 text-sm text-[var(--slot4-muted-text)]">{stat.label}</span>
          </EditableReveal>
        ))}
      </EditableReveal>
    </section>
  )
}

/* ------------------ FEATURED LIBRARY GRID ------------------ */
export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const items = pool.slice(0, 6)
  if (!items.length) return null

  return (
    <section className={`${dc.shell.section} ${dc.shell.sectionY}`}>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <EditableReveal className="max-w-2xl" index={0}>
          <span className={dc.badge.accentPill}>
            <BookOpen className="h-3.5 w-3.5" /> From the {REFERENCE_LIBRARY_LABEL}
          </span>
          <h2 className={`${dc.type.sectionTitle} mt-5`}>
            Picked references, ready to open.
          </h2>
          <p className={`${dc.type.lead} mt-4`}>
            A hand-picked shelf from the {REFERENCE_LIBRARY_LABEL} — fresh guides, evergreen reports, and
            frameworks worth bookmarking.
          </p>
        </EditableReveal>
        <EditableReveal index={1}>
          <Link href={primaryRoute} className={dc.button.outlinePrimary}>
            Browse the Library <ArrowUpRight className="h-4 w-4" />
          </Link>
        </EditableReveal>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((post, i) => (
          <EditableReveal key={post.id || post.slug} index={i}>
            <Link
              href={postHref(primaryTask, post, primaryRoute)}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--editable-border)] bg-white transition duration-500 hover:-translate-y-1 hover:border-[var(--slot4-accent)] hover:shadow-[0_28px_70px_rgba(105,80,232,0.18)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--slot4-media-bg)]">
                <img
                  src={getEditablePostImage(post)}
                  alt={post.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[var(--slot4-accent)]">
                  <FileText className="h-3 w-3" /> {categoryOf(post)}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="editable-display line-clamp-2 text-xl font-medium leading-snug tracking-[-0.01em]">
                  {post.title}
                </h3>
                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-[var(--slot4-muted-text)]">
                  {getExcerpt(post, 150)}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--slot4-accent)]">
                  Open reference
                  <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          </EditableReveal>
        ))}
      </div>
    </section>
  )
}

/* --------- HOW IT WORKS + FEATURE BAND + RAIL ---------- */
const howSteps = [
  {
    icon: Search,
    title: 'Search the shelf',
    body: `Use plain-language search across the ${REFERENCE_LIBRARY_LABEL} — filter by topic, format or category.`,
  },
  {
    icon: BookOpen,
    title: 'Open the reference',
    body: 'Read the full reference in-page. Every entry keeps a preview, a citation summary and a clean download.',
  },
  {
    icon: Download,
    title: 'Save, cite, reuse',
    body: 'Grab the file, copy the citation block, or link back — every reference stays open access.',
  },
]

const featureBenefits = [
  { icon: Layers, title: 'Organized by topic', body: 'Each category ships as its own shelf — no cross-noise.' },
  { icon: Zap, title: 'Fast, keyboard-first', body: 'Search, arrow keys, and open — no modal purgatory.' },
  { icon: Check, title: 'Open access', body: 'Every reference stays downloadable. No lock-ins, no walls.' },
  { icon: BookOpen, title: 'Cite-ready', body: 'Titles, categories and permalinks kept clean for citation.' },
]

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const rail = pool.slice(6, 14)

  return (
    <>
      {/* How it works */}
      <section className={`${dc.shell.section} ${dc.shell.sectionY}`}>
        <EditableReveal className="mx-auto max-w-3xl text-center" index={0}>
          <span className={dc.badge.accentPill}>
            <Sparkles className="h-3.5 w-3.5" /> How it works
          </span>
          <h2 className={`${dc.type.sectionTitle} mt-5`}>Three steps from question to reference.</h2>
          <p className={`${dc.type.lead} mx-auto mt-4 max-w-xl`}>
            A quiet workflow, designed to keep you close to the source and far from noise.
          </p>
        </EditableReveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {howSteps.map((step, i) => {
            const Icon = step.icon
            return (
              <EditableReveal key={step.title} index={i}>
                <div className="relative h-full rounded-3xl border border-[var(--editable-border)] bg-white p-8 transition duration-500 hover:-translate-y-1 hover:border-[var(--slot4-accent)] hover:shadow-[0_24px_60px_rgba(105,80,232,0.14)]">
                  <span className="absolute right-6 top-6 editable-display text-4xl font-medium text-[var(--slot4-accent-soft)]">
                    0{i + 1}
                  </span>
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="editable-display mt-6 text-xl font-medium tracking-[-0.01em]">{step.title}</h3>
                  <p className="mt-3 text-[15px] leading-6 text-[var(--slot4-muted-text)]">{step.body}</p>
                </div>
              </EditableReveal>
            )
          })}
        </div>
      </section>

      {/* Feature showcase — copy left, benefits right */}
      <section className={`${dc.shell.section} ${dc.shell.sectionY}`}>
        <div className="grid gap-12 rounded-[2rem] border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-8 sm:p-12 lg:grid-cols-[1.05fr_0.95fr]">
          <EditableReveal index={0}>
            <span className={dc.badge.accentPill}>
              <Layers className="h-3.5 w-3.5" /> Why the library
            </span>
            <h2 className={`${dc.type.sectionTitle} mt-5`}>
              A library that respects how you actually research.
            </h2>
            <p className={`${dc.type.lead} mt-4`}>
              References ordered by intent, not by upload date. Downloadable in one click. Cite-ready
              metadata baked into every entry. Built to help you finish, not scroll.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={primaryRoute} className={dc.button.primary}>
                Enter the library <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/about" className={dc.button.secondary}>
                What we curate
              </Link>
            </div>
          </EditableReveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {featureBenefits.map((b, i) => {
              const Icon = b.icon
              return (
                <EditableReveal key={b.title} index={i}>
                  <div className="h-full rounded-2xl border border-[var(--editable-border)] bg-white p-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h4 className="editable-display mt-4 text-[1.05rem] font-medium tracking-[-0.005em]">{b.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{b.body}</p>
                  </div>
                </EditableReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Latest additions rail */}
      {rail.length ? (
        <section className={`${dc.shell.section} ${dc.shell.sectionY}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <EditableReveal index={0}>
              <span className={dc.badge.accentPill}>Latest additions</span>
              <h2 className={`${dc.type.sectionTitle} mt-4`}>Recently added to the shelf.</h2>
            </EditableReveal>
            <EditableReveal index={1}>
              <Link href={primaryRoute} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--slot4-accent)]">
                View all <ArrowUpRight className="h-4 w-4" />
              </Link>
            </EditableReveal>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {rail.slice(0, 8).map((post, i) => (
              <EditableReveal key={post.id || post.slug} index={i}>
                <Link
                  href={postHref(primaryTask, post, primaryRoute)}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--editable-border)] bg-white transition duration-500 hover:-translate-y-1 hover:border-[var(--slot4-accent)] hover:shadow-[0_20px_50px_rgba(105,80,232,0.14)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--slot4-media-bg)]">
                    <img
                      src={getEditablePostImage(post)}
                      alt={post.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--slot4-accent)]">
                      {categoryOf(post)}
                    </p>
                    <h3 className="editable-display mt-2 line-clamp-2 flex-1 text-base font-medium leading-snug tracking-[-0.005em]">
                      {post.title}
                    </h3>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--slot4-accent)]">
                      Open <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </EditableReveal>
            ))}
          </div>
        </section>
      ) : null}
    </>
  )
}

/* --------------------- CTA BAND --------------------- */
export function EditableHomeCta() {
  const pdfTask = getTaskConfig('pdf')
  const pdfRoute = pdfTask?.enabled ? pdfTask.route : '/'
  return (
    <section className={`${dc.shell.section} ${dc.shell.sectionY}`}>
      <EditableReveal className="relative overflow-hidden rounded-[2.25rem] bg-[linear-gradient(135deg,#6950e8_0%,#8a76ff_60%,#fd9a57_140%)] p-10 text-center sm:p-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/12 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl">
          <span className="editable-label text-white/85">Start referencing today</span>
          <h2 className="editable-display mt-4 text-3xl leading-[1.08] tracking-[-0.02em] text-white sm:text-5xl">
            Ready to open the {REFERENCE_LIBRARY_LABEL}?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-white/85 sm:text-lg">
            Skim the shelf, save the ones you need, or contribute a reference of your own — the
            library is open by design.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href={pdfRoute}
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-[#3d2fa5] transition hover:brightness-95"
            >
              Enter the library <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/5 px-7 py-3.5 text-sm font-medium text-white transition hover:bg-white/12"
            >
              Contribute a reference
            </Link>
          </div>
        </div>
      </EditableReveal>
    </section>
  )
}
