'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import TopoBackground from '@/components/TopoBackground'

/* ----------------------------------------------------------------------------
 * Design tokens — extracted so the file reads like a stylesheet, not noise.
 * Kept tight to the landing page palette so the login feels like home.
 * -------------------------------------------------------------------------- */

const accent = '#3B82F6'
const accentDeep = '#2563EB'
const ink = '#F1F1F1'
const inkMuted = 'rgba(255,255,255,0.55)'
const inkFaint = 'rgba(255,255,255,0.35)'
const hairline = 'rgba(255,255,255,0.06)'
const hairlineStrong = 'rgba(255,255,255,0.10)'
const surface = 'rgba(255,255,255,0.04)'
const danger = '#E07070'

const MAX_FORM_WIDTH = 440

/* ----------------------------------------------------------------------------
 * Content — value props, trust badges, testimonial pulled to the top.
 * -------------------------------------------------------------------------- */

const VALUE_PROPS = [
  { icon: 'bi-stars',         title: '10 agentes IA especializados', desc: 'Resumidor, Redator, Pesquisador e mais' },
  { icon: 'bi-gift',          title: '2 dias gratis sem cartao',     desc: 'Experimente tudo sem compromisso' },
  { icon: 'bi-shield-lock',   title: 'LGPD e SSL ponta a ponta',     desc: 'Seus dados sao ciriptografados' },
  { icon: 'bi-x-circle',      title: 'Cancelamento em 1 clique',     desc: 'Sem burocracia, sem fidelidade' },
]

const TRUST_BADGES = [
  { icon: 'bi-shield-check', label: 'SSL 256-bit' },
  { icon: 'bi-bank',         label: 'LGPD' },
  { icon: 'bi-credit-card',  label: 'Stripe' },
]

const TESTIMONIAL = {
  initials: 'MC',
  name: 'Mariana Castro',
  cargo: 'Advogada Civil — OAB/SP',
  quote: 'Em 2 semanas economizei mais de 20 horas que eu gastava em pesquisa de jurisprudencia. O Pesquisador encontra acordaos que eu nem sabia que existiam.',
  color: '#2563EB',
}

/* ----------------------------------------------------------------------------
 * Password strength — simple heuristic with three tiers.
 * -------------------------------------------------------------------------- */

type Strength = 'fraca' | 'media' | 'forte'

function scorePassword(pwd: string): { score: number; label: Strength; color: string } {
  if (!pwd) return { score: 0, label: 'fraca', color: 'rgba(255,255,255,0.15)' }

  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  if (score <= 2) return { score: 1, label: 'fraca', color: '#E07070' }
  if (score <= 3) return { score: 2, label: 'media', color: '#F59E0B' }
  return { score: 3, label: 'forte', color: '#10B981' }
}

/* ----------------------------------------------------------------------------
 * Small SVG primitives — kept inline so the page has zero extra imports.
 * -------------------------------------------------------------------------- */

function LexLogoMark({ size = 64 }: { size?: number }) {
  const svgSize = Math.round(size * 0.58)
  return (
    <div
      style={{
        width: size, height: size, flexShrink: 0,
        background: 'linear-gradient(135deg, #141414, #1C1C1C, #2A2A2A)',
        borderRadius: Math.round(size * 0.28),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(59,130,246,0.38), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      <svg viewBox="0 0 28 24" fill="none" width={svgSize} height={Math.round(svgSize * 0.86)}>
        <path d="M3 3 L3 21 L11 21" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 3 L25 21" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M25 3 L13 21" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ animation: 'lx-spin 0.8s linear infinite', flexShrink: 0 }}
      aria-hidden="true"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

function CheckMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

/* ----------------------------------------------------------------------------
 * Form primitives — FormField isolates the icon + label + input pattern so
 * the form body stays readable. OAuthButton unifies the OAuth style.
 * -------------------------------------------------------------------------- */

type FormFieldProps = {
  id: string
  label: string
  icon: string
  type: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  required?: boolean
  trailing?: React.ReactNode
  ariaInvalid?: boolean
}

function FormField({
  id, label, icon, type, value, onChange, placeholder,
  autoComplete, required, trailing, ariaInvalid,
}: FormFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label
        htmlFor={id}
        style={{
          fontSize: 12, fontWeight: 600, color: inkMuted,
          letterSpacing: '0.2px', textTransform: 'uppercase',
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <i
          className={`bi ${icon}`}
          aria-hidden="true"
          style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            color: inkFaint, fontSize: 16, pointerEvents: 'none',
          }}
        />
        <input
          id={id}
          className="lx-input"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={ariaInvalid || undefined}
          style={{ paddingRight: trailing ? 48 : 18 }}
        />
        {trailing && (
          <div style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)' }}>
            {trailing}
          </div>
        )}
      </div>
    </div>
  )
}

