'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, BookOpen, Bot, Code2, Cog, FileText, Keyboard,
  LifeBuoy, Rocket, Shield, Sparkles, Zap, ArrowUpRight,
  Play, Terminal, Gauge, MessageSquare, Search, PenLine,
  Calculator, type LucideIcon,
} from 'lucide-react'

/* ════════════════════════════════════════════════════════════════
 * /docs — Documentacao (v10.8 editorial · 2026-04-22)
 * ────────────────────────────────────────────────────────────────
 * Nao e pagina de suporte generica. E guia editorial onde cada
 * secao abre com numero serial, Playfair italic e hairline.
 * Sete capitulos: Primeiros passos, Agentes, Atalhos, Prompt craft,
 * Integracoes, API, Troubleshooting. CTA final: falar com Renato.
 * ═══════════════════════════════════════════════════════════════ */

type Chapter = {
  n: string
  slug: string
  title: string
  caption: string
  Icon: LucideIcon
  body: React.ReactNode
}

const CHAPTERS: Chapter[] = [
  {
    n: 'I',
    slug: 'primeiros-passos',
    title: 'Primeiros passos',
    caption: 'Do signup ao primeiro parecer em 7 minutos',
    Icon: Rocket,
    body: (
      <>
        <p>
          Depois do signup a plataforma cria seu gabinete. Voce entra com uma
          demo de 50 minutos com acesso enterprise aos 27 agentes. Nao exige cartao.
        </p>
        <ol className="mt-4 space-y-2 pl-5 text-[14px] leading-[1.7] text-white/70 [counter-reset:step]">
          <li className="relative pl-8 before:absolute before:left-0 before:top-0 before:font-mono before:text-[11px] before:font-bold before:tracking-[0.22em] before:text-[#bfa68e] before:content-['01']">
            Abra o Chat orquestrador e digite a intencao (&ldquo;analise este contrato&rdquo;, &ldquo;prazo de embargos&rdquo;).
          </li>
          <li className="relative pl-8 before:absolute before:left-0 before:top-0 before:font-mono before:text-[11px] before:font-bold before:tracking-[0.22em] before:text-[#bfa68e] before:content-['02']">
            O Chat roteia para o agente certo (Resumidor, Calculador, Pesquisador) em 1s.
          </li>
          <li className="relative pl-8 before:absolute before:left-0 before:top-0 before:font-mono before:text-[11px] before:font-bold before:tracking-[0.22em] before:text-[#bfa68e] before:content-['03']">
            Resultado volta em segundos com citacao rastreavel e opcao de copiar ou exportar.
          </li>
        </ol>
      </>
    ),
  },
  {
    n: 'II',
    slug: 'agentes',
    title: 'Os vinte e dois agentes',
    caption: 'Especialista por recorte do Direito brasileiro',
    Icon: Bot,
    body: (
      <>
        <p>
          Cada agente e treinado num recorte especifico. Chat decide qual invocar,
          mas voce pode abrir direto pelo sidebar. Atalho de teclado: <kbd>G</kbd> + inicial.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            { Icon: MessageSquare, name: 'Chat', desc: 'Orquestrador' },
            { Icon: FileText, name: 'Resumidor', desc: 'Contratos, acordaos, pecas' },
            { Icon: Search, name: 'Pesquisador', desc: 'Jurisprudencia rastreavel' },
            { Icon: PenLine, name: 'Redator', desc: 'Pecas com fundamentacao' },
            { Icon: Calculator, name: 'Calculador', desc: 'Prazos, juros, INPC' },
            { Icon: Shield, name: 'Compliance', desc: 'OAB Provimento 205' },
          ].map(({ Icon, name, desc }) => (
            <div
              key={name}
              className="flex items-center gap-3 rounded-lg border border-[#bfa68e]/12 bg-[#bfa68e]/[0.03] px-3 py-2.5"
            >
              <div className="flex size-8 items-center justify-center rounded-md border border-[#bfa68e]/25 bg-[#bfa68e]/[0.06] text-[#e6d4bd]">
                <Icon className="size-4" strokeWidth={1.6} />
              </div>
              <div>
                <div className="text-[13px] font-medium text-white">{name}</div>
                <div className="text-[11.5px] text-white/50">{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5">
          Lista completa e detalhamento no{' '}
          <Link href="/dashboard" className="text-[#bfa68e] underline decoration-[#bfa68e]/40 underline-offset-2 transition hover:decoration-[#bfa68e]">
            dashboard
          </Link>{' '}
          (setor Atelier).
        </p>
      </>
    ),
  },
  {
    n: 'III',
    slug: 'atalhos',
    title: 'Atalhos de teclado',
    caption: 'Tudo que o gabinete resolve sem touchpad',
    Icon: Keyboard,
    body: (
      <>
        <p>
          O atalho principal e a paleta de comandos — abre com <kbd>Ctrl</kbd>+<kbd>K</kbd>{' '}
          (<kbd>Cmd</kbd>+<kbd>K</kbd> no macOS). Dentro dela, busca fuzzy por agente,
          historico, prazo e atalho.
        </p>
        <div className="mt-5 space-y-2">
          {[
            { keys: ['Ctrl', 'K'], desc: 'Abrir paleta de comandos' },
            { keys: ['G', 'D'], desc: 'Ir para Dashboard' },
            { keys: ['G', 'C'], desc: 'Ir para Chat' },
            { keys: ['G', 'H'], desc: 'Ir para Historico' },
            { keys: ['G', 'P'], desc: 'Ir para Prazos' },
            { keys: ['N'], desc: 'Nova consulta no agente ativo' },
            { keys: ['Esc'], desc: 'Fechar modal ou paleta' },
            { keys: ['?'], desc: 'Abrir ajuda contextual' },
          ].map(s => (
            <div
              key={s.desc}
              className="flex items-center justify-between border-b border-white/5 py-2 text-[13.5px]"
            >
              <span className="text-white/75">{s.desc}</span>
              <span className="flex gap-1.5">
                {s.keys.map(k => (
                  <kbd
                    key={k}
                    className="rounded border border-[#bfa68e]/25 bg-[#bfa68e]/[0.06] px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wider text-[#e6d4bd]"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    n: 'IV',
    slug: 'prompt-craft',
    title: 'Artesanato de prompt',
    caption: 'Como falar com os agentes para respostas ricas',
    Icon: Sparkles,
    body: (
      <>
        <p>
          Agentes juridicos trabalham melhor com <strong>contexto curto mas preciso</strong>.
          Tres regras de ofi­cio:
        </p>
        <ol className="mt-4 space-y-3 text-[14px] leading-[1.7] text-white/70">
          <li>
            <strong className="text-white">Seja especifico no tribunal</strong> — &ldquo;pesquisa STJ&rdquo;
            rende acordaos mais relevantes que &ldquo;pesquisa geral&rdquo;.
          </li>
          <li>
            <strong className="text-white">Cite a tese</strong> — &ldquo;boa-fe objetiva em M&amp;A&rdquo; e
            melhor que &ldquo;contratos&rdquo;.
          </li>
          <li>
            <strong className="text-white">Declare o formato</strong> — &ldquo;me retorne em topicos
            para a peca&rdquo; evita texto corrido.
          </li>
        </ol>
        <div className="mt-5 rounded-xl border border-[#bfa68e]/15 bg-[#bfa68e]/[0.03] p-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#bfa68e]/80">
            Exemplo · Pesquisador
          </div>
          <p className="font-mono text-[13px] leading-[1.6] text-white/85">
            Pesquisa STJ, 2020 em diante, sobre exclusao de socio minoritario em SCP
            por quebra de affectio societatis. Quero 3 acordaos com ementa e RR.
          </p>
        </div>
      </>
    ),
  },
  {
    n: 'V',
    slug: 'integracoes',
    title: 'Integracoes',
    caption: 'Google Calendar, WhatsApp, PJe, Resend',
    Icon: Cog,
    body: (
      <>
        <p>
          Integracoes ativam-se em <Link href="/dashboard/configuracoes" className="text-[#bfa68e] underline decoration-[#bfa68e]/40 underline-offset-2 hover:decoration-[#bfa68e]">Configuracoes</Link>.
          Todas usam OAuth — Pralvex nunca armazena senha.
        </p>
        <ul className="mt-4 space-y-3 text-[14px] leading-[1.7] text-white/70">
          <li>
            <strong className="text-white">Google Calendar</strong> — sincroniza prazos e
            agenda do agente Rotina. Escopo leitura + escrita.
          </li>
          <li>
            <strong className="text-white">WhatsApp Business</strong> — encaminha peticoes
            e alerta de prazo via AlexAI.
          </li>
          <li>
            <strong className="text-white">PJe Conectividade</strong> — consulta processual
            por OAB e CPF (beta, apenas TJSP).
          </li>
          <li>
            <strong className="text-white">Resend</strong> — entrega emails transacionais
            com dominio proprio.
          </li>
        </ul>
      </>
    ),
  },
  {
    n: 'VI',
    slug: 'api',
    title: 'API para desenvolvedores',
    caption: 'REST + webhook + SDK TypeScript',
    Icon: Code2,
    body: (
      <>
        <p>
          Plano Firma e Enterprise tem acesso a API. Auth via Bearer token.
          Rate limit 60 req/min no Firma, 600 req/min no Enterprise.
        </p>
        <div className="mt-5 rounded-xl border border-[#bfa68e]/15 bg-black/50 p-4">
          <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#bfa68e]/80">
            <Terminal className="size-3" strokeWidth={1.8} />
            POST /api/v1/agents/pesquisador
          </div>
          <pre className="overflow-x-auto font-mono text-[12.5px] leading-[1.65] text-white/80">
{`curl -X POST https://api.pralvex.com.br/v1/agents/pesquisador \\
  -H "Authorization: Bearer lx_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "responsabilidade civil em queda em supermercado",
    "tribunal": "STJ",
    "limit": 3
  }'`}
          </pre>
        </div>
        <p className="mt-4">
          SDK TypeScript:{' '}
          <code className="rounded border border-[#bfa68e]/20 bg-[#bfa68e]/[0.04] px-2 py-0.5 font-mono text-[12.5px] text-[#e6d4bd]">
            npm i @pralvex/sdk
          </code>
        </p>
      </>
    ),
  },
  {
    n: 'VII',
    slug: 'troubleshooting',
    title: 'Quando algo trava',
    caption: 'Problemas comuns e caminhos de saida',
    Icon: LifeBuoy,
    body: (
      <>
        <p>
          Tres situacoes que costumam dar atrito:
        </p>
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-[#bfa68e]/12 bg-[#bfa68e]/[0.03] p-4">
            <div className="mb-2 text-[13.5px] font-semibold text-white">
              &ldquo;O Pesquisador nao achou nada&rdquo;
            </div>
            <p className="text-[13px] text-white/65">
              Agente recusa quando nao tem fonte rastreavel — e feature, nao bug.
              Refine o prompt com tribunal + tese + ano.
            </p>
          </div>
          <div className="rounded-xl border border-[#bfa68e]/12 bg-[#bfa68e]/[0.03] p-4">
            <div className="mb-2 text-[13.5px] font-semibold text-white">
              &ldquo;Export de peca saiu sem formatacao&rdquo;
            </div>
            <p className="text-[13px] text-white/65">
              Use o botao &ldquo;Copiar com formatacao&rdquo; antes de colar no Word.
              Markdown convertido preserva negrito, italico e numeracao.
            </p>
          </div>
          <div className="rounded-xl border border-[#bfa68e]/12 bg-[#bfa68e]/[0.03] p-4">
            <div className="mb-2 text-[13.5px] font-semibold text-white">
              &ldquo;Agente trava em loop&rdquo;
            </div>
            <p className="text-[13px] text-white/65">
              Clique em &ldquo;Nova consulta&rdquo; — reset do contexto. Se persistir,
              fale com Renato: contato@pralvex.com.br, resposta em 24h.
            </p>
          </div>
        </div>
      </>
    ),
  },
]

export default function DocsClient() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white antialiased">
      {/* Ambient champagne glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[720px]"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(191,166,142,0.12), transparent 72%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 left-1/2 h-[820px] w-[820px] -translate-x-1/2 rounded-full border border-[#bfa68e]/[0.05]"
      />

      {/* Top bar · back link */}
      <div className="relative mx-auto max-w-5xl px-6 pt-10">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-white/50 transition-colors hover:text-[#bfa68e]"
        >
          <ArrowLeft
            size={12}
            strokeWidth={1.8}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          voltar ao site
        </Link>
      </div>

      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-6 pb-16 pt-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#bfa68e]/80">
            <span className="h-px w-8 bg-[#bfa68e]/40" />
            Manual do gabinete · MMXXVI
          </div>
          <h1 className="font-serif text-[clamp(42px,6vw,80px)] leading-[1.05] tracking-tight">
            Documentacao
            <br />
            <span className="italic text-grad-accent">
              do ofi&shy;cio.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-[16px] leading-[1.75] text-white/65">
            Guia pratico para advogados que usam a Pralvex como parte do ritual de
            trabalho. Sete capitulos, linguagem direta, exemplos reais. Atualizado
            a cada release.
          </p>
        </motion.div>

        {/* Quick links bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 grid gap-3 sm:grid-cols-3"
        >
          <a
            href="#primeiros-passos"
            className="group flex items-center gap-3 rounded-xl border border-[#bfa68e]/15 bg-[#bfa68e]/[0.04] px-4 py-3 transition-colors hover:border-[#bfa68e]/35 hover:bg-[#bfa68e]/[0.08]"
          >
            <Play className="size-4 text-[#e6d4bd]" strokeWidth={1.6} />
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-white">Inicio rapido</div>
              <div className="text-[11.5px] text-white/55">7 minutos</div>
            </div>
            <ArrowUpRight
              className="size-4 text-white/40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#bfa68e]"
              strokeWidth={1.8}
            />
          </a>
          <a
            href="#api"
            className="group flex items-center gap-3 rounded-xl border border-[#bfa68e]/15 bg-[#bfa68e]/[0.04] px-4 py-3 transition-colors hover:border-[#bfa68e]/35 hover:bg-[#bfa68e]/[0.08]"
          >
            <Code2 className="size-4 text-[#e6d4bd]" strokeWidth={1.6} />
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-white">API + SDK</div>
              <div className="text-[11.5px] text-white/55">REST + webhook</div>
            </div>
            <ArrowUpRight
              className="size-4 text-white/40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#bfa68e]"
              strokeWidth={1.8}
            />
          </a>
          <a
            href="#troubleshooting"
            className="group flex items-center gap-3 rounded-xl border border-[#bfa68e]/15 bg-[#bfa68e]/[0.04] px-4 py-3 transition-colors hover:border-[#bfa68e]/35 hover:bg-[#bfa68e]/[0.08]"
          >
            <LifeBuoy className="size-4 text-[#e6d4bd]" strokeWidth={1.6} />
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-white">Travou?</div>
              <div className="text-[11.5px] text-white/55">Renato responde em 24h</div>
            </div>
            <ArrowUpRight
              className="size-4 text-white/40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#bfa68e]"
              strokeWidth={1.8}
            />
          </a>
        </motion.div>
      </section>

      {/* Hairline */}
      <div className="mx-auto h-px w-full max-w-5xl bg-gradient-to-r from-transparent via-[#bfa68e]/30 to-transparent" />

      {/* Chapters */}
      <section className="relative mx-auto max-w-5xl px-6 py-16">
        <div className="space-y-20">
          {CHAPTERS.map((c, i) => (
            <motion.article
              key={c.slug}
              id={c.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: Math.min(i * 0.04, 0.2), ease: [0.22, 1, 0.36, 1] }}
              className="scroll-mt-20"
            >
              <header className="mb-6 flex items-start gap-5">
                <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-xl border border-[#bfa68e]/25 bg-gradient-to-br from-[#bfa68e]/[0.12] to-[#bfa68e]/[0.02] text-[#e6d4bd] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_16px_rgba(191,166,142,0.12)]">
                  <c.Icon className="size-5" strokeWidth={1.6} />
                </div>
                <div className="flex-1">
                  <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-[#bfa68e]/80">
                    Capitulo {c.n} · {c.caption}
                  </div>
                  <h2 className="font-serif text-[28px] italic leading-[1.1] tracking-tight text-white md:text-[34px]">
                    {c.title}
                  </h2>
                </div>
              </header>
              <div className="ml-0 space-y-4 text-[14.5px] leading-[1.75] text-white/70 md:ml-[68px]">
                {c.body}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative mx-auto max-w-5xl px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl border border-[#bfa68e]/20 bg-gradient-to-br from-[#bfa68e]/[0.08] via-[#bfa68e]/[0.02] to-transparent p-10 text-center md:p-14"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 size-80 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(191,166,142,0.22), transparent 70%)',
            }}
          />
          <div className="mb-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#bfa68e]/80">
            <Zap className="size-3" strokeWidth={1.8} />
            Duvida fora do manual
          </div>
          <h3 className="font-serif text-[28px] leading-[1.1] text-white md:text-[40px]">
            Renato te responde <em className="italic text-[#e6d4bd]">pessoalmente</em>.
          </h3>
          <p className="mx-auto mt-4 max-w-xl text-[14.5px] text-white/60">
            Sem chatbot, sem ticket, sem copy de onboarding. Voce escreve,
            o socio-gestor responde em ate 24h.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="mailto:contato@pralvex.com.br?subject=Duvida%20sobre%20a%20documentacao%20Pralvex"
              className="group inline-flex items-center gap-3 rounded-full border border-[#bfa68e]/40 bg-gradient-to-r from-[#f5e8d3] via-[#bfa68e] to-[#7a5f48] px-7 py-3 font-mono text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#0a0a0a] shadow-[0_10px_40px_rgba(191,166,142,0.28)] transition-all hover:shadow-[0_14px_56px_rgba(191,166,142,0.45)]"
            >
              Escrever para Renato
              <ArrowUpRight
                className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={2.2}
              />
            </a>
            <Link
              href="/status"
              className="font-mono text-[12px] uppercase tracking-[0.3em] text-white/55 transition-colors hover:text-[#bfa68e]"
            >
              Ver status da plataforma
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
