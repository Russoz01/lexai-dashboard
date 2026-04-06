'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{
  theme: Theme
  toggleTheme: () => void
}>({ theme: 'dark', toggleTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('lexai-theme') as Theme | null
    const preferred = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    setTheme(preferred)
    document.documentElement.setAttribute('data-theme', preferred)

    // Apply saved design preferences
    try {
      const prefs = localStorage.getItem('lexai-design-prefs')
      if (prefs) {
        const p = JSON.parse(prefs)
        const root = document.documentElement
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

  function toggleTheme() {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('lexai-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
