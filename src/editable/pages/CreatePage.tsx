'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Lock,
  Send,
  Sparkles,
  UploadCloud,
} from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

const REFERENCE_LIBRARY = 'Reference Library'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

// Rename public labels; profile task is hidden from public UI so it's never
// offered in the picker. Underlying task keys are unchanged.
const publicLabel = (key: TaskKey, fallback: string): string => {
  if (key === 'pdf') return REFERENCE_LIBRARY
  return fallback
}

const publicDescription = (key: TaskKey, fallback: string): string => {
  if (key === 'pdf')
    return 'Contribute a guide, report or downloadable resource to the shared library.'
  return fallback
}

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

const fieldClass =
  'w-full rounded-2xl border border-[var(--editable-border)] bg-white px-4 py-3 text-sm font-medium text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-muted-text)] focus:border-[var(--slot4-accent)]'

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  // Public submission surface never promotes profile creation. The profile
  // task remains functional internally, but is filtered out here.
  const publicTasks = useMemo(
    () => SITE_CONFIG.tasks.filter((task) => task.enabled && task.key !== 'profile'),
    []
  )
  const [task, setTask] = useState<TaskKey>(
    (publicTasks.find((item) => item.key === 'pdf')?.key ||
      publicTasks[0]?.key ||
      'pdf') as TaskKey
  )
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const activeTask = publicTasks.find((item) => item.key === task) || publicTasks[0]

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className="min-h-screen">
          <section className={`${dc.shell.section} py-16 sm:py-24`}>
            <EditableReveal
              className="mx-auto grid max-w-5xl gap-10 rounded-[2rem] border border-[var(--editable-border)] bg-white p-8 shadow-[0_20px_60px_rgba(105,80,232,0.14)] md:grid-cols-[0.85fr_1.15fr] md:p-12"
              index={0}
            >
              <div className="flex items-center justify-center rounded-3xl bg-[linear-gradient(135deg,#6950e8_0%,#8a76ff_60%,#fd9a57_140%)] p-10 text-white">
                <Lock className="h-20 w-20 opacity-90" />
              </div>
              <div>
                <span className={dc.badge.accentPill}>
                  <Sparkles className="h-3.5 w-3.5" /> {pagesContent.create.locked.badge}
                </span>
                <h1 className={`${dc.type.heroTitle} mt-6`}>{pagesContent.create.locked.title}</h1>
                <p className={`${dc.type.lead} mt-5 max-w-xl`}>
                  {pagesContent.create.locked.description}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/login" className={dc.button.primary}>
                    Sign in <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href="/signup" className={dc.button.secondary}>
                    Get started
                  </Link>
                </div>
              </div>
            </EditableReveal>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className="min-h-screen">
        <section className={`${dc.shell.section} py-12 sm:py-16`}>
          <div className="grid gap-8 rounded-[2rem] border border-[var(--editable-border)] bg-white p-6 shadow-[0_20px_60px_rgba(105,80,232,0.12)] lg:grid-cols-[0.85fr_1.15fr] lg:p-10">
            <aside>
              <span className={dc.badge.accentPill}>
                <UploadCloud className="h-3.5 w-3.5" /> {pagesContent.create.hero.badge}
              </span>
              <h1 className={`${dc.type.heroTitle} mt-6`}>Contribute a reference.</h1>
              <p className={`${dc.type.lead} mt-5 max-w-xl`}>
                Add a guide, report or downloadable resource to the shared {REFERENCE_LIBRARY}.
                Every submission is reviewed for clarity and citeability.
              </p>

              <div className="mt-8 grid gap-3">
                {publicTasks.map((item) => {
                  const label = publicLabel(item.key as TaskKey, item.label)
                  const description = publicDescription(item.key as TaskKey, item.description)
                  const active = item.key === task
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTask(item.key as TaskKey)}
                      className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition duration-500 ${
                        active
                          ? 'border-[var(--slot4-accent)] bg-[var(--slot4-accent-soft)] text-[var(--slot4-page-text)]'
                          : 'border-[var(--editable-border)] bg-white hover:-translate-y-0.5 hover:border-[var(--slot4-accent)]'
                      }`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--slot4-accent)]">
                        <FileText className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="editable-display block text-[15px] font-medium">{label}</span>
                        <span className="mt-1 block text-xs text-[var(--slot4-muted-text)]">
                          {description}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </aside>

            <form
              onSubmit={submit}
              className="rounded-3xl border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="editable-label text-[var(--slot4-accent)]">
                    Contribute {publicLabel((activeTask?.key || 'pdf') as TaskKey, activeTask?.label || 'reference')}
                  </p>
                  <h2 className="editable-display mt-2 text-2xl font-medium tracking-[-0.015em]">
                    {pagesContent.create.formTitle}
                  </h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[var(--slot4-page-text)]">
                  Signed in · {session.name}
                </span>
              </div>

              <div className="mt-6 grid gap-4">
                <input
                  className={fieldClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Reference title"
                  required
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    className={fieldClass}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Category"
                  />
                  <input
                    className={fieldClass}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Source or file URL"
                  />
                </div>
                <input
                  className={fieldClass}
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Cover image URL (optional)"
                />
                <textarea
                  className={`${fieldClass} min-h-24`}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Short summary — one paragraph"
                  required
                />
                <textarea
                  className={`${fieldClass} min-h-48`}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Main content, key sections, or a longer description"
                  required
                />
              </div>

              {created ? (
                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                  <CheckCircle2 className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-semibold">{pagesContent.create.successTitle}</p>
                    <p className="text-xs opacity-80">{created.title}</p>
                  </div>
                </div>
              ) : null}

              <button type="submit" className={`${dc.button.primary} mt-6 w-full`}>
                <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
              </button>
            </form>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
