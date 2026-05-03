'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { usePlan } from '@/hooks/usePlan'
import { agents, modules, isUnlocked, type CatalogItem, type Plan } from '@/lib/catalog'
import { LEGAL_AREAS } from '@/lib/agents/taxonomy'
import {
  LayoutDashboard, Folder, History, CalendarCheck, Wallet,
  Gem, Settings, LogOut, Sparkles, Lock, Crown,
  Search as SearchIcon, Star,
} from 'lucide-react'
import { PralvexMark } from '@/components/PralvexMark'
import s from './Sidebar.module.css'

/* ═════════════════════════════════════════════════════════════
 * Sidebar — wire com catálogo central (migrado em 2026-04-17)
 * ─────────────────────────────────────────────────────────────
 * Consome agents() + modules() + isUnlocked() de @/lib/catalog.
 * - Item implemented:false   → /dashboard/em-breve?feature=<slug>
 * - Item !isUnlocked         → /dashboard/planos
 * - Caso contrário           → item.href normal
 *
 * Wave R3 audit (2026-05-03 UX P0.4): de 33 itens flat pra grupos:
 *   - Mais usados (top 5 hardcoded — chat, resumidor, redator,
 *     pesquisador, calculador)
 *   - Por area: agrupa restantes via LEGAL_AREAS quando agente
 *     marca relevantAgents[]. Catch-all "Outros" pra agentes nao
 *     mapeados.
 *   - Filtro client-side por label/slug/desc no topo da secao.
 *
 * Mantém classes globais (.sidebar, .sidebar-link, etc) do layout
 * pra não quebrar o margin-left:240px do main-content. Apenas
 * ícones Bootstrap foram trocados por lucide-react.
 * ═════════════════════════════════════════════════════════════ */

const PLANOS: Record<string, { nome: string; preco: string }> = {
  free:       { nome: 'Demonstração', preco: '50 min guiados' },
  solo:       { nome: 'Solo',         preco: 'R$ 599 / advogado' },
  starter:    { nome: 'Escritório',   preco: 'R$ 1.399 / advogado' },
  pro:        { nome: 'Firma',        preco: 'R$ 1.459 / advogado' },
  enterprise: { nome: 'Enterprise',   preco: 'R$ 1.599 / advogado' },
}

/** Top 5 mais usados — hardcoded ate analytics dizer quem sao. */
const MAIS_USADOS = ['chat', 'resumidor', 'redator', 'pesquisador', 'calculador']

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
  { href: '/dashboard/configuracoes', Icon: Settings, label: 'Configurações' },
] as const

function SidebarBrandMark() {
  return (
    <div className="logo">
      <PralvexMark variant="bare" size={36} />
    </div>
  )
}

/** Resolve href conforme estado do item no catálogo */
function resolveHref(item: CatalogItem, userPlan: Plan): string {
  if (!isUnlocked(item, userPlan)) return '/dashboard/planos'
  if (!item.implemented) return `/dashboard/em-breve?feature=${item.slug}`
  return item.href
}

