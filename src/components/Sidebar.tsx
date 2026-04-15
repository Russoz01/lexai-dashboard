'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { usePlan } from '@/hooks/usePlan'

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
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span>LexAI</span>
          <span style={{
            fontSize: 9, fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase',
            color: 'var(--text-muted)', marginTop: 3, opacity: 0.8,
          }}>
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
            className="sidebar-link"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <i className="bi bi-box-arrow-right" aria-hidden="true" />
            Sair da conta
          </button>
        </div>
      </nav>

      {/* Plan Badge */}
      <div className="sidebar-plan">
        <div
          className={`sidebar-plan-badge${trial?.active ? ' trial-glow' : ''}${trial?.active && trial.days_left <= 1 ? ' trial-urgent' : ''}`}
        >
          <div className="plan-label">
            <span className={`plan-dot${trial?.active && trial.days_left <= 1 ? ' urgent' : ''}`} />
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
        <div style={{
          marginTop: 12, paddingTop: 12,
          borderTop: '1px solid var(--border)',
          fontSize: 10, color: 'var(--text-muted)',
          textAlign: 'center', letterSpacing: '0.4px',
        }}>
          <i className="bi bi-stars" aria-hidden="true" style={{ marginRight: 5, color: 'var(--accent)' }} />
          Uma marca <strong style={{ color: 'var(--text-secondary)' }}>Vanix Corp</strong>
        </div>
      </div>

      <style jsx>{`
        .plan-label {
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .plan-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--stone);
          flex-shrink: 0;
          animation: pulse-plan 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          box-shadow: 0 0 0 0 var(--stone);
        }
        .plan-dot.urgent {
          background: var(--warning);
          box-shadow: 0 0 0 0 var(--warning);
          animation: pulse-plan-urgent 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        :global(.sidebar-plan-badge.trial-glow) {
          animation: badge-glow 3.2s ease-in-out infinite;
        }
        :global(.sidebar-plan-badge.trial-urgent) {
          animation: badge-glow-urgent 1.6s ease-in-out infinite;
          border-color: var(--warning) !important;
        }
        @keyframes pulse-plan {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(191, 166, 142, 0.50);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(191, 166, 142, 0);
          }
        }
        @keyframes pulse-plan-urgent {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.6);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 7px rgba(245, 158, 11, 0);
            transform: scale(1.15);
          }
        }
        @keyframes badge-glow {
          0%, 100% {
            border-color: rgba(191, 166, 142, 0.18);
          }
          50% {
            border-color: rgba(191, 166, 142, 0.50);
          }
        }
        @keyframes badge-glow-urgent {
          0%, 100% {
            border-color: rgba(245, 158, 11, 0.4);
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
          }
          50% {
            border-color: rgba(245, 158, 11, 0.9);
            box-shadow: 0 0 14px 0 rgba(245, 158, 11, 0.25);
          }
        }
      `}</style>
    </aside>
  )
}
