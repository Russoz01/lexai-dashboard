'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Sun,
  Moon,
  CircleDot,
  Palette,
  RotateCcw,
  Type,
  SlidersHorizontal,
  LayoutGrid,
  Square,
  Accessibility,
  LayoutPanelTop,
  Droplet,
  Eye,
  CheckCircle2,
  Settings,
} from 'lucide-react'
import s from './page.module.css'

/* ─────────────────────────────────────────────────────────────────
   TIPOS & CONSTANTES
   ───────────────────────────────────────────────────────────────── */

type ColorKey = 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'danger'
type ThemeMode = 'light' | 'dark' | 'auto'
type Spacing = 'compact' | 'standard' | 'relaxed'
type Density = 'compact' | 'normal' | 'spacious'
type DashboardLayout = 'glass' | 'minimal' | 'bold'
type Colors = Record<ColorKey, string>

interface DesignPrefs {
  colors: Colors
  themeMode: ThemeMode
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

const DEFAULT_COLORS: Colors = {
  primary:   '#2563EB',
  secondary: '#475569',
  success:   '#10B981',
  warning:   '#F59E0B',
  info:      '#06B6D4',
  danger:    '#EF4444',
}

const COLOR_LABELS: Record<ColorKey, { label: string; tip: string }> = {
  primary:   { label: 'Primária',   tip: 'Cor principal da marca. Usada em botões, links, destaques e barras ativas do menu.' },
  secondary: { label: 'Secundária', tip: 'Cor neutra de apoio. Usada em textos secundários e elementos menos importantes.' },
  success:   { label: 'Sucesso',    tip: 'Indica ações concluídas, confirmações e mensagens positivas.' },
  warning:   { label: 'Aviso',      tip: 'Indica alertas, prazos próximos e informações que merecem atenção.' },
  info:      { label: 'Informação', tip: 'Usada em badges informativos, dicas e estados neutros.' },
  danger:    { label: 'Erro',       tip: 'Indica erros, exclusões e ações destrutivas.' },
}

const HEADING_FONTS = ['Inter SemiBold', 'Playfair Display', 'DM Sans', 'Roboto', 'Poppins', 'Montserrat']
const BODY_FONTS = ['Inter Regular', 'DM Sans', 'Roboto', 'Source Sans Pro', 'Open Sans']

const PALETTES: Record<string, { name: string; description: string; colors: Colors }> = {
  padrao: {
    name: 'Padrão',
    description: 'A paleta original do LexAI: equilibrada e profissional.',
    colors: { primary: '#2563EB', secondary: '#475569', success: '#10B981', warning: '#F59E0B', info: '#06B6D4', danger: '#EF4444' },
  },
  profissional: {
    name: 'Profissional',
    description: 'Tons sóbrios e formais, ideais para escritórios tradicionais.',
    colors: { primary: '#1E3A8A', secondary: '#334155', success: '#15803D', warning: '#B45309', info: '#0E7490', danger: '#B91C1C' },
  },
  vibrante: {
    name: 'Vibrante',
    description: 'Cores marcantes e modernas para um visual energético.',
    colors: { primary: '#7C3AED', secondary: '#64748B', success: '#22C55E', warning: '#F97316', info: '#3B82F6', danger: '#EC4899' },
  },
  minimalista: {
    name: 'Minimalista',
    description: 'Paleta neutra e suave, focada em clareza e leitura.',
    colors: { primary: '#0F172A', secondary: '#64748B', success: '#059669', warning: '#D97706', info: '#0284C7', danger: '#DC2626' },
  },
  elegante: {
    name: 'Elegante',
    description: 'Tons quentes e luxuosos, com toque de sofisticação.',
    colors: { primary: '#92400E', secondary: '#57534E', success: '#4D7C0F', warning: '#CA8A04', info: '#0F766E', danger: '#9F1239' },
  },
}

const DEFAULT_PREFS: DesignPrefs = {
  colors: DEFAULT_COLORS,
  themeMode: 'auto',
  headingFont: 'Inter SemiBold',
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

/* ─────────────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────────────── */

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

  // Cores principais
  root.style.setProperty('--accent', colors.primary)
  root.style.setProperty('--accent-light', hexToRgba(colors.primary, 0.08))
  root.style.setProperty('--accent-dark', colors.primary)
  root.style.setProperty('--accent-bg', hexToRgba(colors.primary, 0.05))
  root.style.setProperty('--success', colors.success)
  root.style.setProperty('--success-light', hexToRgba(colors.success, 0.08))
  root.style.setProperty('--warning', colors.warning)
  root.style.setProperty('--warning-light', hexToRgba(colors.warning, 0.08))
  root.style.setProperty('--danger', colors.danger)
  root.style.setProperty('--danger-light', hexToRgba(colors.danger, 0.08))
  root.style.setProperty('--info', colors.info)
  root.style.setProperty('--sidebar-active-bar', colors.primary)

  // Tamanho da fonte base
  root.style.setProperty('font-size', `${fontSize}px`)

  // Acessibilidade
  if (reduceMotion) {
    root.style.setProperty('--motion-duration', '0.01ms')
  } else {
    root.style.removeProperty('--motion-duration')
  }
  if (highContrast) {
    root.setAttribute('data-high-contrast', 'true')
  } else {
    root.removeAttribute('data-high-contrast')
  }
}

function applyThemeMode(mode: ThemeMode) {
  const root = document.documentElement
  if (mode === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  } else {
    root.setAttribute('data-theme', mode)
  }
}

/* ─────────────────────────────────────────────────────────────────
   COMPONENTES AUXILIARES
   ───────────────────────────────────────────────────────────────── */

function SectionCard({
  title, subtitle, icon, children,
}: { title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className={`section-card ${s.sectionCardInner}`}>
      <div className={s.sectionCardHeader}>
        <div className={s.sectionCardIcon}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className={s.sectionCardTitle}>
            {title}
          </div>
          <div className={s.sectionCardSub}>
            {subtitle}
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}

function FieldLabel({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className={s.fieldLabelWrap}>
      <div className={s.fieldLabelTitle}>{title}</div>
      {hint && (
        <div className={s.fieldLabelHint}>{hint}</div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   PAGINA
   ───────────────────────────────────────────────────────────────── */

export default function DesignPage() {
  const [prefs, setPrefs] = useState<DesignPrefs>(DEFAULT_PREFS)
  const [saved, setSaved] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const initialApply = useRef(false)

  // Helper to update a single field
  const update = useCallback(<K extends keyof DesignPrefs>(key: K, value: DesignPrefs[K]) => {
    setPrefs(prev => ({ ...prev, [key]: value }))
  }, [])

  const updateColor = useCallback((key: ColorKey, value: string) => {
    setPrefs(prev => ({ ...prev, colors: { ...prev.colors, [key]: value } }))
  }, [])

  const resetColor = useCallback((key: ColorKey) => {
    setPrefs(prev => ({ ...prev, colors: { ...prev.colors, [key]: DEFAULT_COLORS[key] } }))
  }, [])

  // Carregar preferencias salvas
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
    } catch {
      /* ignore */
    }
    setHasLoaded(true)
  }, [])

  // Aplicar estilos em tempo real
  useEffect(() => {
    if (!hasLoaded) return
    applyAllStyles(prefs)
    if (initialApply.current) {
      // Skip applying theme mode on initial mount - existing theme stays
      applyThemeMode(prefs.themeMode)
    }
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
    <div className={`page-content ${s.designPage}`}>
      {/* Header */}
      <div className={s.headerWrap}>
        <div className={s.headerHint}>
          Personalize a aparência do seu painel
        </div>
        <h1 className="page-title" style={{ fontSize: 30, fontWeight: 700 }}>
          Design & Aparência
        </h1>
        <div className={s.headerDesc}>
          Personalize cores, tipografia, espaçamento e acessibilidade do seu painel.
          Todas as alterações são aplicadas em tempo real e podem ser salvas para uso futuro.
        </div>
      </div>

      {/* Layout principal: configuracoes a esquerda, preview sticky a direita */}
      <div className={s.designLayout}>
        {/* ───────────── COLUNA DE CONFIGURACOES ───────────── */}
        <div>

          {/* SECAO 1: TEMA (LIGHT/DARK/AUTO) */}
          <SectionCard
            title="Tema do painel"
            subtitle="Escolha entre o modo claro, escuro ou siga automaticamente as preferências do seu sistema operacional."
            icon={<Sun size={18} strokeWidth={1.75} aria-hidden />}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {(['light', 'dark', 'auto'] as ThemeMode[]).map(mode => {
                const isActive = prefs.themeMode === mode
                const labels: Record<ThemeMode, { title: string; desc: string; icon: React.ReactNode }> = {
                  light: { title: 'Claro',      desc: 'Visual claro e arejado', icon: <Sun size={26} strokeWidth={1.75} aria-hidden /> },
                  dark:  { title: 'Escuro',     desc: 'Reduz o cansaço visual', icon: <Moon size={26} strokeWidth={1.75} aria-hidden /> },
                  auto:  { title: 'Automático', desc: 'Segue o seu sistema',    icon: <CircleDot size={26} strokeWidth={1.75} aria-hidden /> },
                }
                const info = labels[mode]
                const previewBg = mode === 'light' ? 'linear-gradient(135deg,#f8fafc,#e2e8f0)'
                                : mode === 'dark'  ? 'linear-gradient(135deg,#0f172a,#1e293b)'
                                : 'linear-gradient(135deg,#f8fafc 0%,#f8fafc 50%,#1e293b 50%,#0f172a 100%)'
                const previewText = mode === 'light' ? '#0f172a' : mode === 'dark' ? '#f1f5f9' : '#475569'

                return (
                  <button
                    key={mode}
                    onClick={() => update('themeMode', mode)}
                    style={{
                      padding: 0,
                      borderRadius: 14,
                      border: isActive ? `2px solid ${colors.primary}` : '1.5px solid var(--border)',
                      background: isActive ? hexToRgba(colors.primary, 0.06) : 'var(--card-bg)',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                  >
                    {/* Mini preview */}
                    <div style={{
                      height: 70, background: previewBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderBottom: '1px solid var(--border)',
                      color: previewText,
                    }}>
                      {info.icon}
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{
                        fontSize: 14, fontWeight: 700,
                        color: isActive ? colors.primary : 'var(--text-primary)',
                        marginBottom: 2,
                      }}>{info.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {info.desc}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </SectionCard>

          {/* SECAO 2: CORES */}
          <SectionCard
            title="Cores"
            subtitle="Escolha as cores que serão usadas em todo o painel. Você pode começar com uma paleta pronta ou personalizar cada cor individualmente."
            icon={<Palette size={18} strokeWidth={1.75} aria-hidden />}
          >
            {/* Paletas pre-prontas */}
            <div style={{ marginBottom: 24 }}>
              <FieldLabel
                title="Paletas pré-prontas"
                hint="Aplicam todas as 6 cores de uma vez, prontas para usar."
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                {Object.entries(PALETTES).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => applyPalette(key)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1.5px solid var(--border)',
                      background: 'var(--card-bg)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.18s',
                      display: 'flex', flexDirection: 'column', gap: 8,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    {/* Mini swatches */}
                    <div style={{ display: 'flex', gap: 4 }}>
                      {Object.values(p.colors).map((c, i) => (
                        <div key={i} style={{
                          width: 18, height: 18, borderRadius: 6, background: c,
                          border: '1px solid rgba(0,0,0,0.06)',
                        }} />
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.35, marginTop: 2 }}>
                        {p.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cores individuais */}
            <FieldLabel
              title="Cores individuais"
              hint="Personalize cada cor manualmente. Passe o mouse sobre o nome para ver o que cada cor controla."
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {(Object.keys(colors) as ColorKey[]).map(key => {
                const value = colors[key]
                const meta = COLOR_LABELS[key]
                const isCustom = value.toLowerCase() !== DEFAULT_COLORS[key].toLowerCase()
                return (
                  <div key={key} style={{
                    padding: 12,
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'var(--card-bg)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  }}>
                    <div style={{ position: 'relative' }} title={meta.tip}>
                      <div style={{
                        width: 56, height: 56, borderRadius: 14, background: value,
                        boxShadow: `0 4px 12px ${hexToRgba(value, 0.35)}`,
                        border: '2px solid rgba(255,255,255,0.85)',
                      }} />
                      <input
                        type="color" value={value}
                        onChange={e => updateColor(key, e.target.value)}
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                      />
                      <div style={{
                        position: 'absolute', bottom: -3, right: -3,
                        width: 20, height: 20, borderRadius: '50%',
                        background: '#fff', border: '1px solid rgba(0,0,0,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                        color: '#475569',
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
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 2 }}>
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
                          display: 'flex', alignItems: 'center', gap: 3,
                        }}
                        title="Restaurar cor padrão"
                      >
                        <RotateCcw size={14} strokeWidth={1.75} aria-hidden /> Resetar
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </SectionCard>

          {/* SECAO 3: TIPOGRAFIA */}
          <SectionCard
            title="Tipografia"
            subtitle="Defina as fontes usadas em títulos e textos do painel, além do tamanho base de leitura."
            icon={<Type size={18} strokeWidth={1.75} aria-hidden />}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <FieldLabel
                  title="Fonte dos títulos"
                  hint="Aplicada em headings, títulos de página e cards."
                />
                <select
                  value={prefs.headingFont}
                  onChange={e => update('headingFont', e.target.value)}
                  className="form-input"
                  style={{ fontSize: 13 }}
                >
                  {HEADING_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <FieldLabel
                  title="Fonte do corpo"
                  hint="Aplicada em parágrafos, listas e descrições."
                />
                <select
                  value={prefs.bodyFont}
                  onChange={e => update('bodyFont', e.target.value)}
                  className="form-input"
                  style={{ fontSize: 13 }}
                >
                  {BODY_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <FieldLabel
                title={`Tamanho base do texto: ${prefs.fontSize}px`}
                hint="Ajusta o tamanho geral de todo o conteúdo. Útil para melhor leitura."
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 30 }}>12px</span>
                <input
                  type="range" min="12" max="20" step="1"
                  value={prefs.fontSize}
                  onChange={e => update('fontSize', Number(e.target.value))}
                  style={{ flex: 1, accentColor: colors.primary }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 30 }}>20px</span>
              </div>
            </div>

            {/* Preview */}
            <div style={{
              padding: 16, borderRadius: 12,
              background: 'var(--input-bg)',
              border: '1px solid var(--border)',
            }}>
              <div style={{
                fontSize: prefs.fontSize * 1.5,
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.2,
                marginBottom: 6,
                fontFamily: `'${prefs.headingFont}', sans-serif`,
              }}>
                Título de exemplo
              </div>
              <div style={{
                fontSize: prefs.fontSize,
                color: 'var(--text-secondary)',
                lineHeight: 1.55,
                fontFamily: `'${prefs.bodyFont}', sans-serif`,
              }}>
                Este é um texto de exemplo para visualizar como ficarão os parágrafos com as fontes e o tamanho escolhidos.
              </div>
            </div>
          </SectionCard>

          {/* SECAO 4: LAYOUT & ESPACAMENTO */}
          <SectionCard
            title="Layout & Espaçamento"
            subtitle="Controle o arredondamento dos cantos, a intensidade das sombras e o espaçamento entre elementos do painel."
            icon={<Settings size={18} strokeWidth={1.75} aria-hidden />}
          >
            {/* Border radius */}
            <div style={{ marginBottom: 22 }}>
              <FieldLabel
                title={`Arredondamento dos cantos: ${prefs.radius}px`}
                hint="Quanto maior, mais arredondados ficam botões, cards e inputs."
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 36 }}>Reto</span>
                <input
                  type="range" min="0" max="28"
                  value={prefs.radius}
                  onChange={e => update('radius', Number(e.target.value))}
                  style={{ flex: 1, accentColor: colors.primary }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 50 }}>Redondo</span>
              </div>
              {/* Preview inline */}
              <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                <button style={{
                  padding: '8px 18px', borderRadius: prefs.radius, background: colors.primary,
                  color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'default',
                }}>Botão</button>
                <input readOnly value="Input" style={{
                  padding: '8px 14px', borderRadius: prefs.radius, border: '1.5px solid var(--border)',
                  fontSize: 13, background: 'var(--input-bg)', outline: 'none', width: 90,
                  color: 'var(--text-secondary)',
                }} />
                <div style={{
                  padding: '8px 14px', borderRadius: prefs.radius, background: 'var(--card-bg)',
                  border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)',
                  boxShadow: `0 2px ${prefs.shadowIntensity / 8}px rgba(0,0,0,0.06)`,
                }}>Card</div>
              </div>
            </div>

            {/* Shadow intensity */}
            <div style={{ marginBottom: 22 }}>
              <FieldLabel
                title={`Intensidade das sombras: ${prefs.shadowIntensity}%`}
                hint="Controla a profundidade visual de cards e elementos elevados."
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 36 }}>Plano</span>
                <input
                  type="range" min="0" max="100"
                  value={prefs.shadowIntensity}
                  onChange={e => update('shadowIntensity', Number(e.target.value))}
                  style={{ flex: 1, accentColor: colors.primary }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 50 }}>Profundo</span>
              </div>
            </div>

            {/* Spacing density */}
            <div style={{ marginBottom: 22 }}>
              <FieldLabel
                title="Espaçamento geral"
                hint="Define o espaço em volta dos elementos. Compacto economiza espaço; relaxado fica mais arejado."
              />
              <div style={{ display: 'flex', gap: 8 }}>
                {(['compact', 'standard', 'relaxed'] as Spacing[]).map(sp => {
                  const labels: Record<Spacing, string> = { compact: 'Compacto', standard: 'Padrão', relaxed: 'Relaxado' }
                  const isActive = prefs.spacing === sp
                  return (
                    <button
                      key={sp}
                      onClick={() => update('spacing', sp)}
                      style={{
                        flex: 1, padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                        border: isActive ? `2px solid ${colors.primary}` : '1.5px solid var(--border)',
                        background: isActive ? hexToRgba(colors.primary, 0.08) : 'var(--card-bg)',
                        color: isActive ? colors.primary : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.18s',
                      }}
                    >
                      {labels[sp]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Density */}
            <div>
              <FieldLabel
                title="Densidade da informação"
                hint="Controla quanta informação aparece em cada tela. Compacta mostra mais dados; espaçosa prioriza clareza."
              />
              <div style={{ display: 'flex', gap: 8 }}>
                {(['compact', 'normal', 'spacious'] as Density[]).map(d => {
                  const labels: Record<Density, { title: string; icon: React.ReactNode }> = {
                    compact:  { title: 'Compacta',  icon: <LayoutGrid size={14} strokeWidth={1.75} aria-hidden /> },
                    normal:   { title: 'Normal',    icon: <LayoutGrid size={14} strokeWidth={1.75} aria-hidden /> },
                    spacious: { title: 'Espaçosa',  icon: <Square size={14} strokeWidth={1.75} aria-hidden /> },
                  }
                  const isActive = prefs.density === d
                  return (
                    <button
                      key={d}
                      onClick={() => update('density', d)}
                      style={{
                        flex: 1, padding: '12px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                        border: isActive ? `2px solid ${colors.primary}` : '1.5px solid var(--border)',
                        background: isActive ? hexToRgba(colors.primary, 0.08) : 'var(--card-bg)',
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

          {/* SECAO 5: ACESSIBILIDADE */}
          <SectionCard
            title="Acessibilidade"
            subtitle="Ajustes para melhorar a usabilidade do painel para diferentes necessidades visuais e motoras."
            icon={<Accessibility size={18} strokeWidth={1.75} aria-hidden />}
          >
            {/* High contrast */}
            <div className={s.toggleRow}>
              <div style={{ flex: 1, paddingRight: 16 }}>
                <div className={s.toggleLabel}>
                  Alto contraste
                </div>
                <div className={s.toggleDesc}>
                  Aumenta o contraste entre textos e fundos para facilitar a leitura.
                </div>
              </div>
              <button
                role="switch"
                aria-checked={prefs.highContrast}
                onClick={() => update('highContrast', !prefs.highContrast)}
                style={{
                  width: 44, height: 24, borderRadius: 12,
                  background: prefs.highContrast ? colors.primary : 'var(--border)',
                  border: 'none', cursor: 'pointer', position: 'relative',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: 2, left: prefs.highContrast ? 22 : 2,
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>

            {/* Reduce motion */}
            <div className={s.toggleRow}>
              <div style={{ flex: 1, paddingRight: 16 }}>
                <div className={s.toggleLabel}>
                  Reduzir animações
                </div>
                <div className={s.toggleDesc}>
                  Diminui ou desativa animações e transições na interface, útil para sensibilidade ao movimento.
                </div>
              </div>
              <button
                role="switch"
                aria-checked={prefs.reduceMotion}
                onClick={() => update('reduceMotion', !prefs.reduceMotion)}
                style={{
                  width: 44, height: 24, borderRadius: 12,
                  background: prefs.reduceMotion ? colors.primary : 'var(--border)',
                  border: 'none', cursor: 'pointer', position: 'relative',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: 2, left: prefs.reduceMotion ? 22 : 2,
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>

            {/* Button scale (touch targets) */}
            <div style={{ paddingTop: 16 }}>
              <FieldLabel
                title={`Tamanho dos botões: ${prefs.buttonScale}%`}
                hint="Aumenta a área de toque dos botões. Útil para uso em telas sensíveis ao toque ou problemas de motricidade."
              />
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
              {/* Preview button at scale */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                <button style={{
                  padding: `${10 * (prefs.buttonScale / 100)}px ${22 * (prefs.buttonScale / 100)}px`,
                  borderRadius: prefs.radius,
                  background: colors.primary, color: '#fff', border: 'none',
                  fontSize: 13 * (prefs.buttonScale / 100), fontWeight: 600, cursor: 'default',
                  transition: 'all 0.2s',
                }}>
                  Botão de exemplo
                </button>
              </div>
            </div>
          </SectionCard>

          {/* SECAO 6: CANTOS DO DASHBOARD */}
          <SectionCard
            title="Cantos do dashboard"
            subtitle="Atalhos para alternar rapidamente entre estilos completos de layout do painel. Cada um aplica um conjunto pré-definido de configurações visuais."
            icon={<LayoutPanelTop size={18} strokeWidth={1.75} aria-hidden />}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {(['glass', 'minimal', 'bold'] as DashboardLayout[]).map(layout => {
                const info: Record<DashboardLayout, { title: string; desc: string; icon: React.ReactNode }> = {
                  glass:   { title: 'Glass',   desc: 'Visual atual com vidro e desfoque',  icon: <Droplet size={22} strokeWidth={1.75} aria-hidden /> },
                  minimal: { title: 'Minimal', desc: 'Linhas limpas, sem sombras pesadas', icon: <Square size={22} strokeWidth={1.75} aria-hidden /> },
                  bold:    { title: 'Bold',    desc: 'Cores fortes e contornos marcantes', icon: <Square size={22} strokeWidth={1.75} aria-hidden /> },
                }
                const isActive = prefs.dashboardLayout === layout
                return (
                  <button
                    key={layout}
                    onClick={() => {
                      update('dashboardLayout', layout)
                      // Apply layout presets
                      if (layout === 'glass') {
                        update('radius', 16)
                        update('shadowIntensity', 50)
                      } else if (layout === 'minimal') {
                        update('radius', 6)
                        update('shadowIntensity', 15)
                      } else if (layout === 'bold') {
                        update('radius', 4)
                        update('shadowIntensity', 80)
                      }
                    }}
                    style={{
                      padding: '16px 14px',
                      borderRadius: 14,
                      border: isActive ? `2px solid ${colors.primary}` : '1.5px solid var(--border)',
                      background: isActive ? hexToRgba(colors.primary, 0.06) : 'var(--card-bg)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: isActive ? colors.primary : 'var(--input-bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                    }}>
                      {info[layout].icon}
                    </div>
                    <div>
                      <div style={{
                        fontSize: 14, fontWeight: 700,
                        color: isActive ? colors.primary : 'var(--text-primary)',
                        marginBottom: 3,
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

        {/* ───────────── PREVIEW STICKY ───────────── */}
        <aside className={s.designPreview}>
          <div className="section-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, color: colors.primary }}>
              <Eye size={18} strokeWidth={1.75} aria-hidden />
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                Pré-visualização
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18, lineHeight: 1.4 }}>
              Veja todas as suas escolhas aplicadas em tempo real.
            </div>

            {/* Mini card preview */}
            <div style={{
              padding: 16,
              borderRadius: prefs.radius,
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              boxShadow: `0 ${prefs.shadowIntensity / 12}px ${prefs.shadowIntensity / 4}px rgba(0,0,0,${prefs.shadowIntensity / 600})`,
              marginBottom: 14,
              transition: 'all 0.25s',
            }}>
              <div style={{
                fontSize: prefs.fontSize * 1.1,
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 4,
                fontFamily: `'${prefs.headingFont}', sans-serif`,
              }}>
                Card de exemplo
              </div>
              <div style={{
                fontSize: prefs.fontSize * 0.85,
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                marginBottom: 12,
                fontFamily: `'${prefs.bodyFont}', sans-serif`,
              }}>
                Este card mostra como o painel ficará com suas configurações.
              </div>

              <input
                placeholder="Campo de texto"
                style={{
                  width: '100%', padding: '8px 12px',
                  borderRadius: prefs.radius * 0.7,
                  border: '1.5px solid var(--border)',
                  background: 'var(--input-bg)',
                  fontSize: 13, color: 'var(--text-primary)',
                  marginBottom: 10, outline: 'none',
                  fontFamily: `'${prefs.bodyFont}', sans-serif`,
                }}
              />

              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{
                  flex: 1,
                  padding: `${9 * (prefs.buttonScale / 100)}px ${14 * (prefs.buttonScale / 100)}px`,
                  borderRadius: prefs.radius * 0.7,
                  background: colors.primary, color: '#fff', border: 'none',
                  fontSize: 12 * (prefs.buttonScale / 100), fontWeight: 600, cursor: 'default',
                }}>
                  Confirmar
                </button>
                <button style={{
                  flex: 1,
                  padding: `${9 * (prefs.buttonScale / 100)}px ${14 * (prefs.buttonScale / 100)}px`,
                  borderRadius: prefs.radius * 0.7,
                  background: 'transparent', color: 'var(--text-secondary)',
                  border: '1.5px solid var(--border)',
                  fontSize: 12 * (prefs.buttonScale / 100), fontWeight: 600, cursor: 'default',
                }}>
                  Cancelar
                </button>
              </div>
            </div>

            {/* Status badges preview */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(['success', 'warning', 'info', 'danger'] as ColorKey[]).map(k => (
                <div key={k} style={{
                  padding: '4px 10px',
                  borderRadius: prefs.radius * 0.5,
                  background: hexToRgba(colors[k], 0.12),
                  color: colors[k],
                  fontSize: 11, fontWeight: 600,
                }}>
                  {COLOR_LABELS[k].label}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ───────────── BARRA FLUTUANTE DE ACOES ───────────── */}
      <div className={s.floatingBar}>
        <button
          onClick={resetDefaults}
          style={{
            padding: '12px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: 'transparent', color: 'var(--text-secondary)',
            border: '1.5px solid var(--border)',
            cursor: 'pointer', transition: 'all 0.18s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <RotateCcw size={14} strokeWidth={1.75} aria-hidden /> Resetar
        </button>
        <button
          onClick={savePrefs}
          style={{
            padding: '12px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: saved ? colors.success : colors.primary, color: '#fff',
            border: 'none', cursor: 'pointer', transition: 'all 0.18s',
            boxShadow: `0 4px 14px ${hexToRgba(saved ? colors.success : colors.primary, 0.4)}`,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {saved ? <CheckCircle2 size={14} strokeWidth={1.75} aria-hidden /> : <CheckCircle2 size={14} strokeWidth={1.75} aria-hidden />}
          {saved ? 'Salvo!' : 'Salvar alterações'}
        </button>
      </div>

    </div>
  )
}
