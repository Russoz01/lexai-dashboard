import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Eye,
  Calendar,
  FileText,
  ArrowLeft,
  ArrowRight,
  TextQuote,
  CheckCircle2,
  AlertTriangle,
  CalendarClock,
  Scale,
  Link2Off,
  Sparkles,
} from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Private shared content — never index
export const metadata: Metadata = {
  title: 'Documento compartilhado — Pralvex',
  description: 'Analise juridica compartilhada via Pralvex.',
  robots: { index: false, follow: false, nocache: true },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Conteudo = any

interface SharedDoc {
  id: string
  token: string
  titulo: string
  conteudo: Conteudo
  tipo: string | null
  views: number | null
  expires_at: string
  created_at: string
}

/**
 * Public, unauthenticated Supabase client used for reading shared_documents.
 * RLS is expected to allow anonymous SELECT by token on this table.
 */
function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function fetchSharedDoc(token: string): Promise<SharedDoc | null> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('shared_documents')
      .select('id, token, titulo, conteudo, tipo, views, expires_at, created_at')
      .eq('token', token)
      .maybeSingle()

    if (error || !data) return null
    return data as SharedDoc
  } catch {
    return null
  }
}

/** Best-effort view counter via RPC SECURITY DEFINER.
 *  Antes: UPDATE direto via anon client. Vulnerabilidade: a policy RLS
 *  permitia anon UPDATE de qualquer coluna (titulo/conteudo/etc) — atacante
 *  com token publico defaceava o doc. Agora chama RPC restrita que SO
 *  incrementa views, valida charset do token e respeita expires_at.
 *  Audit 2026-05-02. */
