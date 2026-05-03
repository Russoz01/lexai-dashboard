'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Bell, HelpCircle, Menu } from 'lucide-react'
import OnboardingModal from './OnboardingModal'
import { ThemeToggle } from './ThemeToggle'
import { createClient } from '@/lib/supabase'
import { resolveUsuarioId } from '@/lib/usuario'

/** Wave R3 UX P0.4 (2026-05-03): hint pra command palette futuro. */
function getCmdSymbol(): string {
  if (typeof navigator === 'undefined') return 'Ctrl'
  return /Mac|iPhone|iPad/i.test(navigator.platform) ? '⌘' : 'Ctrl'
}

/* ════════════════════════════════════════════════════════════════
 * Header (v11.0 · 2026-05-02)
 * ────────────────────────────────────────────────────────────────
 * Light mode reintroduzido como opcional — toggle (sun/system/moon)
 * fica no header top-right. Default = dark (preserva brand editorial).
 * ═══════════════════════════════════════════════════════════════ */

interface HeaderProps {
  userName?: string
  userRole?: string
  onToggleSidebar: () => void
}

export default function Header({ userName = 'Usuario', userRole = 'Pralvex', onToggleSidebar }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [time, setTime] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hasUrgentPrazos, setHasUrgentPrazos] = useState(false)
  const [cmdSymbol, setCmdSymbol] = useState('Ctrl')

  useEffect(() => {
    setMounted(true)
    setCmdSymbol(getCmdSymbol())
    function tick() {
      setTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [])

  // Auto-open onboarding so quando user esta no dashboard root e ainda nao
  // concluiu o tour. Antes marcava onboarded:1 ANTES do user concluir, então
  // se user fechasse o navegador no meio nunca mais via o tour. Agora a marca
  // vai pra dentro do OnboardingModal (handleAction/handleFinish). Skip via
  // Esc/backdrop NAO persiste — user reabre via botao Help.
  useEffect(() => {
    if (pathname !== '/dashboard') return
    if (typeof window === 'undefined') return
    if (!localStorage.getItem('pralvex-onboarded')) {
      setShowHelp(true)
    }
  }, [pathname])

  // Notif bell: so renderiza dot vermelho se ha prazo urgente real (cry-wolf
  // fix). Antes pulsava sempre, mesmo sem prazo, treinando user a ignorar.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const usuarioId = await resolveUsuarioId()
        if (!usuarioId || cancelled) return
        const supabase = createClient()
        const { data } = await supabase
          .from('prazos')
          .select('data_limite,status')
          .eq('usuario_id', usuarioId)
          .eq('status', 'pendente')
        if (cancelled) return
        const hoje = new Date()
        const urgente = (data ?? []).some(p => {
          const diff = (new Date(p.data_limite + 'T00:00:00').getTime() - hoje.getTime()) / 86400000
          return diff >= 0 && diff <= 7
        })
        setHasUrgentPrazos(urgente)
      } catch { /* silent — sem prazo nao quebra header */ }
    })()
    return () => { cancelled = true }
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
        <ThemeToggle variant="header" />

        {/* Cmd+K hint — UX P0.4 (2026-05-03). Hoje so visual ate command
            palette real ficar pronto, mas ja sinaliza power-user affordance.
            suppressHydrationWarning porque cmdSymbol resolve no client. */}
        <kbd
          aria-hidden
          suppressHydrationWarning
          title="Em breve: paleta de comandos"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            padding: '3px 7px',
            border: '1px solid var(--stone-line, var(--border))',
            borderRadius: 6,
            fontFamily: 'var(--font-mono, ui-monospace), monospace',
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--text-muted)',
            background: 'var(--hover, transparent)',
            letterSpacing: '0.04em',
            userSelect: 'none',
            opacity: mounted ? 0.85 : 0,
            transition: 'opacity 0.3s ease',
          }}
        >
          <span>{mounted ? cmdSymbol : ''}</span>
          <span>K</span>
        </kbd>

        <button className="notif-bell" title="Ajuda e tour do Pralvex" onClick={() => setShowHelp(true)}>
          <HelpCircle size={16} strokeWidth={1.75} aria-hidden />
        </button>

        <button
          className="notif-bell"
          title={hasUrgentPrazos ? 'Notificações — ver prazos urgentes' : 'Sem prazos urgentes'}
          aria-label={hasUrgentPrazos ? 'Prazos urgentes pendentes — abrir' : 'Sem prazos urgentes — abrir agenda'}
          onClick={() => router.push('/dashboard/prazos')}
        >
          <Bell size={16} strokeWidth={1.75} aria-hidden />
          {hasUrgentPrazos && <span className="notif-dot" />}
        </button>

        <div className="header-user-info">
          <div className="name">{userName}</div>
          <div className="role">{userRole}</div>
        </div>
        <div className="header-avatar" style={{
          transition: 'all 0.3s ease',
          background: 'linear-gradient(135deg, #f5e8d3, #bfa68e, #7a5f48)',
          color: 'var(--bg-base)',
          border: '1px solid var(--stone)',
          boxShadow: '0 0 0 1px var(--shadow), 0 4px 16px rgba(191,166,142,0.25)',
          fontFamily: "'Playfair Display', Georgia, serif",
        }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 0 1px var(--shadow), 0 0 24px rgba(191,166,142,0.5)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 0 1px var(--shadow), 0 4px 16px rgba(191,166,142,0.25)' }}>
          {initials}
        </div>
      </div>
      <OnboardingModal open={showHelp} onClose={() => setShowHelp(false)} />
    </header>
  )
}
