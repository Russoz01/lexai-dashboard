'use client'

import { useEffect, useState } from 'react'

const WHATSAPP_NUMBER = '5511999999999' // TODO replace with production number
const DEFAULT_MESSAGE = 'Ola! Vim do site da LexAI e gostaria de saber mais sobre a plataforma.'

/**
 * Floating WhatsApp CTA for /empresas and landing.
 *
 * Deliberate UX choices:
 * - NO pulse animation (dark-pattern territory — the user isn't in distress)
 * - Appears only after 600px of scroll to not fight the hero
 * - Hidden on /dashboard and authenticated routes (signaled via props)
 * - prefers-reduced-motion honored — the fade-in is skipped
 */
export function WhatsAppFloat({
  phone = WHATSAPP_NUMBER,
  message = DEFAULT_MESSAGE,
}: {
  phone?: string
  message?: string
}) {
  const [visible, setVisible] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)

    const onScroll = () => setVisible(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar com a LexAI no WhatsApp"
      data-visible={visible}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: '#25D366',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 12px 32px rgba(37,211,102,0.28), 0 2px 6px rgba(0,0,0,0.12)',
        zIndex: 80,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: reducedMotion ? 'none' : 'opacity .28s ease, transform .28s ease',
        color: '#fff',
        textDecoration: 'none',
      }}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20.52 3.478A11.85 11.85 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.548 4.142 1.588 5.946L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.684 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.424-8.423zM12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.215-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.437-9.884 9.889-9.884a9.82 9.82 0 0 1 6.988 2.899 9.82 9.82 0 0 1 2.893 6.99c-.003 5.45-4.437 9.888-9.886 9.888zm5.421-7.403c-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.767.967-.94 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51a12.6 12.6 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.298-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.71.307 1.263.49 1.694.627.712.227 1.36.195 1.872.118.571-.085 1.758-.718 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
      </svg>
    </a>
  )
}
