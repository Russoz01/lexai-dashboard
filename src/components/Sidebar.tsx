'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface NavItem { href: string; icon: string; label: string; badge?: number; badgeWarn?: boolean }

const nav: { title: string; items: NavItem[] }[] = [
  {
    title: 'Principal',
    items: [
      { href: '/dashboard',             icon: 'bi-grid-1x2',          label: 'Dashboard'   },
      { href: '/dashboard/resumidor',   icon: 'bi-file-earmark-text', label: 'Documentos'  },
      { href: '/dashboard/prazos',      icon: 'bi-clock-history',     label: 'Prazos'      },
      { href: '/dashboard/historico',   icon: 'bi-calendar3',         label: 'Histórico'   },
      { href: '/dashboard/financeiro',  icon: 'bi-wallet2',           label: 'Financeiro'  },
    ],
  },
  {
    title: 'Agentes',
    items: [
      { href: '/dashboard/resumidor',   icon: 'bi-text-paragraph',    label: 'Resumidor'   },
      { href: '/dashboard/prazos',      icon: 'bi-clock-history',     label: 'Prazos'      },
      { href: '/dashboard/redator',     icon: 'bi-pencil-square',     label: 'Redator'     },
      { href: '/dashboard/pesquisador', icon: 'bi-journal-bookmark',  label: 'Pesquisador' },
      { href: '/dashboard/financeiro',  icon: 'bi-wallet2',           label: 'Financeiro'  },
      { href: '/dashboard/rotina',      icon: 'bi-calendar-week',     label: 'Rotina'      },
    ],
  },
  {
    title: 'Conta',
    items: [
      { href: '/dashboard/configuracoes', icon: 'bi-person',  label: 'Perfil'        },
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

  async function handleLogout() {
    await supabase.auth.signOut()
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
          <div className="plan-label">Plano ativo</div>
          <div className="plan-name">Pro</div>
          <div className="plan-price">R$ 97 / mês</div>
        </div>
      </div>
    </aside>
  )
}
