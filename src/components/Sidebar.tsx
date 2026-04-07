'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { usePlan } from '@/hooks/usePlan'

const PLANOS: Record<string, { nome: string; preco: string }> = {
  free:       { nome: 'Free Trial', preco: 'Gratis 2 dias' },
  starter:    { nome: 'Starter',    preco: 'R$ 59 / mes' },
  pro:        { nome: 'Pro',        preco: 'R$ 119 / mes' },
  enterprise: { nome: 'Enterprise', preco: 'R$ 239 / mes' },
}

interface NavItem { href: string; icon: string; label: string; badge?: number; badgeWarn?: boolean }

const nav: { title: string; items: NavItem[] }[] = [
  {
    title: 'Principal',
    items: [
      { href: '/dashboard',             icon: 'bi-grid-1x2',          label: 'Dashboard'   },
      { href: '/dashboard/historico',   icon: 'bi-clock-history',     label: 'Histórico'   },
      { href: '/dashboard/prazos',      icon: 'bi-calendar-check',    label: 'Prazos'      },
      { href: '/dashboard/financeiro',  icon: 'bi-wallet2',           label: 'Financeiro'  },
    ],
  },
  {
    title: 'Agentes IA',
    items: [
      { href: '/dashboard/resumidor',   icon: 'bi-file-earmark-text', label: 'Resumidor'   },
      { href: '/dashboard/redator',     icon: 'bi-pencil-square',     label: 'Redator'     },
      { href: '/dashboard/pesquisador', icon: 'bi-journal-bookmark',  label: 'Pesquisador' },
      { href: '/dashboard/negociador',  icon: 'bi-lightning',         label: 'Negociador'  },
      { href: '/dashboard/professor',   icon: 'bi-mortarboard',       label: 'Professor'   },
      { href: '/dashboard/rotina',      icon: 'bi-calendar-week',     label: 'Rotina'      },
      { href: '/dashboard/calculador', icon: 'bi-calculator',        label: 'Calculador'  },
      { href: '/dashboard/legislacao', icon: 'bi-book',              label: 'Legislacao'  },
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
        <span>LexAI</span>
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
                <i className={`bi ${item.icon}`} />
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
            className="sidebar-link"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <i className="bi bi-box-arrow-right" />
            Sair da conta
          </button>
        </div>
      </nav>

      {/* Plan Badge */}
      <div className="sidebar-plan">
        <div className="sidebar-plan-badge">
          <div className="plan-label">{trial?.active ? 'Trial ativo' : 'Plano ativo'}</div>
          <div className="plan-name">{loading ? '...' : (PLANOS[plano]?.nome || 'Free Trial')}</div>
          <div className="plan-price">
            {trial?.active
              ? `${trial.days_left} dia${trial.days_left === 1 ? '' : 's'} restante${trial.days_left === 1 ? '' : 's'}`
              : (PLANOS[plano]?.preco || '')}
          </div>
        </div>
      </div>
    </aside>
  )
}
