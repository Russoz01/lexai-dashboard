'use client'

import { createContext, useContext, useEffect, useState } from 'react'

/* ════════════════════════════════════════════════════════════════
 * ThemeContext (v10.8 · 2026-04-22)
 * ────────────────────────────────────────────────────────────────
 * LIGHT MODE FOI REMOVIDO — o painel é noir champagne sempre.
 * O contrato do contexto continua exposto pra não quebrar imports
 * existentes (Header, Sidebar, dashboard/layout etc), mas:
 *   - theme é congelado em 'dark'
 *   - toggleTheme vira no-op
 *   - data-theme é forçado pra 'dark' no <html> no mount
 * Qualquer pref antiga em localStorage é sobrescrita.
 * ═══════════════════════════════════════════════════════════════ */

type Theme = 'dark'

const ThemeContext = createContext<{
  theme: Theme
  toggleTheme: () => void
}>({ theme: 'dark', toggleTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', 'dark')
    // Sobrescreve qualquer pref antiga
    try { localStorage.setItem('pralvex-theme', 'dark') } catch { /* ignore */ }

    // Reaplica design prefs salvas (cores customizadas)
    try {
      const prefs = localStorage.getItem('pralvex-design-prefs')
      if (prefs) {
        const p = JSON.parse(prefs)
        if (p.colors) {
          if (p.colors.primary) {
            root.style.setProperty('--accent', p.colors.primary)
            root.style.setProperty('--accent-light', `${p.colors.primary}18`)
            root.style.setProperty('--accent-dark', p.colors.primary)
            root.style.setProperty('--sidebar-active-bar', p.colors.primary)
          }
          if (p.colors.success) {
            root.style.setProperty('--success', p.colors.success)
            root.style.setProperty('--success-light', `${p.colors.success}14`)
          }
          if (p.colors.warning) {
            root.style.setProperty('--warning', p.colors.warning)
            root.style.setProperty('--warning-light', `${p.colors.warning}14`)
          }
          if (p.colors.danger) {
            root.style.setProperty('--danger', p.colors.danger)
            root.style.setProperty('--danger-light', `${p.colors.danger}14`)
          }
          if (p.colors.info) root.style.setProperty('--info', p.colors.info)
        }
      }
    } catch { /* ignore */ }

    setMounted(true)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme: 'dark', toggleTheme: () => {} }}>
      <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
