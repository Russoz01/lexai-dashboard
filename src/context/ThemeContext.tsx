'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

/* ════════════════════════════════════════════════════════════════
 * ThemeContext (v11.0 · 2026-05-02)
 * ────────────────────────────────────────────────────────────────
 * Light mode foi reintroduzido como opcional (default = dark).
 * O usuário escolhe entre 3 estados:
 *   - 'dark'   — força noir champagne (default editorial)
 *   - 'light'  — força atelier cream
 *   - 'system' — segue prefers-color-scheme do SO
 *
 * O DOM é controlado via atributo data-theme no <html> ('dark'|'light').
 * O boot script no <head> (layout.tsx) já aplica antes de hydration.
 *
 * Storage: localStorage('pralvex-theme') guarda a PREFERÊNCIA
 * ('dark'|'light'|'system'). data-theme guarda o EFETIVO.
 *
 * Eventos: emite 'pralvex-theme-change' quando preferência muda
 * (mesmo padrão usado pelo CookieConsent).
 * ═══════════════════════════════════════════════════════════════ */

export type ThemePref = 'dark' | 'light' | 'system'
export type ThemeEffective = 'dark' | 'light'

const STORAGE_KEY = 'pralvex-theme'
const EVENT_NAME = 'pralvex-theme-change'

function readSystem(): ThemeEffective {
  if (typeof window === 'undefined') return 'dark'
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'dark'
  }
}

function readPref(): ThemePref {
  if (typeof window === 'undefined') return 'dark'
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch { /* ignore */ }
  // Default dark — preserva brand editorial
  return 'dark'
}

function effectiveOf(pref: ThemePref): ThemeEffective {
  return pref === 'system' ? readSystem() : pref
}

function applyToDOM(effective: ThemeEffective) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', effective)
}

interface ThemeCtx {
  /** Preferência do usuário (light/dark/system) */
  pref: ThemePref
  /** Tema efetivo aplicado ao DOM (light/dark) */
  theme: ThemeEffective
  /** Define a preferência e persiste */
  setPref: (p: ThemePref) => void
  /** Alterna dark <-> light (ignora system). Mantido para compat. */
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeCtx>({
  pref: 'dark',
  theme: 'dark',
  setPref: () => {},
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>('dark')
  const [theme, setTheme] = useState<ThemeEffective>('dark')
  const [mounted, setMounted] = useState(false)

  // Boot — lê preferência + aplica
  useEffect(() => {
    const p = readPref()
    const eff = effectiveOf(p)
    setPrefState(p)
    setTheme(eff)
    applyToDOM(eff)

    // Reaplica design prefs salvas (cores customizadas do user)
    try {
      const root = document.documentElement
      const prefs = localStorage.getItem('pralvex-design-prefs')
      if (prefs) {
        const dp = JSON.parse(prefs)
        if (dp.colors) {
          if (dp.colors.primary) {
            root.style.setProperty('--accent', dp.colors.primary)
            root.style.setProperty('--accent-light', `${dp.colors.primary}18`)
            root.style.setProperty('--accent-dark', dp.colors.primary)
            root.style.setProperty('--sidebar-active-bar', dp.colors.primary)
          }
          if (dp.colors.success) {
            root.style.setProperty('--success', dp.colors.success)
            root.style.setProperty('--success-light', `${dp.colors.success}14`)
          }
          if (dp.colors.warning) {
            root.style.setProperty('--warning', dp.colors.warning)
            root.style.setProperty('--warning-light', `${dp.colors.warning}14`)
          }
          if (dp.colors.danger) {
            root.style.setProperty('--danger', dp.colors.danger)
            root.style.setProperty('--danger-light', `${dp.colors.danger}14`)
          }
          if (dp.colors.info) root.style.setProperty('--info', dp.colors.info)
        }
      }
    } catch { /* ignore */ }

    setMounted(true)
  }, [])

  // Sincroniza com prefers-color-scheme quando pref = 'system'
  useEffect(() => {
    if (pref !== 'system' || typeof window === 'undefined') return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const eff: ThemeEffective = mql.matches ? 'dark' : 'light'
      setTheme(eff)
      applyToDOM(eff)
    }
    // addEventListener é o moderno; addListener fallback Safari < 14
    if (mql.addEventListener) mql.addEventListener('change', onChange)
    else mql.addListener(onChange)
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange)
      else mql.removeListener(onChange)
    }
  }, [pref])

  // Listener cross-tab — mesma key em outra aba dispara storage event
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return
      const p = readPref()
      const eff = effectiveOf(p)
      setPrefState(p)
      setTheme(eff)
      applyToDOM(eff)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setPref = useCallback((p: ThemePref) => {
    try { localStorage.setItem(STORAGE_KEY, p) } catch { /* ignore */ }
    const eff = effectiveOf(p)
    setPrefState(p)
    setTheme(eff)
    applyToDOM(eff)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { pref: p, theme: eff } }))
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setPref(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setPref])

  // Audit fix P1-6 (2026-05-02): removido wrapper visibility:hidden — CLS desnecessário.
  // O boot script no <head> de layout.tsx já aplica data-theme antes do primeiro
  // paint, então não há FOUC a esconder. mounted é mantido só pra evitar SSR/CSR
  // mismatch warning em consumers que dependem do tema (gracefully renderiza com
  // default dark via :root tokens).
  void mounted
  return (
    <ThemeContext.Provider value={{ pref, theme, setPref, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
