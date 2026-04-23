'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Shield, FileText, Lock, Server, Users, Bell,
  Scale, Download, Mail, CheckCircle2, ArrowUpRight,
  type LucideIcon,
} from 'lucide-react'

/* ════════════════════════════════════════════════════════════════
 * /dpa — Data Processing Agreement (v10.8 · 2026-04-22)
 * ────────────────────────────────────────────────────────────────
 * Contrato de Processamento de Dados em conformidade com a LGPD
 * (Lei 13.709/2018). Texto editorial com clausulas padrao + CTA
 * de download PDF + assinatura digital via email.
 * ═══════════════════════════════════════════════════════════════ */

type Section = {
  n: string
  slug: string
  title: string
  Icon: LucideIcon
  body: React.ReactNode
}

const SUB_PROCESSORS = [
  { name: 'Supabase Inc.',     country: 'EUA', purpose: 'Banco de dados + autenticacao', safeguard: 'Standard Contractual Clauses' },
  { name: 'Vercel Inc.',       country: 'EUA', purpose: 'Hospedagem edge + CDN',          safeguard: 'SCC + ISO 27001' },
  { name: 'Anthropic PBC',     country: 'EUA', purpose: 'Modelo de linguagem (Claude)',   safeguard: 'Zero-retention agreement' },
  { name: 'Stripe Inc.',       country: 'EUA', purpose: 'Processamento de pagamento',     safeguard: 'PCI DSS Level 1 + SCC' },
  { name: 'Resend Inc.',       country: 'EUA', purpose: 'Emails transacionais',            safeguard: 'SCC + SOC 2 Type II' },
  { name: 'Cloudflare Inc.',   country: 'EUA', purpose: 'Proxy + DDoS protection',          safeguard: 'SCC + ISO 27001' },
]

const SECURITY_MEASURES = [
  { Icon: Lock,    title: 'Criptografia em repouso', desc: 'AES-256 em todo dado persistido (database, storage, backup)' },
  { Icon: Shield,  title: 'Criptografia em transito', desc: 'TLS 1.3 obrigatorio · HSTS · rating A+ no SSLLabs' },
  { Icon: Users,   title: 'Controle de acesso',       desc: 'MFA, SSO, RLS por usuario, audit log de todo acesso admin' },
  { Icon: Server,  title: 'Residencia de dados',      desc: 'Banco primario em sa-east-1 (Sao Paulo) · replica em us-east-1' },
  { Icon: Bell,    title: 'Deteccao de intrusao',     desc: 'Sentry + PostHog + alerta em webhook < 60s de latencia' },
  { Icon: Scale,   title: 'LGPD + ISO 27001',          desc: 'DPO nomeado · ROPA publico · auditoria externa anual' },
]

