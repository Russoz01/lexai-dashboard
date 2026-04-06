'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import ThemisBackground from '@/components/ThemisBackground'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login')
        return
      }
      const meta = data.user.user_metadata
      setUser({
        name: meta?.nome || data.user.email?.split('@')[0] || 'Usuario',
        role: meta?.role || 'Estudante · Direito',
      })
    })
  }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      {/* z-0: Themis canvas behind everything */}
      <ThemisBackground />

      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* z-100: Sidebar */}
      <div className={sidebarOpen ? 'open' : ''} id="sidebar-wrapper">
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* z-10: Main content area (above Themis canvas) */}
      <div className="main-content" style={{ position: 'relative', zIndex: 10 }}>
        <Header
          userName={user?.name}
          userRole={user?.role}
          onToggleSidebar={() => setSidebarOpen(v => !v)}
        />
        {children}
      </div>
    </div>
  )
}
