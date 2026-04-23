'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, HelpCircle, Menu } from 'lucide-react'
import OnboardingModal from './OnboardingModal'

/* ════════════════════════════════════════════════════════════════
 * Header (v10.8 · 2026-04-22)
 * ────────────────────────────────────────────────────────────────
 * Light mode REMOVIDO — botão Sun/Moon foi suprimido.
 * Painel é noir champagne sempre, alinhado à landing v10.
 * ═══════════════════════════════════════════════════════════════ */

interface HeaderProps {
  userName?: string
  userRole?: string
  onToggleSidebar: () => void
}

export default function Header({ userName = 'Usuario', userRole = 'LexAI', onToggleSidebar }: HeaderProps) {
  const router = useRouter()
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
        <button className="mobile-toggle" onClick={onToggleSidebar} aria-label="Abrir menu">
          <Menu size={18} strokeWidth={1.75} aria-hidden />
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
          <HelpCircle size={16} strokeWidth={1.75} aria-hidden />
        </button>

        <button
          className="notif-bell"
          title="Notificações — ver prazos"
          aria-label="Ver prazos e notificações"
          onClick={() => router.push('/dashboard/prazos')}
        >
          <Bell size={16} strokeWidth={1.75} aria-hidden />
          <span className="notif-dot" />
        </button>

        <div className="header-user-info">
          <div className="name">{userName}</div>
          <div className="role">{userRole}</div>
        </div>
        <div className="header-avatar" style={{
          transition: 'all 0.3s ease',
          background: 'linear-gradient(135deg, #f5e8d3, #bfa68e, #7a5f48)',
          color: '#0a0a0a',
          border: '1px solid rgba(191,166,142,0.4)',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.6), 0 4px 16px rgba(191,166,142,0.25)',
          fontFamily: "'Playfair Display', Georgia, serif",
        }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.6), 0 0 24px rgba(191,166,142,0.5)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.6), 0 4px 16px rgba(191,166,142,0.25)' }}>
          {initials}
        </div>
      </div>
      <OnboardingModal open={showHelp} onClose={() => setShowHelp(false)} />
    </header>
  )
}
