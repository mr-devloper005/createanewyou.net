import Link from 'next/link'
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  Download,
  FileText,
  Globe,
  MapPin,
  Phone,
  Search,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) =>
  post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media)
    ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const images = Array.isArray(content.images)
    ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])]
    .filter(Boolean)
    .slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) =>
  asText(getContent(post).category) || post.tags?.[0] || fallback
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const getSummary = (post: SitePost) =>
  stripHtml(
    post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body)
  )
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const taskGrid: Record<TaskKey, string> = {
  article: 'grid gap-8 md:grid-cols-2 xl:grid-cols-3',
  listing: 'grid gap-6 lg:grid-cols-2',
  classified: 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3',
  image: 'columns-1 gap-6 [column-fill:_balance] sm:columns-2 xl:columns-3',
  sbm: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
  pdf: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
  profile: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

// Public-facing display labels (renamed per task). Only pdf is promoted
// publicly; other task labels are only relevant to their (non-public) archives.
const publicLabelForTask = (task: TaskKey, fallback: string) =>
  task === 'pdf' ? 'Reference Library' : task === 'profile' ? 'Contributor' : fallback

const cardBase =
  'group block rounded-3xl border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1.5 hover:border-[var(--tk-accent)] hover:shadow-[0_28px_70px_rgba(105,80,232,0.16)]'

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return (
    <TaskArchiveView
      task={task}
      posts={posts}
      pagination={pagination}
      category={category}
      basePath={basePath || taskConfig?.route || `/${task}`}
    />
  )
}

