'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme, type ThemePref } from '@/context/ThemeContext'

/* ════════════════════════════════════════════════════════════════
 * ThemeToggle (v11.0 · 2026-05-02)
 * ────────────────────────────────────────────────────────────────
 * Pill segmentado com 3 estados: light · system · dark.
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
  { value: 'light',  label: 'Tema claro',                  Icon: Sun },
  { value: 'system', label: 'Tema do sistema',             Icon: Monitor },
  { value: 'dark',   label: 'Tema escuro (padrão Pralvex)', Icon: Moon },
]

export function ThemeToggle({ variant = 'header', className = '' }: ThemeToggleProps) {
  const { pref, setPref } = useTheme()

  const isLanding = variant === 'landing'

  // Cores tematizadas via tokens — funciona em ambos modes.
  // Landing tem fundo preto fixo, então força paleta champagne sobre noir.
  const wrapperStyle: React.CSSProperties = isLanding
    ? {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(191,166,142,0.18)',
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
              transition: 'background-color 0.18s ease, color 0.18s ease, transform 0.18s ease',
              background: active
                ? (isLanding ? 'rgba(191,166,142,0.18)' : 'var(--accent-light)')
                : 'transparent',
              color: active
                ? (isLanding ? '#f5e8d3' : 'var(--accent)')
                : (isLanding ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)'),
            }}
            onMouseEnter={e => {
              if (!active) {
                e.currentTarget.style.color = isLanding ? 'rgba(255,255,255,0.85)' : 'var(--text-primary)'
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                e.currentTarget.style.color = isLanding ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)'
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
