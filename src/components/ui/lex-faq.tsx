'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Reveal } from '@/components/ui/reveal'

/* ════════════════════════════════════════════════════════════════════
 * LexFaq (v9 · 2026-04-19)
 * ────────────────────────────────────────────────────────────────────
 * Reescrito com:
 *  · Numero correto: 22 agentes (14 prontos + 8 em onda)
 *  · Resposta da implantacao alinhada com tier (Escritorio/Firma/Enterprise)
 *  · Resposta de provimento 205 mais especifica (tipos de claim bloqueados)
 *  · LGPD com servidor sa-east-1 (real)
 *  · Editorial heading + serif italic
 * ═══════════════════════════════════════════════════════════════════ */

const faqs = [
  {
    q: 'Os 22 agentes são especializados em Direito brasileiro?',
    a: 'Sim. CF/88, CLT, CDC, CPC, CC, legislação tributária, previdenciária e regulatória. Base jurisprudencial cobre STF, STJ, TRFs, TJs estaduais e tribunais superiores trabalhistas. Hoje 14 agentes estão prontos para uso; os 8 restantes (parecerista, revisor, contestador, recursos, audiência, estrategista, atendimento e marketing IA) entram em onda nos próximos meses.',
  },
  {
    q: 'Como funciona a validação contra o Provimento 205/2021 da OAB?',
    a: 'Toda saída de qualquer agente passa por uma camada automática de validação. Claims proibidos pela OAB são bloqueados antes da entrega: garantia de resultado, mercantilização do serviço, captação indevida, sensacionalismo, e citação sem fonte rastreável. Audit log registra cada validação por usuário — você pode auditar tudo a qualquer momento.',
  },
  {
    q: 'Meus documentos treinam o modelo da LexAI?',
    a: 'Nunca. Isolamento total entre clientes, criptografia em repouso (AES-256) e em trânsito (TLS 1.3), processamento por sessão. DPA assinado conforme LGPD (Lei 13.709/2018). Servidor em São Paulo (AWS sa-east-1). O modelo não aprende com sua base — cada nova sessão começa do zero.',
  },
  {
    q: 'Integra com PJe, e-SAJ, Projudi e calendário?',
    a: 'Monitoramento processual via API nos planos Firma e Enterprise. Google Calendar, WhatsApp Business e Google Drive vêm por padrão em todos os planos. SSO via SAML, integração com tribunais e webhooks customizados disponíveis no Enterprise.',
  },
  {
    q: 'E se a IA errar em uma peça? Quem responde?',
    a: 'A LexAI é ferramenta de apoio. Toda saída deve ser revisada por profissional habilitado pela OAB antes de uso processual ou contratual. O fluxo sempre termina com aprovação humana — exatamente como o Provimento 205 exige. Nunca enviamos peça sem revisão; o sistema foi projetado para recusar quando a confiança da resposta cai abaixo do limite.',
  },
  {
    q: 'Quanto tempo leva a implantação?',
    a: 'Plano Escritório: mesmo dia, conta criada em 5 minutos. Firma: 3 a 5 dias com onboarding dedicado, importação de modelos e treinamento do time. Enterprise: 2 a 4 semanas incluindo SSO, integrações com sistemas internos, agentes customizados ao nicho do escritório e treinamento. Migração de base histórica disponível em todos os planos.',
  },
  {
    q: 'Por que o preço é fixo por escritório e não por advogado?',
    a: 'Porque escritório que cresce não pode pagar imposto de crescimento. Astrea cobra R$ 1.379 por usuário — a 9 advogados, R$ 12.411/mês. A LexAI cobra um único valor pelo escritório inteiro. Você contrata um analista júnior sem renegociar contrato de software. Sem fidelidade, cancela com um clique.',
  },
]

function Item({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(idx === 0)
  return (
    <Reveal delay={0.05 + idx * 0.04}>
      <div
        className={cn(
          'border-b border-white/[0.08] transition-colors',
          open && 'bg-white/[0.015]',
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="group flex w-full items-center justify-between gap-6 py-5 text-left"
          aria-expanded={open}
        >
          <span className="text-[15.5px] font-medium tracking-tight text-white transition-colors group-hover:text-[#e6d4bd]">
            {q}
          </span>
          <span
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded-full border transition-all',
              open
                ? 'rotate-45 border-[#bfa68e]/40 bg-[#bfa68e]/10 text-[#e6d4bd]'
                : 'border-white/10 text-white/45 group-hover:border-white/30 group-hover:text-white',
            )}
          >
            <Plus className="size-3.5" strokeWidth={2} />
          </span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <p className="pb-6 pr-12 text-[14px] leading-[1.7] text-white/65">{a}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  )
}

export function LexFaq() {
  return (
    <section id="faq" className="relative bg-black py-28">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal as="div" className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/55">
            Perguntas frequentes
          </div>
          <h2 className="text-balance font-serif text-4xl text-white md:text-5xl">
            O que sócios{' '}
            <span className="italic text-[#e6d4bd]">perguntam primeiro</span>.
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
