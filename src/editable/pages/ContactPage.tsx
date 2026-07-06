'use client'

import { BookOpen, Mail, MessageSquare, Sparkles, UploadCloud } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

const REFERENCE_LIBRARY = 'Reference Library'

const lanes = [
  {
    icon: UploadCloud,
    title: 'Contribute a reference',
    body: `Submit a guide, report or downloadable resource to the ${REFERENCE_LIBRARY}. We review every submission for clarity and citeability.`,
  },
  {
    icon: BookOpen,
    title: 'Suggest a topic',
    body: 'Tell us what belongs on the shelf — categories, missing references, requests from your team.',
  },
  {
    icon: MessageSquare,
    title: 'Feedback & corrections',
    body: 'Spotted an issue in an entry or want to flag a broken link? Send a note and we will follow up.',
  },
  {
    icon: Sparkles,
    title: 'Partnerships',
    body: 'Institutional partners, curators, and reference-sharing collaborations are welcome.',
  },
]

export default function ContactPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-screen">
        <section className={`${dc.shell.section} pt-20 pb-10 sm:pt-24`}>
          <EditableReveal className="mx-auto max-w-3xl text-center" index={0}>
            <span className={dc.badge.accentPill}>
              <Mail className="h-3.5 w-3.5" /> {pagesContent.contact.eyebrow}
            </span>
            <h1 className={`${dc.type.heroTitle} mt-6`}>{pagesContent.contact.title}</h1>
            <p className={`${dc.type.lead} mx-auto mt-5 max-w-2xl`}>{pagesContent.contact.description}</p>
          </EditableReveal>
        </section>

        <section className={`${dc.shell.section} pb-16`}>
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              {lanes.map((lane, i) => {
                const Icon = lane.icon
                return (
                  <EditableReveal key={lane.title} index={i}>
                    <div className="h-full rounded-3xl border border-[var(--editable-border)] bg-white p-6 transition duration-500 hover:-translate-y-1 hover:border-[var(--slot4-accent)]">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="editable-display mt-4 text-lg font-medium tracking-[-0.005em]">{lane.title}</h3>
                      <p className="mt-3 text-[15px] leading-6 text-[var(--slot4-muted-text)]">{lane.body}</p>
                    </div>
                  </EditableReveal>
                )
              })}
            </div>

            <EditableReveal className="rounded-[2rem] border border-[var(--editable-border)] bg-white p-7 shadow-[0_20px_50px_rgba(105,80,232,0.12)] sm:p-9">
              <h2 className="editable-display text-2xl font-medium tracking-[-0.015em]">
                {pagesContent.contact.formTitle}
              </h2>
              <p className="mt-2 text-sm text-[var(--slot4-muted-text)]">
                We reply within a couple of working days. All submissions are reviewed by a real human.
              </p>
              <div className="mt-6">
                <EditableContactLeadForm />
              </div>
            </EditableReveal>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