async function incrementViews(token: string) {
  try {
    const supabase = createPublicClient()
    await supabase.rpc('increment_shared_doc_views', { doc_token: token })
  } catch {
    // silent
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

/* ════════════════════════════════════════════════════════════════════
 * /share/[token] — documento publico compartilhado (Tailwind · dark)
 * ────────────────────────────────────────────────────────────────────
 * Migrado de cream+navy+bi-icons para black+champagne+lucide.
 * Mantem server component (async) — sem animacoes framer.
 * Glow decorativo CSS puro (radial-gradient, blur) no hero.
 * Cards com border champagne e bg neutral-950/60 para legibilidade.
 * Robots noindex/nofollow conservado.
 * ═══════════════════════════════════════════════════════════════════ */

function NotFoundView() {
  return (
    <div className="surface-base flex min-h-screen items-center justify-center px-6 py-16">
      {/* Fundo decorativo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(50%_40%_at_50%_30%,rgba(239,68,68,0.08)_0%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 [background:radial-gradient(70%_50%_at_50%_100%,rgba(191,166,142,0.06)_0%,transparent_70%)]"
      />

      <div className="w-full max-w-md rounded-2xl border border-on-surface p-10 text-center backdrop-blur" style={{ background: 'var(--card-bg)' }}>
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl border border-red-400/25 bg-red-400/[0.08]">
          <Link2Off className="size-6 text-red-300" strokeWidth={1.75} />
        </div>
        <h1 className="mb-2.5 text-xl font-medium tracking-tight text-on-surface">
          Link expirado ou nao encontrado
        </h1>
        <p className="mb-7 text-sm leading-relaxed text-on-surface-muted">
          Este documento compartilhado nao esta mais disponivel. Pode ter expirado ou
          o link esta incorreto.
        </p>
        <Link
          href="/"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-br from-[#f5e8d3] via-[#bfa68e] to-[#8a6f55] px-5 text-xs font-medium text-[#0a0807] transition hover:brightness-110"
        >
          <ArrowLeft className="size-3.5" strokeWidth={2.25} />
          Voltar para a Pralvex
        </Link>
      </div>
    </div>
  )
}

export default async function SharedDocumentPage({
  params,
}: {
  params: { token: string }
}) {
  const token = params.token

  // Token validation: tokens sao crypto.randomBytes(32).toString('hex') = 64 hex chars.
  // Validar charset+length estrito previne SSRF/path traversal e indica attempt malicioso.
  if (!token || typeof token !== 'string' || !/^[a-f0-9]{16,64}$/i.test(token)) {
    return <NotFoundView />
  }

  const doc = await fetchSharedDoc(token)
  if (!doc) return <NotFoundView />

  // Check expiration
  const expired = new Date(doc.expires_at).getTime() < Date.now()
  if (expired) return <NotFoundView />

  // Fire and forget view increment (via RPC SECURITY DEFINER)
  incrementViews(token).catch(() => { /* silent */ })

  const analise = doc.conteudo || {}
  const objeto: string = analise.objeto || analise.resumo || analise.conclusao || ''
  const pontos: unknown[] = analise.pontos_principais || analise.pontos_chave || []
  const riscos: unknown[] = analise.riscos || []
  const prazos: unknown[] = analise.prazos_identificados || analise.prazos || []

  const expiresLabel = formatDate(doc.expires_at)
  const viewsCount = (doc.views || 0) + 1 // include this view

  return (
    <div className="relative min-h-screen surface-base">
      {/* ═══ Fundo ═══════════════════════════════════════════════════ */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[520px] [background:radial-gradient(60%_100%_at_50%_0%,rgba(191,166,142,0.10)_0%,transparent_75%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-20 h-px"
        style={{ background: 'linear-gradient(to right, transparent, var(--border), transparent)' }}
      />

      {/* ═══ NAV minima ══════════════════════════════════════════════ */}
      <header className="lex-landing-nav-scrolled sticky top-0 z-40 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-on-surface">
            <div className="flex size-7 items-center justify-center rounded-md border border-on-surface bg-gradient-to-br from-[#bfa68e]/20 to-transparent">
              <Scale className="size-3.5 text-[#bfa68e]" strokeWidth={1.75} />
            </div>
            <span className="text-sm font-medium tracking-tight">Pralvex</span>
          </Link>
          <div className="font-mono text-[0.6rem] uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>
            Documento publico
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        {/* ═══ HERO do documento ════════════════════════════════════ */}
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-on-surface p-8 backdrop-blur md:p-10" style={{ background: 'var(--card-bg)' }}>
          <div
            aria-hidden
            className="pointer-events-none absolute -left-16 -top-16 size-48 rounded-full bg-[#bfa68e]/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#bfa68e]/40 to-transparent"
          />

          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#bfa68e]/25 bg-[#bfa68e]/[0.06] px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#e6d4bd]">
              <span className="size-1 rounded-full bg-[#bfa68e]" />
              Compartilhado via Pralvex
            </div>

            <h1 className="text-balance text-[1.7rem] font-medium leading-tight tracking-tight text-on-surface md:text-[2rem]">
              {doc.titulo}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2.5 font-mono text-[0.65rem] uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="size-3.5 text-[#bfa68e]" strokeWidth={2} />
                {viewsCount} {viewsCount === 1 ? 'visualizacao' : 'visualizacoes'}
              </span>
              <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>&bull;</span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5 text-[#bfa68e]" strokeWidth={2} />
                Ate {expiresLabel}
              </span>
              {doc.tipo && (
                <>
                  <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>&bull;</span>
                  <span className="inline-flex items-center gap-1.5">
                    <FileText className="size-3.5 text-[#bfa68e]" strokeWidth={2} />
                    {doc.tipo}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ═══ Resumo / objeto ═══════════════════════════════════════ */}
        {objeto && (
          <section className="mb-5 rounded-2xl border border-on-surface p-7 backdrop-blur" style={{ background: 'var(--card-bg)' }}>
            <div className="mb-4 inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#bfa68e]">
              <TextQuote className="size-3.5" strokeWidth={2} />
              Resumo executivo
            </div>
            <p className="whitespace-pre-wrap text-[0.95rem] leading-[1.78] text-on-surface-muted">
              {String(objeto)}
            </p>
          </section>
        )}

        {/* ═══ Pontos principais ═══════════════════════════════════ */}
        {Array.isArray(pontos) && pontos.length > 0 && (
          <section className="mb-5 rounded-2xl border border-on-surface p-7 backdrop-blur" style={{ background: 'var(--card-bg)' }}>
            <div className="mb-5 inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#bfa68e]">
              <CheckCircle2 className="size-3.5" strokeWidth={2} />
              Pontos principais
            </div>
            <ul className="space-y-3">
              {pontos.map((p, i) => (
                <li
                  key={i}
                  className="relative flex items-start gap-3 pl-4 text-sm leading-[1.65] text-on-surface-muted"
                >
                  <span className="absolute left-0 top-[0.65rem] h-px w-2 bg-[#bfa68e]/70" />
                  <span>{typeof p === 'string' ? p : JSON.stringify(p)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ═══ Riscos ═══════════════════════════════════════════════ */}
        {Array.isArray(riscos) && riscos.length > 0 && (
          <section className="mb-5 rounded-2xl border border-on-surface p-7 backdrop-blur" style={{ background: 'var(--card-bg)' }}>
            <div className="mb-5 inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-amber-300">
              <AlertTriangle className="size-3.5" strokeWidth={2} />
              Riscos e clausulas importantes
            </div>
            <div className="space-y-3">
              {riscos.map((r, i) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const risco = r as any
                const isObj = r && typeof r === 'object'
                const descricao = isObj
                  ? risco.descricao || JSON.stringify(risco)
                  : String(r)
                const gravidade = isObj ? risco.gravidade : null
                const mitigacao = isObj ? risco.mitigacao : null
                return (
                  <div
                    key={i}
                    className="rounded-xl border border-amber-400/15 bg-amber-400/[0.04] p-5"
                  >
                    {gravidade && (
                      <span className="mb-2 inline-block rounded-full bg-amber-400/90 px-2.5 py-0.5 font-mono text-[0.55rem] font-bold uppercase tracking-[0.18em] text-[#0a0807]">
                        {String(gravidade)}
                      </span>
                    )}
                    <div className="text-sm font-medium leading-relaxed text-on-surface">
                      {descricao}
                    </div>
                    {mitigacao && (
                      <div className="mt-2 text-[0.82rem] leading-relaxed text-on-surface-muted">
                        <strong className="font-semibold text-on-surface">
                          Mitigacao:
                        </strong>{' '}
                        {mitigacao}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ═══ Prazos ═══════════════════════════════════════════════ */}
        {Array.isArray(prazos) && prazos.length > 0 && (
          <section className="mb-5 rounded-2xl border border-on-surface p-7 backdrop-blur" style={{ background: 'var(--card-bg)' }}>
            <div className="mb-5 inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-red-300">
              <CalendarClock className="size-3.5" strokeWidth={2} />
              Prazos identificados
            </div>
            <div className="space-y-3">
              {prazos.map((p, i) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const prazo = p as any
                const isObj = p && typeof p === 'object'
                const evento = isObj
                  ? prazo.evento || prazo.prazo || JSON.stringify(prazo)
                  : String(p)
                const data = isObj ? prazo.data : null
                const consequencia = isObj ? prazo.consequencia : null
                return (
                  <div
                    key={i}
                    className="rounded-xl border border-red-400/15 bg-red-400/[0.04] p-5"
                  >
                    <div
                      className={
                        'flex flex-wrap items-center gap-2 ' +
                        (data ? 'mb-2' : '')
                      }
                    >
                      <div className="flex-1 text-sm font-semibold leading-relaxed text-on-surface">
                        {evento}
                      </div>
                      {data && (
                        <span className="rounded-full bg-red-500 px-2.5 py-0.5 font-mono text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-white">
                          {data}
                        </span>
                      )}
                    </div>
                    {consequencia && (
                      <div className="text-[0.82rem] leading-relaxed text-on-surface-muted">
                        <strong className="font-semibold text-on-surface">
                          Consequencia:
                        </strong>{' '}
                        {consequencia}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ═══ Footer CTA ═══════════════════════════════════════════ */}
        <div className="relative mt-10 overflow-hidden rounded-2xl border border-[#bfa68e]/25 bg-gradient-to-br from-[#bfa68e]/[0.12] via-[#bfa68e]/[0.06] to-transparent p-10 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#bfa68e]/60 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[#bfa68e]/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-[#8a6f55]/10 blur-3xl"
          />

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#bfa68e]/30 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#e6d4bd]" style={{ background: 'var(--card-bg)' }}>
              <Sparkles className="size-3" strokeWidth={2} />
              Prove sem compromisso
            </div>
            <h2 className="text-balance text-2xl font-medium tracking-tight text-on-surface md:text-[1.65rem]">
              Quer gerar suas proprias analises juridicas?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-on-surface-muted">
              Contratos, peticoes e acordaos analisados em segundos. 27 agentes
              especializados, todos no mesmo lugar.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-br from-[#f5e8d3] via-[#bfa68e] to-[#8a6f55] px-6 text-sm font-medium text-[#0a0807] transition hover:-translate-y-0.5 hover:brightness-110"
            >
              Comece gratis na Pralvex
              <ArrowRight className="size-4" strokeWidth={2.25} />
            </Link>
          </div>
        </div>

        {/* ═══ Micro footer ═══════════════════════════════════════════ */}
        <div className="mt-8 text-center font-mono text-[0.6rem] uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>
          Gerado e compartilhado via Pralvex &middot; conteudo de responsabilidade de
          quem criou o compartilhamento
        </div>
      </main>
    </div>
  )
}
