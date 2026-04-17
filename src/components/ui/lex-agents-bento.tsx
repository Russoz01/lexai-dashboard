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
  type LucideIcon,
} from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'
import { cn } from '@/lib/utils'

type Agent = {
  slug: string
  name: string
  desc: string
  icon: LucideIcon
  accent?: boolean
}

/* 23 agentes reais do dashboard — names + desc curta + lucide icon. */
const agents: Agent[] = [
  { slug: 'crm',           name: 'CRM Juridico', desc: 'Pipeline de leads, qualificacao automatica e follow-up com compliance OAB.', icon: Users, accent: true },
  { slug: 'redator',       name: 'Redator',       desc: 'Peticoes, recursos e contestacoes com fundamentacao doutrinaria.', icon: PenLine, accent: true },
  { slug: 'pesquisador',   name: 'Pesquisador',   desc: 'Jurisprudencia STF, STJ, TRFs e TJs com ementa e data.',           icon: Search,  accent: true },
  { slug: 'resumidor',     name: 'Resumidor',     desc: 'Contratos, acordaos e peticoes resumidos com riscos e prazos.',    icon: FileText },
  { slug: 'negociador',    name: 'Negociador',    desc: 'MAAN, margem viavel e tres cenarios antes da audiencia.',          icon: Handshake },
  { slug: 'chat',          name: 'Chat',          desc: 'Orquestrador conversacional — chama o agente certo por voce.',     icon: MessageSquare, accent: true },
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
    <Reveal delay={0.05 + (i % 4) * 0.06}>
      <Link
        href={`/dashboard/${a.slug}`}
        className={cn(
          'group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-neutral-950 p-5 transition-colors hover:border-white/20',
          a.accent && 'border-white/15 bg-gradient-to-b from-[#bfa68e]/[0.04] to-transparent',
        )}
      >
        {/* Sheen on hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#bfa68e]/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
        />

        <div className="mb-3 flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-md border border-white/10 bg-white/[0.02]">
            <Icon className="size-4 text-[#bfa68e]" strokeWidth={1.75} />
          </div>
          <div className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/40">
            {String(i + 1).padStart(2, '0')}
          </div>
        </div>

        <h3 className="text-base font-medium tracking-tight text-white">
          {a.name}
        </h3>
        <p className="mt-1 flex-1 text-sm leading-relaxed text-white/55">
          {a.desc}
        </p>

        <div className="mt-4 inline-flex items-center gap-1 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-white/40 transition-colors group-hover:text-[#bfa68e]">
          Abrir agente →
        </div>
      </Link>
    </Reveal>
  )
}

export function LexAgentsBento() {
  return (
    <section id="agentes" className="relative bg-black py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/55">
            <Scale className="size-3 text-[#bfa68e]" strokeWidth={1.75} />
            23 agentes especializados
          </div>
          <h2 className="text-balance text-4xl font-medium tracking-tight text-white md:text-5xl">
            Do primeiro lead{' '}
            <span className="italic text-white/50">a sentenca</span>.
          </h2>
          <p className="mt-4 text-white/55">
            Cada agente treinado numa funcao especifica do Direito brasileiro.
            Todos compartilham o mesmo CRM, a mesma biblioteca e os mesmos
            dados — sem cinco ferramentas abertas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {agents.map((a, i) => (
            <AgentCard key={a.slug} a={a} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
