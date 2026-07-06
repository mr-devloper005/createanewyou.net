import type { CSSProperties } from 'react'

/*
  Design contract — reference: visiomate.webflow.io.
  Single Satoshi type family. Pill buttons (100px). Soft-shadow rounded cards.
  Purple #6950e8 primary + warm orange #fd9a57 accent on white with soft
  purple wash surfaces. Every downstream component consumes these vars.
*/
export const editableRootStyle = {
  // Page & surface
  '--slot4-page-bg': '#ffffff',
  '--slot4-page-text': '#1a1a1a',
  '--slot4-panel-bg': '#f6f4ff',
  '--slot4-surface-bg': '#ffffff',
  '--slot4-muted-text': '#595959',
  '--slot4-soft-muted-text': '#8a8a8a',
  // Accent (primary purple)
  '--slot4-accent': '#6950e8',
  '--slot4-accent-fill': '#6950e8',
  '--slot4-accent-soft': '#efeaff',
  '--slot4-on-accent': '#ffffff',
  // Secondary warm accent
  '--slot4-warm-accent': '#fd9a57',
  '--slot4-warm-accent-soft': '#ffe5d3',
  // Dark band (occasional full-bleed)
  '--slot4-dark-bg': '#101828',
  '--slot4-dark-text': '#ffffff',
  // Media placeholders / soft washes
  '--slot4-media-bg': '#f4f2fb',
  '--slot4-cream': '#ffffff',
  '--slot4-warm': '#faf8ff',
  '--slot4-lavender': '#f6f4ff',
  '--slot4-gray': '#f7f7f7',
  '--slot4-body-gradient': 'none',
  // Editable shell
  '--editable-page-bg': '#ffffff',
  '--editable-page-text': '#1a1a1a',
  '--editable-container': '80.625rem',
  '--editable-border': '#e9e9e9',
  '--editable-border-strong': '#d9d9d9',
  '--editable-nav-bg': '#ffffff',
  '--editable-nav-text': '#1a1a1a',
  '--editable-nav-active': '#6950e8',
  '--editable-nav-active-text': '#ffffff',
  '--editable-cta-bg': '#6950e8',
  '--editable-cta-text': '#ffffff',
  '--editable-search-bg': '#ffffff',
  '--editable-footer-bg': '#0e0b1c',
  '--editable-footer-text': '#e7e5f4',
  // Motion
  '--ease-premium': 'cubic-bezier(0.22, 1, 0.36, 1)',
} as CSSProperties

export const editablePalette = {
  pageBg: 'bg-[var(--slot4-page-bg)]',
  pageText: 'text-[var(--slot4-page-text)]',
  panelBg: 'bg-[var(--slot4-panel-bg)]',
  panelText: 'text-[var(--slot4-page-text)]',
  surfaceBg: 'bg-[var(--slot4-surface-bg)]',
  surfaceText: 'text-[var(--slot4-page-text)]',
  mutedText: 'text-[var(--slot4-muted-text)]',
  softMutedText: 'text-[var(--slot4-soft-muted-text)]',
  accentText: 'text-[var(--slot4-accent)]',
  accentBg: 'bg-[var(--slot4-accent-fill)]',
  accentSoftBg: 'bg-[var(--slot4-accent-soft)]',
  accentSoftText: 'text-[var(--slot4-accent-soft)]',
  onAccentText: 'text-[var(--slot4-on-accent)]',
  warmAccentBg: 'bg-[var(--slot4-warm-accent)]',
  warmAccentSoftBg: 'bg-[var(--slot4-warm-accent-soft)]',
  darkBg: 'bg-[var(--slot4-dark-bg)]',
  darkText: 'text-[var(--slot4-dark-text)]',
  mediaBg: 'bg-[var(--slot4-media-bg)]',
  creamBg: 'bg-[var(--slot4-cream)]',
  warmBg: 'bg-[var(--slot4-warm)]',
  lavenderBg: 'bg-[var(--slot4-lavender)]',
  grayBg: 'bg-[var(--slot4-gray)]',
  border: 'border-[var(--editable-border)]',
  darkBorder: 'border-white/10',
  shadow: 'shadow-[0_10px_28px_rgba(16,24,40,0.06)]',
  shadowStrong: 'shadow-[0_20px_50px_rgba(105,80,232,0.14)]',
  overlay: 'bg-[linear-gradient(180deg,rgba(16,24,40,0.02),rgba(16,24,40,0.62))]',
} as const

