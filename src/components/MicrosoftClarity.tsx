'use client'

/* ════════════════════════════════════════════════════════════════════
 * MicrosoftClarity · v1.0 (2026-05-01)
 * ────────────────────────────────────────────────────────────────────
 * Wrapper Next.js do snippet de tracking do Microsoft Clarity.
 *
 * O QUE FAZ:
 *   - Carrega clarity.ms tag via next/script com strategy
 *     "afterInteractive" (depois do hidratação, sem bloquear render)
 *   - Só roda em produção (NODE_ENV === 'production')
 *   - Respeita consentimento de cookies (banner CookieConsent):
 *     • 'all'         -> carrega Clarity (analytics opt-in)
 *     • 'necessary'   -> NÃO carrega (categoria não estritamente
 *                        necessária per LGPD Art. 7)
 *     • null/missing  -> NÃO carrega até user decidir
 *
 * PRIVACIDADE / LGPD:
 *   Clarity por default mascara campos com dados sensíveis (CPF, CNPJ,
 *   senha, email em formulários). Configurar projeto pra "Strict Mask"
 *   no painel Clarity em https://clarity.microsoft.com/projects/.../settings/masking
 *
 * INSTALAÇÃO:
 *   <MicrosoftClarity /> em src/app/layout.tsx (dentro de <body>)
 *
 * Project: VANIXCORP · ID: wkg0mc8mwv
 * ═══════════════════════════════════════════════════════════════════ */

import Script from 'next/script'
import { useEffect, useState } from 'react'

const CLARITY_PROJECT_ID = 'wkg0mc8mwv'
const CONSENT_STORAGE_KEY = 'pralvex-cookie-consent'
const CONSENT_EVENT = 'pralvex-consent-change'

export function MicrosoftClarity() {
  const [consentGiven, setConsentGiven] = useState(false)

  // P1 audit fix (2026-05-02): event-driven em vez de polling 500ms.
  // Antes: setInterval(handleStorage, 500) drenava CPU/bateria em todo
  // visitante. Agora: ouve CustomEvent emitido pelo CookieConsent +
  // checa localStorage no mount (TTL 6 meses).
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return

    const checkConsent = () => {
      try {
        const consent = localStorage.getItem(CONSENT_STORAGE_KEY)
        if (consent === 'all') setConsentGiven(true)
      } catch { /* localStorage indisponível */ }
    }

    checkConsent()

    // Event listener: dispara quando CookieConsent persiste decisão
    const handleConsentChange = (e: Event) => {
      const detail = (e as CustomEvent<{ value: string }>).detail
      if (detail?.value === 'all') setConsentGiven(true)
    }
    window.addEventListener(CONSENT_EVENT, handleConsentChange)

    return () => {
      window.removeEventListener(CONSENT_EVENT, handleConsentChange)
    }
  }, [])

  if (!consentGiven) return null

  return (
    <Script
      id="microsoft-clarity"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
        `,
      }}
    />
  )
}