function normalizeQuery(q: string): string {
  return q
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

/** Mapeia agentes pra LEGAL_AREA via relevantAgents[]. Multi-area: pega 1a hit. */
function buildAreaGroups(agentsList: CatalogItem[]): Array<{ label: string; items: CatalogItem[] }> {
  const claimed = new Set<string>()
  const groups: Array<{ label: string; items: CatalogItem[] }> = []

  for (const area of LEGAL_AREAS) {
    const items = agentsList.filter(a =>
      area.relevantAgents.includes(a.slug) && !claimed.has(a.slug)
    )
    if (items.length === 0) continue
    items.forEach(i => claimed.add(i.slug))
    groups.push({ label: area.label, items })
  }

  const outros = agentsList.filter(a => !claimed.has(a.slug))
  if (outros.length > 0) groups.push({ label: 'Outros', items: outros })
  return groups
}

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { plano, trial, loading, founder } = usePlan()
  // Founder resolve pra enterprise no servidor — usamos como fallback aqui
  const userPlan = (founder ? 'enterprise' : plano || 'free') as Plan

  const [filter, setFilter] = useState('')

  async function handleLogout() {
    await supabase.auth.signOut()
    sessionStorage.removeItem('pralvex-plan-cache')
    // Limpar drafts + caches client-side antes de redirecionar — antes outro
    // user logando no mesmo browser via dados antigos por alguns segundos.
    try {
      const keysToWipe = Object.keys(localStorage).filter(k =>
        k.startsWith('pralvex-draft-') || k.startsWith('lexai-')
      )
      keysToWipe.forEach(k => localStorage.removeItem(k))
    } catch { /* localStorage indisponivel — silent */ }
    router.push('/login')
    router.refresh()
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href.split('?')[0])
  }

  const allAgents = useMemo(() => agents(), [])
  const allModules = useMemo(() => modules(), [])

  /* Divide agentes em "Mais usados" e o resto. Filtro client-side aplica
     antes do split pra reordenar quando user busca termo especifico. */
  const filteredAgents = useMemo(() => {
    const norm = normalizeQuery(filter)
    if (!norm) return allAgents
    return allAgents.filter(a => {
      const hay = normalizeQuery(`${a.label} ${a.slug} ${a.desc} ${a.differentiation ?? ''}`)
      return hay.includes(norm)
    })
  }, [allAgents, filter])

  const maisUsados = useMemo(
    () => filteredAgents.filter(a => MAIS_USADOS.includes(a.slug)),
    [filteredAgents],
  )

  const restAgents = useMemo(
    () => filteredAgents.filter(a => !MAIS_USADOS.includes(a.slug)),
    [filteredAgents],
  )

  const areaGroups = useMemo(() => buildAreaGroups(restAgents), [restAgents])

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
        title={locked ? `Disponível no plano ${item.minPlan}` : (item.differentiation || item.desc)}
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
        <SidebarBrandMark />
        <div className={s.brandCol}>
          <span>Pralvex</span>
          <span className={s.brandSub}>Inteligência jurídica</span>
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

          {/* Filtro client-side — UX P0.4. Sem debounce porque eh local-only.
              Tab order natural: filter > grupos > links. */}
          <div className={s.filterWrap}>
            <SearchIcon size={12} strokeWidth={1.75} className={s.filterIcon} aria-hidden />
            <input
              type="text"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Buscar agente..."
              className={s.filterInput}
              aria-label="Filtrar agentes"
            />
            {filter && (
              <button
                type="button"
                onClick={() => setFilter('')}
                className={s.filterClear}
                aria-label="Limpar filtro"
              >
                ×
              </button>
            )}
          </div>

          {filteredAgents.length === 0 && (
            <div className={s.filterEmpty}>
              Nenhum agente bate com &quot;{filter}&quot;
            </div>
          )}

          {maisUsados.length > 0 && (
            <div className={s.subgroup}>
              <div className={s.subgroupHead}>
                <Star size={9} strokeWidth={2} aria-hidden />
                Mais usados
              </div>
              {maisUsados.map(renderLink)}
            </div>
          )}

          {areaGroups.map(group => (
            <div key={group.label} className={s.subgroup}>
              <div className={s.subgroupHead}>{group.label}</div>
              {group.items.map(renderLink)}
            </div>
          ))}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Módulos</div>
          {allModules.map(renderLink)}
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
        {founder ? (
          <div
            className="sidebar-plan-badge"
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 12,
              padding: '14px 14px 13px',
              background:
                'linear-gradient(135deg, rgba(230,212,189,0.14) 0%, rgba(191,166,142,0.08) 45%, rgba(138,111,85,0.06) 100%)',
              border: '1px solid rgba(191,166,142,0.35)',
              boxShadow:
                '0 0 0 1px rgba(230,212,189,0.08), 0 8px 24px -12px rgba(191,166,142,0.4), inset 0 1px 0 rgba(230,212,189,0.18)',
            }}
          >
            <span
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background:
                  'radial-gradient(120% 60% at 100% 0%, rgba(230,212,189,0.22) 0%, rgba(230,212,189,0) 55%)',
              }}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'var(--font-dm-sans)',
                fontSize: 9.5,
                fontWeight: 600,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                marginBottom: 6,
                position: 'relative',
              }}
            >
              <Crown size={11} strokeWidth={2} aria-hidden style={{ color: 'var(--accent)' }} />
              Founder · Lifetime
            </div>
            <div
              className="plan-name"
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 17,
                lineHeight: 1.15,
                color: 'var(--text-primary)',
                fontStyle: 'italic',
                position: 'relative',
              }}
            >
              Leonardo
            </div>
            <div
              className="plan-price"
              style={{
                marginTop: 3,
                fontFamily: 'var(--font-dm-sans)',
                fontSize: 11,
                color: 'var(--text-secondary)',
                position: 'relative',
              }}
            >
              Acesso supremo · sem expiração
            </div>
          </div>
        ) : (
          <div
            className={`sidebar-plan-badge${trial?.active ? ' trial-glow' : ''}${
              trial?.active && (trial.minutes_left ?? 0) <= 5 ? ' trial-urgent' : ''
            }`}
          >
            <div className={s.planLabel}>
              <span className={trial?.active && (trial.minutes_left ?? 0) <= 5 ? s.planDotUrgent : s.planDot} />
              {trial?.active ? 'Demo ativa' : 'Plano ativo'}
            </div>
            <div className="plan-name">{loading ? '...' : PLANOS[plano]?.nome || 'Free Trial'}</div>
            <div className="plan-price">
              {trial?.active
                ? `${trial.minutes_left ?? 0} min restante${(trial.minutes_left ?? 0) === 1 ? '' : 's'}`
                : PLANOS[plano]?.preco || ''}
            </div>
          </div>
        )}
        <div className={s.footerMark}>
          <Sparkles size={11} strokeWidth={1.75} className={s.footerSpark} aria-hidden />
          MMXXVI · Ofício do atelier
        </div>
      </div>
    </aside>
  )
}
