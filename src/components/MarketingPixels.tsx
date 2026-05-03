'use client'

/* ════════════════════════════════════════════════════════════════════
 * MarketingPixels · v1.0 (2026-05-03 · audit business P0-2)
 * ────────────────────────────────────────────────────────────────────
 * Injeta os 3 pixels de tracking client-side: Meta, GA4, LinkedIn.
 *
 * Comportamento:
 *   - Le consent do CookieConsent via localStorage 'pralvex-cookie-consent'.
 *   - Se consent !== 'all' (ou ausente), nao carrega NADA (LGPD compliant).
 *   - Quando consent muda via CustomEvent 'pralvex-consent-change', re-monta.
 *   - Expoe window.pralvexPixels com helpers (purchase / signup / checkout).
 *
 * Eventos disparados manualmente nos pontos chave:
 *   - CompleteRegistration → /auth/callback (signup detectado server-side)
 *   - InitiateCheckout    → /dashboard/planos (iniciarCheckout)
 *   - Purchase            → server-side via Conversions API (webhook stripe)
 *
 * Env vars (NEXT_PUBLIC_*):
 *   - NEXT_PUBLIC_META_PIXEL_ID
 *   - NEXT_PUBLIC_GA4_ID  (formato G-XXXXXXX)
 *   - NEXT_PUBLIC_LINKEDIN_PARTNER_ID
 *
 * Cada pixel é opcional — sem env, simplesmente nao carrega.
 * ═══════════════════════════════════════════════════════════════════ */

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { captureUtm } from '@/lib/utm-capture'

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID
const LINKEDIN_PARTNER_ID = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID

const STORAGE_KEY = 'pralvex-cookie-consent'
const CONSENT_EVENT = 'pralvex-consent-change'

type ConsentLevel = 'all' | 'necessary' | null

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
    _linkedin_partner_id?: string
    _linkedin_data_partner_ids?: string[]
    lintrk?: (action: string, params?: Record<string, unknown>) => void
    pralvexPixels?: {
      signup: (email?: string) => void
      initiateCheckout: (plan: string, interval: string) => void
      purchase: (plan: string, value: number) => void
    }
  }
}

function readConsent(): ConsentLevel {
  if (typeof window === 'undefined') return null
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'all' || v === 'necessary') return v
  } catch { /* localStorage indisponivel */ }
  return null
}

export function MarketingPixels() {
  const [consent, setConsent] = useState<ConsentLevel>(null)

  useEffect(() => {
    setConsent(readConsent())
    // Audit business P2-4 (2026-05-03): captura UTM no first-load mesmo sem
    // consent — UTMs sao first-party data, nao cookies de tracking. Cookie
    // 'pralvex_utm' usado em /auth/callback pra anexar a usuarios.signup_attribution.
    try { captureUtm() } catch { /* silent */ }
    // Re-le consent quando user clica "Aceitar todos" no banner
    const onChange = () => setConsent(readConsent())
    window.addEventListener(CONSENT_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_EVENT, onChange)
  }, [])

  // Expoe helpers globais — funcionam mesmo sem consent (no-op silencioso).
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.pralvexPixels = {
      signup: (email?: string) => {
        if (consent !== 'all') return
        try {
          window.fbq?.('track', 'CompleteRegistration', email ? { em: email } : undefined)
          window.gtag?.('event', 'sign_up', { method: 'email' })
          window.lintrk?.('track', { conversion_id: 'signup' })
        } catch { /* swallow — analytics nunca pode quebrar app */ }
      },
      initiateCheckout: (plan: string, interval: string) => {
        if (consent !== 'all') return
        try {
          window.fbq?.('track', 'InitiateCheckout', { content_name: plan, content_category: interval })
          window.gtag?.('event', 'begin_checkout', { items: [{ item_name: plan, item_variant: interval }] })
          window.lintrk?.('track', { conversion_id: 'initiate_checkout' })
        } catch { /* swallow */ }
      },
      purchase: (plan: string, value: number) => {
        // Client-side Purchase é fallback — webhook server-side via Conversions
        // API é a fonte de verdade (deduplicado por event_id no Meta).
        if (consent !== 'all') return
        try {
          window.fbq?.('track', 'Purchase', { value, currency: 'BRL', content_name: plan })
          window.gtag?.('event', 'purchase', { value, currency: 'BRL', items: [{ item_name: plan }] })
          window.lintrk?.('track', { conversion_id: 'purchase' })
        } catch { /* swallow */ }
      },
    }
  }, [consent])

  // Sem consent total = nao carrega script algum
  if (consent !== 'all') return null

  return (
    <>
      {/* Meta Pixel */}
      {META_PIXEL_ID && (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {/* Google Analytics 4 */}
      {GA4_ID && (
        <>
          <Script
            id="ga4-loader"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
          />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA4_ID}', { anonymize_ip: true });
              `,
            }}
          />
        </>
      )}

      {/* LinkedIn Insight Tag */}
      {LINKEDIN_PARTNER_ID && (
        <>
          <Script
            id="linkedin-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                _linkedin_partner_id = "${LINKEDIN_PARTNER_ID}";
                window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
                window._linkedin_data_partner_ids.push(_linkedin_partner_id);
              `,
            }}
          />
          <Script
            id="linkedin-loader"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(l) {
                if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
                window.lintrk.q=[]}
                var s = document.getElementsByTagName("script")[0];
                var b = document.createElement("script");
                b.type = "text/javascript";b.async = true;
                b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
                s.parentNode.insertBefore(b, s);})(window.lintrk);
              `,
            }}
          />
        </>
      )}
    </>
  )
}

export default MarketingPixels
