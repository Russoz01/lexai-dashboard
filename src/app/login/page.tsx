'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import s from './page.module.css'

/* ----------------------------------------------------------------------------
 * LexAI — Atelier Login
 *
 * Editorial split-screen. Right side is a warm-stone manifesto, left side is
 * the form. No gradients, no glow — just type, whitespace and the Looera
 * palette. Works in both dark and light themes via CSS custom properties.
 * -------------------------------------------------------------------------- */

const MAX_FORM_WIDTH = 440

const VALUE_PROPS = [
  { n: 'I',   title: 'Doze agentes afinados',    desc: 'Treinados especificamente para o ordenamento juridico brasileiro.' },
  { n: 'II',  title: '7 dias gratis',             desc: 'Experimente sem cartao, cancele em um clique, sem fidelidade.' },
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
    <div className={s.logoMark}>
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
      className={s.spinner}
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
    <div className={s.field}>
      <label htmlFor={id} className={s.fieldLabel}>{label}</label>
      <div className={s.fieldWrap}>
        <input
          id={id}
          className={`${s.input}${trailing ? ` ${s.inputWithTrailing}` : ''}`}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={ariaInvalid || undefined}
        />
        {trailing && <div className={s.fieldTrail}>{trailing}</div>}
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

  // Cursor-follow glow nos dois paineis
  const leftRef = useRef<HTMLDivElement>(null)
  const asideRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return
    const attach = (el: HTMLElement | null) => {
      if (!el) return () => {}
      const onMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect()
        el.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`)
        el.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`)
      }
      el.addEventListener('mousemove', onMove)
      return () => el.removeEventListener('mousemove', onMove)
    }
    const offLeft = attach(leftRef.current)
    const offAside = attach(asideRef.current)
    return () => {
      offLeft()
      offAside()
    }
  }, [])

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
    <main className={s.login}>
      <div className={s.loginGlow} aria-hidden />

      {/* ══════════════ LEFT — Form ══════════════ */}
      <section className={s.formCol} ref={leftRef}>
        <div className={s.cursorGlow} aria-hidden />
        <Link href="/" className={s.loginHome}>
          <span aria-hidden className={s.homeArrow}>←</span>
          <span>voltar ao site</span>
        </Link>

        <div className={s.formWrap} style={{ maxWidth: MAX_FORM_WIDTH }}>
          <div className={s.loginBrand}>
            <LexLogoMark />
            <div>
              <div className={s.serial}>N° 001 · LEXAI · MMXXVI</div>
              <h1 className={s.loginTitle}>
                Reservar <em className={s.italic}>acesso</em>
              </h1>
            </div>
          </div>

          <p className={s.loginLede}>
            {isSignUp
              ? 'Crie sua conta. 7 dias gratuitos, sem cartao. Apenas um profissional por vez.'
              : 'Bem-vindo de volta ao atelier. Entre para retomar seu gabinete digital.'}
          </p>

          {erro && (
            <div role="alert" className={s.loginError}>
              <span>{erro}</span>
            </div>
          )}

          {/* Google OAuth */}
          <button
            type="button"
            className={s.oauth}
            onClick={signInGoogle}
            disabled={anyLoading}
          >
            {oauthLoading === 'google' ? <Spinner /> : <GoogleLogo />}
            <span>Continuar com Google</span>
          </button>

          <div className={s.divider}><span className={s.dividerText}>ou continuar com email</span></div>

          {/* Email form */}
          <form onSubmit={submitEmail} noValidate className={s.form}>
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
                    className={s.eye}
                    onClick={() => setShowSenha((v) => !v)}
                    tabIndex={-1}
                    aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showSenha ? 'Ocultar' : 'Mostrar'}
                  </button>
                }
              />

              {isSignUp && senha.length > 0 && (
                <div className={s.strength}>
                  <div className={s.strengthTrack}>
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className={s.strengthPip}
                        style={{
                          background: n <= strength.score ? strength.color : 'var(--stone-line)',
                        }}
                      />
                    ))}
                  </div>
                  <span className={s.strengthLabel} style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}

              {!isSignUp && (
                <div className={s.forgotRow}>
                  <Link href="/login" className={s.loginLink}>Esqueceu a senha?</Link>
                </div>
              )}
            </div>

            <button
              type="submit"
              className={`${s.submit}${success ? ` ${s.submitSuccess}` : ''}`}
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

          <div className={s.toggle}>
            <span>{isSignUp ? 'Ja tem conta?' : 'Ainda nao tem conta?'}</span>{' '}
            <button type="button" onClick={toggleMode} className={`${s.loginLink} ${s.loginLinkBold}`}>
              {isSignUp ? 'Entrar' : 'Criar conta gratis'}
            </button>
          </div>

          <div className={s.terms}>
            Ao continuar, voce concorda com os{' '}
            <Link href="/termos" className={s.loginLink}>Termos de Uso</Link>
            {' '}e a{' '}
            <Link href="/privacidade" className={s.loginLink}>Politica de Privacidade</Link>.
          </div>
        </div>
      </section>

      {/* ══════════════ RIGHT — Manifesto (desktop only) ══════════════ */}
      <aside className={s.aside} aria-hidden="true" ref={asideRef}>
        <div className={s.cursorGlow} aria-hidden />
        <div className={s.asideInner}>
          <div>
            <div className={s.serial}>Atelier · MMXXVI</div>
            <h2 className={s.asideTitle}>
              Um gabinete digital,
              <br />
              <em className={s.italic}>feito a mao</em>.
            </h2>
            <p className={s.asideLede}>
              Doze agentes afinados para o exercicio da advocacia no Brasil. Estrategia e
              precisao para quem trata Direito como oficio.
            </p>
          </div>

          <div className={s.values}>
            {VALUE_PROPS.map((v, i) => (
              <div key={v.title} className={s.value} style={{ animationDelay: `${0.35 + i * 0.08}s` }}>
                <div className={s.valueNum}>{v.n}</div>
                <div>
                  <div className={s.valueTitle}>{v.title}</div>
                  <div className={s.valueDesc}>{v.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <figure className={s.testimonial}>
            <blockquote>&ldquo;{TESTIMONIAL.quote}&rdquo;</blockquote>
            <figcaption>
              <div className={s.testAvatar}>{TESTIMONIAL.initials}</div>
              <div>
                <div className={s.testName}>{TESTIMONIAL.name}</div>
                <div className={s.testCargo}>{TESTIMONIAL.cargo}</div>
              </div>
            </figcaption>
          </figure>
        </div>
      </aside>

    </main>
  )
}
