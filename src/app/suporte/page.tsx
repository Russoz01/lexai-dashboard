import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Mail,
  MessageCircle,
  Phone,
  Clock,
  ShieldCheck,
  ArrowRight,
  CreditCard,
  RefreshCw,
  XCircle,
  AlertTriangle,
  FileText,
  Activity,
} from 'lucide-react'
import { AmbientMesh } from '@/components/ui/ambient-mesh'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SITE_URL } from '@/lib/site-url'

/* ═════════════════════════════════════════════════════════════
 * /suporte — Customer Support page
 * ─────────────────────────────────────────────────────────────
 * Audit elite v4 (2026-05-03): Stripe exige customer support URL
 * publica com canais de contato + politica de reembolso + endereco.
 * Padrao Noir Atelier (paridade com /sobre + /not-found).
 *
 * Stripe customer support requirements cobertos:
 *  - Email + telefone + WhatsApp visiveis
 *  - Horario de atendimento explicito
 *  - SLA por categoria (resposta em N horas)
 *  - Politica de reembolso (Stripe MUST)
 *  - Como cancelar assinatura
 *  - Endereco fiscal + jurisdicao
 *  - Links pra Privacy/Terms/DPA/Status
 *  - JSON-LD ContactPage schema (verificacao automatica Google)
 * ═════════════════════════════════════════════════════════════ */

export const metadata: Metadata = {
  title: 'Suporte · Pralvex',
  description:
    'Atendimento Pralvex — email contato@pralvex.com.br, telefone (16) 99293-0299, WhatsApp (34) 99302-6456. Resposta em ate 4h uteis. Politica de reembolso, cancelamento e SLA por categoria.',
  alternates: { canonical: `${SITE_URL}/suporte` },
  openGraph: {
    title: 'Suporte · Pralvex',
    description:
      'Atendimento direto: email, telefone e WhatsApp. Resposta em 4h uteis. Politica de reembolso transparente.',
    url: `${SITE_URL}/suporte`,
    type: 'website',
  },
  robots: { index: true, follow: true },
}

const contactChannels = [
  {
    Icon: Mail,
    label: 'Email',
    primary: 'contato@pralvex.com.br',
    href: 'mailto:contato@pralvex.com.br',
    sla: 'Resposta em ate 4h uteis',
    note: 'Canal principal pra assinaturas, faturas, reembolsos e duvidas tecnicas',
  },
  {
    Icon: MessageCircle,
    label: 'WhatsApp',
    primary: '(34) 99302-6456',
    href: 'https://wa.me/5534993026456?text=Ola%2C%20preciso%20de%20suporte%20Pralvex',
    sla: 'Resposta em ate 1h uteis',
    note: 'Pra urgencias durante horario comercial — bug critico, conta suspensa',
  },
  {
    Icon: Phone,
    label: 'Telefone',
    primary: '(16) 99293-0299',
    href: 'tel:+5516992930299',
    sla: 'Atendimento direto · seg-sex 09h-18h',
    note: 'Use WhatsApp se preferir registro escrito do atendimento',
  },
] as const

const slaTiers = [
  {
    Icon: AlertTriangle,
    severity: 'P0 critico',
    color: '#ef4444',
    desc: 'Sistema fora, login impossivel, cobranca incorreta',
    response: '1h util',
    resolution: '4h uteis',
  },
  {
    Icon: AlertTriangle,
    severity: 'P1 alto',
    color: '#f59e0b',
    desc: 'Agente travando, documento nao processa, integracao quebrada',
    response: '4h uteis',
    resolution: '24h uteis',
  },
  {
    Icon: Activity,
    severity: 'P2 medio',
    color: '#bfa68e',
    desc: 'Duvida de uso, ajuste de conta, melhorias',
    response: '24h uteis',
    resolution: '72h uteis',
  },
  {
    Icon: FileText,
    severity: 'P3 baixo',
    color: '#64748b',
    desc: 'Sugestao, feedback, integracao planejada',
    response: '72h uteis',
    resolution: 'Roadmap publico',
  },
] as const

