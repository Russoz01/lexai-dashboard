'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Reveal } from '@/components/ui/reveal'

const faqs = [
  {
    q: 'Os 23 agentes sao especializados em Direito brasileiro?',
    a: 'Sim. Cada agente foi treinado sobre o ordenamento juridico brasileiro — CF/88, CLT, CDC, CPC, CC, legislacao tributaria, previdenciaria e regulatoria. A base jurisprudencial cobre STF, STJ, TRFs, TJs estaduais e tribunais superiores trabalhistas.',
  },
  {
    q: 'Como funciona a conformidade com o Provimento 205/2021 da OAB?',
    a: 'Toda saida de qualquer agente passa por uma camada de validacao automatica contra o Provimento 205. Claims proibidos (garantia de resultado, promessa de sucesso, mercantilizacao) sao bloqueados antes da entrega. Audit log registra cada validacao por usuario.',
  },
  {
    q: 'Os dados do meu escritorio sao usados para treinar modelos?',
    a: 'Nunca. Isolamento total entre clientes, criptografia em repouso e em transito, servidores no Brasil. DPA assinado (Data Processing Agreement) conforme LGPD. O modelo nao aprende com seus documentos — todo processamento e por sessao.',
  },
  {
    q: 'Posso integrar com meu sistema juridico atual?',
    a: 'Sim. No plano Enterprise ha API privada com webhooks, SSO via SAML, integracao com tribunais (monitoramento processual) e conectores para os principais CRMs juridicos. Google Calendar, WhatsApp e Drive ja vem por padrao.',
  },
  {
    q: 'E se a IA errar? Quem assume a responsabilidade?',
    a: 'A LexAI e ferramenta de apoio. Toda saida deve ser revisada por profissional habilitado pela OAB antes de uso processual ou contratual. Nunca enviamos documento sem revisao. O fluxo sempre termina com aprovacao humana — eh assim que exige o Provimento 205.',
  },
  {
    q: 'Quanto tempo leva a implantacao?',
    a: 'Plano Escritorio: mesmo dia. Firma: 3 a 5 dias com onboarding dedicado. Enterprise: 2 a 4 semanas incluindo SSO, integracoes, agentes customizados e treinamento do time. Migracao de base historica disponivel em todos os planos.',
  },
]

function Item({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(idx === 0)
  return (
    <Reveal delay={0.05 + idx * 0.05}>
      <div
        className={cn(
          'border-b border-white/10 transition-colors',
          open && 'bg-white/[0.015]',
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-6 py-5 text-left"
          aria-expanded={open}
        >
          <span className="text-base font-medium tracking-tight text-white">
            {q}
          </span>
          <Plus
            className={cn(
              'size-4 shrink-0 text-white/40 transition-transform duration-300',
              open && 'rotate-45 text-[#bfa68e]',
            )}
            strokeWidth={1.75}
          />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <p className="pb-6 pr-10 text-sm leading-relaxed text-white/60">{a}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  )
}

export function LexFaq() {
  return (
    <section id="faq" className="relative bg-black py-24">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal as="div" className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/55">
            Perguntas frequentes
          </div>
          <h2 className="text-balance text-4xl font-medium tracking-tight text-white md:text-5xl">
            O que advogados{' '}
            <span className="italic text-white/50">perguntam primeiro</span>.
          </h2>
        </Reveal>

        <div>
          {faqs.map((f, i) => (
            <Item key={f.q} q={f.q} a={f.a} idx={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
