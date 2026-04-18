'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  FileText,
  PenLine,
  Search,
  Handshake,
  MessageSquare,
  Calculator,
  BookOpen,
  Calendar,
  ClipboardCheck,
  GraduationCap,
  Languages,
  ShieldCheck,
  Table2,
  Clipboard,
  Timer,
  LayoutTemplate,
  Wallet,
  History,
  CreditCard,
  Settings,
  Palette,
  Briefcase,
  Scale,
  Users,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'
import { RetroGrid } from '@/components/ui/retro-grid'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { cn } from '@/lib/utils'

/* ════════════════════════════════════════════════════════════════════
 * LexAgentsBento (v2 · 2026-04-18)
 * ────────────────────────────────────────────────────────────────────
 * Feedback anterior (visual antigo, plano, feio): adicionado
 *  · retro-grid sutil de fundo na secao
 *  · radial champagne no topo
 *  · SpotlightCard envolvendo cada card (mouse follow)
 *  · accent cards com gradient champagne mais forte + borda luminosa
 *  · icon tile com gradient + pontinho de status pulse
 *  · hover eleva card (translate-y + border champagne)
 *  · CTA com ArrowUpRight que se move no hover
 * Os 23 agentes reais sao mantidos, descricoes curtas preservadas.
 * ═══════════════════════════════════════════════════════════════════ */

type Agent = {
  slug: string
  name: string
  desc: string
  icon: LucideIcon
  accent?: boolean
  tag?: string
}

const agents: Agent[] = [
  { slug: 'crm',           name: 'CRM Juridico', desc: 'Pipeline de leads, qualificacao automatica e follow-up com compliance OAB.', icon: Users, accent: true, tag: 'Pro' },
  { slug: 'redator',       name: 'Redator',       desc: 'Peticoes, recursos e contestacoes com fundamentacao doutrinaria.', icon: PenLine, accent: true },
  { slug: 'pesquisador',   name: 'Pesquisador',   desc: 'Jurisprudencia STF, STJ, TRFs e TJs com ementa e data.',           icon: Search,  accent: true },
  { slug: 'resumidor',     name: 'Resumidor',     desc: 'Contratos, acordaos e peticoes resumidos com riscos e prazos.',    icon: FileText },
  { slug: 'negociador',    name: 'Negociador',    desc: 'MAAN, margem viavel e tres cenarios antes da audiencia.',          icon: Handshake },
  { slug: 'chat',          name: 'Chat',          desc: 'Orquestrador conversacional — chama o agente certo por voce.',     icon: MessageSquare, accent: true, tag: 'Novo' },
  { slug: 'calculador',    name: 'Calculador',    desc: 'Prazos, INPC/IGPM/IPCA, juros de mora e custas por estado.',       icon: Calculator },
  { slug: 'legislacao',    name: 'Legislacao',    desc: 'Artigos de lei explicados com doutrina e jurisprudencia.',         icon: BookOpen },
  { slug: 'rotina',        name: 'Rotina',        desc: 'Audiencias, prazos, compromissos e fluxos por prioridade.',        icon: Calendar },
  { slug: 'consultor',     name: 'Consultor',     desc: 'Parecer juridico estruturado, pronto para revisao.',               icon: ClipboardCheck },
  { slug: 'parecerista',   name: 'Parecerista',   desc: 'Opinion writing com pro/contra e recomendacao conclusiva.',        icon: Briefcase },
  { slug: 'professor',     name: 'Professor',     desc: 'Treinamento e revisao em areas especificas do Direito.',           icon: GraduationCap },
  { slug: 'tradutor',      name: 'Tradutor',      desc: 'Contratos EN/ES/FR com vocabulario tecnico preservado.',           icon: Languages },
  { slug: 'compliance',    name: 'Compliance',    desc: 'LGPD, anticorrupcao e riscos regulatorios mapeados.',              icon: ShieldCheck, accent: true },
  { slug: 'planilhas',     name: 'Planilhas',     desc: 'Melhoria automatica de planilhas com diff estatistico.',           icon: Table2 },
  { slug: 'simulado',      name: 'Simulado',      desc: 'Exames modelo com devolutiva item a item.',                        icon: Clipboard },
  { slug: 'prazos',        name: 'Prazos',        desc: 'Rastreamento com prioridade critica, alta, media, baixa.',         icon: Timer },
  { slug: 'modelos',       name: 'Modelos',       desc: '30+ prompts profissionais por 9 areas do Direito.',                icon: LayoutTemplate },
  { slug: 'financeiro',    name: 'Financeiro',    desc: 'Honorarios, repasses, impostos e previsibilidade de caixa.',       icon: Wallet },
  { slug: 'historico',     name: 'Historico',     desc: 'Todas interacoes com tokens e tempo por agente.',                  icon: History },
  { slug: 'planos',        name: 'Planos',        desc: 'Gestao de assinatura, limites e compras avulsas.',                 icon: CreditCard },
  { slug: 'configuracoes', name: 'Configuracoes', desc: 'Integracoes (Calendar, WhatsApp, Drive), notificacoes.',           icon: Settings },
  { slug: 'design',        name: 'Design System', desc: 'Preferencias de cor, fonte, espaco e densidade do app.',           icon: Palette },
]