const faqItems = [
  {
    Icon: CreditCard,
    q: 'Como cancelo minha assinatura?',
    a: 'Vai em Configuracoes > Pagamento no dashboard, clica em "Cancelar assinatura" e responde a pesquisa de motivo. Acesso permanece ativo ate o fim do periodo ja pago — sem multa, sem fidelidade. Tambem pode pedir cancelamento por email contato@pralvex.com.br.',
  },
  {
    Icon: RefreshCw,
    q: 'Como funciona o reembolso?',
    a: 'Reembolso integral em 7 dias corridos a partir da primeira cobranca de qualquer plano (Solo/Escritorio/Firma/Enterprise) — Codigo de Defesa do Consumidor Art. 49 (direito de arrependimento). Apos 7 dias, reembolso pro-rata so em casos de falha sistemica documentada. Solicitacao por email contato@pralvex.com.br com numero da fatura — devolucao no mesmo metodo de pagamento em ate 14 dias uteis.',
  },
  {
    Icon: XCircle,
    q: 'Cancelei mas continuo sendo cobrado',
    a: 'Verifica primeiro Configuracoes > Pagamento se status mostra "Cancelado". Se mostra "Ativo", o cancelamento nao foi processado — tenta novamente ou abre WhatsApp pra resolvermos na hora. Cobrancas indevidas sao estornadas integralmente em ate 5 dias uteis apos confirmacao.',
  },
  {
    Icon: ShieldCheck,
    q: 'Meus dados de cliente estao seguros?',
    a: 'Sim. Pralvex cumpre LGPD (Lei 13.709/2018) — dados criptografados em repouso (AES-256) e em transito (TLS 1.3), isolamento por tenant via RLS Postgres, nunca usados pra treinar modelos publicos. Voce pode exportar ou excluir tudo a qualquer momento via Configuracoes > Privacidade. DPA disponivel pra Enterprise mediante solicitacao.',
  },
  {
    Icon: AlertTriangle,
    q: 'O agente travou ou deu erro',
    a: 'Em geral, problemas de IA sao temporarios — Anthropic (provedor de IA) tem 99.9% uptime mas pode haver picos. Recarrega a pagina ou abre outro agente. Se persistir, abre WhatsApp com print da tela e ID da sessao (canto inferior direito do dashboard). Latencia normal: Resumidor 30-60s, Pesquisador 60-90s, Redator 60-120s.',
  },
  {
    Icon: FileText,
    q: 'A IA inventou jurisprudencia',
    a: 'Reporta imediatamente — esse e nosso bug mais critico (P0). Cada agente e treinado pra negar resposta quando nao tem fonte rastreavel. Se voce viu citacao errada, tira print da resposta + envia por WhatsApp. Investigamos em ate 1h util e creditamos o uso na sua conta. Pralvex nunca cobra por output incorreto.',
  },
  {
    Icon: CreditCard,
    q: 'Preciso de nota fiscal',
    a: 'Pagamentos mensais geram NFS-e automatica em ate 5 dias uteis apos a cobranca, enviada pro email cadastrado. Pra ajustes de razao social, CNPJ ou destinatario diferente, escreve pra contato@pralvex.com.br com os dados antes do dia 25 de cada mes.',
  },
  {
    Icon: Activity,
    q: 'Status do sistema em tempo real',
    a: (
      <>
        Acompanha latencia, uptime e incidentes em{' '}
        <Link
          href="/status"
          className="font-medium text-[#bfa68e] underline-offset-4 transition hover:underline"
        >
          pralvex.com.br/status
        </Link>
        . Em caso de incidente declarado, comunicado por email vai pra todos os
        usuarios ativos no plano dentro de 30 minutos.
      </>
    ),
  },
] as const

const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Suporte Pralvex',
  url: `${SITE_URL}/suporte`,
  inLanguage: 'pt-BR',
  publisher: {
    '@type': 'Organization',
    name: 'Pralvex',
    url: SITE_URL,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'contato@pralvex.com.br',
        telephone: '+55-16-99293-0299',
        availableLanguage: ['Portuguese'],
        hoursAvailable: 'Mo-Fr 09:00-18:00 BRT',
        areaServed: 'BR',
      },
      {
        '@type': 'ContactPoint',
        contactType: 'billing support',
        email: 'contato@pralvex.com.br',
        availableLanguage: ['Portuguese'],
      },
    ],
  },
}

