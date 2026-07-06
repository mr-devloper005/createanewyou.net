import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Building2,
  Check,
  Camera,
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Globe2,
  Hash,
  Layers,
  Link as LinkIcon,
  Mail,
  MapPin,
  Phone,
  Quote,
  ShieldCheck,
  Sparkles,
  Tag,
  UserRound,
} from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { taskThemeStyle } from '@/editable/theme/task-themes'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

async function fetchFileSize(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    if (!response.ok) return null
    const contentLength = response.headers.get('content-length')
    if (!contentLength) return null
    const bytes = parseInt(contentLength, 10)
    return formatBytes(bytes)
  } catch {
    return null
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateEditableDetailMetadata(
  task: TaskKey,
  params: Promise<{ slug?: string; username?: string }>
) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({
  task,
  params,
}: {
  task: TaskKey
  params: Promise<{ slug?: string; username?: string }>
}) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  // Profile detail's "contributions" strip links INTO the Reference Library —
  // fetch pdfs there instead of other profile posts so the tiles resolve.
  const relatedSource = task === 'profile' ? 'pdf' : task
  const related = (await fetchTaskPosts(relatedSource, 8))
    .filter((item) => item.slug !== post.slug)
    .slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  // Fetch real file size for PDF posts
  const fileUrl = (() => {
    const content = typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
    const url = content.fileUrl || content.pdfUrl || content.documentUrl || content.url
    return typeof url === 'string' ? url : ''
  })()
  const fileSize = task === 'pdf' && fileUrl ? await fetchFileSize(fileUrl) : null
  return <TaskDetailView task={task} post={post} related={related} comments={comments} fileSize={fileSize} />
}

const getContent = (post: SitePost) =>
  post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media)
    ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const images = Array.isArray(content.images)
    ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar']
    .map((key) => asText(content[key]))
    .filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return (
    asText(content.body) ||
    asText(content.description) ||
    asText(content.details) ||
    post.summary ||
    'Details will appear here once available.'
  )
}

/* ---------- HTML sanitization ---------- */
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const safeUrl = (value: string) => (/^https?:\/\//i.test(value) ? value : '#')

const linkifyMarkdown = (value: string) =>
  value.replace(
    /\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi,
    (_m, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`
  )

const linkifyText = (value: string) =>
  linkifyMarkdown(value).replace(
    /(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi,
    (_m, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`
  )

const hardenLinks = (html: string) =>
  html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_m, attrs) => {
    let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    if (!/\starget=/i.test(next)) next += ' target="_blank"'
    if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
    return `<a ${next}>`
  })

const sanitizeHtml = (html: string) =>
  hardenLinks(
    html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"')
  )

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const summaryText = (post: SitePost) =>
  post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) =>
  asText(getContent(post).category) || post.tags?.[0] || fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng)
    return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

// Renamed public label (pdf → Reference Library). Profile label is only used
// inside the profile detail page itself, never elsewhere.
const REFERENCE_LIBRARY = 'Reference Library'
const REFERENCE_ITEM = 'Reference document'
const CONTRIBUTOR = 'Contributor'

export function TaskDetailView({
  task,
  post,
  related,
  comments = [],
  fileSize,
}: {
  task: TaskKey
  post: SitePost
  related: SitePost[]
  comments?: Array<{ id: string; name: string; comment: string; createdAt: string }>
  fileSize?: string | null
}) {
  return (
    <EditableSiteShell>
      <main
        style={taskThemeStyle(task)}
        className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]"
      >
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} fileSize={fileSize} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? (
          <ArticleDetail post={post} related={related} comments={comments} />
        ) : null}
      </main>
    </EditableSiteShell>
  )
}

/* --------------------------- Shared bits --------------------------- */

