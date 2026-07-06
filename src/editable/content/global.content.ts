import { slot4BrandConfig } from '@/editable/theme/brand.config'

/*
  Global site copy — Reference-Library-first framing.
  Nav intentionally exposes NO task labels (task links are excluded from the
  navbar). Footer discovery lists ONLY the Reference Library.
*/

export const globalContent = {
  site: {
    name: slot4BrandConfig.siteName,
    tagline: slot4BrandConfig.tagline || 'The reference-first library',
    domain: slot4BrandConfig.domain,
    baseUrl: slot4BrandConfig.baseUrl,
  },
  nav: {
    tagline: 'The reference library',
    // No task-page links in the navbar by design.
    primaryLinks: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    actions: {
      primary: { label: 'Get started', href: '/signup' },
      secondary: { label: 'Sign in', href: '/login' },
    },
  },
  footer: {
    tagline: 'A quiet, cite-ready reference library',
    description:
      'A library of carefully selected references — guides, reports, and downloadables — designed for easy citation and open access.',
    columns: [
      {
        title: 'Discover',
        // Discovery lists ONLY the Reference Library.
        links: [
          { label: 'Reference Library', href: '/pdf' },
          { label: 'Search', href: '/search' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ],
      },
    ],
    bottomNote: 'Curated with care · reference-first · quiet on the eyes.',
  },
  commonLabels: {
    readMore: 'Open reference',
    viewAll: 'View all',
    explore: 'Explore the library',
    latest: 'Latest additions',
    related: 'Related references',
    published: 'In the library',
  },
} as const
