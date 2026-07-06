import type { TaskKey } from '@/lib/site-config'

/*
  Per-task voice used by TaskArchivePage. Only pdf (Reference Library) and
  profile (Contributor — direct-URL-only) surface renamed labels publicly.
  Other tasks keep working internally but are not promoted.
*/

export type TaskPageVoice = {
  eyebrow: string
  headline: string
  description: string
  filterLabel: string
  secondaryNote: string
  chips: string[]
}

const REFERENCE_LIBRARY = 'Reference Library'

export const taskPageVoices = {
  article: {
    eyebrow: 'Reading',
    headline: 'Long-form reads with a calmer editorial rhythm.',
    description:
      'Essays, guides and explainers to sit with — not a directory. The layout gives text space to breathe.',
    filterLabel: 'Choose topic',
    secondaryNote: 'Reading surfaces need space, hierarchy and fewer distractions.',
    chips: ['Editorial pacing', 'Topic filters', 'Long-read friendly'],
  },
  classified: {
    eyebrow: 'Notices',
    headline: 'Fresh notices and time-sensitive offers.',
    description: 'Quick to scan, practical and action-oriented — with less editorial decoration.',
    filterLabel: 'Filter category',
    secondaryNote: 'Prioritize urgency, short summaries and direct browsing.',
    chips: ['Fast scan', 'Offers', 'Action cues'],
  },
  sbm: {
    eyebrow: 'Saved resources',
    headline: 'Curated resource links.',
    description: 'Saved shelves of useful tools, references and collections.',
    filterLabel: 'Filter collection',
    secondaryNote: 'Curated resources need grouping and calm metadata.',
    chips: ['Collections', 'Resources', 'Reference flow'],
  },
  profile: {
    // Profile detail is direct-URL-only; this copy only appears if someone
    // lands on a profile archive URL directly.
    eyebrow: 'Contributor',
    headline: 'Contributor profile.',
    description: 'A single contributor record — reachable by direct URL.',
    filterLabel: 'Filter contributor',
    secondaryNote: 'Contributors are the people behind the references.',
    chips: ['Contributor', 'Bio', 'Contributions'],
  },
  pdf: {
    eyebrow: REFERENCE_LIBRARY,
    headline: `The full ${REFERENCE_LIBRARY} — organized, downloadable, open access.`,
    description: `Every reference in one place — searchable by topic, previewable in-page and free to cite or download.`,
    filterLabel: 'Filter reference category',
    secondaryNote: 'The library grows quietly and stays cite-ready.',
    chips: ['Cite-ready', 'Open access', 'Downloadable'],
  },
  listing: {
    eyebrow: 'Directory',
    headline: 'Directory entries.',
    description: 'Records for discovery and comparison — kept simple, kept practical.',
    filterLabel: 'Filter category',
    secondaryNote: 'Prioritize direct action paths.',
    chips: ['Directory', 'Compare', 'Discovery'],
  },
  image: {
    eyebrow: 'Visuals',
    headline: 'Visual entries.',
    description: 'A gallery-first browsing experience for image-led entries.',
    filterLabel: 'Filter visual category',
    secondaryNote: 'Let images carry the page.',
    chips: ['Gallery', 'Visual-first', 'Portfolio mood'],
  },
} satisfies Record<TaskKey, TaskPageVoice>
