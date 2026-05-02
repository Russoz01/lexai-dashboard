'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

/**
 * OfflineBanner · v1.0 (2026-05-02)
 *
 * Banner discreto no topo quando o navegador detecta offline. Aparece
 * automaticamente via `navigator.onLine` + eventos online/offline.
 *
 * Por que existe: durante demo, se conexão cair, prospect veria erros
 * crípticos de rede em cada tentativa. Banner explica o problema antes
 * que o user tente algo que vai falhar.
 *
 * Wave C5 (2026-05-02) — pre-demo resilience layer.
 */
export function OfflineBanner() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    // Estado inicial — `navigator.onLine` é confiável em browsers modernos
    setOnline(typeof navigator !== 'undefined' ? navigator.onLine : true)

    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (online) return null

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'linear-gradient(135deg, #b91c1c, #991b1b)',
        color: '#fff',
        padding: '10px 16px',
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 500,
        fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      }}
    >
      <WifiOff size={14} strokeWidth={2} aria-hidden />
      <span>Sem conexão com a internet. Algumas funções não vão responder até voltar.</span>
    </div>
  )
}
