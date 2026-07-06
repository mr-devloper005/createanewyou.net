import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, FileText, Search } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

const REFERENCE_LIBRARY = 'Reference Library'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) =>
  typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : ''
const compactRaw = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const getContent = (post: SitePost) =>
  post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media)
    ? post.media.find((item) => typeof item?.url === 'string')?.url
    : ''
  const images = Array.isArray(content.images)
    ? (content.images.find((item) => typeof item === 'string') as string | undefined)
    : ''
  return (
    media ||
    compactRaw(content.featuredImage) ||
    compactRaw(content.image) ||
    compactRaw(content.thumbnail) ||
    images ||
    ''
  )
}
const summaryOf = (post: SitePost) => {
  const raw = post.summary || compactRaw(getContent(post).description) || compactRaw(getContent(post).excerpt) || ''
  return stripHtml(raw).replace(/\s+/g, ' ').trim()
}

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  // Never surface profiles in public search results.
  if (derivedTask === 'profile') return false
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [
    post.title,
    post.summary,
    content.description,
    content.body,
    content.excerpt,
    content.category,
    Array.isArray(post.tags) ? post.tags.join(' ') : '',
  ].some((value) => compactText(value).includes(query))
}

// Public display label for tasks (renamed pdf → Reference Library).
const publicLabel = (task: TaskKey | null | undefined, fallback: string) =>
  task === 'pdf' ? REFERENCE_LIBRARY : fallback

function SearchResultCard({ post, index }: { post: SitePost; index: number }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  const href = `${taskRoute || `/${task || 'pdf'}`}/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const taskLabel = publicLabel(task, SITE_CONFIG.tasks.find((item) => item.key === task)?.label || 'Post')

  return (
    <EditableReveal index={index}>
      <Link
        href={href}
        className="group block overflow-hidden rounded-3xl border border-[var(--editable-border)] bg-white transition duration-500 hover:-translate-y-1 hover:border-[var(--slot4-accent)] hover:shadow-[0_24px_60px_rgba(105,80,232,0.16)]"
      >
        {image ? (
          <div className="relative aspect-[16/10] overflow-hidden bg-[var(--slot4-media-bg)]">
            <img
              src={image}
              alt=""
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
            />
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[var(--slot4-accent)]">
              <FileText className="h-3 w-3" /> {taskLabel}
            </span>
          </div>
        ) : null}
        <div className="p-6">
          {!image ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--slot4-accent-soft)] px-3 py-1 text-[11px] font-semibold text-[var(--slot4-accent)]">
              <FileText className="h-3 w-3" /> {taskLabel}
            </span>
          ) : null}
          <h2 className="editable-display mt-4 line-clamp-3 text-xl font-medium leading-snug tracking-[-0.01em] text-[var(--slot4-page-text)]">
            {post.title}
          </h2>
          {summary ? (
            <p className="mt-3 line-clamp-3 text-[15px] leading-6 text-[var(--slot4-muted-text)]">
              {summary}
            </p>
          ) : null}
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--slot4-accent)]">
            Open <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </EditableReveal>
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }>
}) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(
    useMaster ? 1000 : 300,
    useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined
  )
  const posts = feed?.posts?.length
    ? feed.posts
    : useMaster
      ? []
      : SITE_CONFIG.tasks
          .filter((item) => item.enabled && item.key !== 'profile')
          .flatMap((item) => getMockPostsForTask(item.key))
  const results = posts
    .filter((post) => matches(post, normalized, category, task))
    .slice(0, normalized ? 80 : 36)
  // Public task filter — never surface the profile task in the filter dropdown.
  const enabledTasks = SITE_CONFIG.tasks.filter((item) => item.enabled && item.key !== 'profile')

  return (
    <EditableSiteShell>
      <main className="min-h-screen">
        <section className={`${dc.shell.section} pt-16 pb-8 sm:pt-24`}>
          <EditableReveal className="mx-auto max-w-3xl text-center" index={0}>
            <span className={dc.badge.accentPill}>
              <Search className="h-3.5 w-3.5" /> {pagesContent.search.hero.badge}
            </span>
            <h1 className={`${dc.type.heroTitle} mt-6`}>{pagesContent.search.hero.title}</h1>
            <p className={`${dc.type.lead} mx-auto mt-5 max-w-xl`}>{pagesContent.search.hero.description}</p>
          </EditableReveal>

          <EditableReveal
            className="mx-auto mt-10 max-w-4xl rounded-[2rem] border border-[var(--editable-border)] bg-white p-3 shadow-[0_20px_50px_rgba(105,80,232,0.14)]"
            index={1}
          >
            <form action="/search" className="grid gap-2 sm:grid-cols-[1fr_180px_180px_auto]">
              <input type="hidden" name="master" value="1" />
              <label className="flex items-center gap-3 rounded-full border border-[var(--editable-border)] bg-white px-4">
                <Search className="h-4 w-4 text-[var(--slot4-muted-text)]" />
                <input
                  name="q"
                  defaultValue={query}
                  placeholder={pagesContent.search.hero.placeholder}
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm font-medium outline-none placeholder:text-[var(--slot4-muted-text)]"
                />
              </label>
              <input
                name="category"
                defaultValue={category}
                placeholder="Category"
                className="rounded-full border border-[var(--editable-border)] bg-white px-4 py-3 text-sm font-medium outline-none placeholder:text-[var(--slot4-muted-text)]"
              />
              <select
                name="task"
                defaultValue={task}
                className="rounded-full border border-[var(--editable-border)] bg-white px-4 py-3 text-sm font-medium outline-none"
              >
                <option value="">All content</option>
                {enabledTasks.map((item) => (
                  <option key={item.key} value={item.key}>
                    {publicLabel(item.key as TaskKey, item.label)}
                  </option>
                ))}
              </select>
              <button type="submit" className={dc.button.primary}>
                Search
              </button>
            </form>
          </EditableReveal>
        </section>

        <section className={`${dc.shell.section} pb-16`}>
          <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="editable-label text-[var(--slot4-accent)]">{results.length} results</p>
              <h2 className={`${dc.type.sectionTitle} mt-3`}>
                {query ? `Results for “${query}”` : pagesContent.search.resultsTitle}
              </h2>
            </div>
          </div>

          {results.length ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {results.map((post, index) => (
                <SearchResultCard key={post.id || post.slug} post={post} index={index} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[2rem] border border-dashed border-[var(--editable-border)] bg-white p-10 text-center">
              <p className="editable-display text-2xl font-medium tracking-[-0.015em]">No matching results.</p>
              <p className="mt-3 text-sm text-[var(--slot4-muted-text)]">
                Try a different keyword, content type, or category.
              </p>
            </div>
          )}

          {/* Footer ad slot (search) */}
          <div className="mt-16">
            <Ads
              slot="footer"
              size={pickRandom(getSlotSizes('footer'))}
              showLabel
              className="mx-auto w-full"
            />
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
