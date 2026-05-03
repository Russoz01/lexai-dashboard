'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme, type ThemePref } from '@/context/ThemeContext'

/* ════════════════════════════════════════════════════════════════
 * ThemeToggle (v11.1 · 2026-05-02)
 * ────────────────────────────────────────────────────────────────
 * Pill segmentado binário: light · dark.
 * "System" foi removido em audit fix v11.1 — confuso pra advogado.
 * Usa data-theme do <html> + ThemeContext.
 *
 * Variantes visuais:
 *   - 'header'  — pill compacto, glass, pra dashboard top-right
 *   - 'landing' — versão sutil, transparente, pra nav da landing
 * ═══════════════════════════════════════════════════════════════ */

interface ThemeToggleProps {
  variant?: 'header' | 'landing'
  className?: string
}

const OPTIONS: Array<{ value: ThemePref; label: string; Icon: typeof Sun }> = [
  { value: 'light', label: 'Tema claro',                  Icon: Sun },
  { value: 'dark',  label: 'Tema escuro (padrão Pralvex)', Icon: Moon },
]

export function ThemeToggle({ variant = 'header', className = '' }: ThemeToggleProps) {
  const { pref, setPref } = useTheme()

  const isLanding = variant === 'landing'

  // Cores tematizadas via tokens — funciona em ambos modes.
  // v11.2 (2026-05-03): landing variant agora usa tokens tematizados também.
  // Antes hardcoded white/55 sobre preto = invisivel no light cream.
  const wrapperStyle: React.CSSProperties = isLanding
    ? {
        background: 'var(--hover)',
        border: '1px solid var(--glass-border)',
      }
    : {
        background: 'var(--glass)',
        border: '1px solid var(--glass-border)',
      }

  return (
    <div
      role="radiogroup"
      aria-label="Selecionar tema"
      className={`pralvex-theme-toggle ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        padding: 3,
        borderRadius: 999,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        ...wrapperStyle,
      }}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = pref === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setPref(value)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color var(--duration-fast) var(--ease-snappy), color var(--duration-fast) var(--ease-snappy), transform var(--duration-fast) var(--ease-snappy)',
              background: active ? 'var(--accent-light)' : 'transparent',
              color: active ? 'var(--accent)' : 'var(--text-muted)',
            }}
            onMouseEnter={e => {
              if (!active) {
                e.currentTarget.style.color = 'var(--text-primary)'
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                e.currentTarget.style.color = 'var(--text-muted)'
              }
            }}
          >
            <Icon size={14} strokeWidth={1.75} aria-hidden />
          </button>
        )
      })}
    </div>
  )
}

export default ThemeToggle
