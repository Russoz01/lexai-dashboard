'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import s from './CommandPalette.module.css'

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
      className={s.cpBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onMouseDown={(e) => {
        // Close when clicking backdrop (not modal)
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className={s.cpModal} onMouseDown={(e) => e.stopPropagation()}>
        {/* Search input */}
        <div className={s.cpSearch}>
          <i className={`bi bi-search ${s.cpSearchIcon}`} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Buscar paginas, agentes, configuracoes..."
            className={s.cpInput}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className={s.cpKbdHint}>Esc</kbd>
        </div>

        {/* Results list */}
        <div ref={listRef} className={s.cpList} role="listbox">
          {filtered.length === 0 ? (
            <div className={s.cpEmpty}>
              Nenhum resultado para <strong className={s.cpEmptyStrong}>&ldquo;{query}&rdquo;</strong>
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
                  className={`${s.cpItem} ${isSelected ? s.selected : ''}`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => handleSelect(item)}
                >
                  <i className={`bi ${item.icon} ${s.cpItemIcon}`} aria-hidden="true" />
                  <span className={s.cpItemLabel}>{item.label}</span>
                  <span className={s.cpItemCategory}>{item.category}</span>
                  <kbd className={`${s.cpKbd} ${s.cpItemKbd}`}>
                    {shortcutMod}+K
                  </kbd>
                </button>
              )
            })
          )}
        </div>

        {/* Footer hints */}
        <div className={s.cpFooter}>
          <div className={s.cpFooterItem}>
            <kbd className={s.cpKbd}>↑</kbd>
            <kbd className={s.cpKbd}>↓</kbd>
            <span>Navegar</span>
          </div>
          <div className={s.cpFooterItem}>
            <kbd className={s.cpKbd}>↵</kbd>
            <span>Selecionar</span>
          </div>
          <div className={s.cpFooterItem}>
            <kbd className={s.cpKbd}>Esc</kbd>
            <span>Fechar</span>
          </div>
        </div>
      </div>
    </div>
  )
}
