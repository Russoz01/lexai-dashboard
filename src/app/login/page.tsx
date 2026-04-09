'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

/* ----------------------------------------------------------------------------
 * LexAI — Atelier Login
 *
 * Editorial split-screen. Right side is a warm-stone manifesto, left side is
 * the form. No gradients, no glow — just type, whitespace and the Looera
 * palette. Works in both dark and light themes via CSS custom properties.
 * -------------------------------------------------------------------------- */

const MAX_FORM_WIDTH = 440

const VALUE_PROPS = [
  { n: 'I',   title: 'Dez agentes afinados',    desc: 'Treinados especificamente para o ordenamento juridico brasileiro.' },
  { n: 'II',  title: 'Dois dias gratis',        desc: 'Experimente sem cartao, cancele em um clique, sem fidelidade.' },
  { n: 'III', title: 'Seguranca e LGPD',        desc: 'Dados criptografados em transito e em repouso. Nunca utilizados em treinamento.' },
  { n: 'IV',  title: 'Feito a mao',             desc: 'Nao somos mais um SaaS generico. Somos um atelier.' },
]

const TESTIMONIAL = {
  initials: 'MC',
  name: 'Mariana Castro',
  cargo: 'Advogada Civil · OAB/SP',
  quote: 'Em duas semanas economizei mais de vinte horas de pesquisa. O Pesquisador encontra acordaos que eu nem sabia que existiam.',
}

/* --------------------------------------------------------------------------
 * Password strength — three tiers.
 * ------------------------------------------------------------------------ */

type Strength = 'fraca' | 'media' | 'forte'

function scorePassword(pwd: string): { score: number; label: Strength; color: string } {
  if (!pwd) return { score: 0, label: 'fraca', color: 'var(--border)' }

  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  if (score <= 2) return { score: 1, label: 'fraca', color: 'var(--danger)' }
  if (score <= 3) return { score: 2, label: 'media', color: 'var(--warning)' }
  return { score: 3, label: 'forte', color: 'var(--success)' }
}

/* --------------------------------------------------------------------------
 * Inline primitives — zero extra imports.
 * ------------------------------------------------------------------------ */

function LexLogoMark() {
  return (
    <div className="lx-logo-mark">
      <svg viewBox="0 0 28 24" fill="none" width="22" height="19">
        <path d="M3 3 L3 21 L11 21" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 3 L25 21" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M25 3 L13 21" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
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
      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ animation: 'ax-spin 0.8s linear infinite' }}
      aria-hidden="true"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

function CheckMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

/* --------------------------------------------------------------------------
 * Field primitive
 * ------------------------------------------------------------------------ */

type FieldProps = {
  id: string
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
  required?: boolean
  trailing?: React.ReactNode
  ariaInvalid?: boolean
}

function Field({ id, label, type, value, onChange, placeholder, autoComplete, required, trailing, ariaInvalid }: FieldProps) {
  return (
    <div className="ax-field">
      <label htmlFor={id} className="ax-field-label">{label}</label>
      <div className="ax-field-wrap">
        <input
          id={id}
          className="ax-input"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={ariaInvalid || undefined}
          style={{ paddingRight: trailing ? 48 : 16 }}
        />
        {trailing && <div className="ax-field-trail">{trailing}</div>}
      </div>
    </div>
  )
}

