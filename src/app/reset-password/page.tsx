'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Check, Loader2, Mail } from 'lucide-react'
import { PralvexMark } from '@/components/PralvexMark'

/* ═════════════════════════════════════════════════════════════
 * /reset-password — Atelier Reset Flow (v10.9 · 2026-04-22)
 * ─────────────────────────────────────────────────────────────
 * Pede email, dispara supabase.auth.resetPasswordForEmail.
 * Redireciona para /reset-password/confirm com token de recovery.
 * Noir + champagne, coerente com /login.
 * ═════════════════════════════════════════════════════════════ */

function ResetBrandMark() {
  return <PralvexMark variant="seal" size={40} />
}

export default function ResetPasswordPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sent, setSent] = useState(false)

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

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const redirectTo = window.location.origin + '/reset-password/confirm'
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })

    if (error) {
      setErro('Não foi possível enviar o link. Verifique o email e tente novamente.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
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
            <ResetBrandMark />
            <div>
              <div className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[#bfa68e]">
                Nº 002 · Pralvex · MMXXVI
              </div>
              <h1 className="mt-1 text-3xl font-light leading-tight tracking-tight md:text-4xl">
                Recuperar{' '}
                <em className="bg-gradient-to-r from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] bg-clip-text italic text-transparent">
                  acesso
                </em>
              </h1>
            </div>
          </div>

          {!sent ? (
            <>
              <p className="mb-7 text-sm leading-relaxed text-white/60">
                Informe o email cadastrado. Enviaremos um link seguro para você criar uma nova senha. Válido por 1 hora.
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
                  <label htmlFor="px-reset-email" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-white/50">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      id="px-reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      required
                      autoFocus
                      aria-invalid={!!erro || undefined}
                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#bfa68e]/50 focus:bg-white/[0.06] aria-[invalid=true]:border-red-500/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] px-4 py-3 text-sm font-medium text-[#0a0807] shadow-[0_0_28px_rgba(191,166,142,0.25)] transition hover:shadow-[0_0_40px_rgba(191,166,142,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bfa68e] focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Enviando
                    </>
                  ) : (
                    <>
                      <Mail size={16} strokeWidth={1.75} />
                      Enviar link
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-white/40">
                Lembrou a senha?{' '}
                <Link href="/login" className="text-white/70 underline-offset-4 transition hover:text-[#bfa68e] hover:underline">
                  Voltar ao login
                </Link>
              </p>
            </>
          ) : (
            <div className="rounded-2xl border border-[#bfa68e]/25 bg-gradient-to-br from-[#1a1410]/80 to-black/60 p-7 shadow-[0_0_40px_rgba(191,166,142,0.12)]">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-green-400/30 bg-green-400/10 text-green-300">
                <Check size={22} strokeWidth={2.2} />
              </div>
              <div className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.25em] text-[#bfa68e]">
                Link enviado
              </div>
              <h2 className="mb-3 text-xl font-light leading-tight">
                Verifique sua caixa de entrada
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-white/60">
                Enviamos um link seguro para <strong className="text-white/80">{email}</strong>. Abra o email, clique no botão e defina sua nova senha. Se não encontrar, confira o spam.
              </p>

              <div className="mb-6 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 rounded-lg border border-white/5 bg-black/40 p-4 text-xs text-white/60">
                <span className="font-mono uppercase tracking-[0.2em] text-white/40">Validade</span>
                <span>1 hora a partir do envio</span>
                <span className="font-mono uppercase tracking-[0.2em] text-white/40">Remetente</span>
                <span>noreply@pralvex.com.br</span>
                <span className="font-mono uppercase tracking-[0.2em] text-white/40">Suporte</span>
                <span>contato@pralvex.com.br</span>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => { setSent(false); setEmail('') }}
                  className="flex-1 rounded-lg border border-white/15 bg-white/[0.03] px-4 py-2.5 text-sm text-white/80 transition hover:border-[#bfa68e]/40 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bfa68e] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  Usar outro email
                </button>
                <Link
                  href="/login"
                  className="flex flex-1 items-center justify-center rounded-lg bg-gradient-to-r from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] px-4 py-2.5 text-sm font-medium text-[#0a0807] transition hover:shadow-[0_0_30px_rgba(191,166,142,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bfa68e] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  Voltar ao login
                </Link>
              </div>
            </div>
          )}
        </div>

        <footer className="relative z-10 mt-10 text-center font-mono text-[0.58rem] uppercase tracking-[0.3em] text-white/25">
          Pralvex · MMXXVI · Atelier
        </footer>
      </section>
    </main>
  )
}
