'use client'

import { useTheme } from '@/context/ThemeContext'
import { useState, useEffect } from 'react'

interface HeaderProps {
  userName?: string
  userRole?: string
  onToggleSidebar: () => void
}

export default function Header({ userName = 'Usuario', userRole = 'LexAI', onToggleSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const [time, setTime] = useState('')

  useEffect(() => {
    function tick() {
      setTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [])

  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="mobile-toggle" onClick={onToggleSidebar}>
          <i className="bi bi-list" />
        </button>
        <div className="header-status">
          <span className="dot" />
          Online
        </div>
        {time && (
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.5px' }}>
            {time}
          </span>
        )}
      </div>

      <div className="header-user">
        <button className="notif-bell" title="Notificacoes" onClick={() => window.location.href='/dashboard/prazos'}>
          <i className="bi bi-bell" />
          <span className="notif-dot" />
        </button>

        <button className="header-theme-toggle" onClick={toggleTheme}
          title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}>
          <i className={`bi ${theme === 'light' ? 'bi-moon' : 'bi-sun'}`} />
        </button>

        <div className="header-user-info">
          <div className="name">{userName}</div>
          <div className="role">{userRole}</div>
        </div>
        <div className="header-avatar" style={{
          transition: 'all 0.3s ease',
          background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
        }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 16px rgba(59,130,246,0.40)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '' }}>
          {initials}
        </div>
      </div>
    </header>
  )
}
