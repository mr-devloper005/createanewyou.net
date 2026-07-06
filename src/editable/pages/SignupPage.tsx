import type { Metadata } from 'next'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalSignupForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/signup',
    title: 'Get started',
    description: pagesContent.auth.signup.metadataDescription,
  })
}

export default function SignupPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-panel-bg)]">
        <section className={`${dc.shell.section} grid min-h-[calc(100vh-12rem)] items-center gap-12 py-16 lg:grid-cols-[0.95fr_1fr]`}>
          <div className="rounded-[2rem] border border-[var(--editable-border)] bg-white p-7 shadow-[0_20px_50px_rgba(105,80,232,0.14)] sm:p-9">
            <h1 className="editable-display text-2xl font-medium tracking-[-0.015em]">
              {pagesContent.auth.signup.formTitle}
            </h1>
            <EditableLocalSignupForm />
            <p className="mt-6 text-sm text-[var(--slot4-muted-text)]">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-[var(--slot4-accent)] underline-offset-4 hover:underline">
                {pagesContent.auth.signup.loginCta}
              </Link>
            </p>
          </div>
          <div>
            <span className={dc.badge.accentPill}>
              <UserPlus className="h-3.5 w-3.5" /> {pagesContent.auth.signup.badge}
            </span>
            <h2 className={`${dc.type.heroTitle} mt-6`}>{pagesContent.auth.signup.title}</h2>
            <p className={`${dc.type.lead} mt-5 max-w-lg`}>{pagesContent.auth.signup.description}</p>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