export default function SuportePage() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden surface-base">
      <AmbientMesh dust dustCount={6} intensity={0.45} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />

      <header className="lex-landing-nav-scrolled sticky top-0 z-40 flex items-center justify-between px-6 py-4 backdrop-blur-md md:px-10">
        <Link href="/" className="group flex items-center gap-2.5">
          <div
            className="relative flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#bfa68e]/[0.12] to-transparent overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-p.png"
              alt="Pralvex"
              className="size-6 object-contain"
              style={{ filter: 'drop-shadow(0 0 6px rgba(191,166,142,0.35))' }}
            />
          </div>
          <span
            className="font-serif text-[15px] tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Pralvex
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/sobre" className="text-on-surface-muted transition hover:text-on-surface">
            Sobre
          </Link>
          <Link
            href="/empresas"
            className="hidden text-on-surface-muted transition hover:text-on-surface sm:inline"
          >
            Empresas
          </Link>
          <ThemeToggle variant="landing" />
          <Link
            href="/login"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--hover)',
              color: 'var(--text-primary)',
            }}
            className="rounded-full border px-4 py-1.5 text-sm transition hover:border-[#bfa68e]/40"
          >
            Entrar
          </Link>
        </nav>
      </header>

      <main id="main-content" className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        {/* Editorial serial */}
        <div className="mb-6 font-mono text-[0.65rem] uppercase tracking-[0.28em] text-[#bfa68e]">
          Nº 008 · Suporte · MMXXVI
        </div>

        {/* Hero */}
        <h1 className="text-balance text-4xl font-light leading-[1.08] tracking-tight text-on-surface sm:text-5xl md:text-[3.5rem]">
          Atendimento{' '}
          <em className="text-grad-accent italic">direto</em>, sem fila
          <br />
          de protocolo.
        </h1>

        <p className="mt-8 text-base leading-relaxed text-on-surface-muted md:text-lg">
          Email, WhatsApp ou telefone — voce escolhe. Resposta de bug critico em
          1h util, duvida de uso em 4h. Sem chatbot intermediando, sem ticket
          esperando 5 dias. Atendimento por engenheiro ou operador juridico que
          conhece o produto.
        </p>

        {/* Canais de contato */}
        <div className="my-14 h-px w-full" style={{ background: 'linear-gradient(to right, transparent, var(--border), transparent)' }} />

        <h2 className="mb-8 text-2xl font-medium tracking-tight text-on-surface md:text-3xl">
          Tres canais
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {contactChannels.map((c) => {
            const Icon = c.Icon
            return (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:border-[#bfa68e]/35"
                style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
              >
                <div className="flex size-10 items-center justify-center rounded-lg border border-[#bfa68e]/25 bg-gradient-to-br from-[#bfa68e]/[0.14] to-transparent text-[#e6d4bd]">
                  <Icon size={17} strokeWidth={1.75} />
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#bfa68e]/80">
                    {c.label}
                  </div>
                  <div className="mt-1.5 text-[14px] font-medium text-on-surface">
                    {c.primary}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-[#bfa68e]">
                    <Clock size={11} strokeWidth={2} />
                    {c.sla}
                  </div>
                  <p className="mt-3 text-[12px] leading-relaxed text-on-surface-muted">
                    {c.note}
                  </p>
                </div>
                <ArrowRight
                  size={13}
                  strokeWidth={2}
                  className="absolute right-4 top-4 text-on-surface-muted transition-all group-hover:translate-x-0.5 group-hover:text-[#bfa68e]"
                />
              </a>
            )
          })}
        </div>

        {/* Horario */}
        <div
          className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border px-5 py-4"
          style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
        >
          <Clock size={14} strokeWidth={1.75} className="text-[#bfa68e]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-on-surface-muted">
            Horario comercial
          </span>
          <span className="text-[13px] text-on-surface">
            Seg-Sex · 09h-18h BRT (UTC-3)
          </span>
          <span style={{ color: 'var(--text-muted)', opacity: 0.4 }}>·</span>
          <span className="text-[12px] text-on-surface-muted">
            Fora do horario, email recebido e respondido no proximo dia util ate 11h
          </span>
        </div>

        {/* SLAs */}
        <div className="my-14 h-px w-full" style={{ background: 'linear-gradient(to right, transparent, var(--border), transparent)' }} />

        <h2 className="mb-2 text-2xl font-medium tracking-tight text-on-surface md:text-3xl">
          SLA por severidade
        </h2>
        <p className="mb-8 text-[14px] leading-relaxed text-on-surface-muted">
          Tempos validos pra contas com assinatura ativa. Trial gratuito tem
          atendimento best-effort.
        </p>
        <ul className="overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}>
          {slaTiers.map((s, i) => {
            const Icon = s.Icon
            return (
              <li
                key={s.severity}
                className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-5 ${i < slaTiers.length - 1 ? 'border-b' : ''}`}
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-3 sm:w-44">
                  <div
                    className="flex size-7 items-center justify-center rounded-md"
                    style={{ background: `${s.color}1a`, color: s.color }}
                  >
                    <Icon size={13} strokeWidth={2} />
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-on-surface">
                    {s.severity}
                  </span>
                </div>
                <p className="flex-1 text-[13px] leading-relaxed text-on-surface-muted">
                  {s.desc}
                </p>
                <div className="flex gap-4 sm:w-52 sm:justify-end">
                  <div className="text-right">
                    <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-on-surface-muted">
                      Resposta
                    </div>
                    <div className="text-[12px] font-medium text-on-surface">
                      {s.response}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-on-surface-muted">
                      Resolucao
                    </div>
                    <div className="text-[12px] font-medium text-[#bfa68e]">
                      {s.resolution}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        {/* Politica de reembolso */}
        <div className="my-14 h-px w-full" style={{ background: 'linear-gradient(to right, transparent, var(--border), transparent)' }} />

        <div className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.28em] text-[#bfa68e]">
          Nº 008/I · Reembolso e cancelamento
        </div>
        <h2 className="mb-6 text-2xl font-medium tracking-tight text-on-surface md:text-3xl">
          Politica de reembolso
        </h2>
        <div
          className="rounded-2xl border p-6 md:p-8"
          style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
        >
          <ul className="space-y-4 text-[14px] leading-relaxed text-on-surface-muted">
            <li className="flex gap-3">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#bfa68e]/60" />
              <span>
                <strong className="text-on-surface">7 dias de arrependimento</strong> —
                reembolso integral em qualquer plano, contado da primeira cobranca.
                Garantia legal CDC Art. 49 (Lei 8.078/1990).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#bfa68e]/60" />
              <span>
                <strong className="text-on-surface">Apos 7 dias</strong> — reembolso
                pro-rata em caso de falha sistemica documentada (downtime &gt; 4h
                consecutivas, bug critico que impede uso, cobranca duplicada).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#bfa68e]/60" />
              <span>
                <strong className="text-on-surface">Cancelamento</strong> — sem
                multa, sem fidelidade, sem burocracia. Acesso permanece ativo ate
                o fim do periodo ja pago. Cancela via Configuracoes &gt; Pagamento ou
                solicita por email contato@pralvex.com.br.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#bfa68e]/60" />
              <span>
                <strong className="text-on-surface">Devolucao</strong> — feita no
                mesmo metodo do pagamento original (cartao de credito, PIX, boleto)
                em ate 14 dias uteis apos aprovacao. Em cartao, prazo da bandeira
                pode adicionar 1-2 ciclos de fatura.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#bfa68e]/60" />
              <span>
                <strong className="text-on-surface">Solicitacao</strong> — email
                pra contato@pralvex.com.br com numero da fatura ou ID da assinatura
                (ambos visiveis em Configuracoes &gt; Pagamento &gt; Historico).
                Confirmacao em ate 24h uteis.
              </span>
            </li>
          </ul>
        </div>

        {/* FAQ */}
        <div className="my-14 h-px w-full" style={{ background: 'linear-gradient(to right, transparent, var(--border), transparent)' }} />

        <h2 className="mb-8 text-2xl font-medium tracking-tight text-on-surface md:text-3xl">
          Perguntas frequentes
        </h2>
        <div className="space-y-3">
          {faqItems.map((item, i) => {
            const Icon = item.Icon
            return (
              <details
                key={i}
                className="group rounded-xl border transition hover:border-[#bfa68e]/30"
                style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-[#bfa68e]/25 bg-gradient-to-br from-[#bfa68e]/[0.12] to-transparent text-[#bfa68e]">
                    <Icon size={13} strokeWidth={1.75} />
                  </div>
                  <span className="flex-1 text-[14px] font-medium text-on-surface">
                    {item.q}
                  </span>
                  <ArrowRight
                    size={13}
                    strokeWidth={2}
                    className="text-on-surface-muted transition-transform group-open:rotate-90"
                  />
                </summary>
                <div className="border-t px-5 py-4 text-[13.5px] leading-relaxed text-on-surface-muted" style={{ borderColor: 'var(--border)' }}>
                  {item.a}
                </div>
              </details>
            )
          })}
        </div>

        {/* Endereco e jurisdicao */}
        <div className="my-14 h-px w-full" style={{ background: 'linear-gradient(to right, transparent, var(--border), transparent)' }} />

        <h2 className="mb-6 text-2xl font-medium tracking-tight text-on-surface md:text-3xl">
          Endereco e jurisdicao
        </h2>
        <div
          className="grid gap-4 rounded-2xl border p-6 sm:grid-cols-2"
          style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
        >
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#bfa68e]/80">
              Endereco fiscal
            </div>
            <div className="mt-2 text-[13.5px] leading-relaxed text-on-surface">
              Pralvex
              <br />
              Ituverava · Sao Paulo · Brasil
              <br />
              CEP 14500-000
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#bfa68e]/80">
              Jurisdicao
            </div>
            <div className="mt-2 text-[13.5px] leading-relaxed text-on-surface">
              Foro da comarca de Ituverava-SP
              <br />
              Lei brasileira (LGPD, CDC, Marco Civil)
              <br />
              Resolucao consensual antes de judicial
            </div>
          </div>
        </div>

        {/* Documentos legais */}
        <div className="my-14 h-px w-full" style={{ background: 'linear-gradient(to right, transparent, var(--border), transparent)' }} />

        <h2 className="mb-6 text-2xl font-medium tracking-tight text-on-surface md:text-3xl">
          Documentos relacionados
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { href: '/privacidade', label: 'Politica de Privacidade', desc: 'LGPD Art. 9 e direitos do titular' },
            { href: '/termos', label: 'Termos de Uso', desc: 'Condicoes contratuais e SLA' },
            { href: '/dpa', label: 'Data Processing Agreement', desc: 'Contrato de processamento de dados (Enterprise)' },
            { href: '/status', label: 'Status do Sistema', desc: 'Uptime, latencia e incidentes em tempo real' },
          ].map((doc) => (
            <Link
              key={doc.href}
              href={doc.href}
              className="group flex items-center justify-between rounded-xl border px-5 py-4 transition hover:border-[#bfa68e]/35 hover:bg-[#bfa68e]/[0.04]"
              style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}
            >
              <div>
                <div className="text-[13.5px] font-medium text-on-surface">{doc.label}</div>
                <div className="mt-0.5 text-[12px] text-on-surface-muted">{doc.desc}</div>
              </div>
              <ArrowRight
                size={13}
                strokeWidth={2}
                className="text-on-surface-muted transition-all group-hover:translate-x-0.5 group-hover:text-[#bfa68e]"
              />
            </Link>
          ))}
        </div>

        {/* Footer atelier */}
        <div
          className="mt-16 flex flex-wrap items-center justify-center gap-4 border-t pt-8 font-mono text-[11px] uppercase tracking-[0.22em]"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          <span>Pralvex · MMXXVI</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <Link href="/" className="transition hover:text-[#bfa68e]">
            Voltar ao inicio
          </Link>
        </div>
      </main>
    </div>
  )
}
