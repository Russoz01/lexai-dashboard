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
 *  · Numero correto: 27 agentes (21 prontos + 6 novos v10.8)
 *  · Resposta da implantacao alinhada com tier (Escritorio/Firma/Enterprise)
 *  · Resposta de provimento 205 mais especifica (tipos de claim bloqueados)
 *  · LGPD com servidor sa-east-1 (real)
 *  · Editorial heading + serif italic
 * ═══════════════════════════════════════════════════════════════════ */

const faqs = [
  {
    q: 'Os 27 agentes são especializados em Direito brasileiro?',
    a: 'Sim. Treinados em CF/88, CLT, CDC, CPC, CC, legislação tributária, previdenciária e regulatória. Base jurisprudencial cobre STF, STJ, TRFs, TJs estaduais e tribunais superiores trabalhistas. A plataforma tem 27 agentes ao todo; o acesso varia por plano: Solo libera 8 agentes essenciais, Escritório libera 18, Firma libera os 27, Enterprise inclui agentes customizados treinados no acervo do escritório.',
  },
  {
    q: 'Como funciona a validação contra o Provimento 205/2021 da OAB?',
    a: 'Toda saída de qualquer agente passa por uma camada automática de validação. Claims proibidos pela OAB são bloqueados antes da entrega: garantia de resultado, mercantilização do serviço, captação indevida, sensacionalismo, e citação sem fonte rastreável. Audit log registra cada validação por usuário — você pode auditar tudo a qualquer momento.',
  },
  {
    q: 'Meus documentos treinam o modelo da Pralvex?',
    a: 'Nunca. Isolamento total entre clientes, criptografia em repouso (AES-256) e em trânsito (TLS 1.3), processamento por sessão. DPA assinado conforme LGPD (Lei 13.709/2018). Servidor em São Paulo (AWS sa-east-1). O modelo não aprende com sua base — cada nova sessão começa do zero.',
  },
  {
    q: 'Integra com PJe, e-SAJ, Projudi e calendário?',
    a: 'Monitoramento processual via API exclusivo nos planos Firma e Enterprise. Google Calendar e Google Drive vêm a partir do Escritório. SSO via SAML, integração direta com tribunais e webhooks customizados disponíveis apenas no Enterprise. Solo tem o agente Calculador de prazos manual mas sem sync automático com tribunal.',
  },
  {
    q: 'E se a IA errar em uma peça? Quem responde?',
    a: 'A Pralvex é ferramenta de apoio. Toda saída deve ser revisada por profissional habilitado pela OAB antes de uso processual ou contratual. O fluxo sempre termina com aprovação humana — exatamente como o Provimento 205 exige. Nunca enviamos peça sem revisão; o sistema foi projetado para recusar quando a confiança da resposta cai abaixo do limite.',
  },
  {
    q: 'Quanto tempo leva a implantação?',
    a: 'Plano Escritório: mesmo dia, conta criada em 5 minutos. Firma: 3 a 5 dias com onboarding dedicado, importação de modelos e treinamento do time. Enterprise: 2 a 4 semanas incluindo SSO, integrações com sistemas internos, agentes customizados ao nicho do escritório e treinamento. Migração de base histórica disponível em todos os planos.',
  },
  {
    q: 'Como é a cobrança — por escritório ou por advogado?',
    a: 'Por advogado registrado. Solo R$ 599 (1 advogado), Escritório R$ 1.399 (até 5 advogados), Firma R$ 1.459 (6-15), Enterprise R$ 1.599 (16+). Astrea cobra R$ 1.379 por usuário sem variar feature set — a 9 advogados, R$ 12.411/mês com mesmo limite de docs. Pralvex Firma a 9 advogados sai R$ 13.131/mês mas com documentos ilimitados, todos os 27 agentes e onboarding 1:1 incluso. Sem fidelidade, cancela com um clique.',
  },
]

function Item({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(idx === 0)
  return (
    <Reveal delay={0.05 + idx * 0.04}>
      <div
        className="transition-colors"
        style={{
          borderBottom: '1px solid var(--border)',
          background: open ? 'var(--hover)' : 'transparent',
        }}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="group flex w-full items-center justify-between gap-6 py-5 text-left"
          aria-expanded={open}
        >
          <span
            className="text-[15.5px] font-medium tracking-tight transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            {q}
          </span>
          <span
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded-full transition-all',
              open && 'rotate-45',
            )}
            style={{
              border: '1px solid',
              borderColor: open ? 'var(--stone)' : 'var(--border)',
              background: open ? 'var(--accent-light)' : 'transparent',
              color: open ? 'var(--accent)' : 'var(--text-muted)',
            }}
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
              <p
                className="pb-6 pr-12 text-[14px] leading-[1.7]"
                style={{ color: 'var(--text-secondary)' }}
              >{a}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  )
}

export function LexFaq() {
  return (
    <section
      id="faq"
      className="relative py-28"
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="mx-auto max-w-3xl px-6">
        <Reveal as="div" className="mb-12 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.22em]"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--hover)',
              color: 'var(--text-secondary)',
            }}
          >
            Perguntas frequentes
          </div>
          <h2
            className="text-balance font-serif text-4xl md:text-5xl"
            style={{ color: 'var(--text-primary)' }}
          >
            O que sócios{' '}
            <span className="italic text-grad-accent">perguntam primeiro</span>.
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
