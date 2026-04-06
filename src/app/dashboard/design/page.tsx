'use client'

import { useState, useEffect, useCallback } from 'react'

const DEFAULT_COLORS = {
  primary: '#2563EB',
  secondary: '#475569',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#06B6D4',
  danger: '#EF4444',
}

const FONTS = ['Inter SemiBold', 'Playfair Display', 'DM Sans', 'Roboto', 'Poppins']
const BODY_FONTS = ['Inter Regular', 'DM Sans', 'Roboto', 'Source Sans Pro']

export default function DesignPage() {
  const [colors, setColors] = useState(DEFAULT_COLORS)
  const [headingFont, setHeadingFont] = useState('Inter SemiBold')
  const [bodyFont, setBodyFont] = useState('DM Sans')
  const [fontSize, setFontSize] = useState(16)
  const [radius, setRadius] = useState(16)
  const [shadowIntensity, setShadowIntensity] = useState(50)
  const [spacing, setSpacing] = useState<'compact' | 'standard' | 'relaxed'>('standard')
  const [saved, setSaved] = useState(false)

  // Load saved preferences
  useEffect(() => {
    try {
      const prefs = localStorage.getItem('lexai-design-prefs')
      if (prefs) {
        const p = JSON.parse(prefs)
        if (p.colors) setColors(p.colors)
        if (p.headingFont) setHeadingFont(p.headingFont)
        if (p.bodyFont) setBodyFont(p.bodyFont)
        if (p.fontSize) setFontSize(p.fontSize)
        if (p.radius) setRadius(p.radius)
        if (p.shadowIntensity) setShadowIntensity(p.shadowIntensity)
        if (p.spacing) setSpacing(p.spacing)
      }
    } catch { /* ignore */ }
  }, [])

  // Apply CSS variables in real time
  const applyStyles = useCallback(() => {
    const root = document.documentElement
    root.style.setProperty('--color-primary', colors.primary)
    root.style.setProperty('--color-success', colors.success)
    root.style.setProperty('--color-warning', colors.warning)
    root.style.setProperty('--color-danger', colors.danger)
    root.style.setProperty('--color-info', colors.info)
    root.style.setProperty('--radius-global', `${radius}px`)
    root.style.setProperty('--shadow-intensity', String(shadowIntensity / 100))
  }, [colors, radius, shadowIntensity])

  useEffect(() => { applyStyles() }, [applyStyles])

  function savePrefs() {
    localStorage.setItem('lexai-design-prefs', JSON.stringify({
      colors, headingFont, bodyFont, fontSize, radius, shadowIntensity, spacing,
    }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function resetDefaults() {
    setColors(DEFAULT_COLORS)
    setHeadingFont('Inter SemiBold')
    setBodyFont('DM Sans')
    setFontSize(16)
    setRadius(16)
    setShadowIntensity(50)
    setSpacing('standard')
    localStorage.removeItem('lexai-design-prefs')
    const root = document.documentElement
    root.style.removeProperty('--color-primary')
    root.style.removeProperty('--color-success')
    root.style.removeProperty('--color-warning')
    root.style.removeProperty('--color-danger')
    root.style.removeProperty('--color-info')
    root.style.removeProperty('--radius-global')
    root.style.removeProperty('--shadow-intensity')
  }

  const colorEntries = Object.entries(colors) as [keyof typeof colors, string][]

  return (
    <div className="page-content" style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} | {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <h1 className="page-title" style={{ fontSize: 28 }}>Design & Theme Settings</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 20, alignItems: 'start' }}>
        {/* Column 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Theme & Color Palette */}
          <div className="section-card" style={{ padding: '24px 28px' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
              Theme & Color Palette
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 8,
            }}>
              {colorEntries.map(([key, value]) => (
                <label key={key} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer',
                }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: 12, background: value,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)', border: '2px solid rgba(255,255,255,0.8)',
                    }} />
                    <input
                      type="color" value={value}
                      onChange={e => setColors(c => ({ ...c, [key]: e.target.value }))}
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                    />
                    <div style={{
                      position: 'absolute', bottom: -2, right: -2,
                      width: 18, height: 18, borderRadius: '50%',
                      background: '#fff', border: '1px solid rgba(0,0,0,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10,
                    }}>
                      <i className="bi bi-pencil-fill" style={{ fontSize: 8, color: '#475569' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                    {key}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Component Styling */}
          <div className="section-card" style={{ padding: '24px 28px' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
              Component Styling
            </div>

            {/* Border Radius */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Global Border Radius
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 40 }}>Sharp</span>
                <input type="range" min="0" max="24" value={radius}
                  onChange={e => setRadius(Number(e.target.value))}
                  style={{ flex: 1, accentColor: colors.primary }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 70 }}>Rounded</span>
              </div>
              {/* Preview */}
              <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
                <button style={{
                  padding: '8px 20px', borderRadius: radius, background: colors.primary,
                  color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>Button</button>
                <input placeholder="Input" style={{
                  padding: '8px 14px', borderRadius: radius, border: '1.5px solid rgba(0,0,0,0.12)',
                  fontSize: 13, background: 'rgba(241,245,249,0.6)', outline: 'none', width: 100,
                }} />
                <div style={{
                  padding: '8px 14px', borderRadius: radius, background: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(255,255,255,0.6)', fontSize: 12, color: 'var(--text-muted)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}>Card</div>
              </div>
            </div>

            {/* Shadow Intensity */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Shadow Intensity
              </div>
              <input type="range" min="0" max="100" value={shadowIntensity}
                onChange={e => setShadowIntensity(Number(e.target.value))}
                style={{ width: '100%', accentColor: colors.primary }} />
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Typography & Scaling */}
          <div className="section-card" style={{ padding: '24px 28px' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
              Typography & Scaling
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Heading Font</div>
              <select value={headingFont} onChange={e => setHeadingFont(e.target.value)} className="form-input" style={{ fontSize: 13 }}>
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Body Font</div>
              <select value={bodyFont} onChange={e => setBodyFont(e.target.value)} className="form-input" style={{ fontSize: 13 }}>
                {BODY_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Base font size</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => setFontSize(s => Math.max(12, s - 1))} style={{
                  width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
                  background: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-secondary)',
                }}>-</button>
                <input type="number" value={fontSize} onChange={e => setFontSize(Number(e.target.value))}
                  style={{ width: 50, textAlign: 'center', padding: '6px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, background: 'rgba(241,245,249,0.6)' }} />
                <button onClick={() => setFontSize(s => Math.min(24, s + 1))} style={{
                  width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
                  background: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-secondary)',
                }}>+</button>
              </div>
            </div>

            {/* Preview */}
            <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(241,245,249,0.5)', marginTop: 12 }}>
              <div style={{ fontSize: fontSize * 1.5, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 4 }}>
                Heading text
              </div>
              <div style={{ fontSize: fontSize, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Body text preview with the selected font settings.
              </div>
            </div>
          </div>

          {/* Branding & Spacing */}
          <div className="section-card" style={{ padding: '24px 28px' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
              Branding & Spacing
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>General Spacing</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['compact', 'standard', 'relaxed'] as const).map(s => (
                  <button key={s} onClick={() => setSpacing(s)} style={{
                    flex: 1, padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                    border: spacing === s ? `2px solid ${colors.primary}` : '1px solid var(--border)',
                    background: spacing === s ? `${colors.primary}12` : 'transparent',
                    color: spacing === s ? colors.primary : 'var(--text-secondary)',
                    cursor: 'pointer', textTransform: 'capitalize',
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    {s === 'compact' ? 'Compact' : s === 'standard' ? 'Standard' : 'Relaxed'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Column 3 — Quick Actions sidebar */}
        <div style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="section-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
              Quick Actions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={savePrefs} style={{
                width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: saved ? '#10B981' : colors.primary, color: '#fff', border: 'none', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
              }}>
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
              <button onClick={resetDefaults} style={{
                width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)',
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}>
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
