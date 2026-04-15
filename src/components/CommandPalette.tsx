'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface NavItem {
  href: string
  icon: string
  label: string
  category: string
}

const NAV_ITEMS: NavItem[] = [
  // Principal
  { href: '/dashboard',             icon: 'bi-grid-1x2',          label: 'Dashboard',   category: 'Principal' },
  { href: '/dashboard/historico',   icon: 'bi-clock-history',     label: 'Historico',   category: 'Principal' },
  { href: '/dashboard/prazos',      icon: 'bi-calendar-check',    label: 'Prazos',      category: 'Principal' },
  { href: '/dashboard/financeiro',  icon: 'bi-wallet2',           label: 'Financeiro',  category: 'Principal' },
  { href: '/dashboard/rotina',      icon: 'bi-calendar-week',     label: 'Rotina',      category: 'Principal' },
  // Agentes
  { href: '/dashboard/resumidor',   icon: 'bi-file-earmark-text', label: 'Resumidor',   category: 'Agentes'  },
  { href: '/dashboard/pesquisador', icon: 'bi-journal-bookmark',  label: 'Pesquisador', category: 'Agentes'  },
  { href: '/dashboard/redator',     icon: 'bi-pencil-square',     label: 'Redator',     category: 'Agentes'  },
  { href: '/dashboard/negociador',  icon: 'bi-lightning',         label: 'Negociador',  category: 'Agentes'  },
  { href: '/dashboard/professor',   icon: 'bi-bell',              label: 'Monitor Legislativo', category: 'Agentes'  },
  { href: '/dashboard/calculador',  icon: 'bi-calculator',        label: 'Calculador',  category: 'Agentes'  },
  { href: '/dashboard/legislacao',  icon: 'bi-book',              label: 'Legislacao',  category: 'Agentes'  },
  { href: '/dashboard/simulado',   icon: 'bi-file-earmark-check', label: 'Parecerista', category: 'Agentes'  },
  { href: '/dashboard/consultor',  icon: 'bi-shield-check',       label: 'Estrategista', category: 'Agentes'  },
  { href: '/dashboard/compliance', icon: 'bi-shield-check',       label: 'Compliance',  category: 'Agentes'  },
  { href: '/dashboard/tradutor',   icon: 'bi-translate',          label: 'Tradutor Juridico', category: 'Agentes'  },
  // Conta
  { href: '/dashboard/planos',        icon: 'bi-gem',     label: 'Planos',        category: 'Conta' },
  { href: '/dashboard/configuracoes', icon: 'bi-gear',    label: 'Configuracoes', category: 'Conta' },
  { href: '/dashboard/design',        icon: 'bi-palette', label: 'Design',        category: 'Conta' },
]

