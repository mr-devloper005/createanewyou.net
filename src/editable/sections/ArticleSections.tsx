import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, BookOpen } from 'lucide-react'
import type { SitePost, SiteFeedPagination } from '@/lib/site-connector'
import { CATEGORY_OPTIONS } from '@/lib/categories'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { ArticleListCard, postHref } from '@/editable/cards/PostCards'

/*
  Legacy article-archive & detail wrappers (kept for backward compatibility
  with any callers). Refreshed to use the visiomate token system — pill
  buttons, purple accents, soft-shadow cards.
*/

export function EditableArticleArchive({
  posts,
  pagination,
  category = 'all',
  basePath = '/article',
}: {
  posts: SitePost[]
  pagination: SiteFeedPagination
  category?: string
  basePath?: string
}) {
  const voice = taskPageVoices.article
  const page = pagination.page || 1
  const pageHref = (nextPage: number) =>
    `${basePath}?${new URLSearchParams({
      ...(category && category !== 'all' ? { category } : {}),
      page: String(nextPage),
    }).toString()}`
  return (
    <main className={dc.shell.page}>
      <section className={`${dc.shell.section} pt-16 sm:pt-20`}>
        <div className="rounded-[2.25rem] border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-8 sm:p-12">
          <span className={dc.badge.accentPill}>
            <BookOpen className="h-3.5 w-3.5" /> {voice.eyebrow}
          </span>
          <h1 className={`${dc.type.heroTitle} mt-6 max-w-4xl`}>{voice.headline}</h1>
          <p className={`${dc.type.lead} mt-5 max-w-3xl`}>{voice.description}</p>
          <form action={basePath} className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
            <select
              name="category"
              defaultValue={category || 'all'}
              className="min-w-0 flex-1 rounded-full border border-[var(--editable-border)] bg-white px-5 py-3 text-sm font-medium text-[var(--slot4-page-text)] outline-none"
            >
              <option value="all">All categories</option>
              {CATEGORY_OPTIONS.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <button className={dc.button.primary}>Filter</button>
          </form>
        </div>
      </section>

      <section className={`${dc.shell.section} ${dc.shell.sectionY}`}>
        {posts.length ? (
          <div className="grid gap-6">
            {posts.map((post, index) => (
              <ArticleListCard
                key={post.id}
                post={post}
                href={postHref('article', post, basePath)}
                index={index + (page - 1) * pagination.limit}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[var(--editable-border)] bg-white p-10 text-center">
            <h2 className="editable-display text-2xl font-medium tracking-[-0.015em]">
              No entries found
            </h2>
            <p className="mt-3 text-sm text-[var(--slot4-muted-text)]">
              Try another category or return to the full list.
            </p>
          </div>
        )}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {pagination.hasPrevPage ? (
            <Link href={pageHref(page - 1)} className={dc.button.secondary}>
              Previous
            </Link>
          ) : null}
          <span className="inline-flex items-center rounded-full border border-[var(--editable-border)] bg-white px-5 py-3 text-sm font-medium text-[var(--slot4-muted-text)]">
            Page {page} of {pagination.totalPages || 1}
          </span>
          {pagination.hasNextPage ? (
            <Link href={pageHref(page + 1)} className={dc.button.primary}>
              Next <ArrowUpRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export function EditableArticleDetailShell({
  slug,
  post,
}: {
  slug: string
  post: SitePost | null
}) {
  const voice = taskPageVoices.article
  return (
    <main className={dc.shell.page}>
      <section className={`${dc.shell.section} pt-14 sm:pt-20`}>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-accent)]"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <span className={dc.badge.accentPill}>
              <BookOpen className="h-3.5 w-3.5" /> {voice.eyebrow}
            </span>
            <h1 className={`${dc.type.heroTitle} mt-6 max-w-3xl`}>
              {post?.title || pagesContent.detailPages.article.fallbackTitle}
            </h1>
          </div>
          <aside className="rounded-3xl bg-[var(--slot4-panel-bg)] p-6">
            <p className="editable-label text-[var(--slot4-accent)]">Reading note</p>
            <p className="mt-4 text-sm leading-6 text-[var(--slot4-muted-text)]">{voice.secondaryNote}</p>
            <Link href="/contact" className={`${dc.button.primary} mt-6`}>
              Contact <ArrowUpRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </section>
      <section className={`${dc.shell.section} pb-16 pt-8`}>
        <div className="rounded-[2rem] border border-[var(--editable-border)] bg-white p-6 sm:p-10">
          <p className="text-[15px] leading-[1.75] text-[var(--slot4-muted-text)]">
            {post?.summary || `Content for ${slug} will render through the editable detail page.`}
          </p>
        </div>
      </section>
    </main>
  )
}
