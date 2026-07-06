'use client'

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react'

/*
  IntersectionObserver-driven fade + slide-up. Per-item stagger via `index`.
  Hidden state only applied AFTER mount so JS-off visitors see content.
*/
export function EditableReveal({
  children,
  index = 0,
  className = '',
  as: Tag = 'div',
  step = 80,
  once = true,
  style,
}: {
  children: ReactNode
  index?: number
  className?: string
  as?: ElementType
  step?: number
  once?: boolean
  style?: CSSProperties
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            if (once) obs.disconnect()
          } else if (!once) {
            setVisible(false)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [once])

  const state = !mounted ? '' : visible ? 'is-visible' : 'is-hidden'
  const delay = mounted ? `${Math.min(index, 12) * step}ms` : '0ms'
  const Element = Tag as unknown as 'div'

  return (
    <Element
      ref={ref as never}
      className={`editable-reveal ${state} ${className}`.trim()}
      style={{ transitionDelay: delay, ...style }}
    >
      {children}
    </Element>
  )
}