export default function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isMac, setIsMac] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Detect platform
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.platform))
    }
  }, [])

  // Filter items
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return NAV_ITEMS
    return NAV_ITEMS.filter(
      item =>
        item.label.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    )
  }, [query])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Close palette
  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  // Navigate to selected item
  const handleSelect = useCallback(
    (item: NavItem) => {
      router.push(item.href)
      close()
    },
    [router, close]
  )

  // Global keyboard listener for Cmd+K / Ctrl+K / Esc
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Cmd+K (Mac) or Ctrl+K (others) toggles
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
        return
      }
      // Esc closes
      if (e.key === 'Escape' && open) {
        e.preventDefault()
        close()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, close])

  // Autofocus input when opened
  useEffect(() => {
    if (open) {
      // Delay to ensure modal is mounted
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  // Arrow key navigation inside the list
  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => (filtered.length === 0 ? 0 : (i + 1) % filtered.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i =>
        filtered.length === 0 ? 0 : (i - 1 + filtered.length) % filtered.length
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filtered[selectedIndex]
      if (item) handleSelect(item)
    } else if (e.key === 'Home') {
      e.preventDefault()
      setSelectedIndex(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setSelectedIndex(Math.max(0, filtered.length - 1))
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    if (!open || !listRef.current) return
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-cp-index="${selectedIndex}"]`
    )
    if (el) {
      el.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex, open])

  if (!open) return null

  const shortcutMod = isMac ? 'Cmd' : 'Ctrl'

  return (
    <div
      className="cp-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onMouseDown={(e) => {
        // Close when clicking backdrop (not modal)
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className="cp-modal" onMouseDown={(e) => e.stopPropagation()}>
        {/* Search input */}
        <div className="cp-search">
          <i className="bi bi-search cp-search-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Buscar paginas, agentes, configuracoes..."
            className="cp-input"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="cp-kbd cp-kbd-hint">Esc</kbd>
        </div>

        {/* Results list */}
        <div ref={listRef} className="cp-list" role="listbox">
          {filtered.length === 0 ? (
            <div className="cp-empty">
              Nenhum resultado para <strong>&ldquo;{query}&rdquo;</strong>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex
              return (
                <button
                  key={item.href}
                  type="button"
                  data-cp-index={idx}
                  role="option"
                  aria-selected={isSelected}
                  className={`cp-item ${isSelected ? 'selected' : ''}`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => handleSelect(item)}
                >
                  <i className={`bi ${item.icon} cp-item-icon`} aria-hidden="true" />
                  <span className="cp-item-label">{item.label}</span>
                  <span className="cp-item-category">{item.category}</span>
                  <kbd className="cp-kbd cp-item-kbd">
                    {shortcutMod}+K
                  </kbd>
                </button>
              )
            })
          )}
        </div>

        {/* Footer hints */}
        <div className="cp-footer">
          <div className="cp-footer-item">
            <kbd className="cp-kbd">↑</kbd>
            <kbd className="cp-kbd">↓</kbd>
            <span>Navegar</span>
          </div>
          <div className="cp-footer-item">
            <kbd className="cp-kbd">↵</kbd>
            <span>Selecionar</span>
          </div>
          <div className="cp-footer-item">
            <kbd className="cp-kbd">Esc</kbd>
            <span>Fechar</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cp-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding-top: 15vh;
          padding-left: 16px;
          padding-right: 16px;
          animation: cp-fade-in 0.15s ease-out both;
        }

        .cp-modal {
          width: 100%;
          max-width: 600px;
          background: var(--card-bg);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow:
            0 24px 60px rgba(0, 0, 0, 0.45),
            0 2px 8px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          max-height: 70vh;
          animation: cp-scale-in 0.15s ease-out both;
          color: var(--text-primary);
        }

        .cp-search {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }

        .cp-search-icon {
          font-size: 18px;
          color: var(--text-muted, rgba(148, 163, 184, 0.8));
          flex-shrink: 0;
        }

        .cp-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 15px;
          font-weight: 500;
          font-family: inherit;
          min-width: 0;
        }

        .cp-input::placeholder {
          color: var(--text-muted, rgba(148, 163, 184, 0.7));
          font-weight: 400;
        }

        .cp-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .cp-empty {
          padding: 32px 16px;
          text-align: center;
          color: var(--text-muted, rgba(148, 163, 184, 0.8));
          font-size: 14px;
        }

        .cp-empty strong {
          color: var(--text-primary);
          font-weight: 600;
        }

        .cp-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: var(--text-primary);
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          font-size: 14px;
          transition: background 0.08s ease, border-color 0.08s ease;
          border-left: 3px solid transparent;
          margin-bottom: 2px;
        }

        .cp-item.selected {
          background: var(--accent-light);
          border-left: 3px solid var(--accent);
        }

        .cp-item-icon {
          font-size: 18px;
          color: var(--accent);
          flex-shrink: 0;
          width: 22px;
          text-align: center;
        }

        .cp-item-label {
          flex: 1;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cp-item-category {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted, rgba(148, 163, 184, 0.8));
          padding: 3px 8px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--hover);
          flex-shrink: 0;
        }

        .cp-item-kbd {
          opacity: 0;
          transition: opacity 0.1s ease;
        }

        .cp-item.selected .cp-item-kbd {
          opacity: 1;
        }

        .cp-kbd {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 5px;
          border: 1px solid var(--border);
          background: var(--hover);
          color: var(--text-muted, rgba(148, 163, 184, 0.9));
          line-height: 1.4;
          min-width: 18px;
          text-align: center;
          display: inline-block;
        }

        .cp-kbd-hint {
          flex-shrink: 0;
        }

        .cp-footer {
          display: flex;
          gap: 16px;
          padding: 10px 20px;
          border-top: 1px solid var(--border);
          font-size: 12px;
          color: var(--text-muted, rgba(148, 163, 184, 0.8));
          background: var(--hover);
        }

        .cp-footer-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        @keyframes cp-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes cp-scale-in {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1);    }
        }

        @media (max-width: 640px) {
          .cp-backdrop {
            padding-top: 10vh;
          }
          .cp-item-category {
            display: none;
          }
          .cp-footer {
            gap: 12px;
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  )
}
