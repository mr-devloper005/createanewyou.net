import type { Metadata } from 'next'
import { SchemaJsonLd } from '@/components/seo/schema-jsonld'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { buildPageMetadata } from '@/lib/seo'
import { fetchHomeTaskFeed, fetchHomeTimeSections, type HomeTimeSection } from '@/lib/task-data'
import { pagesContent } from '@/editable/content/pages.content'
import type { SitePost } from '@/lib/site-connector'
import {
  EditableHomeCta,
  EditableHomeHero,
  EditableMagazineSplit,
  EditableStoryRail,
  EditableTimeCollections,
} from '@/editable/sections/HomeSections'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 300

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/',
    title: pagesContent.home.metadata.title,
    description: pagesContent.home.metadata.description,
    openGraphTitle: pagesContent.home.metadata.openGraphTitle,
    openGraphDescription: pagesContent.home.metadata.openGraphDescription,
    image: SITE_CONFIG.defaultOgImage,
    keywords: [...pagesContent.home.metadata.keywords],
  })
}

type TaskFeedItem = { task: (typeof SITE_CONFIG.tasks)[number]; posts: SitePost[] }

function uniquePosts(posts: SitePost[]) {
  return Array.from(new Map(posts.map((post) => [post.slug || post.id || post.title, post])).values())
}

export default async function HomePage() {
  // Prefer pdf (Reference Library) as the primary public surface. Fall back to
  // the first enabled task, but always skip profile (never surfaced publicly).
  const enabled = SITE_CONFIG.tasks.filter((task) => task.enabled)
  const primaryTaskKey = (
    enabled.find((task) => task.key === 'pdf')?.key ||
    enabled.find((task) => task.key !== 'profile')?.key ||
    'pdf'
  ) as TaskKey
  const primaryRoute = SITE_CONFIG.taskViews[primaryTaskKey] || `/${primaryTaskKey}`

  const taskFeed: TaskFeedItem[] = await fetchHomeTaskFeed(12, { timeoutMs: 2500 })
  const primaryPosts = uniquePosts(
    taskFeed.find(({ task }) => task.key === primaryTaskKey)?.posts ||
      taskFeed.filter(({ task }) => task.key !== 'profile').flatMap(({ posts }) => posts)
  ).slice(0, 24)
  const timeSections: HomeTimeSection[] = await fetchHomeTimeSections(primaryTaskKey, {
    limit: 8,
    timeoutMs: 2500,
  })
  const baseUrl = SITE_CONFIG.baseUrl.replace(/\/$/, '')

  return (
    <EditableSiteShell>
      <main>
        <SchemaJsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_CONFIG.name,
            url: baseUrl,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${baseUrl}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }}
        />

        <EditableHomeHero
          primaryTask={primaryTaskKey}
          primaryRoute={primaryRoute}
          posts={primaryPosts}
          timeSections={timeSections}
        />

        {/* Existing header slot ad — kept as-is per the ad rules. */}
        <div className="mx-auto max-w-[var(--editable-container)] px-5 py-6 sm:px-8 lg:px-10">
          <Ads
            slot="header"
            size={pickRandom(getSlotSizes('header'))}
            showLabel
            eager
            className="mx-auto w-full"
          />
        </div>

        <EditableStoryRail
          primaryTask={primaryTaskKey}
          primaryRoute={primaryRoute}
          posts={primaryPosts}
          timeSections={timeSections}
        />
        <EditableMagazineSplit
          primaryTask={primaryTaskKey}
          primaryRoute={primaryRoute}
          posts={primaryPosts}
          timeSections={timeSections}
        />
        <EditableTimeCollections
          primaryTask={primaryTaskKey}
          primaryRoute={primaryRoute}
          posts={primaryPosts}
          timeSections={timeSections}
        />
        <EditableHomeCta />
      </main>
    </EditableSiteShell>
  )
}