function BackLink({ task, label }: { task: TaskKey; label?: string }) {
  const taskConfig = getTaskConfig(task)
  const to = task === 'profile' ? '/' : taskConfig?.route || '/'
  return (
    <Link
      href={to}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-muted)] transition hover:text-[var(--tk-accent)]"
    >
      <ArrowLeft className="h-4 w-4" /> {label || `Back to ${task === 'pdf' ? REFERENCE_LIBRARY : 'home'}`}
    </Link>
  )
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-8 max-w-none text-[var(--tk-text)] ${
        compact ? 'text-[15px] leading-7' : 'text-[1.0625rem] leading-8'
      }`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function TagChips({ post }: { post: SitePost }) {
  const tags = Array.isArray(post.tags) ? post.tags.filter(Boolean).slice(0, 8) : []
  if (!tags.length) return null
  return (
    <div className="mt-8 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-[var(--tk-line)] bg-white px-3.5 py-1.5 text-xs font-medium text-[var(--tk-muted)]"
        >
          #{tag}
        </span>
      ))}
    </div>
  )
}

function InfoRow({
  Icon,
  label,
  value,
  href,
}: {
  Icon: typeof MapPin
  label: string
  value: string
  href?: string
}) {
  const inner = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--tk-muted)]">
          {label}
        </span>
        <span className="mt-0.5 block break-words text-sm font-medium leading-[1.45] text-[var(--tk-text)] [overflow-wrap:anywhere]">
          {value}
        </span>
      </span>
    </>
  )
  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noreferrer' : undefined}
        className="flex min-w-0 items-start gap-3 rounded-2xl border border-[var(--tk-line)] bg-white p-3 transition hover:border-[var(--tk-accent)]"
      >
        {inner}
      </a>
    )
  }
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-[var(--tk-line)] bg-white p-3">
      {inner}
    </div>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--tk-line)] bg-white">
      <div className="flex items-center gap-2 p-4 text-sm font-medium">
        <MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {label || 'Location'}
      </div>
      <iframe src={src} title="Map" loading="lazy" className="h-72 w-full border-0" />
    </div>
  )
}

function TrustPanel() {
  const items = [
    { icon: ShieldCheck, label: 'Verified contributor' },
    { icon: CheckCircle2, label: 'Direct contact' },
    { icon: Check, label: 'Curated & moderated' },
  ]
  return (
    <div className="rounded-3xl border border-[var(--tk-line)] bg-white p-6">
      <p className="editable-label text-[var(--tk-muted)]">Trust</p>
      <div className="mt-4 grid gap-3">
        {items.map((it) => {
          const Icon = it.icon
          return (
            <div key={it.label} className="flex items-center gap-3 text-sm font-medium text-[var(--tk-text)]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
                <Icon className="h-4 w-4" />
              </span>
              {it.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* --------------------------- PDF (public) --------------------------- */
/*
  Focus-Reader layout for the Reference Library detail page.

  Structure (top to bottom):
   1. Full-bleed hero band on a soft-purple wash — two columns:
      copy stack on the left, floating document card on the right.
   2. Reading-time / stats meta row baked into the hero.
   3. Full-width preview shell with jump-nav chrome bar + tall iframe.
   4. Info triptych — About / What's inside / How to cite (with a plain
      selectable citation block).
   5. Editorial reader body with drop-cap first letter + tag chips.
   6. article-bottom ad slot (per placement rules).
   7. Horizontal snap rail of related references (not a grid).
   8. Bottom download strip on a purple→orange gradient.
*/
function PdfDetail({ post, related, fileSize }: { post: SitePost; related: SitePost[]; fileSize?: string | null }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  const category = categoryOf(post, 'General')
  const pages = getField(post, ['pages', 'pageCount'])
  const sizeFromPost = getField(post, ['fileSize', 'size', 'filesize'])
  const size = fileSize || sizeFromPost
  const uploadedBy = getField(post, ['author', 'uploader', 'submittedBy'])
  const author = uploadedBy || SITE_CONFIG.name
  const lead = leadText(post)
  const filename = `${(post.slug || post.title || 'reference').toLowerCase().replace(/\s+/g, '-')}.pdf`
  const outline = (() => {
    const content = getContent(post)
    const raw = content.outline || content.sections || content.contents
    if (Array.isArray(raw))
      return raw.filter((v): v is string => typeof v === 'string' && v.trim().length > 0).slice(0, 6)
    return [
      'Executive summary',
      'Key findings',
      'Methodology & sources',
      'Practical takeaways',
      'Cite & reuse',
    ]
  })()

  // Rough reading time — pages when known, else derived from body length.
  const readingMinutes = (() => {
    const p = Number(pages)
    if (p > 0) return Math.max(2, Math.round(p * 2))
    const words = stripHtml(getBody(post)).split(/\s+/).length
    return Math.max(2, Math.round(words / 220))
  })()

  const shortDescription =
    lead || stripHtml(getBody(post)).slice(0, 220) + (stripHtml(getBody(post)).length > 220 ? '…' : '')

  // Static plain-text citation the user can select and copy manually.
  const citation = `${author}. ${post.title}. ${SITE_CONFIG.name} Reference Library.`
  const citationUrl = `${SITE_CONFIG.baseUrl.replace(/\/$/, '')}${getTaskConfig('pdf')?.route || '/pdf'}/${post.slug}`

  return (
    <>
      {/* ============ 1. Hero band (soft purple wash) ============ */}
      <section className="relative overflow-hidden bg-[var(--tk-raised)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_15%_0%,rgba(105,80,232,0.18),transparent_60%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-16 h-72 w-72 rounded-full bg-[var(--slot4-warm-accent-soft)] opacity-60 blur-3xl"
        />
        <div className={`${dc.shell.section} relative pt-10 pb-16 sm:pt-14 sm:pb-24`}>
          <BackLink task="pdf" label={`Back to the ${REFERENCE_LIBRARY}`} />

          <div className="mt-10 grid gap-12 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
            {/* Left: title stack -------------------------------- */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="editable-label rounded-full border border-[var(--tk-line)] bg-white px-3 py-1 text-[var(--tk-muted)]">
                  {REFERENCE_ITEM}
                </span>
                <span className="rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--tk-accent)]">
                  PDF
                </span>
                <span className="rounded-full border border-[var(--tk-line)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--tk-muted)]">
                  {category}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--tk-muted)]">
                  <Clock3 className="h-3 w-3" /> {readingMinutes} min read
                </span>
              </div>

              <h1 className="editable-display mt-8 text-balance text-4xl font-medium leading-[1.02] tracking-[-0.025em] sm:text-5xl lg:text-[4.25rem]">
                {post.title}
              </h1>

              {lead ? (
                <p className="editable-display mt-8 max-w-3xl text-[1.25rem] font-normal leading-[1.5] tracking-[-0.005em] text-[var(--tk-muted)] sm:text-[1.4rem]">
                  <Quote className="mr-2 -mt-1 inline h-5 w-5 text-[var(--tk-accent)]" />
                  {lead}
                </p>
              ) : null}

              <div className="mt-10 flex flex-wrap items-center gap-3">
                {fileUrl ? (
                  <Link href={fileUrl} target="_blank" rel="noreferrer" className={dc.button.primary}>
                    Download reference <Download className="h-4 w-4" />
                  </Link>
                ) : null}
                {fileUrl ? (
                  <Link href={fileUrl} target="_blank" rel="noreferrer" className={dc.button.secondary}>
                    Open in new tab <ExternalLink className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>

              <TagChips post={post} />
            </div>

            {/* Right: floating document card -------------------- */}
            <aside className="relative">
              <div
                aria-hidden
                className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-[conic-gradient(from_120deg_at_50%_50%,rgba(105,80,232,0.16),rgba(253,154,87,0.12),transparent_70%)] blur-2xl"
              />
              <div className="relative rotate-[-1.5deg] rounded-[2rem] border border-[var(--tk-line)] bg-white p-6 shadow-[0_36px_80px_rgba(16,24,40,0.14)] sm:p-8">
                {/* Doc glyph card ------------------------------- */}
                <div className="relative overflow-hidden rounded-2xl bg-[var(--tk-accent-soft)] p-8">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-6 top-6 grid grid-cols-1 gap-1.5 opacity-40"
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <span
                        key={i}
                        className="block h-1 rounded-full bg-[var(--tk-accent)]"
                        style={{ width: `${100 - i * 8}%` }}
                      />
                    ))}
                  </div>
                  <div className="relative flex items-center justify-center py-6">
                    <FileText className="h-24 w-24 text-[var(--tk-accent)]" strokeWidth={1.25} />
                  </div>
                </div>
                {/* Filename + stats ----------------------------- */}
                <div className="mt-6">
                  <p className="editable-label text-[var(--tk-muted)]">File</p>
                  <p className="mt-1.5 truncate font-mono text-[13px] font-medium text-[var(--tk-text)]">
                    {filename}
                  </p>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-2 border-t border-[var(--tk-line)] pt-5 text-center">
                  {[
                    
                    ['Size', size || '—'],
                    ['Read', `${readingMinutes} min`],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-[var(--tk-raised)] px-2 py-3">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--tk-muted)]">
                        {k}
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-[var(--tk-text)]">{v}</dd>
                    </div>
                  ))}
                </dl>
                {fileUrl ? (
                  <Link
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`${dc.button.primary} mt-5 w-full`}
                  >
                    Download <Download className="h-4 w-4" />
                  </Link>
                ) : null}
                <div className="mt-5 flex items-center gap-3 border-t border-[var(--tk-line)] pt-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
                    <UserRound className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--tk-muted)]">
                      Contributed by
                    </p>
                    <p className="truncate text-sm font-medium text-[var(--tk-text)]">{author}</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ============ 2. Preview shell (full-width) ============ */}
      <section className={`${dc.shell.section} -mt-10 sm:-mt-14`}>
        {fileUrl ? (
          <div className="overflow-hidden rounded-[2rem] border border-[var(--tk-line)] bg-white shadow-[0_30px_80px_rgba(16,24,40,0.12)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--tk-line)] bg-[var(--tk-raised)] px-5 py-3 sm:px-7">
              <div className="flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[var(--tk-accent)]">
                  <FileText className="h-4 w-4" />
                </span>
                <span className="editable-label text-[var(--tk-muted)]">Reference preview</span>
                <span className="hidden text-xs text-[var(--tk-muted)] sm:inline">·</span>
                <nav className="hidden items-center gap-3 text-xs font-medium text-[var(--tk-muted)] sm:flex">
                  <a href="#about" className="transition hover:text-[var(--tk-accent)]">About</a>
                  <span aria-hidden>·</span>
                  <a href="#inside" className="transition hover:text-[var(--tk-accent)]">Sections</a>
                  <span aria-hidden></span>
                  
                </nav>
              </div>
              <Link
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-xs font-medium text-[var(--tk-on-accent)] transition hover:brightness-95"
              >
                Download <Download className="h-3.5 w-3.5" />
              </Link>
            </div>
            <iframe
              src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              title={post.title}
              className="h-[85vh] w-full bg-[var(--tk-raised)]"
            />
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-[var(--tk-line)] bg-white p-16 text-center">
            <FileText className="mx-auto h-10 w-10 text-[var(--tk-muted)]" />
            <p className="mt-5 text-sm text-[var(--tk-muted)]">
              Preview will appear once the file is attached.
            </p>
          </div>
        )}
      </section>

      {/* ============ 3. Info triptych ============ */}
      <section className={`${dc.shell.section} ${dc.shell.sectionY}`}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* About ------------------------------------------------- */}
          <div id="about" className="rounded-3xl border border-[var(--tk-line)] bg-white p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="editable-label text-[var(--tk-muted)]">About this reference</span>
            </div>
            <p className="mt-5 text-[15px] leading-[1.7] text-[var(--tk-text)]">
              {shortDescription || 'A curated reference from the shared Reference Library.'}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-[var(--tk-raised)] px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--tk-muted)]">
                  Category
                </p>
                <p className="mt-0.5 truncate font-medium text-[var(--tk-text)]">{category}</p>
              </div>
              <div className="rounded-xl bg-[var(--tk-raised)] px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--tk-muted)]">
                  Format
                </p>
                <p className="mt-0.5 font-medium text-[var(--tk-text)]">PDF</p>
              </div>
            </div>
          </div>

          {/* Inside ------------------------------------------------ */}
          <div id="inside" className="rounded-3xl border border-[var(--tk-line)] bg-white p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
                <Layers className="h-5 w-5" />
              </span>
              <span className="editable-label text-[var(--tk-muted)]">What&apos;s inside</span>
            </div>
            <ol className="mt-5 space-y-3 text-sm">
              {outline.map((entry, i) => (
                <li key={`inside-${i}`} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[10px] font-semibold text-[var(--tk-accent)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="leading-6 text-[var(--tk-text)]">{entry}</span>
                </li>
              ))}
            </ol>
          </div>

         
        </div>
      </section>

      {/* ============ 4. Editorial reader body ============ */}
      <section className={`${dc.shell.section} ${dc.shell.sectionY}`}>
        <div className="mx-auto max-w-3xl">
          <span className={dc.badge.accentPill}>
            <BookOpen className="h-3.5 w-3.5" /> The full reference
          </span>
          <h2 className="editable-display mt-5 text-3xl font-medium leading-[1.1] tracking-[-0.015em] sm:text-4xl">
            Inside this reference
          </h2>
          <p className="mt-4 text-sm text-[var(--tk-muted)]">
            A written companion to the preview above — key ideas summarized for scanning.
          </p>
          {/* Drop-cap on the first paragraph of the sanitized body */}
          <div className="[&_.article-content>p:first-of-type]:first-letter:float-left [&_.article-content>p:first-of-type]:first-letter:mr-3 [&_.article-content>p:first-of-type]:first-letter:pt-1 [&_.article-content>p:first-of-type]:first-letter:text-[3.75rem] [&_.article-content>p:first-of-type]:first-letter:font-medium [&_.article-content>p:first-of-type]:first-letter:leading-[0.85] [&_.article-content>p:first-of-type]:first-letter:text-[var(--tk-accent)]">
            <BodyContent post={post} />
          </div>
        </div>

        {/* Article-bottom ad (per placement rules) */}
        <div className="mx-auto mt-16 max-w-3xl">
          <Ads
            slot="article-bottom"
            size={pickRandom(getSlotSizes('article-bottom'))}
            showLabel
            className="mx-auto w-full"
          />
        </div>
      </section>

      {/* ============ 5. Related shelf — snap rail ============ */}
      {related.length ? (
        <section className={`${dc.shell.section} ${dc.shell.sectionY}`}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="editable-label text-[var(--tk-accent)]">More from the shelf</p>
              <h2 className="editable-display mt-3 text-3xl font-medium tracking-[-0.015em] sm:text-4xl">
                Related references
              </h2>
            </div>
            <Link
              href={getTaskConfig('pdf')?.route || '/'}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]"
            >
              View all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative mt-8 -mx-5 sm:-mx-8 lg:-mx-10">
            <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:px-8 lg:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {related.map((item, i) => (
                <PdfRelatedTile key={item.id || item.slug} post={item} index={i} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ 6. Bottom download strip ============ */}
      {fileUrl ? (
        <section className={`${dc.shell.section} pb-16 sm:pb-24`}>
          <div className="relative overflow-hidden rounded-[2.25rem] bg-[linear-gradient(135deg,#6950e8_0%,#8a76ff_60%,#fd9a57_140%)] p-8 sm:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/12 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            />
            <div className="relative flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
              <div className="max-w-2xl text-white">
                <span className="editable-label text-white/85">Ready to use it?</span>
                <h3 className="editable-display mt-3 text-2xl font-medium leading-[1.15] tracking-[-0.01em] sm:text-3xl md:text-4xl">
                  Download the full reference and cite it in your work.
                </h3>
                <p className="mt-4 flex items-center gap-2 text-sm text-white/85">
                  <UserRound className="h-4 w-4" /> Contributed by {author}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-medium text-[#3d2fa5] transition hover:brightness-95"
                >
                  Download reference <Download className="h-4 w-4" />
                </Link>
                <Link
                  href={getTaskConfig('pdf')?.route || '/'}
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/5 px-6 py-4 text-sm font-medium text-white transition hover:bg-white/12"
                >
                  Browse the {REFERENCE_LIBRARY} <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}

function PdfRelatedTile({ post, index = 0 }: { post: SitePost; index?: number }) {
  const href = `${getTaskConfig('pdf')?.route || '/pdf'}/${post.slug}`
  const size = getField(post, ['fileSize', 'size', 'filesize'])
  const cat = categoryOf(post, 'Reference')
  return (
    <Link
      href={href}
      className="group flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-[var(--tk-line)] bg-white transition duration-500 hover:-translate-y-1 hover:border-[var(--tk-accent)] hover:shadow-[0_24px_60px_rgba(105,80,232,0.16)] sm:w-[320px]"
    >
      {/* Cover slot — colored FileText glyph on tinted panel */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--tk-accent-soft)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-8 grid grid-cols-1 gap-1.5 opacity-40"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="block h-1 rounded-full bg-[var(--tk-accent)]"
              style={{ width: `${100 - i * 10}%` }}
            />
          ))}
        </div>
        <div className="relative flex h-full items-center justify-center">
          <FileText className="h-14 w-14 text-[var(--tk-accent)]" strokeWidth={1.25} />
        </div>
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--tk-accent)]">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--tk-accent)]">
          {cat}
        </p>
        <h3 className="editable-display mt-2 line-clamp-2 flex-1 text-[15px] font-medium leading-snug tracking-[-0.005em]">
          {post.title}
        </h3>
        <div className="mt-5 flex items-center justify-between text-xs text-[var(--tk-muted)]">
          <span className="rounded-full bg-[var(--tk-accent-soft)] px-2.5 py-1 font-semibold text-[var(--tk-accent)]">
            {size || 'PDF'}
          </span>
          <ArrowUpRight className="h-4 w-4 transition group-hover:text-[var(--tk-accent)]" />
        </div>
      </div>
    </Link>
  )
}

/* --------------------- Profile (direct-URL only) --------------------- */
function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const avatar = images[0]
  const role = getField(post, ['role', 'designation', 'company'])
  const location = getField(post, ['location', 'city', 'address'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const linkedin = getField(post, ['linkedin', 'linkedinUrl'])
  const twitter = getField(post, ['twitter', 'twitterUrl'])
  const github = getField(post, ['github', 'githubUrl'])
  const lead = leadText(post)
  const mapSrc = mapSrcFor(post)
  const verified = Boolean(getField(post, ['verified', 'isVerified'])) || post.tags?.includes?.('verified') === true

  return (
    <>
      {/* Hero band with avatar + display-scale name */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_-20%,var(--tk-glow),transparent_60%)]"
        />
        <div className={`${dc.shell.section} relative pt-14 pb-10 sm:pt-20 sm:pb-14`}>
          <BackLink task="profile" label="Back to home" />

          <div className="mt-10 flex flex-col items-center gap-8 text-center">
            <div className="relative">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[var(--tk-raised)] shadow-[0_20px_50px_rgba(105,80,232,0.24)] sm:h-40 sm:w-40">
                {avatar ? (
                  <img src={avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="h-16 w-16 text-[var(--tk-muted)]" />
                )}
              </div>
              {verified ? (
                <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--tk-accent)] text-white shadow-md">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
              ) : null}
            </div>

            <div>
              <span className={dc.badge.accentPill}>
                <UserRound className="h-3.5 w-3.5" /> {CONTRIBUTOR}
              </span>
              <h1 className="editable-display mt-5 text-balance text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-[3.5rem]">
                {post.title}
              </h1>
              {role ? (
                <p className="mt-3 text-lg font-medium text-[var(--tk-muted)]">{role}</p>
              ) : null}
            </div>

            {lead ? (
              <p className={`${dc.type.lead} mx-auto max-w-2xl`}>{lead}</p>
            ) : null}

            {/* Quick facts strip */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[var(--tk-muted)]">
              {location ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] bg-white px-3.5 py-1.5 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}
                </span>
              ) : null}
              {role ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] bg-white px-3.5 py-1.5 font-medium">
                  <Building2 className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {role}
                </span>
              ) : null}
              {(website || linkedin || twitter || github) ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] bg-white px-3.5 py-1.5 font-medium">
                  <LinkIcon className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Links
                </span>
              ) : null}
              {verified ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tk-line)] bg-white px-3.5 py-1.5 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Verified
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Two-column body ------------------------------------------- */}
      <section className={`${dc.shell.section} py-8 sm:py-12`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="min-w-0">
            <h2 className="editable-display text-3xl font-medium leading-[1.1] tracking-[-0.015em] sm:text-4xl">
              About the {CONTRIBUTOR.toLowerCase()}
            </h2>
            <BodyContent post={post} />
            <TagChips post={post} />

            {/* Their contributions → link INTO Reference Library, never other profiles */}
            {related.length ? (
              <div className="mt-14 rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-raised)] p-8">
                <p className="editable-label text-[var(--tk-accent)]">Contributions</p>
                <h3 className="editable-display mt-3 text-2xl font-medium tracking-[-0.015em] sm:text-[1.75rem]">
                  From this {CONTRIBUTOR.toLowerCase()} in the {REFERENCE_LIBRARY}
                </h3>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {related.slice(0, 4).map((item) => (
                    <Link
                      key={item.id || item.slug}
                      href={`${getTaskConfig('pdf')?.route || '/pdf'}/${item.slug}`}
                      className="group flex items-center gap-4 rounded-2xl border border-[var(--tk-line)] bg-white p-4 transition duration-500 hover:-translate-y-1 hover:border-[var(--tk-accent)]"
                    >
                      <span className="editable-display flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
                        <FileText className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <h4 className="editable-display line-clamp-2 text-sm font-medium leading-snug tracking-[-0.005em]">
                          {item.title}
                        </h4>
                        <p className="mt-1 truncate text-xs text-[var(--tk-muted)]">Open in the {REFERENCE_LIBRARY}</p>
                      </div>
                      <ArrowUpRight className="ml-auto h-4 w-4 text-[var(--tk-muted)] transition group-hover:text-[var(--tk-accent)]" />
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {mapSrc ? <div className="mt-12"><MapBox src={mapSrc} label={location || post.title} /></div> : null}
          </article>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Contact card */}
            <div className="rounded-3xl border border-[var(--tk-line)] bg-white p-7">
              <p className="editable-label text-[var(--tk-muted)]">Reach out</p>
              <div className="mt-5 grid gap-3">
                {location ? <InfoRow Icon={MapPin} label="Location" value={location} /> : null}
                {phone ? <InfoRow Icon={Phone} label="Phone" value={phone} href={`tel:${phone}`} /> : null}
                {email ? <InfoRow Icon={Mail} label="Email" value={email} href={`mailto:${email}`} /> : null}
                {website ? (
                  <InfoRow Icon={Globe2} label="Website" value={website} href={website} />
                ) : null}
                {linkedin ? <InfoRow Icon={LinkIcon} label="LinkedIn" value={linkedin} href={linkedin} /> : null}
                {twitter ? <InfoRow Icon={LinkIcon} label="Twitter" value={twitter} href={twitter} /> : null}
                {github ? <InfoRow Icon={LinkIcon} label="GitHub" value={github} href={github} /> : null}
              </div>

              {website ? (
                <Link
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className={`${dc.button.primary} mt-6 w-full`}
                >
                  Visit website <ArrowUpRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>

            <TrustPanel />

            {/* Profile detail sidebar ad slot */}
            <Ads
              slot="sidebar"
              size={pickRandom(getSlotSizes('sidebar'))}
              showLabel
              className="mx-auto w-full"
            />
          </aside>
        </div>
      </section>
    </>
  )
}

/* --------------------- Article (quiet reading column) --------------------- */
function ArticleDetail({
  post,
  related,
  comments,
}: {
  post: SitePost
  related: SitePost[]
  comments: Array<{ id: string; name: string; comment: string; createdAt: string }>
}) {
  const images = getImages(post)
  return (
    <>
      <article className="mx-auto max-w-4xl px-5 py-14 sm:px-6 sm:py-20">
        <BackLink task="article" />
        <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--tk-accent)]">
          {categoryOf(post, 'Article')}
        </p>
        <h1 className="editable-display mt-5 text-balance text-4xl font-medium leading-[1.06] tracking-[-0.02em] sm:text-5xl lg:text-[3.4rem]">
          {post.title}
        </h1>
        <div className="mt-4 text-sm text-[var(--tk-muted)]">{SITE_CONFIG.name}</div>
        {images[0] ? (
          <img
            src={images[0]}
            alt=""
            className="mt-10 aspect-[16/9] w-full rounded-3xl border border-[var(--tk-line)] object-cover"
          />
        ) : null}
        <BodyContent post={post} />
        <TagChips post={post} />
        <EditableArticleComments slug={post.slug} comments={comments} />
      </article>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

/* ---------- Listing / classified / image / sbm — internal only ---------- */

function ListingDetail({ post, related: _related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const logo = images[0]
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const mapSrc = mapSrcFor(post)
  return (
    <section className={`${dc.shell.section} py-14 sm:py-20`}>
      <BackLink task="listing" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="min-w-0">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-[var(--tk-line)] bg-[var(--tk-raised)]">
              {logo ? (
                <img src={logo} alt="" className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-10 w-10 text-[var(--tk-muted)]" />
              )}
            </div>
            <div className="min-w-0">
              <span className={dc.badge.accentPill}>Directory</span>
              <h1 className="editable-display mt-4 text-3xl font-medium leading-[1.05] tracking-[-0.015em] sm:text-4xl">
                {post.title}
              </h1>
            </div>
          </div>
          {leadText(post) ? (
            <p className={`${dc.type.lead} mt-7 max-w-2xl`}>{leadText(post)}</p>
          ) : null}
          <BodyContent post={post} />
          <TagChips post={post} />
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
          <div className="rounded-3xl border border-[var(--tk-line)] bg-white p-6">
            <p className="editable-label text-[var(--tk-muted)]">Reach out</p>
            <div className="mt-4 grid gap-3">
              {address ? <InfoRow Icon={MapPin} label="Address" value={address} /> : null}
              {phone ? <InfoRow Icon={Phone} label="Phone" value={phone} href={`tel:${phone}`} /> : null}
              {email ? <InfoRow Icon={Mail} label="Email" value={email} href={`mailto:${email}`} /> : null}
              {website ? <InfoRow Icon={Globe2} label="Website" value={website} href={website} /> : null}
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

function ClassifiedDetail({ post, related: _related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  return (
    <section className={`${dc.shell.section} py-14 sm:py-20`}>
      <BackLink task="classified" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-[var(--tk-line)] bg-white p-7 shadow-[0_20px_50px_rgba(105,80,232,0.12)]">
            <span className={dc.badge.accentPill}>Notice</span>
            <h1 className="editable-display mt-4 text-2xl font-medium leading-tight tracking-[-0.01em]">
              {post.title}
            </h1>
            <p className="editable-display mt-6 text-4xl font-medium tracking-[-0.02em] text-[var(--tk-accent)]">
              {price || 'Open offer'}
            </p>
            {location ? (
              <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-[var(--tk-muted)]">
                <MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {location}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              {phone ? (
                <a href={`tel:${phone}`} className={dc.button.primary}>
                  <Phone className="h-4 w-4" /> Call
                </a>
              ) : null}
              {email ? (
                <a href={`mailto:${email}`} className={dc.button.secondary}>
                  <Mail className="h-4 w-4" /> Email
                </a>
              ) : null}
            </div>
          </div>
        </aside>
        <article className="min-w-0">
          {images[0] ? (
            <img
              src={images[0]}
              alt=""
              className="aspect-[16/10] w-full rounded-3xl border border-[var(--tk-line)] object-cover"
            />
          ) : null}
          <BodyContent post={post} />
          <TagChips post={post} />
        </article>
      </div>
    </section>
  )
}

function ImageDetail({ post, related: _related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <section className={`${dc.shell.section} py-14 sm:py-20`}>
      <BackLink task="image" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2">
          {gallery.map((image, index) => (
            <figure
              key={`${image}-${index}`}
              className="mb-5 break-inside-avoid overflow-hidden rounded-3xl border border-[var(--tk-line)] bg-white"
            >
              <img src={image} alt="" className="w-full object-cover" />
            </figure>
          ))}
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <span className={dc.badge.accentPill}>
            <Camera className="h-3.5 w-3.5" /> Visual
          </span>
          <h1 className="editable-display mt-6 text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-5xl">
            {post.title}
          </h1>
          {leadText(post) ? (
            <p className={`${dc.type.lead} mt-6`}>{leadText(post)}</p>
          ) : null}
          <BodyContent post={post} compact />
        </aside>
      </div>
    </section>
  )
}

function BookmarkDetail({ post, related: _related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <article className={`${dc.shell.section} py-14 sm:py-20 max-w-3xl`}>
      <BackLink task="sbm" />
      <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <Bookmark className="h-7 w-7" />
      </div>
      <span className={`${dc.badge.accentPill} mt-6`}>Saved resource</span>
      <h1 className="editable-display mt-4 text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-5xl">
        {post.title}
      </h1>
      {leadText(post) ? <p className={`${dc.type.lead} mt-6`}>{leadText(post)}</p> : null}
      {website ? (
        <Link href={website} target="_blank" rel="noreferrer" className={`${dc.button.primary} mt-8`}>
          Open resource <ExternalLink className="h-4 w-4" />
        </Link>
      ) : null}
      <BodyContent post={post} />
      <TagChips post={post} />
    </article>
  )
}

/* Related strip used only by article. Never used for profile (rules). */
function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="border-t border-[var(--tk-line)]">
      <div className={`${dc.shell.section} py-14 sm:py-16`}>
        <div className="flex items-end justify-between gap-4">
          <h2 className="editable-display text-2xl font-medium tracking-[-0.015em] sm:text-3xl">
            More reading
          </h2>
          <Link
            href={taskConfig?.route || '/'}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]"
          >
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => (
            <Link
              key={item.id || item.slug}
              href={`${taskConfig?.route || `/${task}`}/${item.slug}`}
              className="group flex flex-col overflow-hidden rounded-3xl border border-[var(--tk-line)] bg-white transition duration-500 hover:-translate-y-1 hover:border-[var(--tk-accent)]"
            >
              <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
                {getImages(item)[0] ? (
                  <img
                    src={getImages(item)[0]}
                    alt=""
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FileText className="h-7 w-7 text-[var(--tk-muted)]" />
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="editable-display line-clamp-2 text-base font-medium leading-snug tracking-[-0.005em]">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