export function TaskArchiveView({
  task,
  posts,
  pagination,
  category,
  basePath,
}: {
  task: TaskKey
  posts: SitePost[]
  pagination: SiteFeedPagination
  category: string
  basePath: string
}) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = publicLabelForTask(task, taskConfig?.label || task)
  const categoryLabel =
    category === 'all'
      ? 'All categories'
      : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category

  return (
    <EditableSiteShell>
      <main
        style={taskThemeStyle(task)}
        className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]"
      >
        {/* Hero header ------------------------------------------------ */}
        <header className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_-20%,var(--tk-glow),transparent_65%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-[var(--slot4-warm-accent-soft)] opacity-70 blur-3xl"
          />
          <div className={`${dc.shell.section} relative pt-16 pb-14 sm:pt-24 sm:pb-16`}>
            <EditableReveal className="mx-auto max-w-4xl text-center" index={0}>
              <span className={dc.badge.accentPill}>
                <BookOpen className="h-3.5 w-3.5" /> {label}
              </span>
              <h1 className={`${dc.type.heroTitle} mt-6 text-balance text-[var(--tk-text)]`}>
                {task === 'pdf'
                  ? `The full ${label} — organized, downloadable, open access.`
                  : voice?.headline || `Browse ${label}`}
              </h1>
              <p className={`${dc.type.lead} mx-auto mt-5 max-w-2xl`}>
                {task === 'pdf'
                  ? `Every reference in one place — searchable by topic, previewable in-page, and free to cite or download.`
                  : voice?.description || theme.note}
              </p>
            </EditableReveal>

            {/* Header ad slot (Reference Library archive) */}
            {task === 'pdf' ? (
              <div className="mt-10">
                <Ads
                  slot="header"
                  size={pickRandom(getSlotSizes('header'))}
                  showLabel
                  className="mx-auto w-full max-w-3xl"
                />
              </div>
            ) : null}

            <EditableReveal
              className="mx-auto mt-10 flex max-w-4xl flex-col items-stretch gap-3 rounded-full border border-[var(--tk-line)] bg-white p-2 shadow-[0_20px_60px_rgba(105,80,232,0.14)] sm:flex-row sm:items-center"
              index={1}
            >
              <form action="/search" className="flex flex-1 items-center gap-3 rounded-full px-4 py-1.5">
                <Search className="h-4 w-4 shrink-0 text-[var(--tk-muted)]" />
                <input
                  name="q"
                  placeholder={`Search the ${label}`}
                  className="w-full bg-transparent py-2.5 text-sm text-[var(--tk-text)] outline-none placeholder:text-[var(--tk-muted)]"
                />
              </form>
              <form action={basePath} className="flex items-center gap-2 sm:pr-1.5">
                <div className="relative flex-1">
                  <select
                    name="category"
                    defaultValue={category}
                    className="h-11 w-full appearance-none rounded-full border border-[var(--tk-line)] bg-white pl-4 pr-10 text-sm font-medium text-[var(--tk-text)] outline-none transition focus:border-[var(--tk-accent)]"
                    aria-label={voice?.filterLabel || 'Filter category'}
                  >
                    <option value="all">All categories</option>
                    {CATEGORY_OPTIONS.map((item) => (
                      <option key={item.slug} value={item.slug}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                </div>
                <button className={dc.button.primary + ' !py-3'}>Apply</button>
              </form>
            </EditableReveal>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-[var(--tk-muted)]">
              <span className="font-semibold">{posts.length}</span>
              <span>·</span>
              <span>{categoryLabel}</span>
            </div>
          </div>
        </header>

        {/* Grid ------------------------------------------------------- */}
        <section className={`${dc.shell.section} ${dc.shell.sectionY}`}>
          {posts.length ? (
            <div className={taskGrid[task]}>
              {posts.map((post, index) => (
                <EditableReveal key={post.id || post.slug} index={index}>
                  <ArchivePostCard post={post} task={task} basePath={basePath} index={index} />
                </EditableReveal>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] px-8 py-16 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-[var(--tk-accent)]" />
              <h2 className="editable-display mt-5 text-2xl font-medium tracking-[-0.02em]">
                Nothing on the shelf yet
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--tk-muted)]">
                Try another category, or come back after new entries are added.
              </p>
            </div>
          )}

          {posts.length ? (
            <nav className="mt-16 flex items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? (
                <Link href={pageHref(basePath, category, page - 1)} className={dc.button.secondary}>
                  Previous
                </Link>
              ) : null}
              <span className="inline-flex items-center rounded-full border border-[var(--tk-line)] bg-white px-5 py-3 text-sm font-medium text-[var(--tk-muted)]">
                Page {page} of {pagination.totalPages || 1}
              </span>
              {pagination.hasNextPage ? (
                <Link href={pageHref(basePath, category, page + 1)} className={dc.button.primary}>
                  Next <ArrowUpRight className="h-4 w-4" />
                </Link>
              ) : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ArchivePostCard({
  post,
  task,
  basePath,
  index,
}: {
  post: SitePost
  task: TaskKey
  basePath: string
  index: number
}) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
}

function CardArrow({ label }: { label: string }) {
  return (
    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">
      {label}
      <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </span>
  )
}

/* ---- PDF (Reference Library) — public archive card ---- */
function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const category = getCategory(post, 'Reference')
  const fileSize = getField(post, ['fileSize', 'size', 'filesize'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-7`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
          <FileText className="h-7 w-7" />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--tk-muted)]">
          {category}
        </span>
      </div>
      <h2 className="editable-display mt-6 text-xl font-medium leading-snug tracking-[-0.01em]">
        {post.title}
      </h2>
      <p className="mt-3 line-clamp-3 flex-1 text-[15px] leading-6 text-[var(--tk-muted)]">
        {getSummary(post)}
      </p>
      <div className="mt-6 flex items-center justify-between border-t border-[var(--tk-line)] pt-5">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--tk-muted)]">
          <Download className="h-3.5 w-3.5" /> {fileSize || 'PDF'}
        </span>
        <CardArrow label="Open reference" />
      </div>
    </Link>
  )
}

/* ---- Other variants (unchanged public role, kept functional) ---- */

function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  const category = getCategory(post, 'Article')
  return (
    <Link href={href} className={`${cardBase} overflow-hidden`}>
      <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
      </div>
      <div className="p-6 sm:p-7">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--tk-accent)]">
          <span>{category}</span>
          <span className="text-[var(--tk-muted)]">· No. {String(index + 1).padStart(2, '0')}</span>
        </div>
        <h2 className="editable-display mt-3 text-xl font-medium leading-snug tracking-[-0.01em]">
          {post.title}
        </h2>
        <p className="mt-3 line-clamp-2 text-[15px] leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <CardArrow label="Read more" />
      </div>
    </Link>
  )
}

function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  return (
    <Link href={href} className={`${cardBase} flex items-center gap-5 p-6`}>
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {logo ? (
          <img src={logo} alt="" className="h-full w-full object-cover" />
        ) : (
          <BriefcaseBusiness className="h-9 w-9 text-[var(--tk-muted)]" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="editable-display truncate text-xl font-medium tracking-[-0.01em]">{post.title}</h2>
        <p className="mt-2 line-clamp-1 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-[var(--tk-muted)]">
          {location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}
            </span>
          ) : null}
          {phone ? (
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {phone}
            </span>
          ) : null}
          {website ? (
            <span className="inline-flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Website
            </span>
          ) : null}
        </div>
      </div>
      <ArrowUpRight className="h-5 w-5 shrink-0 text-[var(--tk-muted)] transition group-hover:text-[var(--tk-accent)]" />
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-7`}>
      <div className="flex items-start justify-between gap-4">
        <span className="editable-display text-3xl font-medium tracking-[-0.02em] text-[var(--tk-accent)]">
          {price || 'Open offer'}
        </span>
        {condition ? (
          <span className="rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--tk-accent)]">
            {condition}
          </span>
        ) : null}
      </div>
      <h2 className="editable-display mt-5 text-xl font-medium leading-snug tracking-[-0.01em]">
        {post.title}
      </h2>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <div className="mt-6 flex items-center justify-between border-t border-[var(--tk-line)] pt-4 text-xs font-medium text-[var(--tk-muted)]">
        <span className="inline-flex items-center gap-1.5">
          {location ? (
            <>
              <MapPin className="h-3.5 w-3.5" /> {location}
            </>
          ) : (
            'Details inside'
          )}
        </span>
        <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)] transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  return (
    <Link
      href={href}
      className="group mb-6 block break-inside-avoid overflow-hidden rounded-3xl border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-500 hover:-translate-y-1"
    >
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,0,0,0.72))] opacity-80" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h2 className="editable-display line-clamp-2 text-lg font-medium leading-snug tracking-[-0.01em] text-white">
            {post.title}
          </h2>
        </div>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <Link href={href} className={`${cardBase} flex gap-4 p-6`}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <Globe className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--tk-muted)]">
          Saved · {String(index + 1).padStart(2, '0')}
        </span>
        <h2 className="editable-display mt-1.5 text-lg font-medium leading-snug tracking-[-0.01em]">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        {website ? <p className="mt-3 truncate text-xs font-medium text-[var(--tk-accent)]">{cleanDomain(website)}</p> : null}
      </div>
    </Link>
  )
}

// Profile archive card is kept exported but is not surfaced by the public
// nav/footer/home/search. It only renders if someone lands on a profile
// archive URL directly.
function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col items-center p-7 text-center`}>
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
        {avatar ? (
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          <UserRound className="h-10 w-10 text-[var(--tk-muted)]" />
        )}
      </div>
      <h2 className="editable-display mt-5 text-lg font-medium tracking-[-0.01em]">{post.title}</h2>
      {role ? (
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--tk-accent)]">{role}</p>
      ) : null}
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
    </Link>
  )
}
