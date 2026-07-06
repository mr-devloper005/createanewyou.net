import Link from 'next/link'
import { ArrowUpRight, FileText } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'

/*
  Cards — reference: visiomate.webflow.io. Soft-shadow rounded surfaces,
  purple category pills, subtle lift on hover, image zoom 1.04 / 700ms.
  Exported names / signatures preserved.
*/

export function getEditablePostImage(post?: SitePost | null) {
  const media = Array.isArray(post?.media) ? post?.media : []
  const mediaUrl = media.find((item) => typeof item?.url === 'string' && item.url)?.url
  const content =
    post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const images = Array.isArray(content.images) ? content.images : []
  const contentImage = images.find((url): url is string => typeof url === 'string' && Boolean(url))
  const logo = typeof content.logo === 'string' ? content.logo : ''
  return mediaUrl || contentImage || logo || '/placeholder.svg?height=900&width=1400'
}

export function getEditableExcerpt(post?: SitePost | null, limit = 150) {
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

export function getEditableCategory(post?: SitePost | null) {
  const content =
    post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Featured'
}

export function postHref(task: TaskKey, post: SitePost, route = `/${task}`) {
  return `${route}/${post.slug}`
}

/* ------------------------------------------------------------------ */
/* Reference-Library-first card variants                              */
/* Signatures preserved so existing call-sites keep working.          */
/* ------------------------------------------------------------------ */

export function EditorialFeatureCard({
  post,
  href,
  label = 'Featured resource',
}: {
  post: SitePost
  href: string
  label?: string
}) {
  return (
    <Link
      href={href}
      className={`group relative block min-w-0 overflow-hidden rounded-[2rem] ${pal.shadow} ${dc.motion.lift}`}
    >
      <div className="relative min-h-[440px] lg:min-h-[520px]">
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,24,40,0)_35%,rgba(16,24,40,0.75)_100%)]" />
        <div className="relative z-10 flex h-full min-h-[440px] flex-col justify-end p-7 sm:p-10 lg:min-h-[520px]">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-[var(--slot4-accent)]">
            {label}
          </span>
          <h3 className="editable-display mt-5 max-w-3xl text-3xl font-medium leading-[1.08] tracking-[-0.02em] text-white sm:text-4xl lg:text-[2.75rem]">
            {post.title}
          </h3>
          <p className="mt-4 max-w-2xl text-[15px] leading-[1.6] text-white/80 sm:text-base">
            {getEditableExcerpt(post, 190)}
          </p>
          <span className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-[#231b3d]">
            Read more <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export function RailPostCard({
  post,
  href,
  index,
}: {
  post: SitePost
  href: string
  index: number
}) {
  return (
    <Link
      href={href}
      className={`group ${dc.layout.minRailCard} block overflow-hidden rounded-3xl border border-[var(--editable-border)] bg-white ${dc.motion.lift}`}
    >
      <div className={`${dc.media.frame} ${dc.media.ratio}`}>
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <span className={`absolute left-4 top-4 ${dc.badge.accentPill}`}>
          {String(index + 1).padStart(2, '0')} · {getEditableCategory(post)}
        </span>
      </div>
      <div className="p-6">
        <h3 className="editable-display line-clamp-3 text-xl font-medium leading-snug tracking-[-0.01em] text-[var(--slot4-page-text)]">
          {post.title}
        </h3>
        <p className={`mt-3 line-clamp-2 text-sm leading-6 ${pal.mutedText}`}>
          {getEditableExcerpt(post, 130)}
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--slot4-accent)]">
          Explore <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  )
}

export function CompactIndexCard({
  post,
  href,
  index,
}: {
  post: SitePost
  href: string
  index: number
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-[var(--editable-border)] bg-white p-5 transition duration-500 hover:-translate-y-1 hover:border-[var(--slot4-accent)] hover:shadow-[0_20px_50px_rgba(105,80,232,0.14)]"
    >
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-sm font-semibold text-[var(--slot4-accent)]">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--slot4-accent)]">
            {getEditableCategory(post)}
          </p>
          <h3 className="editable-display mt-2 line-clamp-2 text-lg font-medium leading-snug tracking-[-0.01em] text-[var(--slot4-page-text)]">
            {post.title}
          </h3>
          <p className={`mt-2 line-clamp-2 text-sm leading-6 ${pal.mutedText}`}>
            {getEditableExcerpt(post, 110)}
          </p>
        </div>
      </div>
    </Link>
  )
}

export function ArticleListCard({
  post,
  href,
  index,
}: {
  post: SitePost
  href: string
  index: number
}) {
  return (
    <Link
      href={href}
      className={`group grid min-w-0 gap-6 overflow-hidden rounded-3xl border border-[var(--editable-border)] bg-white p-4 ${dc.motion.lift} sm:grid-cols-[240px_minmax(0,1fr)] sm:p-5`}
    >
      <div className={`${dc.media.frame} aspect-[16/11] sm:aspect-auto sm:min-h-[200px]`}>
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold text-[var(--slot4-accent)]">
          <FileText className="h-3 w-3" /> {getEditableCategory(post)}
        </span>
      </div>
      <div className="min-w-0 py-1 sm:py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--slot4-accent)]">
          No. {String(index + 1).padStart(2, '0')}
        </p>
        <h2 className="editable-display mt-3 line-clamp-3 text-2xl font-medium leading-snug tracking-[-0.015em] text-[var(--slot4-page-text)] sm:text-[1.65rem]">
          {post.title}
        </h2>
        <p className={`mt-4 line-clamp-3 text-[15px] leading-[1.6] ${pal.mutedText}`}>
          {getEditableExcerpt(post, 190)}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--slot4-accent)]">
          Read the reference <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  )
}
