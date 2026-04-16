'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { usePlan } from '@/hooks/usePlan'
import s from './Sidebar.module.css'

const PLANOS: Record<string, { nome: string; preco: string }> = {
  free:       { nome: 'Demonstracao', preco: '30 min guiados' },
  starter:    { nome: 'Escritorio',   preco: 'R$ 1.399 / advogado' },
  pro:        { nome: 'Firma',        preco: 'R$ 1.459 / advogado' },
  enterprise: { nome: 'Enterprise',   preco: 'R$ 1.599 / advogado' },
}

interface NavItem { href: string; icon: string; label: string; badge?: number; badgeWarn?: boolean }

const nav: { title: string; items: NavItem[] }[] = [
  {
    title: 'Principal',
    items: [
      { href: '/dashboard',             icon: 'bi-grid-1x2',          label: 'Dashboard'   },
      { href: '/dashboard/modelos',     icon: 'bi-collection',        label: 'Modelos'     },
      { href: '/dashboard/historico',   icon: 'bi-clock-history',     label: 'Histórico'   },
      { href: '/dashboard/prazos',      icon: 'bi-calendar-check',    label: 'Prazos'      },
      { href: '/dashboard/financeiro',  icon: 'bi-wallet2',           label: 'Financeiro'  },
    ],
  },
  {
    title: 'Agentes IA',
    items: [
      { href: '/dashboard/chat',        icon: 'bi-chat-square-dots',  label: 'Chat'        },
      { href: '/dashboard/resumidor',   icon: 'bi-file-earmark-text', label: 'Resumidor'   },
      { href: '/dashboard/redator',     icon: 'bi-pencil-square',     label: 'Redator'     },
      { href: '/dashboard/pesquisador', icon: 'bi-journal-bookmark',  label: 'Pesquisador' },
      { href: '/dashboard/negociador',  icon: 'bi-lightning',         label: 'Negociador'  },
      { href: '/dashboard/professor',   icon: 'bi-bell',              label: 'Monitor Legislativo' },
      { href: '/dashboard/rotina',      icon: 'bi-calendar-week',     label: 'Rotina'      },
      { href: '/dashboard/calculador', icon: 'bi-calculator',        label: 'Calculador'  },
      { href: '/dashboard/legislacao', icon: 'bi-book',              label: 'Legislacao'  },
      { href: '/dashboard/simulado',  icon: 'bi-file-earmark-check', label: 'Parecerista' },
      { href: '/dashboard/consultor', icon: 'bi-shield-check',       label: 'Estrategista' },
      { href: '/dashboard/compliance', icon: 'bi-shield-check',      label: 'Compliance'   },
      { href: '/dashboard/tradutor',  icon: 'bi-translate',          label: 'Tradutor Juridico' },
      { href: '/dashboard/planilhas',  icon: 'bi-file-earmark-spreadsheet', label: 'Planilhas' },
    ],
  },
  {
    title: 'Conta',
    items: [
      { href: '/dashboard/planos',        icon: 'bi-gem',     label: 'Planos'        },
      { href: '/dashboard/design',        icon: 'bi-palette', label: 'Design'        },
      { href: '/dashboard/configuracoes', icon: 'bi-gear',    label: 'Configurações' },
    ],
  },
]

/* ── Monograma LX ─────────────────────────────────────────── */
function LexLogo() {
  return (
    <div className="logo">
      <svg viewBox="0 0 28 24" fill="none" width="22" height="19" xmlns="http://www.w3.org/2000/svg">
        {/* L */}
        <path d="M3 3 L3 21 L11 21" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
        {/* X */}
        <path d="M13 3 L25 21" stroke="white" strokeWidth="2.4" strokeLinecap="round"/>
        <path d="M25 3 L13 21" stroke="white" strokeWidth="2.4" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()
  const { plano, trial, loading } = usePlan()

  async function handleLogout() {
    await supabase.auth.signOut()
    sessionStorage.removeItem('lexai-plan-cache')
    router.push('/login')
    router.refresh()
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside className="sidebar" id="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <LexLogo />
        <div className={s.brandCol}>
          <span>LexAI</span>
          <span className={s.brandSub}>
            by Vanix Corp
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {nav.map(section => (
          <div key={section.title} className="sidebar-section">
            <div className="sidebar-section-title">{section.title}</div>
            {section.items.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                onClick={onClose}
                className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
              >
                <i className={`bi ${item.icon}`} aria-hidden="true" />
                {item.label}
                {item.badge != null && (
                  <span className={`badge-count ${item.badgeWarn ? 'warn' : ''}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}

        {/* Logout */}
        <div className="sidebar-section">
          <button
            onClick={handleLogout}
            className={`sidebar-link ${s.logoutBtn}`}
          >
            <i className="bi bi-box-arrow-right" aria-hidden="true" />
            Sair da conta
          </button>
        </div>
      </nav>

      {/* Plan Badge */}
      <div className={`sidebar-plan ${s.planWrapper}`}>
        <div
          className={`sidebar-plan-badge${trial?.active ? ' trial-glow' : ''}${trial?.active && trial.days_left <= 1 ? ' trial-urgent' : ''}`}
        >
          <div className={s.planLabel}>
            <span className={trial?.active && trial.days_left <= 1 ? s.planDotUrgent : s.planDot} />
            {trial?.active ? 'Trial ativo' : 'Plano ativo'}
          </div>
          <div className="plan-name">{loading ? '...' : (PLANOS[plano]?.nome || 'Free Trial')}</div>
          <div className="plan-price">
            {trial?.active
              ? `${trial.days_left} dia${trial.days_left === 1 ? '' : 's'} restante${trial.days_left === 1 ? '' : 's'}`
              : (PLANOS[plano]?.preco || '')}
          </div>
        </div>
        {/* Vanix Corp footer mark */}
        <div className={s.footerMark}>
          <i className="bi bi-stars" aria-hidden="true" style={{ marginRight: 5, color: 'var(--accent)' }} />
          Uma marca <strong className={s.footerStrong}>Vanix Corp</strong>
        </div>
      </div>
    </aside>
  )
}
