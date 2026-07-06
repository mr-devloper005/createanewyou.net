import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

/*
  Task surface theme — reference: visiomate.webflow.io.

  Single shared visual language for every task (`--tk-*` tokens): white
  surfaces, soft-purple wash raised, warm-black ink, purple accent, warm
  orange as secondary. Per-task copy (kicker / note) varies. Only two
  tasks surface publicly: pdf → "Reference Library", profile → "Contributor"
  (contributor label appears ONLY on the profile detail page).
*/

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const SATOSHI = "'Satoshi', ui-sans-serif, system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"

const base = {
  dark: false,
  fontDisplay: SATOSHI,
  fontBody: SATOSHI,
  bg: '#ffffff',
  surface: '#ffffff',
  raised: '#f6f4ff',
  text: '#1a1a1a',
  muted: '#595959',
  line: '#e9e9e9',
  accent: '#6950e8',
  accentSoft: '#efeaff',
  onAccent: '#ffffff',
  glow: 'rgba(105,80,232,0.18)',
  radius: '1.5rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Read', note: 'Long-form reads worth your time.' },
  listing: { ...base, kicker: 'Directory', note: 'Discover and compare directly.' },
  classified: { ...base, kicker: 'Notices', note: 'Fresh offers, ready to act on.' },
  image: { ...base, kicker: 'Visuals', note: 'A visual feed of standout imagery.' },
  sbm: { ...base, kicker: 'Saved', note: 'Curated resources and links worth keeping.' },
  // pdf public label = "Reference Library"; item kicker = "Reference document"
  pdf: {
    ...base,
    kicker: 'Reference document',
    note: 'A downloadable guide from the Reference Library — cite, share, and reuse.',
  },
  // profile display label = "Contributor" — only appears on profile detail page
  profile: {
    ...base,
    kicker: 'Contributor',
    note: 'The person behind the reference — bio, links, and their contributions.',
  },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.pdf
}

export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
