'use client'

/* ═════════════════════════════════════════════════════════════
 * DESIGN & APARÊNCIA — v10 editorial
 * ─────────────────────────────────────────────────────────────
 * Paletas alinhadas à DNA LexAI: champagne + noir + ouro antigo.
 * Todas as 5 paletas respeitam o padrão visual do dashboard —
 * nenhuma quebra o layout dourado do resto do painel.
 * ═════════════════════════════════════════════════════════════ */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Palette, RotateCcw, Type,
  SlidersHorizontal, LayoutGrid, Square, Accessibility,
  LayoutPanelTop, Droplet, Eye, CheckCircle2, Settings,
} from 'lucide-react'

/* ── Types ───────────────────────────────────────────────────── */

type ColorKey = 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'danger'
type Spacing = 'compact' | 'standard' | 'relaxed'
type Density = 'compact' | 'normal' | 'spacious'
type DashboardLayout = 'glass' | 'minimal' | 'bold'
type Colors = Record<ColorKey, string>

interface DesignPrefs {
  colors: Colors
  headingFont: string
  bodyFont: string
  fontSize: number
  radius: number
  shadowIntensity: number
  spacing: Spacing
  density: Density
  highContrast: boolean
  reduceMotion: boolean
  buttonScale: number
  dashboardLayout: DashboardLayout
}

/* ── Brand-aligned defaults (champagne DNA, NOT blue) ───────── */
const DEFAULT_COLORS: Colors = {
  primary:   '#bfa68e',  // champagne — nunca sobrescreve o --accent do dashboard
  secondary: '#7a5f48',  // ouro antigo
  success:   '#8fb082',  // jade seco
  warning:   '#d4ae6a',  // ouro brilhante
  info:      '#9cb3bf',  // névoa
  danger:    '#d88977',  // carmim pálido
}

const COLOR_LABELS: Record<ColorKey, { label: string; tip: string }> = {
  primary:   { label: 'Principal',  tip: 'Cor da marca. Botões, links, destaques e barras ativas.' },
  secondary: { label: 'Apoio',      tip: 'Cor neutra de apoio. Textos secundários e elementos discretos.' },
  success:   { label: 'Sucesso',    tip: 'Ações concluídas, confirmações e mensagens positivas.' },
  warning:   { label: 'Atenção',    tip: 'Alertas, prazos próximos e estados intermediários.' },
  info:      { label: 'Informação', tip: 'Badges informativos, dicas e estados neutros.' },
  danger:    { label: 'Risco',      tip: 'Erros, exclusões e ações destrutivas.' },
}

const HEADING_FONTS = ['Playfair Display', 'DM Sans', 'Inter', 'Roboto', 'Poppins', 'Montserrat']
const BODY_FONTS = ['DM Sans', 'Inter', 'Roboto', 'Source Sans Pro', 'Open Sans']

/* ── 5 paletas, todas alinhadas à DNA champagne/noir ────────── */
const PALETTES: Record<string, { name: string; description: string; colors: Colors }> = {
  champagne: {
    name: 'Champagne',
    description: 'Paleta oficial · ouro sobre carvão. O padrão do dashboard.',
    colors: { primary: '#bfa68e', secondary: '#7a5f48', success: '#8fb082', warning: '#d4ae6a', info: '#9cb3bf', danger: '#d88977' },
  },
  noirOuro: {
    name: 'Noir & Ouro',
    description: 'Contraste máximo · ouro intenso sobre preto profundo.',
    colors: { primary: '#d4ae6a', secondary: '#3d3530', success: '#6ea66a', warning: '#e0b878', info: '#8ba2b2', danger: '#c57360' },
  },
  papiro: {
    name: 'Papiro',
    description: 'Quente e editorial · pergaminho + tinta sépia.',
    colors: { primary: '#c9a876', secondary: '#8a6f5a', success: '#9bb07e', warning: '#d4a95a', info: '#b0a48e', danger: '#c27b63' },
  },
  jadeToga: {
    name: 'Jade Toga',
    description: 'Tribunal clássico · verde jade + dourado apagado.',
    colors: { primary: '#a39067', secondary: '#3f4e3a', success: '#6f9a6a', warning: '#c8a556', info: '#88a09a', danger: '#b87058' },
  },
  carmimTribunal: {
    name: 'Carmim Tribunal',
    description: 'Autoridade clássica · vinho fechado + dourado fosco.',
    colors: { primary: '#a88b6e', secondary: '#6e3d3b', success: '#7ea079', warning: '#c69a56', info: '#93a0aa', danger: '#b65e52' },
  },
}

