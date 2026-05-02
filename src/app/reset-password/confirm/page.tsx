'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Check, Eye, EyeOff, Loader2, Lock, ShieldCheck } from 'lucide-react'
import { PralvexMark } from '@/components/PralvexMark'

/* ═════════════════════════════════════════════════════════════
 * /reset-password/confirm — Set New Password (v10.9 · 2026-04-22)
 * ─────────────────────────────────────────────────────────────
 * Recebe recovery via detectSessionInUrl do Supabase (auto).
 * Usuário define nova senha, supabase.auth.updateUser().
 * Redireciona pro /dashboard em sucesso.
 * ═════════════════════════════════════════════════════════════ */

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

function ResetConfirmBrandMark() {
  return <PralvexMark variant="seal" size={40} />
}

export default function ResetPasswordConfirmPage() {
  const router = useRouter()
  const supabase = createClient()

  const [ready, setReady] = useState<'loading' | 'ok' | 'invalid'>('loading')
  const [senha, setSenha] = useState('')
  const [confirma, setConfirma] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [success, setSuccess] = useState(false)

  const strength = useMemo(() => scorePassword(senha), [senha])
  const mismatch = confirma.length > 0 && senha !== confirma

  const leftRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return
    const el = leftRef.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`)
      el.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`)
    }
    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [])

  // Supabase client auto-detecta token na URL via hash/query e cria session recovery
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (cancelled) return
        setReady(session ? 'ok' : 'invalid')
      } catch {
        if (!cancelled) setReady('invalid')
      }
    })()
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setReady('ok')
      }
    })
    return () => {
      cancelled = true
      sub?.subscription.unsubscribe()
    }
  }, [supabase])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (senha.length < 8) {
      setErro('Senha deve ter no mínimo 8 caracteres.')
      return
    }
    if (senha !== confirma) {
      setErro('As senhas não conferem.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: senha })
    if (error) {
      setErro('Não foi possível atualizar a senha. O link pode ter expirado.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push('/dashboard'), 900)
  }

  return (
    <main className="relative min-h-screen bg-black text-white antialiased">
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
          href="/login"
          className="group relative z-10 mb-10 inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-white/50 transition hover:text-white"
        >
          <ArrowLeft size={12} strokeWidth={1.75} className="transition-transform group-hover:-translate-x-0.5" />
          voltar para login
        </Link>

        <div className="relative z-10 mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center">
          <div className="mb-7 flex items-center gap-3">
            <ResetConfirmBrandMark />
            <div>
              <div className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[#bfa68e]">
                Nº 003 · Pralvex · MMXXVI
              </div>
              <h1 className="mt-1 text-3xl font-light leading-tight tracking-tight md:text-4xl">
                Nova{' '}
                <em className="bg-gradient-to-r from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] bg-clip-text italic text-transparent">
                  senha
                </em>
              </h1>
            </div>
          </div>

          {ready === 'loading' && (
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-6 text-sm text-white/60">
              <Loader2 size={16} className="animate-spin text-[#bfa68e]" />
              Validando link de recuperação...
            </div>
          )}

          {ready === 'invalid' && (
            <div className="rounded-2xl border border-red-500/25 bg-red-500/[0.05] p-6">
              <div className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.25em] text-red-300">
                Link inválido ou expirado
              </div>
              <h2 className="mb-3 text-lg font-light leading-tight">
                Não conseguimos validar este link
              </h2>
              <p className="mb-5 text-sm leading-relaxed text-white/60">
                Links de recuperação valem 1 hora. Se já passou do prazo, solicite um novo.
              </p>
              <Link
                href="/reset-password"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] px-4 py-2.5 text-sm font-medium text-[#0a0807] transition hover:shadow-[0_0_30px_rgba(191,166,142,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bfa68e] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Solicitar novo link
              </Link>
            </div>
          )}

          {ready === 'ok' && (
            <>
              <p className="mb-7 text-sm leading-relaxed text-white/60">
                Escolha uma nova senha. Mínimo 8 caracteres. Recomendamos combinar letras, números e um caractere especial.
              </p>

              {erro && (
                <div
                  role="alert"
                  className="mb-5 rounded-lg border border-red-500/30 bg-red-500/[0.08] px-4 py-3 text-sm text-red-200"
                >
                  {erro}
                </div>
              )}

              <form onSubmit={submit} noValidate className="space-y-4">
                <div>
                  <label htmlFor="px-new-pwd" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-white/50">
                    Nova senha
                  </label>
                  <div className="relative">
                    <input
                      id="px-new-pwd"
                      type={showSenha ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                      required
                      autoFocus
                      aria-invalid={!!erro || undefined}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#bfa68e]/50 focus:bg-white/[0.06] aria-[invalid=true]:border-red-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSenha((v) => !v)}
                      tabIndex={-1}
                      aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                      className="absolute inset-y-0 right-2 flex items-center rounded p-2 text-white/50 transition hover:bg-white/5 hover:text-white"
                    >
                      {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {senha.length > 0 && (
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
                </div>

                <div>
                  <label htmlFor="px-confirma" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-white/50">
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <input
                      id="px-confirma"
                      type={showSenha ? 'text' : 'password'}
                      value={confirma}
                      onChange={(e) => setConfirma(e.target.value)}
                      placeholder="Repita a nova senha"
                      autoComplete="new-password"
                      required
                      aria-invalid={mismatch || undefined}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#bfa68e]/50 focus:bg-white/[0.06] aria-[invalid=true]:border-red-500/50"
                    />
                  </div>
                  {mismatch && (
                    <p className="mt-1.5 text-xs text-red-300">As senhas não conferem.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || success || senha.length < 8 || senha !== confirma}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bfa68e] focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-70 ${
                    success
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] text-[#0a0807] shadow-[0_0_28px_rgba(191,166,142,0.25)] hover:shadow-[0_0_40px_rgba(191,166,142,0.5)]'
                  }`}
                >
                  {success ? (
                    <>
                      <Check size={16} strokeWidth={2.5} />
                      Senha redefinida
                    </>
                  ) : loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Salvando
                    </>
                  ) : (
                    <>
                      <Lock size={16} strokeWidth={1.75} />
                      Redefinir senha
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-start gap-2 rounded-lg border border-white/5 bg-black/30 px-4 py-3 text-[0.72rem] leading-relaxed text-white/50">
                <ShieldCheck size={14} strokeWidth={1.75} className="mt-0.5 shrink-0 text-[#bfa68e]" />
                <span>
                  Sua senha é armazenada criptografada (bcrypt). Nunca a enviamos por email e não temos acesso ao valor em texto puro.
                </span>
              </div>
            </>
          )}
        </div>

        <footer className="relative z-10 mt-10 text-center font-mono text-[0.58rem] uppercase tracking-[0.3em] text-white/25">
          Pralvex · MMXXVI · Atelier
        </footer>
      </section>
    </main>
  )
}
