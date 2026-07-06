import { slot4BrandConfig } from '@/editable/theme/brand.config'

/*
  Page copy — Reference-Library-first. No mentions of profiles in
  publicly-visible surfaces. Auth and Create copy centers on
  contributing references, never on profile creation.
*/

const REFERENCE_LIBRARY = 'Reference Library'

export const pagesContent = {
  home: {
    metadata: {
      title: `${REFERENCE_LIBRARY} — guides, reports and citeable references`,
      description: `A curated ${REFERENCE_LIBRARY} of downloadable guides, reports and references, organized by topic and free to cite.`,
      openGraphTitle: `The ${REFERENCE_LIBRARY}`,
      openGraphDescription: `Everything worth referencing, in one calm library.`,
      keywords: ['reference library', 'guides', 'reports', 'downloadable resources', 'citation'],
    },
    hero: {
      badge: 'The reference-first way to research',
      title: [
        `Everything worth referencing —`,
        `in one calm ${REFERENCE_LIBRARY}.`,
      ],
      description: `Browse a growing ${REFERENCE_LIBRARY} of guides, reports and downloadable references — thoughtfully organized, easy to cite and quiet on the eyes.`,
      primaryCta: { label: `Enter the ${REFERENCE_LIBRARY}`, href: '/pdf' },
      secondaryCta: { label: 'How it works', href: '/about' },
      searchPlaceholder: `Search the ${REFERENCE_LIBRARY}`,
      focusLabel: 'Focus',
      featureCardBadge: 'Featured reference',
      featureCardTitle: 'The most-opened reference this week.',
      featureCardDescription:
        'Fresh additions and the most-cited references rotate through the featured slot automatically.',
    },
    intro: {
      badge: 'About the library',
      title: 'A quiet, reference-first way to work with knowledge.',
      paragraphs: [
        `Every entry in the ${REFERENCE_LIBRARY} is chosen for clarity, citeability and staying power — no filler, no funnel.`,
        `References are grouped by intent, not by upload date. You can find what you need in a few clicks, download it, and get back to work.`,
        `The library grows quietly. New references are added weekly, and every existing entry stays open access.`,
      ],
      sideBadge: 'At a glance',
      sidePoints: [
        'Curated by topic — not by feed rank.',
        'Downloadable and citation-ready.',
        'Search works on titles, tags and full-text.',
        'Open access, no accounts required to read.',
      ],
      primaryLink: { label: `Browse the ${REFERENCE_LIBRARY}`, href: '/pdf' },
      secondaryLink: { label: 'Contribute a reference', href: '/create' },
    },
    cta: {
      badge: 'Start referencing today',
      title: `Ready to open the ${REFERENCE_LIBRARY}?`,
      description: `Skim the shelf, save what you need, or contribute a reference of your own — the library is open by design.`,
      primaryCta: { label: 'Enter the library', href: '/pdf' },
      secondaryCta: { label: 'Contribute a reference', href: '/create' },
    },
    taskSection: {
      heading: `Latest in the ${REFERENCE_LIBRARY}`,
      descriptionSuffix: 'Fresh additions to the shelf.',
    },
  },
  about: {
    badge: 'About',
    title: `A calmer, reference-first way to explore knowledge.`,
    description: `${slot4BrandConfig.siteName} runs a curated ${REFERENCE_LIBRARY} — guides, reports and downloadable references chosen for clarity and staying power.`,
    paragraphs: [
      `We keep the library organized by topic rather than by feed rank, so a search feels less like scrolling and more like arriving.`,
      `Every reference is downloadable and citation-ready. Titles, categories and permalinks stay clean so your citations stay stable.`,
      `The library is open access by design — no wall, no lock-in, no account required to read.`,
    ],
    values: [
      {
        title: 'Curated for clarity',
        description:
          'Every entry is chosen for how easy it is to read, cite and reuse — not for engagement metrics.',
      },
      {
        title: 'Organized by intent',
        description:
          'Topics group naturally into shelves. Filters are simple. Search covers titles, tags and full-text.',
      },
      {
        title: 'Open access',
        description:
          'Downloadable, citation-ready and free to reference. No paywall, no signup wall, no dark patterns.',
      },
    ],
  },
  contact: {
    eyebrow: `Contact ${slot4BrandConfig.siteName}`,
    title: 'Reach the humans behind the library.',
    description:
      'Contribute a reference, suggest a topic, flag a correction, or explore a partnership. We reply within a couple of working days.',
    formTitle: 'Send a message',
  },

  search: {
    metadata: {
      title: `Search the ${REFERENCE_LIBRARY}`,
      description: `Search titles, categories and full text across the ${REFERENCE_LIBRARY}.`,
    },
    hero: {
      badge: `Search the ${REFERENCE_LIBRARY}`,
      title: `Find the reference you need, faster.`,
      description: `Search by keyword, topic or category across the full library.`,
      placeholder: `Search titles, topics, keywords`,
    },
    resultsTitle: 'Latest references',
  },
  create: {
    metadata: {
      title: `Contribute to the ${REFERENCE_LIBRARY}`,
      description: `Submit a guide, report or downloadable resource to the shared ${REFERENCE_LIBRARY}.`,
    },
    locked: {
      badge: 'Sign in to contribute',
      title: `Sign in to contribute to the ${REFERENCE_LIBRARY}.`,
      description:
        'Use your account to open the submission workspace, add a new reference, and track review status.',
    },
    hero: {
      badge: 'Contribute a reference',
      title: `Add a reference to the ${REFERENCE_LIBRARY}.`,
      description:
        'Submit a guide, report or downloadable resource. Every submission is reviewed for clarity and citeability before it lands on the shelf.',
    },
    formTitle: 'Reference details',
    submitLabel: 'Submit reference',
    successTitle: 'Reference submitted — thank you.',
  },
  auth: {
    login: {
      metadataDescription: `Sign in to the ${REFERENCE_LIBRARY}.`,
      badge: 'Member access',
      title: `Welcome back to the ${REFERENCE_LIBRARY}.`,
      description: `Sign in to continue browsing, saving and contributing to the library.`,
      formTitle: 'Sign in',
      submitLabel: 'Continue',
      noAccount: 'No account matched these details. Create one first, then sign in.',
      success: 'Signed in. Redirecting…',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: `Get started with the ${REFERENCE_LIBRARY}.`,
      badge: 'Get started',
      title: `Create your account and start referencing.`,
      description: `Create an account to save references, track your submissions and contribute new resources to the library.`,
      formTitle: 'Create account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created. Redirecting…',
      loginCta: 'Sign in',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'More reading',
      fallbackTitle: 'Reference details',
    },
    listing: {
      relatedTitle: 'More entries',
      fallbackTitle: 'Directory entry',
    },
    image: {
      relatedTitle: 'More visuals',
      fallbackTitle: 'Visual details',
    },
    profile: {
      // Profile detail page is direct-URL-only and never linked publicly.
      relatedTitle: 'From this contributor in the library',
      fallbackDescription: 'Contributor details will appear here once available.',
      visitButton: 'Visit website',
    },
  },
} as const