const DEFAULT_PREFS: DesignPrefs = {
  colors: DEFAULT_COLORS,
  headingFont: 'Playfair Display',
  bodyFont: 'DM Sans',
  fontSize: 16,
  radius: 16,
  shadowIntensity: 50,
  spacing: 'standard',
  density: 'normal',
  highContrast: false,
  reduceMotion: false,
  buttonScale: 100,
  dashboardLayout: 'glass',
}

const STORAGE_KEY = 'lexai-design-prefs'

/* ── Helpers ─────────────────────────────────────────────────── */

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function applyAllStyles(prefs: DesignPrefs) {
  const root = document.documentElement
  const { colors, fontSize, reduceMotion, highContrast } = prefs

  root.style.setProperty('--accent', colors.primary)
  root.style.setProperty('--accent-light', hexToRgba(colors.primary, 0.08))
  root.style.setProperty('--accent-dark', colors.secondary)
  root.style.setProperty('--accent-bg', hexToRgba(colors.primary, 0.05))
  root.style.setProperty('--success', colors.success)
  root.style.setProperty('--success-light', hexToRgba(colors.success, 0.08))
  root.style.setProperty('--warning', colors.warning)
  root.style.setProperty('--warning-light', hexToRgba(colors.warning, 0.08))
  root.style.setProperty('--danger', colors.danger)
  root.style.setProperty('--danger-light', hexToRgba(colors.danger, 0.08))
  root.style.setProperty('--info', colors.info)
  root.style.setProperty('--sidebar-active-bar', colors.primary)

  root.style.setProperty('font-size', `${fontSize}px`)

  if (reduceMotion) root.style.setProperty('--motion-duration', '0.01ms')
  else root.style.removeProperty('--motion-duration')

  if (highContrast) root.setAttribute('data-high-contrast', 'true')
  else root.removeAttribute('data-high-contrast')

  // Painel é sempre dark v10 — light mode foi removido em 2026-04-22
  root.setAttribute('data-theme', 'dark')
}

/* ── Design tokens for cards on this page ───────────────────── */
const cardShell = {
  padding: 24, borderRadius: 14, marginBottom: 18,
  background: 'rgba(15,15,15,0.82)',
  border: '1px solid var(--border)',
} as const

const sectionLabel = {
  fontFamily: 'var(--font-mono, ui-monospace), monospace',
  fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase' as const,
  color: 'var(--accent)',
  marginBottom: 6,
}

const sectionTitle = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: 'italic' as const,
  fontSize: 22, fontWeight: 500,
  color: 'var(--text-primary)',
  letterSpacing: '-0.01em',
  marginBottom: 6,
}

const sectionSub = {
  fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.55,
  marginBottom: 18,
}

const fieldLabelStyle = {
  fontFamily: 'var(--font-mono, ui-monospace), monospace',
  fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase' as const,
  color: 'var(--text-secondary)', fontWeight: 600,
  marginBottom: 4,
}

const fieldHintStyle = {
  fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.45,
  marginBottom: 10,
}

/* ── SectionCard ─────────────────────────────────────────────── */

function SectionCard({
  title, subtitle, icon, children,
}: { title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={cardShell}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: 'rgba(212,174,106,0.12)',
          border: '1px solid rgba(212,174,106,0.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent)',
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={sectionLabel}>Configuração</div>
          <div style={sectionTitle}>{title}</div>
          <div style={sectionSub}>{subtitle}</div>
        </div>
      </div>
      {children}
    </div>
  )
}

function FieldLabel({ title, hint }: { title: string; hint?: string }) {
  return (
    <div>
      <div style={fieldLabelStyle}>{title}</div>
      {hint && <div style={fieldHintStyle}>{hint}</div>}
    </div>
  )
}

/* ── Page ────────────────────────────────────────────────────── */

