import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalLoginForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/login',
    title: 'Sign in',
    description: pagesContent.auth.login.metadataDescription,
  })
}

export default function LoginPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-panel-bg)]">
        <section className={`${dc.shell.section} grid min-h-[calc(100vh-12rem)] items-center gap-12 py-16 lg:grid-cols-[1fr_0.95fr]`}>
          <div>
            <span className={dc.badge.accentPill}>
              <BookOpen className="h-3.5 w-3.5" /> {pagesContent.auth.login.badge}
            </span>
            <h1 className={`${dc.type.heroTitle} mt-6`}>{pagesContent.auth.login.title}</h1>
            <p className={`${dc.type.lead} mt-5 max-w-lg`}>{pagesContent.auth.login.description}</p>
          </div>
          <div className="rounded-[2rem] border border-[var(--editable-border)] bg-white p-7 shadow-[0_20px_50px_rgba(105,80,232,0.14)] sm:p-9">
            <h2 className="editable-display text-2xl font-medium tracking-[-0.015em]">
              {pagesContent.auth.login.formTitle}
            </h2>
            <EditableLocalLoginForm />
            <p className="mt-6 text-sm text-[var(--slot4-muted-text)]">
              New here?{' '}
              <Link href="/signup" className="font-medium text-[var(--slot4-accent)] underline-offset-4 hover:underline">
                {pagesContent.auth.login.createCta}
              </Link>
            </p>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
