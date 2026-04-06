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
    <>
      {/* Fixed backgrounds — z-0 */}
      <ThemisBackground />

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

      <style>{`
        @keyframes fadeInPage {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
