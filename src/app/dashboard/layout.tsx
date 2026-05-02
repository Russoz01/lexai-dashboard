'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { createClient } from '@/lib/supabase'
import { useTheme } from '@/context/ThemeContext'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import TopoBackground from '@/components/TopoBackground'
import { ToastContainer } from '@/components/Toast'
import { ConfirmDialogContainer } from '@/components/ConfirmDialog'
import CommandPalette from '@/components/CommandPalette'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()
  // Garante que ThemeProvider montou + leu localStorage antes do Header.
  useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)

  // Audit fix v11.1 (2026-05-02): dashboard SEMPRE em dark.
  // 27+ pages com colors hardcoded inline (rgba(20,20,20,0.85), #bfa68e etc)
  // não adaptam ao tema. Tokenizar todas = 4h+ de trabalho. Decisão
  // pragmática: brand editorial dark é coerente (Linear faz igual). Light
  // mode aplica em landing/marketing/legal onde já tá tokenizado.
  // Salva preferência do user; quando sair do dashboard, restora.
  useEffect(() => {
    if (typeof document === 'undefined') return
    const html = document.documentElement
    const previous = html.getAttribute('data-theme') ?? 'dark'
    html.setAttribute('data-theme', 'dark')
    return () => {
      // Ao desmontar (navegou pra landing), volta pra preferência efetiva
      try {
        const pref = localStorage.getItem('pralvex-theme') || 'dark'
        const eff = pref === 'light' ? 'light' : 'dark'
        html.setAttribute('data-theme', eff)
      } catch {
        html.setAttribute('data-theme', previous)
      }
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (!isMounted) return
        if (error || !data.user) {
          router.replace('/login')
          return
        }
        const meta = data.user.user_metadata
        const plano = (data.user.app_metadata?.plano as string) || 'unknown'
        // P0 audit fix: Sentry user context — sem isso, errors chegam sem
        // userId/plan = impossível triagem por tier (Founding vs Solo).
        // Email NUNCA setado (LGPD); só id + plano (não-PII).
        Sentry.setUser({ id: data.user.id, plano })
        setUser({
          name: meta?.nome || data.user.email?.split('@')[0] || 'Usuario',
          role: meta?.role || 'Advogado',
        })
      } catch {
        if (isMounted) router.replace('/login')
      }
    }
    checkAuth()
    return () => { isMounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {/* Background layers — z-0 (sempre TopoBackground v10 noir) */}
      <TopoBackground />

      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar — z-100 */}
      <div className={sidebarOpen ? 'open' : ''} id="sidebar-wrapper">
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content — z-10 */}
      <div className="main-content" style={{ position: 'relative', zIndex: 10 }}>
        <Header
          userName={user?.name}
          userRole={user?.role}
          onToggleSidebar={() => setSidebarOpen(v => !v)}
        />
        <div style={{ animation: 'fadeInPage 0.4s ease both' }}>
          {children}
        </div>
      </div>

      {/* Global toast notifications + confirm dialog */}
      <ToastContainer />
      <ConfirmDialogContainer />
      <CommandPalette />

      <style>{`
        @keyframes fadeInPage {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
