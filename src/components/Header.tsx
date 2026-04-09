'use client'

import { useTheme } from '@/context/ThemeContext'
import { useState, useEffect } from 'react'
import OnboardingModal from './OnboardingModal'

interface HeaderProps {
  userName?: string
  userRole?: string
  onToggleSidebar: () => void
}

export default function Header({ userName = 'Usuario', userRole = 'LexAI', onToggleSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const [time, setTime] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    function tick() {
      setTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!localStorage.getItem('lexai-onboarded')) {
      setShowHelp(true)
      localStorage.setItem('lexai-onboarded', '1')
    }
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
        <span suppressHydrationWarning style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.5px', minWidth: 36, display: 'inline-block' }}>
          {mounted ? time : ''}
        </span>
      </div>

      <div className="header-user">
        <button className="notif-bell" title="Ajuda e tour do LexAI" onClick={() => setShowHelp(true)}>
          <i className="bi bi-question-circle" />
        </button>

        <button className="notif-bell" title="Notificacoes" onClick={() => window.location.href='/dashboard/prazos'}>
          <i className="bi bi-bell" />
          <span className="notif-dot" />
        </button>

        <button className="header-theme-toggle" onClick={toggleTheme}
          suppressHydrationWarning
          title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}>
          <i suppressHydrationWarning className={`bi ${mounted && theme === 'light' ? 'bi-moon' : 'bi-sun'}`} />
        </button>

        <div className="header-user-info">
          <div className="name">{userName}</div>
          <div className="role">{userRole}</div>
        </div>
        <div className="header-avatar" style={{
          transition: 'all 0.3s ease',
          background: 'linear-gradient(135deg, var(--accent), var(--stone))',
          color: 'var(--bg-base)',
        }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 16px rgba(191,166,142,0.42)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '' }}>
          {initials}
        </div>
      </div>
      <OnboardingModal open={showHelp} onClose={() => setShowHelp(false)} />
    </header>
  )
}
