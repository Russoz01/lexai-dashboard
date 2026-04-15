'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useTheme } from '@/context/ThemeContext'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import ThemisBackground from '@/components/ThemisBackground'
import TopoBackground from '@/components/TopoBackground'
import { ToastContainer } from '@/components/Toast'
import CommandPalette from '@/components/CommandPalette'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)

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
      {/* Background layers — z-0 */}
      {theme === 'dark' ? <TopoBackground /> : <ThemisBackground />}

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

      {/* Global toast notifications */}
      <ToastContainer />
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