function AgentCard({ a, i }: { a: Agent; i: number }) {
  const Icon = a.icon
  return (
    <Reveal delay={0.04 + (i % 4) * 0.05} className="h-full">
      <SpotlightCard
        color={a.accent ? 'rgba(191,166,142,0.55)' : 'rgba(255,255,255,0.45)'}
        size={a.accent ? 380 : 320}
        className="h-full rounded-2xl"
      >
        <Link
          href={`/dashboard/${a.slug}`}
          className={cn(
            'group relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 transition-all duration-300',
            'hover:-translate-y-0.5',
            a.accent
              ? 'border-[#bfa68e]/25 bg-gradient-to-b from-[#bfa68e]/[0.06] via-neutral-950 to-neutral-950 hover:border-[#bfa68e]/50'
              : 'border-white/10 bg-neutral-950 hover:border-white/20',
          )}
        >
          {/* Sheen superior no hover (linha champagne) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#bfa68e]/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />

          {/* Halo sutil atras do icone nos accent */}
          {a.accent && (
            <div
              aria-hidden
              className="pointer-events-none absolute -left-4 -top-4 size-32 rounded-full bg-[#bfa68e]/10 blur-3xl transition-opacity duration-500 group-hover:bg-[#bfa68e]/20"
            />
          )}

          {/* Header com icone + numero + tag */}
          <div className="relative mb-5 flex items-center justify-between">
            <div
              className={cn(
                'flex size-10 items-center justify-center rounded-lg border transition-all duration-300',
                a.accent
                  ? 'border-[#bfa68e]/30 bg-gradient-to-br from-[#bfa68e]/20 to-[#8a6f55]/10 group-hover:border-[#bfa68e]/50'
                  : 'border-white/10 bg-white/[0.03] group-hover:border-white/20 group-hover:bg-white/[0.06]',
              )}
            >
              <Icon
                className={cn(
                  'size-[18px] transition-colors',
                  a.accent ? 'text-[#e6d4bd]' : 'text-[#bfa68e]',
                )}
                strokeWidth={1.75}
              />
            </div>

            <div className="flex items-center gap-2">
              {a.tag && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#bfa68e]/30 bg-[#bfa68e]/[0.08] px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.15em] text-[#e6d4bd]">
                  <span className="size-1 rounded-full bg-[#bfa68e]" />
                  {a.tag}
                </span>
              )}
              <div className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/35">
                {String(i + 1).padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* Titulo + descricao */}
          <h3 className="relative text-[1.02rem] font-medium tracking-tight text-white">
            {a.name}
          </h3>
          <p className="relative mt-2 flex-1 text-[13.5px] leading-relaxed text-white/55">
            {a.desc}
          </p>

          {/* Footer CTA */}
          <div className="relative mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
            <span
              className={cn(
                'font-mono text-[0.6rem] uppercase tracking-[0.18em] transition-colors',
                a.accent
                  ? 'text-[#bfa68e]'
                  : 'text-white/40 group-hover:text-[#bfa68e]',
              )}
            >
              Abrir agente
            </span>
            <ArrowUpRight
              className={cn(
                'size-3.5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5',
                a.accent ? 'text-[#bfa68e]' : 'text-white/40 group-hover:text-[#bfa68e]',
              )}
              strokeWidth={2}
            />
          </div>
        </Link>
      </SpotlightCard>
    </Reveal>
  )
}

export function LexAgentsBento() {
  return (
    <section id="agentes" className="relative isolate overflow-hidden bg-black py-28">
      {/* ── Layers de fundo ───────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(60%_40%_at_50%_0%,rgba(191,166,142,0.10)_0%,transparent_70%)]"
      />
      <div aria-hidden className="absolute inset-x-0 top-1/3 bottom-0 -z-20">
        <RetroGrid opacity={0.14} angle={70} />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* ── Heading ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/70">
            <Scale className="size-3 text-[#bfa68e]" strokeWidth={2} />
            23 agentes especializados
          </div>
          <h2 className="text-balance text-4xl font-medium tracking-tight text-white md:text-5xl">
            Do primeiro lead{' '}
            <span className="bg-gradient-to-br from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] bg-clip-text italic text-transparent">
              a sentenca
            </span>
            .
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-balance text-white/65">
            Cada agente treinado numa funcao especifica do Direito brasileiro. Todos
            compartilham o mesmo CRM, a mesma biblioteca e os mesmos dados — sem
            cinco ferramentas abertas.
          </p>
        </motion.div>

        {/* ── Grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {agents.map((a, i) => (
            <AgentCard key={a.slug} a={a} i={i} />
          ))}
        </div>

        {/* ── Rodape da secao (stats) ─────────────────────────────── */}
        <Reveal delay={0.2}>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-y border-white/10 py-6">
            {[
              'Todos os 23 agentes no plano Pro',
              'Historico compartilhado',
              'Um unico CRM',
              'Sem troca de contexto',
            ].map((t) => (
              <div
                key={t}
                className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/55"
              >
                <span className="size-1 rounded-full bg-[#bfa68e]/60" />
                {t}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
