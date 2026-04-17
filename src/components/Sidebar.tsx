'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { usePlan } from '@/hooks/usePlan'
import { agents, modules, isUnlocked, type CatalogItem, type Plan } from '@/lib/catalog'
import {
  LayoutDashboard, Folder, History, CalendarCheck, Wallet,
  Gem, Palette, Settings, LogOut, Sparkles, Lock,
} from 'lucide-react'
import s from './Sidebar.module.css'

/* ═════════════════════════════════════════════════════════════
 * Sidebar — wire com catálogo central (migrado em 2026-04-17)
 * ─────────────────────────────────────────────────────────────
 * Consome agents() + modules() + isUnlocked() de @/lib/catalog.
 * - Item implemented:false   → /dashboard/em-breve?feature=<slug>
 * - Item !isUnlocked         → /dashboard/planos
 * - Caso contrário           → item.href normal
 *
 * Mantém classes globais (.sidebar, .sidebar-link, etc) do layout
 * pra não quebrar o margin-left:240px do main-content. Apenas
 * ícones Bootstrap foram trocados por lucide-react.
 * ═════════════════════════════════════════════════════════════ */

const PLANOS: Record<string, { nome: string; preco: string }> = {
  free:       { nome: 'Demonstração', preco: '30 min guiados' },
  starter:    { nome: 'Escritório',   preco: 'R$ 1.399 / advogado' },
  pro:        { nome: 'Firma',        preco: 'R$ 1.459 / advogado' },
  enterprise: { nome: 'Enterprise',   preco: 'R$ 1.599 / advogado' },
}

/** Links fixos fora do catálogo — módulos de conta/infra */
const PRINCIPAL = [
  { href: '/dashboard',            Icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/modelos',    Icon: Folder,          label: 'Modelos' },
  { href: '/dashboard/historico',  Icon: History,         label: 'Histórico' },
  { href: '/dashboard/prazos',     Icon: CalendarCheck,   label: 'Prazos' },
  { href: '/dashboard/financeiro', Icon: Wallet,          label: 'Financeiro' },
] as const

const CONTA = [
  { href: '/dashboard/planos',        Icon: Gem,      label: 'Planos' },
  { href: '/dashboard/design',        Icon: Palette,  label: 'Design' },
  { href: '/dashboard/configuracoes', Icon: Settings, label: 'Configurações' },
] as const

function LexLogo() {
  return (
    <div className="logo">
      <svg viewBox="0 0 28 24" fill="none" width="22" height="19" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3 L3 21 L11 21" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 3 L25 21" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M25 3 L13 21" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </div>
  )
}

/** Resolve href conforme estado do item no catálogo */
function resolveHref(item: CatalogItem, userPlan: Plan): string {
  if (!isUnlocked(item, userPlan)) return '/dashboard/planos'
  if (!item.implemented) return `/dashboard/em-breve?feature=${item.slug}`
  return item.href
}

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { plano, trial, loading } = usePlan()
  const userPlan = (plano || 'free') as Plan

  async function handleLogout() {
    await supabase.auth.signOut()
    sessionStorage.removeItem('lexai-plan-cache')
    router.push('/login')
    router.refresh()
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href.split('?')[0])
  }

  const renderLink = (item: CatalogItem) => {
    const href = resolveHref(item, userPlan)
    const locked = !isUnlocked(item, userPlan)
    const active = isActive(item.href)
    const Icon = item.Icon
    return (
      <Link
        key={item.slug}
        href={href}
        onClick={onClose}
        className={`sidebar-link ${active ? 'active' : ''}`}
        aria-disabled={locked || undefined}
        title={locked ? `Disponível no plano ${item.minPlan}` : item.desc}
      >
        <Icon size={15} strokeWidth={1.75} className={s.navIcon} aria-hidden />
        <span className={locked ? s.linkLocked : ''}>{item.label}</span>
        {locked && <Lock size={11} strokeWidth={2} className={s.lockIcon} aria-hidden />}
        {!item.implemented && !locked && (
          <span className={s.soonPill} aria-hidden>
            em breve
          </span>
        )}
      </Link>
    )
  }

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-brand">
        <LexLogo />
        <div className={s.brandCol}>
          <span>LexAI</span>
          <span className={s.brandSub}>by Vanix Corp</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <div className="sidebar-section-title">Principal</div>
          {PRINCIPAL.map(({ href, Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`sidebar-link ${isActive(href) ? 'active' : ''}`}
            >
              <Icon size={15} strokeWidth={1.75} className={s.navIcon} aria-hidden />
              {label}
            </Link>
          ))}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Agentes IA</div>
          {agents().map(renderLink)}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Módulos</div>
          {modules().map(renderLink)}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Conta</div>
          {CONTA.map(({ href, Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`sidebar-link ${isActive(href) ? 'active' : ''}`}
            >
              <Icon size={15} strokeWidth={1.75} className={s.navIcon} aria-hidden />
              {label}
            </Link>
          ))}
          <button onClick={handleLogout} className={`sidebar-link ${s.logoutBtn}`}>
            <LogOut size={15} strokeWidth={1.75} className={s.navIcon} aria-hidden />
            Sair da conta
          </button>
        </div>
      </nav>

      <div className={`sidebar-plan ${s.planWrapper}`}>
        <div
          className={`sidebar-plan-badge${trial?.active ? ' trial-glow' : ''}${
            trial?.active && trial.days_left <= 1 ? ' trial-urgent' : ''
          }`}
        >
          <div className={s.planLabel}>
            <span className={trial?.active && trial.days_left <= 1 ? s.planDotUrgent : s.planDot} />
            {trial?.active ? 'Trial ativo' : 'Plano ativo'}
          </div>
          <div className="plan-name">{loading ? '...' : PLANOS[plano]?.nome || 'Free Trial'}</div>
          <div className="plan-price">
            {trial?.active
              ? `${trial.days_left} dia${trial.days_left === 1 ? '' : 's'} restante${trial.days_left === 1 ? '' : 's'}`
              : PLANOS[plano]?.preco || ''}
          </div>
        </div>
        <div className={s.footerMark}>
          <Sparkles size={11} strokeWidth={1.75} className={s.footerSpark} aria-hidden />
          Uma marca <strong className={s.footerStrong}>Vanix Corp</strong>
        </div>
      </div>
    </aside>
  )
}
