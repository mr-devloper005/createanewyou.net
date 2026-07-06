'use client'

import Link from 'next/link'
import { ArrowUpRight, Mail, Github, Twitter, Linkedin } from 'lucide-react'
import { SITE_CONFIG, getTaskConfig } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

/*
  Multi-column footer — reference: visiomate.webflow.io.
  Discovery column lists ONLY the Reference Library (renamed pdf). No profile
  surfacing. CTA strip at the top, brand block + newsletter row on the left,
  columns on the right, bottom copyright bar.
*/

const REFERENCE_LIBRARY_LABEL = 'Reference Library'

export function EditableFooter() {
  const pdfTask = getTaskConfig('pdf')
  const pdfRoute = pdfTask?.enabled ? pdfTask.route : null
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()
  const description =
    globalContent.footer?.description ||
    `A curated Reference Library — guides, reports and downloadable resources, easy to find and easy to cite.`

  return (
    <footer className="mt-24 bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      {/* CTA strip ------------------------------------------------------- */}
      <div className="mx-auto max-w-[var(--editable-container)] px-5 pt-16 sm:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#6950e8_0%,#8f7cff_60%,#fd9a57_120%)] px-8 py-14 sm:px-12 sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/12 blur-3xl"
          />
          <div className="relative flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="editable-label text-white/80">Ready when you are</p>
              <h2 className="editable-display mt-3 text-3xl leading-[1.1] tracking-[-0.015em] text-white sm:text-4xl md:text-[2.5rem]">
                Everything you need, in one Reference Library.
              </h2>
              <p className="mt-4 max-w-lg text-white/85 sm:text-lg">
                Browse the collection, download what you need, or contribute a resource of your own.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {pdfRoute ? (
                <Link
                  href={pdfRoute}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-[#3d2fa5] transition hover:brightness-95"
                >
                  Browse the Library <ArrowUpRight className="h-4 w-4" />
                </Link>
              ) : null}
              <Link
                href="/create"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/5 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/12"
              >
                Contribute a resource
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main columns --------------------------------------------------- */}
      <div className="mx-auto grid max-w-[var(--editable-container)] gap-14 px-5 pb-14 pt-16 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
              <img
                src="/favicon.png?v=20260706"
                alt={SITE_CONFIG.name}
                className="h-9 w-9 object-contain"
              />
            </span>
            <span className="editable-display text-xl font-medium tracking-[-0.01em] text-white">
              {SITE_CONFIG.name}
            </span>
          </Link>
          <p className="mt-5 max-w-md text-[15px] leading-[1.65] text-white/70">{description}</p>
          
        </div>

        <div>
          <h3 className="editable-label text-white/60">Discover</h3>
          <div className="mt-5 grid gap-3">
            {pdfRoute ? (
              <Link
                href={pdfRoute}
                className="inline-flex items-center gap-2 text-sm font-medium text-white/85 transition hover:text-white"
              >
                {REFERENCE_LIBRARY_LABEL} <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            ) : null}
            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/85 transition hover:text-white"
            >
              Search
            </Link>
          </div>
        </div>

        <div>
          <h3 className="editable-label text-white/60">Resources</h3>
          <div className="mt-5 grid gap-3">
            <Link href="/about" className="text-sm font-medium text-white/85 transition hover:text-white">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium text-white/85 transition hover:text-white">
              Contact
            </Link>
          </div>
        </div>

        <div>
          <h3 className="editable-label text-white/60">Account</h3>
          <div className="mt-5 grid gap-3">
            {session ? (
              <>
                <Link href="/create" className="text-sm font-medium text-white/85 transition hover:text-white">
                  Submit a resource
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="text-left text-sm font-medium text-white/85 transition hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-white/85 transition hover:text-white">
                  Sign in
                </Link>
                <Link href="/signup" className="text-sm font-medium text-white/85 transition hover:text-white">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[var(--editable-container)] flex-col gap-3 px-5 py-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>
            © {year} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <p className="text-white/50">Curated with care · reference-first · quiet on the eyes.</p>
        </div>
      </div>
    </footer>
  )
}