function OAuthButton({
  onClick,
  disabled,
  loading,
  children,
}: {
  onClick: () => void
  disabled: boolean
  loading: boolean
  children: React.ReactNode
}) {
  return (
    <button type="button" className="lx-oauth-btn" onClick={onClick} disabled={disabled}>
      {loading ? <Spinner /> : <GoogleLogo />}
      <span>{children}</span>
    </button>
  )
}

function ValuePropRow({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: number }) {
  return (
    <div className="lx-value" style={{ animationDelay: `${delay}s` }}>
      <div className="lx-value-icon">
        <i className={`bi ${icon}`} aria-hidden="true" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: ink, letterSpacing: '-0.1px' }}>{title}</div>
        <div style={{ fontSize: 12, color: inkFaint, marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  )
}

function TrustBadges() {
  return (
    <div
      role="list"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 20, flexWrap: 'wrap',
        marginTop: 24, paddingTop: 20,
        borderTop: `1px solid ${hairline}`,
      }}
    >
      {TRUST_BADGES.map((b) => (
        <div
          key={b.label}
          role="listitem"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 11, color: inkFaint, fontWeight: 500,
            letterSpacing: '0.2px',
          }}
        >
          <i className={`bi ${b.icon}`} style={{ fontSize: 13, color: 'rgba(59,130,246,0.65)' }} aria-hidden="true" />
          {b.label}
        </div>
      ))}
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * Page — the body stays declarative; all the CSS lives in a single <style>.
 * -------------------------------------------------------------------------- */

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const isSignUp = mode === 'signup'

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)

  const [oauthLoading, setOauthLoading] = useState<'google' | null>(null)
  const [emailLoading, setEmailLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [success, setSuccess] = useState(false)

  const anyLoading = oauthLoading !== null || emailLoading || success
  const strength = useMemo(() => scorePassword(senha), [senha])

  function toggleMode() {
    setMode((m) => (m === 'login' ? 'signup' : 'login'))
    setErro('')
  }

  async function signInGoogle() {
    setOauthLoading('google')
    setErro('')
    try {
      const redirectTo = window.location.origin + '/auth/callback'
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })
      if (error) {
        console.error('Erro OAuth:', error.message)
        setErro('Erro ao iniciar login com Google: ' + error.message)
        setOauthLoading(null)
      }
    } catch (err) {
      console.error('Erro geral OAuth:', err)
      setErro('Erro inesperado ao conectar com Google.')
      setOauthLoading(null)
    }
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault()
    setEmailLoading(true)
    setErro('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome: nome.trim() } },
      })
      if (error) {
        setErro(
          error.message === 'User already registered'
            ? 'Este email ja esta cadastrado. Faca login.'
            : error.message,
        )
        setEmailLoading(false)
        return
      }
      setEmailLoading(false)
      setMode('login')
      alert('Conta criada! Verifique seu email para confirmar.')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro('Email ou senha incorretos.')
      setEmailLoading(false)
      return
    }
    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 450)
  }

  const submitLabel = isSignUp ? 'Criar conta gratis' : 'Entrar'

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageCss }} />

      <main className="lx-page">
        <TopoBackground />

        {/* Ambient gradient glows — pure decoration, sit behind everything */}
        <div className="lx-glow lx-glow--a" aria-hidden="true" />
        <div className="lx-glow lx-glow--b" aria-hidden="true" />

        {/* ════════ LEFT — Login form column ════════ */}
        <section className="lx-form-col" aria-labelledby="lx-form-title">
          <div className="lx-form-wrap" style={{ maxWidth: MAX_FORM_WIDTH }}>
            {/* Brand + tagline */}
            <div className="lx-brand">
              <LexLogoMark size={68} />
              <h1 id="lx-form-title" className="lx-brand-name">LexAI</h1>
              <div className="lx-brand-vendor">
                <i className="bi bi-stars" aria-hidden="true" />
                <span>uma marca <strong>Vanix Corp</strong></span>
              </div>
              <p className="lx-brand-tag">Inteligencia juridica que pensa com voce</p>
            </div>

            {/* Error banner */}
            {erro && (
              <div role="alert" className="lx-error">
                <i className="bi bi-exclamation-circle" aria-hidden="true" />
                <span>{erro}</span>
              </div>
            )}

            {/* Google OAuth */}
            <OAuthButton onClick={signInGoogle} disabled={anyLoading} loading={oauthLoading === 'google'}>
              Continuar com Google
            </OAuthButton>

            <div className="lx-divider"><span>ou</span></div>

            {/* Email form */}
            <form onSubmit={submitEmail} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {isSignUp && (
                <div className="lx-fade-in">
                  <FormField
                    id="lx-nome"
                    label="Nome"
                    icon="bi-person"
                    type="text"
                    value={nome}
                    onChange={setNome}
                    placeholder="Seu nome completo"
                    autoComplete="name"
                    required
                  />
                </div>
              )}

              <FormField
                id="lx-email"
                label="Email"
                icon="bi-envelope"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="seu@email.com"
                autoComplete="email"
                required
                ariaInvalid={!!erro}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <FormField
                  id="lx-senha"
                  label="Senha"
                  icon="bi-lock"
                  type={showSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={setSenha}
                  placeholder={isSignUp ? 'Minimo 8 caracteres' : 'Sua senha'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  ariaInvalid={!!erro}
                  trailing={
                    <button
                      type="button"
                      className="lx-eye"
                      onClick={() => setShowSenha((v) => !v)}
                      tabIndex={-1}
                      aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      <i className={`bi ${showSenha ? 'bi-eye-slash' : 'bi-eye'}`} />
                    </button>
                  }
                />

                {/* Password strength bar (sign-up only) */}
                {isSignUp && senha.length > 0 && (
                  <div className="lx-strength">
                    <div className="lx-strength-track">
                      {[1, 2, 3].map((n) => (
                        <div
                          key={n}
                          className="lx-strength-pip"
                          style={{
                            background: n <= strength.score ? strength.color : 'rgba(255,255,255,0.08)',
                          }}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: 11, color: strength.color, fontWeight: 600, textTransform: 'capitalize' }}>
                      {strength.label}
                    </span>
                  </div>
                )}

                {/* Forgot link (login only) */}
                {!isSignUp && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                    <Link href="/login" className="lx-link">Esqueceu a senha?</Link>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className={`lx-submit ${success ? 'lx-submit--success' : ''}`}
                disabled={anyLoading}
              >
                {success ? (
                  <>
                    <CheckMark />
                    <span>Entrando...</span>
                  </>
                ) : emailLoading ? (
                  <>
                    <Spinner />
                    <span>{isSignUp ? 'Criando conta...' : 'Entrando...'}</span>
                  </>
                ) : (
                  submitLabel
                )}
              </button>
            </form>

            {/* Mode toggle */}
            <div className="lx-toggle">
              <span>{isSignUp ? 'Ja tem conta?' : 'Ainda nao tem conta?'}</span>{' '}
              <button type="button" onClick={toggleMode} className="lx-link lx-link--bold">
                {isSignUp ? 'Entrar' : 'Criar conta gratis'}
              </button>
            </div>

            {/* Terms */}
            <div className="lx-terms">
              Ao continuar, voce concorda com os{' '}
              <Link href="/termos" className="lx-link lx-link--muted">Termos de Uso</Link>
              {' '}e a{' '}
              <Link href="/privacidade" className="lx-link lx-link--muted">Politica de Privacidade</Link>
            </div>

            <TrustBadges />
          </div>
        </section>

        {/* ════════ RIGHT — Showcase column (desktop only) ════════ */}
        <aside className="lx-showcase-col" aria-hidden="true">
          <div className="lx-showcase-inner">
            {/* Top: brand badge + headline */}
            <div className="lx-showcase-head">
              <span className="lx-pill">
                <span className="lx-pill-dot" />
                Plataforma com IA
              </span>
              <h2 className="lx-showcase-title">
                O escritorio digital<br />que nunca dorme.
              </h2>
              <p className="lx-showcase-lede">
                Conte com dez agentes de IA treinados para Direito brasileiro. Comece em segundos, cancele quando quiser.
              </p>
            </div>

            {/* Value props */}
            <div className="lx-values">
              {VALUE_PROPS.map((v, i) => (
                <ValuePropRow key={v.title} {...v} delay={0.15 + i * 0.08} />
              ))}
            </div>

            {/* Testimonial card */}
            <figure className="lx-testimonial">
              <div className="lx-stars">
                {[0, 1, 2, 3, 4].map((s) => (
                  <i key={s} className="bi bi-star-fill" aria-hidden="true" />
                ))}
              </div>
              <blockquote>
                &ldquo;{TESTIMONIAL.quote}&rdquo;
              </blockquote>
              <figcaption>
                <div
                  className="lx-avatar"
                  style={{ background: `linear-gradient(135deg, ${TESTIMONIAL.color}, ${TESTIMONIAL.color}99)` }}
                >
                  {TESTIMONIAL.initials}
                </div>
                <div>
                  <div className="lx-t-name">{TESTIMONIAL.name}</div>
                  <div className="lx-t-role">{TESTIMONIAL.cargo}</div>
                </div>
              </figcaption>
            </figure>
          </div>
        </aside>
      </main>
    </>
  )
}

/* ----------------------------------------------------------------------------
 * Styles — one block, no inline chaos. Organized by layer.
 * -------------------------------------------------------------------------- */

const pageCss = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #0A0A0A; }
  body { font-family: 'DM Sans', 'Segoe UI', sans-serif; }

  @keyframes lx-spin { to { transform: rotate(360deg); } }
  @keyframes lx-fade-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes lx-fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes lx-slide-down { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes lx-glow-drift { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(24px, -18px); } }

  /* ——— Page layout ——— */
  .lx-page {
    position: relative;
    min-height: 100vh;
    background: #0A0A0A;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    overflow: hidden;
  }

  .lx-glow {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(80px);
    z-index: 1;
  }
  .lx-glow--a {
    top: -10%; left: 10%;
    width: 640px; height: 640px;
    background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 65%);
    animation: lx-glow-drift 18s ease-in-out infinite;
  }
  .lx-glow--b {
    bottom: -15%; right: 5%;
    width: 520px; height: 520px;
    background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%);
    animation: lx-glow-drift 22s ease-in-out infinite reverse;
  }

  /* ——— Form column ——— */
  .lx-form-col {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 32px;
    min-height: 100vh;
  }
  .lx-form-wrap {
    width: 100%;
    animation: lx-fade-up 0.7s cubic-bezier(.2,.8,.2,1) both;
  }

  /* ——— Brand block ——— */
  .lx-brand {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 32px;
  }
  .lx-brand-name {
    font-size: 30px;
    font-weight: 700;
    color: ${ink};
    letter-spacing: -0.5px;
    margin-top: 16px;
  }
  .lx-brand-vendor {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    padding: 4px 12px;
    border-radius: 999px;
    background: rgba(59, 130, 246, 0.08);
    border: 1px solid rgba(59, 130, 246, 0.18);
    font-size: 11px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.65);
    letter-spacing: 0.3px;
  }
  .lx-brand-vendor i { color: ${accent}; font-size: 11px; }
  .lx-brand-vendor strong { color: ${ink}; font-weight: 700; }
  .lx-brand-tag {
    font-size: 13px;
    color: ${inkFaint};
    margin-top: 10px;
    max-width: 280px;
    line-height: 1.5;
  }

  /* ——— Error banner ——— */
  .lx-error {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    margin-bottom: 20px;
    border-radius: 12px;
    background: rgba(192,57,43,0.14);
    border: 1px solid rgba(192,57,43,0.30);
    color: ${danger};
    font-size: 13px;
    font-weight: 500;
    animation: lx-slide-down 0.3s ease both;
  }
  .lx-error i { font-size: 16px; flex-shrink: 0; }

  /* ——— OAuth button ——— */
  .lx-oauth-btn {
    width: 100%;
    height: 52px;
    background: rgba(255,255,255,0.05);
    border: 1px solid ${hairlineStrong};
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: ${ink};
    font-size: 15px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.18s cubic-bezier(.2,.8,.2,1);
  }
  .lx-oauth-btn:hover:not(:disabled) {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.18);
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.40);
  }
  .lx-oauth-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ——— Divider ——— */
  .lx-divider {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 24px 0;
  }
  .lx-divider::before, .lx-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${hairline};
  }
  .lx-divider span {
    font-size: 11px;
    color: ${inkFaint};
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  /* ——— Input ——— */
  .lx-input {
    width: 100%;
    height: 52px;
    padding: 14px 18px 14px 44px;
    background: rgba(255,255,255,0.04);
    border: 1px solid ${hairlineStrong};
    border-radius: 14px;
    color: ${ink};
    font-size: 14.5px;
    font-family: inherit;
    outline: none;
    transition: all 0.18s ease;
  }
  .lx-input::placeholder { color: rgba(255,255,255,0.30); }
  .lx-input:hover { border-color: rgba(255,255,255,0.16); }
  .lx-input:focus {
    border-color: rgba(59,130,246,0.55);
    background: rgba(59,130,246,0.04);
    box-shadow: 0 0 0 4px rgba(59,130,246,0.10);
  }
  .lx-input[aria-invalid="true"] {
    border-color: rgba(192,57,43,0.45);
    box-shadow: 0 0 0 3px rgba(192,57,43,0.10);
  }

  /* ——— Eye toggle ——— */
  .lx-eye {
    width: 38px; height: 38px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: rgba(255,255,255,0.38);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: color 0.15s;
  }
  .lx-eye:hover { color: rgba(255,255,255,0.75); }
  .lx-eye i { font-size: 17px; }

  /* ——— Password strength ——— */
  .lx-strength {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 2px 0;
    animation: lx-fade 0.25s ease both;
  }
  .lx-strength-track {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
  .lx-strength-pip {
    height: 4px;
    border-radius: 99px;
    transition: background 0.3s ease;
  }

  /* ——— Submit ——— */
  .lx-submit {
    width: 100%;
    height: 54px;
    margin-top: 4px;
    background: linear-gradient(135deg, ${accent}, ${accentDeep});
    color: #FFFFFF;
    border: none;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    letter-spacing: 0.1px;
    box-shadow: 0 10px 28px rgba(37,99,235,0.28), inset 0 1px 0 rgba(255,255,255,0.18);
    transition: transform 0.18s cubic-bezier(.2,.8,.2,1), box-shadow 0.18s, background 0.25s;
  }
  .lx-submit:hover:not(:disabled) {
    transform: translateY(-1px) scale(1.01);
    box-shadow: 0 14px 36px rgba(37,99,235,0.40), inset 0 1px 0 rgba(255,255,255,0.22);
  }
  .lx-submit:active:not(:disabled) { transform: translateY(0) scale(0.995); }
  .lx-submit:disabled { opacity: 0.65; cursor: not-allowed; }
  .lx-submit--success {
    background: linear-gradient(135deg, #10B981, #059669);
    box-shadow: 0 10px 28px rgba(16,185,129,0.34);
    opacity: 1;
  }

  /* ——— Toggle + terms ——— */
  .lx-toggle {
    text-align: center;
    margin-top: 20px;
    font-size: 13px;
    color: ${inkFaint};
  }
  .lx-link {
    background: none;
    border: none;
    color: ${accent};
    font-family: inherit;
    font-size: inherit;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: color 0.15s;
  }
  .lx-link:hover { color: #60A5FA; }
  .lx-link--bold { font-weight: 700; }
  .lx-link--muted { color: rgba(59,130,246,0.65); }
  .lx-link--muted:hover { color: ${accent}; }
  .lx-terms {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid ${hairline};
    text-align: center;
    font-size: 11.5px;
    color: ${inkFaint};
    line-height: 1.6;
  }

  /* ——— Fade-in helper for dynamic Nome field ——— */
  .lx-fade-in { animation: lx-fade-up 0.35s ease both; }

  /* ——— Showcase column ——— */
  .lx-showcase-col {
    position: relative;
    z-index: 5;
    background:
      linear-gradient(135deg, rgba(59,130,246,0.04) 0%, rgba(18,18,18,0) 60%),
      rgba(14,14,14,0.55);
    border-left: 1px solid ${hairline};
    display: flex;
    align-items: center;
    padding: 64px 56px;
    overflow: hidden;
  }
  .lx-showcase-inner {
    max-width: 460px;
    width: 100%;
    animation: lx-fade-up 0.9s cubic-bezier(.2,.8,.2,1) 0.1s both;
  }

  .lx-showcase-head { margin-bottom: 36px; }
  .lx-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: rgba(59,130,246,0.10);
    border: 1px solid rgba(59,130,246,0.20);
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    color: ${accent};
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-bottom: 18px;
  }
  .lx-pill-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: ${accent};
    box-shadow: 0 0 12px ${accent};
  }
  .lx-showcase-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 36px;
    font-weight: 700;
    color: ${ink};
    line-height: 1.15;
    letter-spacing: -0.8px;
    margin-bottom: 14px;
  }
  .lx-showcase-lede {
    font-size: 15px;
    color: ${inkMuted};
    line-height: 1.6;
    max-width: 420px;
  }

  /* ——— Value props ——— */
  .lx-values {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 36px;
  }
  .lx-value {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    background: ${surface};
    border: 1px solid ${hairline};
    border-radius: 14px;
    transition: all 0.2s ease;
    animation: lx-fade-up 0.6s cubic-bezier(.2,.8,.2,1) both;
  }
  .lx-value:hover {
    background: rgba(255,255,255,0.06);
    border-color: ${hairlineStrong};
    transform: translateX(4px);
  }
  .lx-value-icon {
    width: 40px; height: 40px;
    border-radius: 11px;
    background: rgba(59,130,246,0.12);
    display: flex; align-items: center; justify-content: center;
    color: ${accent};
    font-size: 17px;
    flex-shrink: 0;
    border: 1px solid rgba(59,130,246,0.18);
  }

  /* ——— Testimonial ——— */
  .lx-testimonial {
    padding: 24px 26px;
    background: rgba(255,255,255,0.03);
    border: 1px solid ${hairline};
    border-left: 3px solid rgba(59,130,246,0.5);
    border-radius: 16px;
    animation: lx-fade-up 0.8s ease 0.6s both;
  }
  .lx-stars {
    display: flex;
    gap: 3px;
    margin-bottom: 12px;
    color: #F59E0B;
    font-size: 12px;
  }
  .lx-testimonial blockquote {
    font-size: 13.5px;
    color: rgba(255,255,255,0.78);
    line-height: 1.7;
    font-style: italic;
    margin-bottom: 16px;
  }
  .lx-testimonial figcaption {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .lx-avatar {
    width: 38px; height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
    box-shadow: 0 4px 16px rgba(37,99,235,0.35);
  }
  .lx-t-name { font-size: 13px; font-weight: 700; color: ${ink}; }
  .lx-t-role { font-size: 11px; color: ${inkFaint}; margin-top: 1px; }

  /* ——— Responsive ——— */
  @media (max-width: 900px) {
    .lx-page { grid-template-columns: 1fr; }
    .lx-showcase-col { display: none; }
    .lx-form-col { padding: 32px 20px; }
    .lx-glow--a { width: 420px; height: 420px; top: -15%; left: -10%; }
    .lx-glow--b { display: none; }
  }

  @media (max-width: 480px) {
    .lx-brand-name { font-size: 26px; }
    .lx-brand-tag { font-size: 12.5px; }
    .lx-input { height: 50px; font-size: 14px; }
    .lx-submit { height: 52px; }
    .lx-oauth-btn { height: 50px; font-size: 14.5px; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`