export const editableDesignContract = {
  shell: {
    page: `min-h-screen ${editablePalette.pageBg} ${editablePalette.pageText}`,
    section: 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-10',
    sectionY: 'py-11 md:py-16 lg:py-20',
    sectionYLg: 'py-16 md:py-24 lg:py-28',
    sectionYSm: 'py-8 md:py-12',
  },
  layout: {
    safeGrid: 'grid gap-8 md:grid-cols-2 xl:grid-cols-3',
    featureGrid: 'grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center',
    rail: 'flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    minRailCard: 'w-[280px] shrink-0 snap-start sm:w-[320px]',
  },
  type: {
    // eyebrow: uppercase purple label, tight tracking (single-font differentiation)
    eyebrow: 'text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--slot4-accent)]',
    heroTitle:
      'editable-display text-4xl leading-[1.05] tracking-[-0.02em] sm:text-5xl md:text-6xl lg:text-[3.75rem]',
    sectionTitle:
      'editable-display text-3xl leading-[1.1] tracking-[-0.015em] sm:text-4xl md:text-[2.875rem]',
    body: 'text-base leading-[1.65] sm:text-[1.0625rem]',
    lead: 'text-lg leading-[1.6] sm:text-[1.1875rem] text-[var(--slot4-muted-text)]',
    emphasis: 'text-[var(--slot4-accent)] font-medium',
  },
  surface: {
    card: `rounded-3xl border ${editablePalette.border} ${editablePalette.surfaceBg} ${editablePalette.shadow}`,
    soft: `rounded-3xl ${editablePalette.lavenderBg}`,
    dark: `rounded-3xl ${editablePalette.darkBg} ${editablePalette.darkText} ${editablePalette.shadowStrong}`,
    plain: `rounded-2xl border ${editablePalette.border} ${editablePalette.surfaceBg}`,
  },
  radius: {
    pill: 'rounded-full',
    card: 'rounded-3xl',
    md: 'rounded-2xl',
    sm: 'rounded-xl',
  },
  button: {
    // All pills, ~100px radius. Padding: y-3.5 x-6 (~14/24). Weight 500.
    primary:
      'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-6 py-3.5 text-sm font-medium tracking-[0.005em] text-[var(--slot4-on-accent)] shadow-[0_10px_24px_rgba(105,80,232,0.28)] transition duration-300 hover:brightness-[0.96] hover:-translate-y-0.5 active:translate-y-0',
    secondary:
      'inline-flex items-center justify-center gap-2 rounded-full border border-[var(--editable-border-strong)] bg-white px-6 py-3.5 text-sm font-medium tracking-[0.005em] text-[var(--slot4-page-text)] transition duration-300 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)] hover:-translate-y-0.5',
    accent:
      'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-warm-accent)] px-6 py-3.5 text-sm font-medium tracking-[0.005em] text-[#3b1f00] transition duration-300 hover:brightness-95 hover:-translate-y-0.5',
    ghost:
      'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-[var(--slot4-page-text)] transition hover:text-[var(--slot4-accent)]',
    outlinePrimary:
      'inline-flex items-center justify-center gap-2 rounded-full border border-[var(--slot4-accent)] bg-white px-6 py-3.5 text-sm font-medium text-[var(--slot4-accent)] transition duration-300 hover:bg-[var(--slot4-accent-soft)] hover:-translate-y-0.5',
    dark:
      'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-dark-bg)] px-6 py-3.5 text-sm font-medium text-white transition duration-300 hover:opacity-90 hover:-translate-y-0.5',
  },
  badge: {
    pill: 'inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-white px-3.5 py-1.5 text-xs font-medium text-[var(--slot4-muted-text)]',
    accentPill:
      'inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-soft)] px-3.5 py-1.5 text-xs font-semibold text-[var(--slot4-accent)]',
    warmPill:
      'inline-flex items-center gap-2 rounded-full bg-[var(--slot4-warm-accent-soft)] px-3.5 py-1.5 text-xs font-semibold text-[#8a3b00]',
  },
  media: {
    frame: `relative overflow-hidden rounded-3xl ${editablePalette.mediaBg}`,
    frameFull: `relative overflow-hidden rounded-[2rem] ${editablePalette.mediaBg}`,
    ratio: 'aspect-[16/10]',
    ratioSquare: 'aspect-square',
    ratioBanner: 'aspect-[16/7]',
  },
  motion: {
    lift: 'transition duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(105,80,232,0.14)]',
    fade: 'transition duration-300 hover:opacity-90',
    zoom: 'transition duration-700 group-hover:scale-[1.04]',
  },
} as const

export const aiLayoutRules = [
  'Consume tokens through CSS vars in editableRootStyle — never hardcode hex/font in JSX.',
  'Use dc.button.primary/secondary/outlinePrimary (pill shape) for every CTA.',
  'Section rhythm is dc.shell.sectionY (11/16/20) — larger hero via sectionYLg.',
  'Preserve dynamic post fetching. Do not replace dynamic posts with mock arrays.',
] as const