const SECTIONS: Section[] = [
  {
    n: 'I',
    slug: 'objeto',
    title: 'Objeto do contrato',
    Icon: FileText,
    body: (
      <>
        <p>
          Este Data Processing Agreement (&ldquo;DPA&rdquo;) regula o tratamento de
          dados pessoais realizado pela <strong>Pralvex</strong> (&ldquo;Operadora&rdquo;)
          quando voce (&ldquo;Controladora&rdquo;) contrata a plataforma LexAI para
          apoiar sua atividade de advocacia.
        </p>
        <p>
          O DPA e parte integrante dos Termos de Uso e se aplica automaticamente
          desde o primeiro login. Voce pode solicitar uma copia assinada por email.
        </p>
        <p>
          A LGPD (Lei 13.709/18) e o marco regulatorio principal. Para clientes
          com operacao na UE, aplicam-se tambem GDPR e Standard Contractual Clauses
          (SCC decisao 2021/914).
        </p>
      </>
    ),
  },
  {
    n: 'II',
    slug: 'papeis',
    title: 'Papeis e responsabilidades',
    Icon: Users,
    body: (
      <>
        <p>
          <strong>Voce e a Controladora</strong>: decide quais dados pessoais inserir
          na plataforma, a finalidade do tratamento e o tempo de retencao.
        </p>
        <p>
          <strong>A LexAI/Pralvex e a Operadora</strong>: processa os dados
          exclusivamente conforme instrucao sua, nao utiliza para treinar modelos
          proprios ou de terceiros, e nao revende ou compartilha para marketing.
        </p>
        <p>
          <strong>DPO nomeado</strong>: Leonardo Luiz Fernando, Pralvex,
          contato em <a href="mailto:dpo@vanixcorp.com" className="text-[#bfa68e] underline decoration-[#bfa68e]/40 underline-offset-2 hover:decoration-[#bfa68e]">dpo@vanixcorp.com</a>.
          Responde em 15 dias corridos a qualquer solicitacao LGPD art. 18.
        </p>
      </>
    ),
  },
  {
    n: 'III',
    slug: 'dados',
    title: 'Categorias de dados tratados',
    Icon: FileText,
    body: (
      <>
        <p>Lista nao-exaustiva do que a plataforma processa:</p>
        <ul className="mt-4 space-y-2 pl-5">
          <li className="relative pl-4 before:absolute before:left-0 before:top-[10px] before:h-1 before:w-1.5 before:bg-[#bfa68e]">
            <strong className="text-white">Cadastrais da Controladora</strong>: nome, CPF, OAB, email, telefone, endereco profissional.
          </li>
          <li className="relative pl-4 before:absolute before:left-0 before:top-[10px] before:h-1 before:w-1.5 before:bg-[#bfa68e]">
            <strong className="text-white">Conteudo gerado pela Controladora</strong>: prompts, peticoes, contratos, pareceres, calculos, historico de interacoes.
          </li>
          <li className="relative pl-4 before:absolute before:left-0 before:top-[10px] before:h-1 before:w-1.5 before:bg-[#bfa68e]">
            <strong className="text-white">Dados de terceiros inseridos pela Controladora</strong>: clientes do escritorio, partes contrarias, testemunhas, processos. <em className="text-[#bfa68e]">Voce permanece a Controladora desses dados.</em>
          </li>
          <li className="relative pl-4 before:absolute before:left-0 before:top-[10px] before:h-1 before:w-1.5 before:bg-[#bfa68e]">
            <strong className="text-white">Tecnicos</strong>: IP, user-agent, timestamp, pais de acesso, device, latencia de requisicao.
          </li>
          <li className="relative pl-4 before:absolute before:left-0 before:top-[10px] before:h-1 before:w-1.5 before:bg-[#bfa68e]">
            <strong className="text-white">Pagamento</strong>: processado por Stripe sob PCI DSS. LexAI nao armazena numero de cartao, apenas token opaco.
          </li>
        </ul>
      </>
    ),
  },
  {
    n: 'IV',
    slug: 'seguranca',
    title: 'Medidas tecnicas e organizacionais',
    Icon: Shield,
    body: (
      <>
        <p>
          A LexAI mantem controles tecnicos compativeis com ISO 27001 e Provimento
          205 da OAB:
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {SECURITY_MEASURES.map(m => (
            <div
              key={m.title}
              className="flex items-start gap-3 rounded-xl border border-[#bfa68e]/12 bg-[#bfa68e]/[0.03] p-4"
            >
              <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg border border-[#bfa68e]/25 bg-[#bfa68e]/[0.08] text-[#e6d4bd]">
                <m.Icon className="size-4" strokeWidth={1.6} />
              </div>
              <div>
                <div className="text-[13.5px] font-medium text-white">{m.title}</div>
                <div className="mt-0.5 text-[12px] text-white/55">{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    n: 'V',
    slug: 'sub-operadores',
    title: 'Sub-operadores autorizados',
    Icon: Server,
    body: (
      <>
        <p>
          A LexAI usa os seguintes sub-operadores para entregar o servico. Qualquer
          alteracao nesta lista e comunicada com 30 dias de antecedencia.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-[#bfa68e]/15 text-[10px] uppercase tracking-[0.2em] text-[#bfa68e]/80">
                <th className="pb-3 pr-4 font-mono font-semibold">Sub-operador</th>
                <th className="pb-3 pr-4 font-mono font-semibold">Pais</th>
                <th className="pb-3 pr-4 font-mono font-semibold">Finalidade</th>
                <th className="pb-3 font-mono font-semibold">Salvaguarda</th>
              </tr>
            </thead>
            <tbody className="text-white/70">
              {SUB_PROCESSORS.map(s => (
                <tr key={s.name} className="border-b border-white/5">
                  <td className="py-3 pr-4 font-medium text-white">{s.name}</td>
                  <td className="py-3 pr-4 text-white/55">{s.country}</td>
                  <td className="py-3 pr-4">{s.purpose}</td>
                  <td className="py-3 text-[12px] text-[#bfa68e]/85">{s.safeguard}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[13px] text-white/55">
          <strong className="text-white/75">Importante:</strong> a LexAI nunca envia
          o conteudo de peticoes/pareceres para treinar modelos de terceiros. O
          acordo zero-retention com a Anthropic garante que prompts sao deletados
          em no maximo 30 dias apos processamento.
        </p>
      </>
    ),
  },
  {
    n: 'VI',
    slug: 'direitos',
    title: 'Direitos do titular e da Controladora',
    Icon: Scale,
    body: (
      <>
        <p>
          A LGPD art. 18 garante aos titulares de dados o direito de:
        </p>
        <div className="mt-4 space-y-2 text-[14px] leading-[1.7] text-white/70">
          {[
            'Confirmacao da existencia de tratamento',
            'Acesso aos dados',
            'Correcao de dados incompletos ou desatualizados',
            'Anonimizacao, bloqueio ou eliminacao de dados desnecessarios',
            'Portabilidade a outro fornecedor de servico',
            'Informacao sobre compartilhamento com terceiros',
            'Revogacao de consentimento',
            'Peticao perante a ANPD',
          ].map(d => (
            <div key={d} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 flex-shrink-0 text-[#bfa68e]" strokeWidth={1.8} />
              <span>{d}</span>
            </div>
          ))}
        </div>
        <p className="mt-5">
          Solicitacoes sao atendidas em <strong className="text-white">15 dias corridos</strong> por padrao,
          ou em ate 30 dias para casos que exijam analise juridica.
        </p>
      </>
    ),
  },
  {
    n: 'VII',
    slug: 'incidentes',
    title: 'Notificacao de incidentes',
    Icon: Bell,
    body: (
      <>
        <p>
          Em caso de incidente de seguranca que afete dados pessoais, a LexAI
          notifica a Controladora em ate <strong className="text-white">72 horas</strong> apos
          ciencia, contendo:
        </p>
        <ul className="mt-4 space-y-2 pl-5">
          <li className="relative pl-4 before:absolute before:left-0 before:top-[10px] before:h-1 before:w-1.5 before:bg-[#bfa68e]">
            Natureza do incidente e vetor de ataque
          </li>
          <li className="relative pl-4 before:absolute before:left-0 before:top-[10px] before:h-1 before:w-1.5 before:bg-[#bfa68e]">
            Categorias e quantidade aproximada de titulares afetados
          </li>
          <li className="relative pl-4 before:absolute before:left-0 before:top-[10px] before:h-1 before:w-1.5 before:bg-[#bfa68e]">
            Medidas adotadas para conter o incidente
          </li>
          <li className="relative pl-4 before:absolute before:left-0 before:top-[10px] before:h-1 before:w-1.5 before:bg-[#bfa68e]">
            Contato do DPO para informacoes adicionais
          </li>
        </ul>
        <p className="mt-5">
          Pos-mortem completo e publicado em{' '}
          <Link href="/status" className="text-[#bfa68e] underline decoration-[#bfa68e]/40 underline-offset-2 hover:decoration-[#bfa68e]">
            /status
          </Link>{' '}
          em ate 72h apos resolucao.
        </p>
      </>
    ),
  },
  {
    n: 'VIII',
    slug: 'encerramento',
    title: 'Encerramento e devolucao de dados',
    Icon: Download,
    body: (
      <>
        <p>
          Ao final do contrato (cancelamento, nao-renovacao ou rescisao), a
          Controladora pode solicitar:
        </p>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-[#bfa68e]/12 bg-[#bfa68e]/[0.03] p-4">
            <div className="mb-1 text-[13.5px] font-semibold text-white">
              Export completo em formato estruturado
            </div>
            <div className="text-[12.5px] text-white/60">
              JSON + PDF em ate 7 dias corridos. Inclui historico, peticoes, contratos e anexos.
            </div>
          </div>
          <div className="rounded-xl border border-[#bfa68e]/12 bg-[#bfa68e]/[0.03] p-4">
            <div className="mb-1 text-[13.5px] font-semibold text-white">
              Eliminacao completa
            </div>
            <div className="text-[12.5px] text-white/60">
              Dados primarios apagados em 30 dias. Backups em 90 dias. Logs de auditoria retidos por 5 anos conforme CPC art. 1.007-a.
            </div>
          </div>
        </div>
      </>
    ),
  },
]

export default function DpaClient() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white antialiased">
      {/* Ambient glow */}
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

      {/* Top bar */}
      <div className="relative mx-auto max-w-4xl px-6 pt-10">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-white/50 transition-colors hover:text-[#bfa68e]"
        >
          <ArrowLeft size={12} strokeWidth={1.8} className="transition-transform group-hover:-translate-x-0.5" />
          voltar ao site
        </Link>
      </div>

      {/* Hero */}
      <section className="relative mx-auto max-w-4xl px-6 pb-12 pt-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#bfa68e]/80">
            <span className="h-px w-8 bg-[#bfa68e]/40" />
            DPA · Data Processing Agreement · MMXXVI
          </div>
          <h1 className="font-serif text-[clamp(40px,5.5vw,66px)] leading-[1.05] tracking-tight">
            Contrato de
            <br />
            <em className="italic bg-gradient-to-r from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] bg-clip-text text-transparent">
              processamento de dados.
            </em>
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-[1.75] text-white/65">
            Voce e Controladora. A LexAI e Operadora. Este DPA formaliza essa
            relacao em conformidade com a LGPD (Lei 13.709/18) e, quando
            aplicavel, GDPR + Standard Contractual Clauses.
          </p>
        </motion.div>

        {/* Trust pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-8 flex flex-wrap gap-2"
        >
          {[
            { label: 'LGPD compliant',     icon: Shield },
            { label: 'ISO 27001 aligned',  icon: Lock },
            { label: 'Servidor em SP',     icon: Server },
            { label: 'Zero-retention IA',  icon: CheckCircle2 },
          ].map(p => (
            <div
              key={p.label}
              className="inline-flex items-center gap-2 rounded-full border border-[#bfa68e]/18 bg-[#bfa68e]/[0.04] px-3 py-1.5"
            >
              <p.icon className="size-3 text-[#bfa68e]" strokeWidth={1.8} />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
                {p.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Download CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
        >
          <a
            href="mailto:dpo@vanixcorp.com?subject=Solicitacao%20de%20copia%20assinada%20do%20DPA%20LexAI&body=Ola%20Leonardo%2C%0A%0AGostaria%20de%20receber%20uma%20copia%20assinada%20do%20DPA%20para%20o%20nosso%20escritorio.%0A%0ARazao%20social%3A%0ACNPJ%3A%0AEndereco%3A%0APessoa%20responsavel%3A%0A%0AObrigado."
            className="group inline-flex items-center gap-3 rounded-full border border-[#bfa68e]/40 bg-gradient-to-r from-[#f5e8d3] via-[#bfa68e] to-[#7a5f48] px-6 py-3 font-mono text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#0a0a0a] shadow-[0_10px_40px_rgba(191,166,142,0.28)] transition-all hover:shadow-[0_14px_56px_rgba(191,166,142,0.45)]"
          >
            <Download className="size-4" strokeWidth={2} />
            Solicitar copia assinada
          </a>
          <a
            href="mailto:dpo@vanixcorp.com"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-white/55 transition-colors hover:text-[#bfa68e]"
          >
            <Mail className="size-3" strokeWidth={1.8} />
            dpo@vanixcorp.com
          </a>
        </motion.div>
      </section>

      <div className="mx-auto h-px w-full max-w-4xl bg-gradient-to-r from-transparent via-[#bfa68e]/30 to-transparent" />

      {/* Sections */}
      <section className="relative mx-auto max-w-4xl px-6 py-16">
        <div className="space-y-16">
          {SECTIONS.map((s, i) => (
            <motion.article
              key={s.slug}
              id={s.slug}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: Math.min(i * 0.04, 0.2) }}
              className="scroll-mt-16"
            >
              <header className="mb-6 flex items-start gap-5">
                <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-xl border border-[#bfa68e]/25 bg-gradient-to-br from-[#bfa68e]/[0.12] to-[#bfa68e]/[0.02] text-[#e6d4bd] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_16px_rgba(191,166,142,0.12)]">
                  <s.Icon className="size-5" strokeWidth={1.6} />
                </div>
                <div>
                  <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-[#bfa68e]/80">
                    Clausula {s.n}
                  </div>
                  <h2 className="font-serif text-[26px] italic leading-[1.15] tracking-tight text-white md:text-[32px]">
                    {s.title}
                  </h2>
                </div>
              </header>
              <div className="space-y-4 text-[14.5px] leading-[1.75] text-white/70 md:ml-[68px]">
                {s.body}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Sign CTA */}
      <section className="relative mx-auto max-w-4xl px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-2xl border border-[#bfa68e]/20 bg-gradient-to-br from-[#bfa68e]/[0.08] via-transparent to-[#bfa68e]/[0.02] p-10 text-center md:p-14"
        >
          <div className="mb-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#bfa68e]/80">
            <Scale className="size-3" strokeWidth={1.8} />
            Duvida contratual
          </div>
          <h3 className="font-serif text-[28px] leading-[1.1] text-white md:text-[40px]">
            Quer DPA com <em className="italic text-[#e6d4bd]">sua propria clausula</em>?
          </h3>
          <p className="mx-auto mt-4 max-w-xl text-[14.5px] text-white/60">
            Enterprise aceita DPA customizado. Escritorios com operacao internacional
            tambem fecham contrato com GDPR + SCC. Escreva para o DPO.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="mailto:dpo@vanixcorp.com?subject=DPA%20customizado%20-%20escritorio%20X"
              className="group inline-flex items-center gap-3 rounded-full border border-[#bfa68e]/40 bg-gradient-to-r from-[#f5e8d3] via-[#bfa68e] to-[#7a5f48] px-7 py-3 font-mono text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#0a0a0a] shadow-[0_10px_40px_rgba(191,166,142,0.28)] transition-all hover:shadow-[0_14px_56px_rgba(191,166,142,0.45)]"
            >
              Falar com o DPO
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.2} />
            </a>
            <Link
              href="/privacidade"
              className="font-mono text-[12px] uppercase tracking-[0.3em] text-white/55 transition-colors hover:text-[#bfa68e]"
            >
              Ver Politica de Privacidade
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
