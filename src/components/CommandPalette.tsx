'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarCheck, Folder, Gem, History, LayoutDashboard, Lock,
  Search, Settings, Wallet, type LucideIcon,
} from 'lucide-react'
import { usePlan } from '@/hooks/usePlan'
import { CATALOG, isUnlocked, type Plan } from '@/lib/catalog'
import s from './CommandPalette.module.css'

/* ═════════════════════════════════════════════════════════════
 * CommandPalette — Cmd/Ctrl+K
 * ─────────────────────────────────────────────────────────────
 * Fonte única: CATALOG (agents + modules) + itens fixos de conta
 * e infra (dashboard, histórico, prazos, financeiro, planos…).
 * Itens locked ainda aparecem no palette mas levam a /dashboard/planos;
 * implemented:false vai para /dashboard/em-breve?feature=<slug>.
 * ═════════════════════════════════════════════════════════════ */

interface NavItem {
  href: string
  Icon: LucideIcon
  label: string
  category: string
  locked?: boolean
  slug?: string
  implemented?: boolean
}

const FIXED_PRINCIPAL: NavItem[] = [
  { href: '/dashboard',            Icon: LayoutDashboard, label: 'Dashboard',  category: 'Principal' },
  { href: '/dashboard/modelos',    Icon: Folder,          label: 'Modelos',    category: 'Principal' },
  { href: '/dashboard/historico',  Icon: History,         label: 'Histórico',  category: 'Principal' },
  { href: '/dashboard/prazos',     Icon: CalendarCheck,   label: 'Prazos',     category: 'Principal' },
  { href: '/dashboard/financeiro', Icon: Wallet,          label: 'Financeiro', category: 'Principal' },
]

const FIXED_CONTA: NavItem[] = [
  { href: '/dashboard/planos',        Icon: Gem,      label: 'Planos',        category: 'Conta' },
  { href: '/dashboard/configuracoes', Icon: Settings, label: 'Configurações', category: 'Conta' },
]

function resolveHref(item: NavItem): string {
  if (item.locked) return '/dashboard/planos'
  if (item.slug && item.implemented === false) return `/dashboard/em-breve?feature=${item.slug}`
  return item.href
}

export default function CommandPalette() {
  const router = useRouter()
  const { plano } = usePlan()
  const userPlan = (plano || 'free') as Plan

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isMac, setIsMac] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.platform))
    }
  }, [])

  const navItems = useMemo<NavItem[]>(() => {
    const catItems: NavItem[] = CATALOG.map(item => ({
      href: item.href,
      Icon: item.Icon,
      label: item.label,
      category: item.kind === 'agent' ? 'Agentes' : 'Módulos',
      locked: !isUnlocked(item, userPlan),
      slug: item.slug,
      implemented: item.implemented,
    }))
    return [...FIXED_PRINCIPAL, ...catItems, ...FIXED_CONTA]
  }, [userPlan])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return navItems
    return navItems.filter(
      item =>
        item.label.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q),
    )
  }, [navItems, query])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  const handleSelect = useCallback(
    (item: NavItem) => {
      router.push(resolveHref(item))
      close()
    },
    [router, close],
  )

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
        return
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault()
        close()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, close])

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => (filtered.length === 0 ? 0 : (i + 1) % filtered.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i =>
        filtered.length === 0 ? 0 : (i - 1 + filtered.length) % filtered.length,
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

  useEffect(() => {
    if (!open || !listRef.current) return
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-cp-index="${selectedIndex}"]`,
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
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className={s.cpModal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={s.cpSearch}>
          <Search size={16} strokeWidth={1.75} className={s.cpSearchIcon} aria-hidden />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Buscar páginas, agentes, configurações..."
            className={s.cpInput}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className={s.cpKbdHint}>Esc</kbd>
        </div>

        <div ref={listRef} className={s.cpList} role="listbox">
          {filtered.length === 0 ? (
            <div className={s.cpEmpty}>
              Nenhum resultado para <strong className={s.cpEmptyStrong}>&ldquo;{query}&rdquo;</strong>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex
              const Icon = item.Icon
              return (
                <button
                  key={`${item.category}:${item.href}`}
                  type="button"
                  data-cp-index={idx}
                  role="option"
                  aria-selected={isSelected}
                  className={`${s.cpItem} ${isSelected ? s.selected : ''}`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => handleSelect(item)}
                >
                  <Icon size={16} strokeWidth={1.75} className={s.cpItemIcon} aria-hidden />
                  <span className={s.cpItemLabel}>{item.label}</span>
                  <span className={s.cpItemCategory}>{item.category}</span>
                  {item.locked && (
                    <Lock size={12} strokeWidth={2} className={s.cpItemLock} aria-hidden />
                  )}
                  <kbd className={`${s.cpKbd} ${s.cpItemKbd}`}>
                    {shortcutMod}+K
                  </kbd>
                </button>
              )
            })
          )}
        </div>

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
