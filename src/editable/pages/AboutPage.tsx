import { ArrowUpRight, BookOpen, Check, Layers, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { getTaskConfig } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

const REFERENCE_LIBRARY = 'Reference Library'

export default function AboutPage() {
  const pdfTask = getTaskConfig('pdf')
  const pdfRoute = pdfTask?.enabled ? pdfTask.route : '/'
  return (
    <EditableSiteShell>
      <main className="min-h-screen">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_-10%,var(--slot4-accent-soft),transparent_65%)]"
          />
          <div className={`${dc.shell.section} relative pt-20 pb-14 text-center sm:pt-28`}>
            <EditableReveal className="mx-auto max-w-3xl" index={0}>
              <span className={dc.badge.accentPill}>
                <Sparkles className="h-3.5 w-3.5" /> {pagesContent.about.badge}
              </span>
              <h1 className={`${dc.type.heroTitle} mt-6`}>{pagesContent.about.title}</h1>
              <p className={`${dc.type.lead} mx-auto mt-6 max-w-2xl`}>
                {pagesContent.about.description}
              </p>
            </EditableReveal>
          </div>
        </section>

        <section className={`${dc.shell.section} pb-8`}>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <EditableReveal className="rounded-[2rem] border border-[var(--editable-border)] bg-white p-8 sm:p-12" index={0}>
              <span className={dc.badge.accentPill}>
                <BookOpen className="h-3.5 w-3.5" /> Our approach
              </span>
              <h2 className={`${dc.type.sectionTitle} mt-5`}>
                A calmer, reference-first way to work with knowledge.
              </h2>
              <div className="mt-6 space-y-5 text-[15px] leading-[1.75] text-[var(--slot4-muted-text)]">
                {pagesContent.about.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={pdfRoute} className={dc.button.primary}>
                  Enter the {REFERENCE_LIBRARY} <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className={dc.button.secondary}>
                  Talk to us
                </Link>
              </div>
            </EditableReveal>

            <div className="space-y-5">
              {pagesContent.about.values.map((value, i) => (
                <EditableReveal key={value.title} index={i}>
                  <div className="rounded-3xl border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--slot4-accent)]">
                      {i === 0 ? <Layers className="h-5 w-5" /> : i === 1 ? <BookOpen className="h-5 w-5" /> : <Check className="h-5 w-5" />}
                    </span>
                    <h3 className="editable-display mt-4 text-xl font-medium tracking-[-0.01em]">{value.title}</h3>
                    <p className="mt-3 text-[15px] leading-[1.6] text-[var(--slot4-muted-text)]">{value.description}</p>
                  </div>
                </EditableReveal>
              ))}
            </div>
          </div>
        </section>

        <section className={`${dc.shell.section} py-16`}>
          <EditableReveal className="rounded-[2.25rem] bg-[linear-gradient(135deg,#6950e8_0%,#8a76ff_60%,#fd9a57_140%)] p-10 text-center text-white sm:p-14">
            <p className="editable-label text-white/85">Ready when you are</p>
            <h2 className="editable-display mt-3 text-3xl leading-[1.1] tracking-[-0.015em] sm:text-4xl">
              Open the {REFERENCE_LIBRARY} and start browsing.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/85">
              Every entry is free to read, download and cite. Curated for clarity, updated regularly.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href={pdfRoute}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-[#3d2fa5] transition hover:brightness-95"
              >
                Browse now <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </EditableReveal>
        </section>
      </main>
    </EditableSiteShell>
  )
}