export default function DesignPage() {
  const [prefs, setPrefs] = useState<DesignPrefs>(DEFAULT_PREFS)
  const [saved, setSaved] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const initialApply = useRef(false)

  const update = useCallback(<K extends keyof DesignPrefs>(key: K, value: DesignPrefs[K]) => {
    setPrefs(prev => ({ ...prev, [key]: value }))
  }, [])

  const updateColor = useCallback((key: ColorKey, value: string) => {
    setPrefs(prev => ({ ...prev, colors: { ...prev.colors, [key]: value } }))
  }, [])

  const resetColor = useCallback((key: ColorKey) => {
    setPrefs(prev => ({ ...prev, colors: { ...prev.colors, [key]: DEFAULT_COLORS[key] } }))
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const p = JSON.parse(raw) as Partial<DesignPrefs>
        setPrefs(prev => ({
          ...prev,
          ...p,
          colors: { ...prev.colors, ...(p.colors || {}) },
        }))
      }
    } catch { /* ignore */ }
    setHasLoaded(true)
  }, [])

  useEffect(() => {
    if (!hasLoaded) return
    applyAllStyles(prefs)
    initialApply.current = true
  }, [prefs, hasLoaded])

  function savePrefs() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function resetDefaults() {
    setPrefs(DEFAULT_PREFS)
    localStorage.removeItem(STORAGE_KEY)
    const root = document.documentElement
    ;[
      '--accent', '--accent-light', '--accent-dark', '--accent-bg',
      '--success', '--success-light', '--warning', '--warning-light',
      '--danger', '--danger-light', '--info', '--sidebar-active-bar',
      '--motion-duration',
    ].forEach(v => root.style.removeProperty(v))
    root.style.removeProperty('font-size')
    root.removeAttribute('data-high-contrast')
  }

  function applyPalette(paletteKey: string) {
    const palette = PALETTES[paletteKey]
    if (!palette) return
    setPrefs(prev => ({ ...prev, colors: { ...palette.colors } }))
  }

  const { colors } = prefs

  return (
    <div style={{ padding: '32px 36px 120px', maxWidth: 1400, margin: '0 auto' }}>
      {/* HEADER */}
      <header style={{ marginBottom: 28 }}>
        <div style={{
          fontFamily: 'var(--font-mono, ui-monospace), monospace',
          fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase',
          color: 'var(--accent)', marginBottom: 10,
        }}>
          Painel · aparência
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 40, fontWeight: 500, fontStyle: 'italic',
          color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1,
        }}>
          Design &amp; aparência
        </h1>
        <p style={{
          fontSize: 14, color: 'var(--text-muted)', maxWidth: 680,
          lineHeight: 1.6, marginTop: 10,
        }}>
          Personalize cores, tipografia, espaçamento e acessibilidade do seu painel.
          Alterações aplicam em tempo real e podem ser salvas pro escritório inteiro.
        </p>
      </header>

      {/* LAYOUT */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px',
        gap: 28, alignItems: 'start',
      }} className="dp-layout">
        {/* ───── CONFIG COLUMN ───── */}
        <div>

          {/* CORES */}
          <SectionCard
            title="Cores"
            subtitle="Escolha uma paleta pronta alinhada à DNA LexAI ou personalize cada cor individualmente."
            icon={<Palette size={18} strokeWidth={1.75} aria-hidden />}
          >
            <div style={{ marginBottom: 24 }}>
              <FieldLabel
                title="Paletas brand-aligned"
                hint="Cinco combinações testadas · todas respeitam o contraste noir + gold do dashboard."
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginTop: 10 }}>
                {Object.entries(PALETTES).map(([key, p]) => {
                  const isActive = JSON.stringify(p.colors) === JSON.stringify(colors)
                  return (
                    <button
                      key={key}
                      onClick={() => applyPalette(key)}
                      style={{
                        padding: 14, borderRadius: 12,
                        border: isActive ? `1.5px solid ${colors.primary}` : '1px solid var(--border)',
                        background: isActive ? hexToRgba(colors.primary, 0.06) : 'rgba(10,10,10,0.5)',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.18s ease',
                        display: 'flex', flexDirection: 'column', gap: 10,
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = 'rgba(212,174,106,0.38)' }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = 'var(--border)' }}
                    >
                      <div style={{ display: 'flex', gap: 3 }}>
                        {Object.values(p.colors).map((c, i) => (
                          <div key={i} style={{
                            width: 22, height: 22, borderRadius: 6, background: c,
                            border: '1px solid rgba(0,0,0,0.3)',
                            boxShadow: `0 2px 6px ${hexToRgba(c, 0.35)}`,
                          }} />
                        ))}
                      </div>
                      <div>
                        <div style={{
                          fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic',
                          fontSize: 16, fontWeight: 500,
                          color: isActive ? colors.primary : 'var(--text-primary)',
                          letterSpacing: '-0.01em',
                        }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, marginTop: 4 }}>
                          {p.description}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <FieldLabel
              title="Cores individuais"
              hint="Ajuste fino · passe o mouse sobre cada cor pra ver o que ela controla."
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 10 }}>
              {(Object.keys(colors) as ColorKey[]).map(key => {
                const value = colors[key]
                const meta = COLOR_LABELS[key]
                const isCustom = value.toLowerCase() !== DEFAULT_COLORS[key].toLowerCase()
                return (
                  <div key={key} style={{
                    padding: 14, borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'rgba(10,10,10,0.5)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{ position: 'relative' }} title={meta.tip}>
                      <div style={{
                        width: 58, height: 58, borderRadius: 14, background: value,
                        boxShadow: `0 8px 22px ${hexToRgba(value, 0.34)}, inset 0 1px 0 rgba(255,255,255,0.15)`,
                        border: '1.5px solid rgba(255,255,255,0.08)',
                      }} />
                      <input
                        type="color" value={value}
                        onChange={e => updateColor(key, e.target.value)}
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                      />
                      <div style={{
                        position: 'absolute', bottom: -4, right: -4,
                        width: 22, height: 22, borderRadius: '50%',
                        background: '#0a0a0a', border: '1px solid rgba(212,174,106,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--accent)',
                      }}>
                        <SlidersHorizontal size={9} strokeWidth={1.75} aria-hidden />
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: 12, fontWeight: 700, color: 'var(--text-primary)',
                      }} title={meta.tip}>
                        {meta.label}
                      </div>
                      <div style={{
                        fontSize: 10, color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono, ui-monospace), monospace',
                        marginTop: 2, letterSpacing: '0.05em',
                      }}>
                        {value.toUpperCase()}
                      </div>
                    </div>
                    {isCustom && (
                      <button
                        onClick={() => resetColor(key)}
                        style={{
                          fontSize: 10, fontWeight: 600, color: colors.primary,
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          padding: '2px 6px', borderRadius: 6,
                          display: 'flex', alignItems: 'center', gap: 4,
                          fontFamily: 'var(--font-mono, ui-monospace), monospace',
                          letterSpacing: '0.12em', textTransform: 'uppercase',
                        }}
                        title="Restaurar cor padrão"
                      >
                        <RotateCcw size={11} strokeWidth={2} aria-hidden /> Resetar
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </SectionCard>

          {/* TIPOGRAFIA */}
          <SectionCard
            title="Tipografia"
            subtitle="Fontes dos títulos e corpo. Playfair no heading mantém o caráter editorial do painel."
            icon={<Type size={18} strokeWidth={1.75} aria-hidden />}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
              <div>
                <FieldLabel title="Títulos" hint="Headings, títulos de página e cards" />
                <select
                  value={prefs.headingFont}
                  onChange={e => update('headingFont', e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 13,
                    background: 'rgba(10,10,10,0.6)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontFamily: 'inherit',
                  }}
                >
                  {HEADING_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <FieldLabel title="Corpo" hint="Parágrafos, listas e descrições" />
                <select
                  value={prefs.bodyFont}
                  onChange={e => update('bodyFont', e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: 13,
                    background: 'rgba(10,10,10,0.6)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontFamily: 'inherit',
                  }}
                >
                  {BODY_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <FieldLabel title={`Tamanho base · ${prefs.fontSize}px`} hint="Ajusta todo o conteúdo proporcionalmente" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 30 }}>12</span>
                <input
                  type="range" min="12" max="20" step="1"
                  value={prefs.fontSize}
                  onChange={e => update('fontSize', Number(e.target.value))}
                  style={{ flex: 1, accentColor: colors.primary }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 30 }}>20</span>
              </div>
            </div>

            <div style={{
              padding: 18, borderRadius: 12,
              background: 'rgba(10,10,10,0.55)',
              border: '1px solid rgba(191,166,142,0.1)',
            }}>
              <div style={{
                fontSize: prefs.fontSize * 1.6, fontWeight: 500, fontStyle: 'italic',
                color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: 8,
                fontFamily: `'${prefs.headingFont}', Georgia, serif`,
                letterSpacing: '-0.02em',
              }}>
                Título de exemplo
              </div>
              <div style={{
                fontSize: prefs.fontSize,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                fontFamily: `'${prefs.bodyFont}', sans-serif`,
              }}>
                Este é um texto de exemplo para visualizar como ficarão os parágrafos com as fontes e o tamanho escolhidos.
              </div>
            </div>
          </SectionCard>

          {/* LAYOUT */}
          <SectionCard
            title="Layout &amp; espaçamento"
            subtitle="Arredondamento, sombras e densidade dos elementos do painel."
            icon={<Settings size={18} strokeWidth={1.75} aria-hidden />}
          >
            <div style={{ marginBottom: 22 }}>
              <FieldLabel title={`Arredondamento · ${prefs.radius}px`} hint="Quanto maior, mais macio o visual" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 36 }}>reto</span>
                <input
                  type="range" min="0" max="28"
                  value={prefs.radius}
                  onChange={e => update('radius', Number(e.target.value))}
                  style={{ flex: 1, accentColor: colors.primary }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 50 }}>redondo</span>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                <button style={{
                  padding: '9px 18px', borderRadius: prefs.radius,
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  color: '#0a0a0a', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'default',
                  fontFamily: 'var(--font-mono, ui-monospace), monospace',
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                }}>Botão</button>
                <input readOnly value="Input" style={{
                  padding: '9px 14px', borderRadius: prefs.radius, border: '1px solid var(--border)',
                  fontSize: 12, background: 'rgba(10,10,10,0.55)', outline: 'none', width: 90,
                  color: 'var(--text-secondary)',
                }} />
                <div style={{
                  padding: '9px 14px', borderRadius: prefs.radius,
                  background: 'rgba(15,15,15,0.82)',
                  border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)',
                  boxShadow: `0 2px ${prefs.shadowIntensity / 8}px rgba(0,0,0,0.3)`,
                }}>Card</div>
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <FieldLabel title={`Sombras · ${prefs.shadowIntensity}%`} hint="Profundidade visual dos elementos elevados" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 36 }}>plano</span>
                <input
                  type="range" min="0" max="100"
                  value={prefs.shadowIntensity}
                  onChange={e => update('shadowIntensity', Number(e.target.value))}
                  style={{ flex: 1, accentColor: colors.primary }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 50 }}>profundo</span>
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <FieldLabel title="Espaçamento geral" hint="Compacto economiza espaço · relaxado fica arejado" />
              <div style={{ display: 'flex', gap: 8 }}>
                {(['compact', 'standard', 'relaxed'] as Spacing[]).map(sp => {
                  const labels: Record<Spacing, string> = { compact: 'Compacto', standard: 'Padrão', relaxed: 'Relaxado' }
                  const isActive = prefs.spacing === sp
                  return (
                    <button
                      key={sp}
                      onClick={() => update('spacing', sp)}
                      style={{
                        flex: 1, padding: '10px 14px', borderRadius: 10,
                        fontFamily: 'var(--font-mono, ui-monospace), monospace',
                        fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700,
                        border: isActive ? `1.5px solid ${colors.primary}` : '1px solid var(--border)',
                        background: isActive ? hexToRgba(colors.primary, 0.1) : 'rgba(10,10,10,0.5)',
                        color: isActive ? colors.primary : 'var(--text-secondary)',
                        cursor: 'pointer', transition: 'all 0.18s',
                      }}
                    >
                      {labels[sp]}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <FieldLabel title="Densidade" hint="Compacta mostra mais dados · espaçosa prioriza clareza" />
              <div style={{ display: 'flex', gap: 8 }}>
                {(['compact', 'normal', 'spacious'] as Density[]).map(d => {
                  const labels: Record<Density, { title: string; icon: React.ReactNode }> = {
                    compact:  { title: 'Compacta',  icon: <LayoutGrid size={12} strokeWidth={1.75} aria-hidden /> },
                    normal:   { title: 'Normal',    icon: <LayoutGrid size={12} strokeWidth={1.75} aria-hidden /> },
                    spacious: { title: 'Espaçosa',  icon: <Square size={12} strokeWidth={1.75} aria-hidden /> },
                  }
                  const isActive = prefs.density === d
                  return (
                    <button
                      key={d}
                      onClick={() => update('density', d)}
                      style={{
                        flex: 1, padding: '10px 14px', borderRadius: 10,
                        fontFamily: 'var(--font-mono, ui-monospace), monospace',
                        fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700,
                        border: isActive ? `1.5px solid ${colors.primary}` : '1px solid var(--border)',
                        background: isActive ? hexToRgba(colors.primary, 0.1) : 'rgba(10,10,10,0.5)',
                        color: isActive ? colors.primary : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        transition: 'all 0.18s',
                      }}
                    >
                      {labels[d].icon} {labels[d].title}
                    </button>
                  )
                })}
              </div>
            </div>
          </SectionCard>

          {/* ACESSIBILIDADE */}
          <SectionCard
            title="Acessibilidade"
            subtitle="Ajustes para diferentes necessidades visuais e motoras."
            icon={<Accessibility size={18} strokeWidth={1.75} aria-hidden />}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 0', borderBottom: '1px solid rgba(191,166,142,0.12)',
            }}>
              <div style={{ flex: 1, paddingRight: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                  Alto contraste
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Aumenta o contraste entre textos e fundos para facilitar a leitura.
                </div>
              </div>
              <button
                role="switch" aria-checked={prefs.highContrast}
                onClick={() => update('highContrast', !prefs.highContrast)}
                style={{
                  width: 44, height: 24, borderRadius: 12,
                  background: prefs.highContrast ? colors.primary : 'var(--border)',
                  border: 'none', cursor: 'pointer', position: 'relative',
                  transition: 'background 0.2s', flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: 2, left: prefs.highContrast ? 22 : 2,
                  width: 20, height: 20, borderRadius: '50%',
                  background: prefs.highContrast ? '#0a0a0a' : '#fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 0', borderBottom: '1px solid rgba(191,166,142,0.12)',
            }}>
              <div style={{ flex: 1, paddingRight: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                  Reduzir animações
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Diminui ou desativa transições — útil para sensibilidade ao movimento.
                </div>
              </div>
              <button
                role="switch" aria-checked={prefs.reduceMotion}
                onClick={() => update('reduceMotion', !prefs.reduceMotion)}
                style={{
                  width: 44, height: 24, borderRadius: 12,
                  background: prefs.reduceMotion ? colors.primary : 'var(--border)',
                  border: 'none', cursor: 'pointer', position: 'relative',
                  transition: 'background 0.2s', flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: 2, left: prefs.reduceMotion ? 22 : 2,
                  width: 20, height: 20, borderRadius: '50%',
                  background: prefs.reduceMotion ? '#0a0a0a' : '#fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>

            <div style={{ paddingTop: 16 }}>
              <FieldLabel title={`Escala dos botões · ${prefs.buttonScale}%`} hint="Área de toque ampliada — útil para mobile e telas sensíveis" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 36 }}>100%</span>
                <input
                  type="range" min="100" max="150" step="5"
                  value={prefs.buttonScale}
                  onChange={e => update('buttonScale', Number(e.target.value))}
                  style={{ flex: 1, accentColor: colors.primary }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 36 }}>150%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
                <button style={{
                  padding: `${10 * (prefs.buttonScale / 100)}px ${22 * (prefs.buttonScale / 100)}px`,
                  borderRadius: prefs.radius,
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  color: '#0a0a0a', border: 'none',
                  fontFamily: 'var(--font-mono, ui-monospace), monospace',
                  fontSize: 12 * (prefs.buttonScale / 100), fontWeight: 700,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  cursor: 'default', transition: 'all 0.2s',
                }}>
                  Botão de exemplo
                </button>
              </div>
            </div>
          </SectionCard>

          {/* DASHBOARD LAYOUT */}
          <SectionCard
            title="Estilo do dashboard"
            subtitle="Presets que aplicam um conjunto completo de configurações visuais."
            icon={<LayoutPanelTop size={18} strokeWidth={1.75} aria-hidden />}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {(['glass', 'minimal', 'bold'] as DashboardLayout[]).map(layout => {
                const info: Record<DashboardLayout, { title: string; desc: string; icon: React.ReactNode }> = {
                  glass:   { title: 'Glass',   desc: 'Vidro e desfoque · padrão v10',  icon: <Droplet size={20} strokeWidth={1.75} aria-hidden /> },
                  minimal: { title: 'Minimal', desc: 'Linhas limpas · sem sombras',    icon: <Square size={20} strokeWidth={1.75} aria-hidden /> },
                  bold:    { title: 'Bold',    desc: 'Contornos marcantes · arrojado', icon: <Square size={20} strokeWidth={1.75} aria-hidden /> },
                }
                const isActive = prefs.dashboardLayout === layout
                return (
                  <button
                    key={layout}
                    onClick={() => {
                      update('dashboardLayout', layout)
                      if (layout === 'glass') { update('radius', 16); update('shadowIntensity', 50) }
                      else if (layout === 'minimal') { update('radius', 6); update('shadowIntensity', 15) }
                      else if (layout === 'bold') { update('radius', 4); update('shadowIntensity', 80) }
                    }}
                    style={{
                      padding: '16px 14px', borderRadius: 14,
                      border: isActive ? `1.5px solid ${colors.primary}` : '1px solid var(--border)',
                      background: isActive ? hexToRgba(colors.primary, 0.08) : 'rgba(10,10,10,0.5)',
                      cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                    }}
                  >
                    <div style={{
                      width: 46, height: 46, borderRadius: 12,
                      background: isActive
                        ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                        : 'rgba(191,166,142,0.08)',
                      border: `1px solid ${isActive ? 'transparent' : 'rgba(191,166,142,0.2)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isActive ? '#0a0a0a' : 'var(--text-secondary)',
                      transition: 'all 0.2s',
                    }}>
                      {info[layout].icon}
                    </div>
                    <div>
                      <div style={{
                        fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic',
                        fontSize: 16, fontWeight: 500,
                        color: isActive ? colors.primary : 'var(--text-primary)',
                        marginBottom: 4, letterSpacing: '-0.01em',
                      }}>{info[layout].title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {info[layout].desc}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </SectionCard>

        </div>

        {/* ───── STICKY PREVIEW ───── */}
        <aside style={{ position: 'sticky', top: 100, alignSelf: 'start' }} className="dp-preview">
          <div style={{
            padding: 20, borderRadius: 14,
            background: 'radial-gradient(120% 140% at 20% 0%, rgba(212,174,106,0.1), transparent 60%), rgba(15,15,15,0.88)',
            border: '1px solid rgba(212,174,106,0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, color: colors.primary }}>
              <Eye size={16} strokeWidth={1.75} aria-hidden />
              <div style={{
                fontFamily: 'var(--font-mono, ui-monospace), monospace',
                fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
                color: 'var(--accent)', fontWeight: 700,
              }}>
                Pré-visualização
              </div>
            </div>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic',
              fontSize: 20, color: 'var(--text-primary)', fontWeight: 500,
              letterSpacing: '-0.01em', marginBottom: 14, lineHeight: 1.2,
            }}>
              ao vivo
            </div>

            <div style={{
              padding: 16, borderRadius: prefs.radius,
              background: 'rgba(10,10,10,0.55)',
              border: '1px solid rgba(191,166,142,0.12)',
              boxShadow: `0 ${prefs.shadowIntensity / 10}px ${prefs.shadowIntensity / 3}px rgba(0,0,0,${prefs.shadowIntensity / 400})`,
              marginBottom: 14, transition: 'all 0.25s',
            }}>
              <div style={{
                fontSize: prefs.fontSize * 1.15, fontWeight: 500, fontStyle: 'italic',
                color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.25,
                fontFamily: `'${prefs.headingFont}', Georgia, serif`,
                letterSpacing: '-0.01em',
              }}>
                Card de exemplo
              </div>
              <div style={{
                fontSize: prefs.fontSize * 0.82,
                color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 14,
                fontFamily: `'${prefs.bodyFont}', sans-serif`,
              }}>
                Este card mostra como o painel ficará com suas configurações.
              </div>
              <input
                placeholder="Campo de texto"
                style={{
                  width: '100%', padding: '8px 12px',
                  borderRadius: prefs.radius * 0.7,
                  border: '1px solid var(--border)',
                  background: 'rgba(0,0,0,0.35)',
                  fontSize: 12, color: 'var(--text-primary)',
                  marginBottom: 10, outline: 'none',
                  fontFamily: `'${prefs.bodyFont}', sans-serif`,
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{
                  flex: 1,
                  padding: `${9 * (prefs.buttonScale / 100)}px ${14 * (prefs.buttonScale / 100)}px`,
                  borderRadius: prefs.radius * 0.7,
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  color: '#0a0a0a', border: 'none',
                  fontFamily: 'var(--font-mono, ui-monospace), monospace',
                  fontSize: 10 * (prefs.buttonScale / 100), fontWeight: 700,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  cursor: 'default',
                }}>
                  Confirmar
                </button>
                <button style={{
                  flex: 1,
                  padding: `${9 * (prefs.buttonScale / 100)}px ${14 * (prefs.buttonScale / 100)}px`,
                  borderRadius: prefs.radius * 0.7,
                  background: 'transparent', color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-mono, ui-monospace), monospace',
                  fontSize: 10 * (prefs.buttonScale / 100), fontWeight: 700,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  cursor: 'default',
                }}>
                  Cancelar
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(['success', 'warning', 'info', 'danger'] as ColorKey[]).map(k => (
                <div key={k} style={{
                  padding: '4px 10px',
                  borderRadius: prefs.radius * 0.5,
                  background: hexToRgba(colors[k], 0.14),
                  color: colors[k],
                  fontSize: 10, fontWeight: 600,
                  fontFamily: 'var(--font-mono, ui-monospace), monospace',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  border: `1px solid ${hexToRgba(colors[k], 0.3)}`,
                }}>
                  {COLOR_LABELS[k].label}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ───── FLOATING ACTIONS ───── */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 50,
        display: 'flex', gap: 10, padding: 12, borderRadius: 16,
        background: 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(18px) saturate(160%)',
        WebkitBackdropFilter: 'blur(18px) saturate(160%)',
        border: '1px solid rgba(212,174,106,0.32)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
      }}>
        <button
          onClick={resetDefaults}
          style={{
            padding: '11px 16px', borderRadius: 10,
            fontFamily: 'var(--font-mono, ui-monospace), monospace',
            fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700,
            background: 'transparent', color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
            cursor: 'pointer', transition: 'all 0.18s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <RotateCcw size={12} strokeWidth={2} aria-hidden /> Resetar
        </button>
        <button
          onClick={savePrefs}
          style={{
            padding: '11px 20px', borderRadius: 10,
            fontFamily: 'var(--font-mono, ui-monospace), monospace',
            fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700,
            background: saved
              ? `linear-gradient(135deg, ${colors.success}, #6e9067)`
              : 'linear-gradient(135deg, #f5e8d3, #bfa68e, #7a5f48)',
            color: '#0a0a0a', border: '1px solid rgba(212,174,106,0.5)',
            cursor: 'pointer', transition: 'all 0.18s',
            boxShadow: saved
              ? `0 10px 28px ${hexToRgba(colors.success, 0.3)}`
              : '0 10px 28px rgba(212,174,106,0.28)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <CheckCircle2 size={12} strokeWidth={2} aria-hidden />
          {saved ? 'Salvo!' : 'Salvar alterações'}
        </button>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dp-layout { grid-template-columns: 1fr !important; }
          .dp-preview { position: static !important; }
        }
      `}</style>
    </div>
  )
}
