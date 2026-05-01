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

export function MicrosoftClarity() {
  const [consentGiven, setConsentGiven] = useState(false)

  // Verifica consentimento do CookieConsent banner — só carrega se 'all'
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return

    try {
      const consent = sessionStorage.getItem(CONSENT_STORAGE_KEY)
      if (consent === 'all') setConsentGiven(true)
    } catch {
      // sessionStorage indisponível (private mode etc) — não carrega
    }

    // Listener: se user aceitar cookies durante a sessão, ativa Clarity
    const handleStorage = () => {
      try {
        const consent = sessionStorage.getItem(CONSENT_STORAGE_KEY)
        if (consent === 'all') setConsentGiven(true)
      } catch { /* noop */ }
    }
    window.addEventListener('storage', handleStorage)

    // Re-checa após 500ms (CookieConsent escreve sessionStorage no clique)
    const interval = window.setInterval(handleStorage, 500)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.clearInterval(interval)
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