/* --------------------------------------------------------------------------
 * Page
 * ------------------------------------------------------------------------ */

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
        setErro('Erro ao iniciar login com Google: ' + error.message)
        setOauthLoading(null)
      }
    } catch (err) {
      console.error('Erro OAuth:', err)
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
    <main className="ax-login">
      {/* ══════════════ LEFT — Form ══════════════ */}
      <section className="ax-login-form-col">
        <Link href="/" className="ax-login-home">
          <span aria-hidden>←</span>
          <span>voltar ao site</span>
        </Link>

        <div className="ax-form-wrap" style={{ maxWidth: MAX_FORM_WIDTH }}>
          <div className="ax-login-brand">
            <LexLogoMark />
            <div>
              <div className="ax-serial">N° 001 · LEXAI · MMXXVI</div>
              <h1 className="ax-login-title">
                Reservar <em className="ax-italic">acesso</em>
              </h1>
            </div>
          </div>

          <p className="ax-login-lede">
            {isSignUp
              ? 'Crie sua conta. Dois dias gratuitos, sem cartao. Apenas um profissional por vez.'
              : 'Bem-vindo de volta ao atelier. Entre para retomar seu gabinete digital.'}
          </p>

          {erro && (
            <div role="alert" className="ax-login-error">
              <span>{erro}</span>
            </div>
          )}

          {/* Google OAuth */}
          <button
            type="button"
            className="ax-oauth"
            onClick={signInGoogle}
            disabled={anyLoading}
          >
            {oauthLoading === 'google' ? <Spinner /> : <GoogleLogo />}
            <span>Continuar com Google</span>
          </button>

          <div className="ax-divider"><span>ou continuar com email</span></div>

          {/* Email form */}
          <form onSubmit={submitEmail} noValidate className="ax-form">
            {isSignUp && (
              <Field
                id="lx-nome"
                label="Nome completo"
                type="text"
                value={nome}
                onChange={setNome}
                placeholder="Seu nome completo"
                autoComplete="name"
                required
              />
            )}

            <Field
              id="lx-email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="seu@email.com"
              autoComplete="email"
              required
              ariaInvalid={!!erro}
            />

            <div>
              <Field
                id="lx-senha"
                label="Senha"
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
                    className="ax-eye"
                    onClick={() => setShowSenha((v) => !v)}
                    tabIndex={-1}
                    aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showSenha ? 'Ocultar' : 'Mostrar'}
                  </button>
                }
              />

              {isSignUp && senha.length > 0 && (
                <div className="ax-strength">
                  <div className="ax-strength-track">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="ax-strength-pip"
                        style={{
                          background: n <= strength.score ? strength.color : 'var(--stone-line)',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: strength.color, fontWeight: 600, textTransform: 'capitalize', letterSpacing: '0.4px' }}>
                    {strength.label}
                  </span>
                </div>
              )}

              {!isSignUp && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <Link href="/login" className="ax-login-link">Esqueceu a senha?</Link>
                </div>
              )}
            </div>

            <button
              type="submit"
              className={`ax-submit ${success ? 'ax-submit--success' : ''}`}
              disabled={anyLoading}
            >
              {success ? (
                <>
                  <CheckMark />
                  <span>Entrando</span>
                </>
              ) : emailLoading ? (
                <>
                  <Spinner />
                  <span>{isSignUp ? 'Criando conta' : 'Entrando'}</span>
                </>
              ) : (
                submitLabel
              )}
            </button>
          </form>

          <div className="ax-toggle">
            <span>{isSignUp ? 'Ja tem conta?' : 'Ainda nao tem conta?'}</span>{' '}
            <button type="button" onClick={toggleMode} className="ax-login-link ax-login-link--bold">
              {isSignUp ? 'Entrar' : 'Criar conta gratis'}
            </button>
          </div>

          <div className="ax-terms">
            Ao continuar, voce concorda com os{' '}
            <Link href="/termos" className="ax-login-link">Termos de Uso</Link>
            {' '}e a{' '}
            <Link href="/privacidade" className="ax-login-link">Politica de Privacidade</Link>.
          </div>
        </div>
      </section>

      {/* ══════════════ RIGHT — Manifesto (desktop only) ══════════════ */}
      <aside className="ax-login-aside" aria-hidden="true">
        <div className="ax-aside-inner">
          <div>
            <div className="ax-serial">Atelier · MMXXVI</div>
            <h2 className="ax-aside-title">
              Um gabinete digital,
              <br />
              <em className="ax-italic">feito a mao</em>.
            </h2>
            <p className="ax-aside-lede">
              Dez agentes afinados para o exercicio da advocacia no Brasil. Estrategia e
              precisao para quem trata Direito como oficio.
            </p>
          </div>

          <div className="ax-values">
            {VALUE_PROPS.map((v) => (
              <div key={v.title} className="ax-value">
                <div className="ax-value-num">{v.n}</div>
                <div>
                  <div className="ax-value-title">{v.title}</div>
                  <div className="ax-value-desc">{v.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <figure className="ax-testimonial">
            <blockquote>&ldquo;{TESTIMONIAL.quote}&rdquo;</blockquote>
            <figcaption>
              <div className="ax-test-avatar">{TESTIMONIAL.initials}</div>
              <div>
                <div className="ax-test-name">{TESTIMONIAL.name}</div>
                <div className="ax-test-cargo">{TESTIMONIAL.cargo}</div>
              </div>
            </figcaption>
          </figure>
        </div>
      </aside>

      {/* ══════════════ STYLES ══════════════ */}
      <style>{`
        @keyframes ax-spin { to { transform: rotate(360deg); } }
        @keyframes ax-fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ax-fade { from { opacity: 0; } to { opacity: 1; } }

        .ax-login {
          position: relative;
          min-height: 100vh;
          background: var(--bg-base);
          color: var(--text-primary);
          font-family: var(--font-dm-sans, 'DM Sans'), sans-serif;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          overflow: hidden;
          -webkit-font-smoothing: antialiased;
        }
        .ax-login::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse 50% 40% at 12% 10%, var(--stone-soft), transparent 68%),
            radial-gradient(ellipse 60% 55% at 88% 100%, rgba(68,55,43,0.10), transparent 70%);
        }

        .ax-italic {
          font-family: var(--font-playfair, 'Playfair Display'), Georgia, serif;
          font-style: italic;
          font-weight: 500;
          color: var(--accent);
          letter-spacing: -0.5px;
        }
        .ax-serial {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        /* ── Left column ────────────────────────────────── */
        .ax-login-form-col {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 48px 48px;
          min-height: 100vh;
        }
        .ax-login-home {
          position: absolute;
          top: 32px;
          left: 48px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-muted);
          text-decoration: none;
          letter-spacing: 0.3px;
          transition: color 0.2s ease;
        }
        .ax-login-home:hover { color: var(--accent); }
        .ax-form-wrap {
          width: 100%;
          animation: ax-fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .ax-logo-mark {
          width: 44px;
          height: 44px;
          border: 1px solid var(--stone-line);
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--stone-soft);
          color: var(--text-primary);
          flex-shrink: 0;
        }
        .ax-login-brand {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-bottom: 22px;
        }
        .ax-login-title {
          font-size: 36px;
          font-weight: 300;
          letter-spacing: -1.4px;
          color: var(--text-primary);
          margin-top: 6px;
          line-height: 1;
        }
        .ax-login-title .ax-italic { font-size: 1em; letter-spacing: -1.2px; }
        .ax-login-lede {
          font-size: 14px;
          line-height: 1.65;
          color: var(--text-secondary);
          margin: 0 0 34px;
        }

        /* ── Error ──────────────────────────────────────── */
        .ax-login-error {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          margin-bottom: 22px;
          border: 1px solid rgba(139,46,31,0.40);
          background: rgba(139,46,31,0.08);
          color: var(--danger);
          font-size: 13px;
          font-weight: 500;
        }

        /* ── OAuth ──────────────────────────────────────── */
        .ax-oauth {
          width: 100%;
          height: 50px;
          background: transparent;
          border: 1px solid var(--stone-line);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          letter-spacing: 0.2px;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .ax-oauth:hover:not(:disabled) {
          background: var(--stone-soft);
          border-color: var(--accent);
        }
        .ax-oauth:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Divider ────────────────────────────────────── */
        .ax-divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 28px 0;
        }
        .ax-divider::before, .ax-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--stone-line);
        }
        .ax-divider span {
          font-size: 10px;
          color: var(--text-muted);
          font-weight: 600;
          letter-spacing: 1.8px;
          text-transform: uppercase;
        }

        /* ── Form ───────────────────────────────────────── */
        .ax-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .ax-field { display: flex; flex-direction: column; gap: 8px; }
        .ax-field-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 1.8px;
          text-transform: uppercase;
        }
        .ax-field-wrap { position: relative; }
        .ax-input {
          width: 100%;
          height: 48px;
          padding: 12px 16px;
          background: var(--input-bg);
          border: 1px solid var(--stone-line);
          color: var(--text-primary);
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease;
          -webkit-appearance: none;
          border-radius: 0;
        }
        .ax-input::placeholder { color: var(--text-muted); opacity: 0.7; }
        .ax-input:hover { border-color: var(--accent); }
        .ax-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--stone-soft);
        }
        .ax-input[aria-invalid="true"] {
          border-color: var(--danger);
        }
        .ax-field-trail {
          position: absolute;
          right: 6px;
          top: 50%;
          transform: translateY(-50%);
        }
        .ax-eye {
          background: none;
          border: none;
          color: var(--text-muted);
          font-family: inherit;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          cursor: pointer;
          padding: 8px 10px;
          transition: color 0.2s ease;
        }
        .ax-eye:hover { color: var(--accent); }

        /* ── Strength ───────────────────────────────────── */
        .ax-strength {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 10px;
        }
        .ax-strength-track { display: flex; gap: 4px; flex: 1; }
        .ax-strength-pip {
          flex: 1;
          height: 3px;
          background: var(--stone-line);
          transition: background 0.3s ease;
        }

        /* ── Submit ─────────────────────────────────────── */
        .ax-submit {
          width: 100%;
          height: 52px;
          margin-top: 8px;
          background: var(--text-primary);
          color: var(--bg-base);
          border: 1px solid var(--text-primary);
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          letter-spacing: 0.4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.25s ease, border-color 0.25s ease, color 0.25s ease, transform 0.25s ease;
        }
        .ax-submit:hover:not(:disabled) {
          background: var(--accent);
          border-color: var(--accent);
          color: var(--bg-base);
          transform: translateY(-1px);
        }
        .ax-submit:disabled { opacity: 0.55; cursor: not-allowed; }
        .ax-submit--success { background: var(--success); border-color: var(--success); }

        /* ── Toggle + terms ─────────────────────────────── */
        .ax-toggle {
          margin-top: 26px;
          text-align: center;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .ax-login-link {
          color: var(--accent);
          background: none;
          border: none;
          font: inherit;
          cursor: pointer;
          text-decoration: none;
          font-size: 12px;
          letter-spacing: 0.2px;
          padding: 0;
          transition: color 0.2s ease;
        }
        .ax-login-link:hover { color: var(--text-primary); }
        .ax-login-link--bold { font-weight: 600; font-size: 13px; }

        .ax-terms {
          margin-top: 26px;
          padding-top: 22px;
          border-top: 1px solid var(--stone-line);
          font-size: 11px;
          color: var(--text-muted);
          text-align: center;
          line-height: 1.65;
        }

        /* ── Right column (manifesto) ───────────────────── */
        .ax-login-aside {
          position: relative;
          z-index: 2;
          padding: 64px 56px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: var(--bg-raise);
          border-left: 1px solid var(--stone-line);
          min-height: 100vh;
        }
        .ax-login-aside::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(ellipse 80% 50% at 50% 0%, var(--stone-soft), transparent 70%);
        }
        .ax-aside-inner {
          position: relative;
          max-width: 520px;
          display: flex;
          flex-direction: column;
          gap: 56px;
          animation: ax-fade-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.12s both;
        }
        .ax-aside-title {
          font-size: clamp(36px, 4.4vw, 56px);
          font-weight: 300;
          letter-spacing: -1.8px;
          line-height: 1.05;
          color: var(--text-primary);
          margin: 20px 0 24px;
        }
        .ax-aside-title .ax-italic { font-size: 1em; letter-spacing: -1.4px; }
        .ax-aside-lede {
          font-size: 15px;
          line-height: 1.7;
          color: var(--text-secondary);
          max-width: 440px;
          margin: 0;
        }

        .ax-values {
          display: flex;
          flex-direction: column;
          padding-top: 30px;
          border-top: 1px solid var(--stone-line);
        }
        .ax-value {
          display: flex;
          gap: 22px;
          padding: 22px 0;
          border-bottom: 1px solid var(--stone-line);
        }
        .ax-value:last-child { border-bottom: none; }
        .ax-value-num {
          font-family: var(--font-playfair), Georgia, serif;
          font-style: italic;
          font-size: 20px;
          color: var(--accent);
          line-height: 1.2;
          min-width: 30px;
        }
        .ax-value-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          letter-spacing: -0.1px;
          margin-bottom: 4px;
        }
        .ax-value-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .ax-testimonial {
          padding: 28px 0 0;
          margin: 0;
          border-top: 1px solid var(--stone-line);
        }
        .ax-testimonial blockquote {
          font-family: var(--font-playfair), Georgia, serif;
          font-style: italic;
          font-size: 16px;
          line-height: 1.65;
          color: var(--text-primary);
          margin: 0 0 22px;
        }
        .ax-testimonial figcaption {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .ax-test-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--stone-soft);
          border: 1px solid var(--stone-line);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-playfair), Georgia, serif;
          font-weight: 600;
          font-size: 13px;
          color: var(--text-primary);
        }
        .ax-test-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .ax-test-cargo {
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.2px;
          margin-top: 2px;
        }

        /* ── Responsive ─────────────────────────────────── */
        @media (max-width: 980px) {
          .ax-login { grid-template-columns: 1fr; }
          .ax-login-aside { display: none; }
          .ax-login-form-col { padding: 80px 32px 48px; }
        }
        @media (max-width: 480px) {
          .ax-login-home { left: 24px; top: 24px; }
          .ax-login-form-col { padding: 72px 24px 36px; }
          .ax-login-title { font-size: 28px; }
        }
      `}</style>
    </main>
  )
}
