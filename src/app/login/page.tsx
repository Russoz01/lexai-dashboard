'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Check, Eye, EyeOff, Loader2, MailCheck } from 'lucide-react'

/* ═════════════════════════════════════════════════════════════
 * /login — Atelier Login (migrado para Tailwind em 2026-04-17)
 * ─────────────────────────────────────────────────────────────
 * Split-screen editorial: esquerda form, direita manifesto.
 * Mantém Google OAuth + email/senha + toggle signup/login.
 * Paleta Noir Atelier (#bfa68e champagne + neutral-950).
 * Cursor-follow glow via CSS custom property (--mx/--my).
 * ═════════════════════════════════════════════════════════════ */

const VALUE_PROPS = [
  { n: 'I', title: 'Vinte e dois agentes afinados', desc: 'Treinados especificamente para o ordenamento jurídico brasileiro.' },
  { n: 'II', title: '7 dias grátis', desc: 'Experimente sem cartão, cancele em um clique, sem fidelidade.' },
  { n: 'III', title: 'Segurança e LGPD', desc: 'Dados criptografados em trânsito e em repouso. Nunca utilizados em treinamento.' },
  { n: 'IV', title: 'Feito à mão', desc: 'Não somos mais um SaaS genérico. Somos um atelier.' },
]

const FOUNDER_NOTE = {
  initials: 'VC',
  signature: 'Vanix Corp',
  cargo: 'Ofício do atelier · MMXXVI',
  quote:
    'Escrevi cada agente do zero pensando em um sócio-gestor brasileiro — que vive entre audiência, boletim de compliance e prazo de segunda-feira. Nenhum dos 22 aprende com o seu caso. É um instrumento, não um estagiário digital.',
}

type Strength = 'fraca' | 'media' | 'forte'

function scorePassword(pwd: string): { score: number; label: Strength; color: string } {
  if (!pwd) return { score: 0, label: 'fraca', color: 'rgba(255,255,255,0.15)' }
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  if (score <= 2) return { score: 1, label: 'fraca', color: '#ef4444' }
  if (score <= 3) return { score: 2, label: 'media', color: '#eab308' }
  return { score: 3, label: 'forte', color: '#22c55e' }
}

function LexLogoMark() {
  return (
    <div className="flex size-10 items-center justify-center rounded-lg border border-[#bfa68e]/30 bg-gradient-to-br from-[#1a1410] to-black text-[#bfa68e] shadow-[0_0_16px_rgba(191,166,142,0.2)]">
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
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-white/50">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={ariaInvalid || undefined}
          className={`w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#bfa68e]/50 focus:bg-white/[0.06] aria-[invalid=true]:border-red-500/50 ${
            trailing ? 'pr-20' : ''
          }`}
        />
        {trailing && <div className="absolute inset-y-0 right-2 flex items-center">{trailing}</div>}
      </div>
    </div>
  )
}

function LoginPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
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
  const [signupSent, setSignupSent] = useState<string | null>(null)

  const anyLoading = oauthLoading !== null || emailLoading || success
  const strength = useMemo(() => scorePassword(senha), [senha])

  // Se já logado, redireciona pro dashboard imediatamente
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!cancelled && session) {
        router.replace('/dashboard')
      }
    })()
    return () => { cancelled = true }
  }, [router, supabase])

  // Mostra erro de OAuth/callback vindo de ?error=...
  useEffect(() => {
    const err = searchParams.get('error')
    if (!err) return
    const map: Record<string, string> = {
      oauth_error: 'Falha ao autenticar com o provedor. Tente novamente.',
      session_expired: 'Sua sessão expirou. Faça login novamente.',
      invalid_request: 'Requisição inválida. Tente novamente.',
    }
    setErro(map[err] ?? 'Algo deu errado na autenticação. Tente novamente.')
  }, [searchParams])

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
            ? 'Este email já está cadastrado. Faça login.'
            : error.message,
        )
        setEmailLoading(false)
        return
      }
      setEmailLoading(false)
      setSignupSent(email)
      setMode('login')
      setSenha('')
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

  const submitLabel = isSignUp ? 'Criar conta grátis' : 'Entrar'

  return (
    <main className="relative min-h-screen grid-cols-1 bg-black text-white antialiased lg:grid lg:grid-cols-2">
      {/* ══════ LEFT — Form ══════ */}
      <section
        ref={leftRef}
        className="relative flex min-h-screen flex-col px-6 py-10 md:px-12 lg:py-16"
        style={{ '--mx': '50%', '--my': '30%' } as React.CSSProperties}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(520px circle at var(--mx) var(--my), rgba(191,166,142,0.10), transparent 60%)',
          }}
        />

        <Link
          href="/"
          className="group relative z-10 mb-10 inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-white/50 transition hover:text-white"
        >
          <ArrowLeft size={12} strokeWidth={1.75} className="transition-transform group-hover:-translate-x-0.5" />
          voltar ao site
        </Link>

        <div className="relative z-10 mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center">
          <div className="mb-7 flex items-center gap-3">
            <LexLogoMark />
            <div>
              <div className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[#bfa68e]">
                Nº 001 · LexAI · MMXXVI
              </div>
              <h1 className="mt-1 text-3xl font-light leading-tight tracking-tight md:text-4xl">
                Reservar{' '}
                <em className="bg-gradient-to-r from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] bg-clip-text italic text-transparent">
                  acesso
                </em>
              </h1>
            </div>
          </div>

          <p className="mb-7 text-sm leading-relaxed text-white/60">
            {isSignUp
              ? 'Crie sua conta. 7 dias gratuitos, sem cartão. Apenas um profissional por vez.'
              : 'Bem-vindo de volta ao atelier. Entre para retomar seu gabinete digital.'}
          </p>

          {erro && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-500/30 bg-red-500/[0.08] px-4 py-3 text-sm text-red-200"
            >
              {erro}
            </div>
          )}

          {signupSent && (
            <div
              role="status"
              className="mb-5 flex items-start gap-3 rounded-lg border border-green-400/25 bg-green-400/[0.06] px-4 py-3 text-sm text-green-100"
            >
              <MailCheck size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-green-300" />
              <div>
                <div className="font-medium text-green-50">Conta criada</div>
                <div className="text-green-200/80">Enviamos um link para <strong className="text-white">{signupSent}</strong>. Confirme o email para entrar.</div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={signInGoogle}
            disabled={anyLoading}
            className="mb-5 flex w-full items-center justify-center gap-3 rounded-lg border border-white/15 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white transition hover:border-[#bfa68e]/40 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {oauthLoading === 'google' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <GoogleLogo />
            )}
            Continuar com Google
          </button>

          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-white/40">
              ou continuar com email
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={submitEmail} noValidate className="space-y-4">
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
                placeholder={isSignUp ? 'Mínimo 8 caracteres' : 'Sua senha'}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                ariaInvalid={!!erro}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowSenha((v) => !v)}
                    tabIndex={-1}
                    aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    className="mr-1 rounded p-2 text-white/50 transition hover:bg-white/5 hover:text-white"
                  >
                    {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              {isSignUp && senha.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="h-1 flex-1 rounded-full transition-colors"
                        style={{
                          background: n <= strength.score ? strength.color : 'rgba(255,255,255,0.1)',
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className="font-mono text-[0.65rem] uppercase tracking-wider"
                    style={{ color: strength.color }}
                  >
                    {strength.label}
                  </span>
                </div>
              )}

              {!isSignUp && (
                <div className="mt-2 flex justify-end">
                  <Link href="/reset-password" className="text-xs text-white/50 underline-offset-4 transition hover:text-[#bfa68e] hover:underline focus-visible:outline-none focus-visible:text-[#bfa68e] focus-visible:underline">
                    Esqueceu a senha?
                  </Link>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={anyLoading}
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70 ${
                success
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] text-[#0a0807] shadow-[0_0_28px_rgba(191,166,142,0.25)] hover:shadow-[0_0_40px_rgba(191,166,142,0.5)]'
              }`}
            >
              {success ? (
                <>
                  <Check size={16} strokeWidth={2.5} />
                  Entrando
                </>
              ) : emailLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {isSignUp ? 'Criando conta' : 'Entrando'}
                </>
              ) : (
                submitLabel
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/60">
            {isSignUp ? 'Já tem conta?' : 'Ainda não tem conta?'}{' '}
            <button
              type="button"
              onClick={toggleMode}
              className="font-medium text-[#bfa68e] transition hover:text-[#e6d4bd]"
            >
              {isSignUp ? 'Entrar' : 'Criar conta grátis'}
            </button>
          </div>

          <div className="mt-6 text-center text-[0.7rem] leading-relaxed text-white/40">
            Ao continuar, você concorda com os{' '}
            <Link href="/termos" className="underline decoration-white/20 underline-offset-2 hover:text-white">
              Termos de Uso
            </Link>{' '}
            e a{' '}
            <Link href="/privacidade" className="underline decoration-white/20 underline-offset-2 hover:text-white">
              Política de Privacidade
            </Link>
            .
          </div>
        </div>
      </section>

      {/* ══════ RIGHT — Manifesto ══════ */}
      <aside
        ref={asideRef}
        aria-hidden="true"
        className="relative hidden min-h-screen overflow-hidden border-l border-white/10 bg-gradient-to-br from-[#0f0b08] via-[#0a0807] to-black lg:block"
        style={{ '--mx': '60%', '--my': '40%' } as React.CSSProperties}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(600px circle at var(--mx) var(--my), rgba(191,166,142,0.15), transparent 60%)',
          }}
        />

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:80px_80px]" />

        <div className="relative flex h-full min-h-screen flex-col justify-between gap-12 px-12 py-16 xl:px-20">
          <div>
            <div className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[#bfa68e]">
              Atelier · MMXXVI
            </div>
            <h2 className="mt-4 text-balance text-4xl font-light leading-[1.08] tracking-tight text-white xl:text-5xl">
              Um gabinete digital,
              <br />
              <em className="bg-gradient-to-r from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] bg-clip-text italic text-transparent">
                feito à mão
              </em>
              .
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/60">
              Vinte e dois agentes afinados para o exercício da advocacia no Brasil.
              Estratégia e precisão para quem trata Direito como ofício.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {VALUE_PROPS.map((v) => (
              <div key={v.title} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="mb-2 font-mono text-xs tracking-[0.22em] text-[#bfa68e]/80">
                  {v.n}
                </div>
                <div className="mb-1 text-sm font-medium text-white">{v.title}</div>
                <div className="text-xs leading-relaxed text-white/55">{v.desc}</div>
              </div>
            ))}
          </div>

          <figure className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-6">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#bfa68e]/60 to-transparent"
            />
            <div className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/45">
              Nota do atelier
            </div>
            <blockquote className="font-serif text-[0.98rem] italic leading-relaxed text-white/80">
              &ldquo;{FOUNDER_NOTE.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full border border-[#bfa68e]/30 bg-gradient-to-br from-[#1a1410] to-black font-mono text-xs tracking-wider text-[#bfa68e]">
                {FOUNDER_NOTE.initials}
              </div>
              <div>
                <div className="text-sm font-medium text-white">{FOUNDER_NOTE.signature}</div>
                <div className="text-xs text-white/50">{FOUNDER_NOTE.cargo}</div>
              </div>
            </figcaption>
          </figure>
        </div>
      </aside>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" aria-hidden />}>
      <LoginPageInner />
    </Suspense>
  )
}
