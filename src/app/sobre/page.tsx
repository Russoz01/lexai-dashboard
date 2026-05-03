'use client'

import Link from 'next/link'
import { WhatsAppFloat } from '@/components/WhatsAppFloat'
import { ArrowRight } from 'lucide-react'
import { AmbientMesh } from '@/components/ui/ambient-mesh'
import { ScrollProgress } from '@/components/ui/scroll-progress'
import { ThemeToggle } from '@/components/ThemeToggle'

/* ═════════════════════════════════════════════════════════════
 * /sobre — página institucional (migrado para Tailwind em 2026-04-17)
 * ─────────────────────────────────────────────────────────────
 * Parte do Pass 1 da migração CSS Modules → Tailwind.
 * Paleta Noir Atelier: #bfa68e champagne + neutral-950 + white/10 borders.
 * Sem scroll reveal complexo — página curta, conteúdo estático.
 * ═════════════════════════════════════════════════════════════ */

const pillars = [
  {
    n: 'I',
    title: 'Precisão acima de viralidade',
    body: 'A Pralvex nunca inventa jurisprudência. Cada citação tem origem rastreável. Em produção jurídica, uma alucinação não é bug: é risco de sanção.',
  },
  {
    n: 'II',
    title: 'Construído por quem vive o caso',
    body: 'Prompt, interface e fluxo são desenhados com advogados militantes. Testamos cada agente em varas reais antes de liberar para o mercado.',
  },
  {
    n: 'III',
    title: 'LGPD sem asterisco',
    body: 'Processamos no Brasil quando possível. Nenhum dado do cliente treina modelo público. Retenção e direitos do titular atendem Art. 18 — exportação e exclusão em minutos.',
  },
  {
    n: 'IV',
    title: 'O escritório é o cliente',
    body: 'Não vendemos para departamentos jurídicos de banco. Não servimos tech bros. Servimos quem bate ponto em fórum, quem perde almoço por peça e quem ainda cobra honorário de sucesso.',
  },
]

export default function SobrePage() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden surface-base">
      <ScrollProgress />
      <AmbientMesh dust dustCount={8} intensity={0.5} />
      <header className="lex-landing-nav-scrolled sticky top-0 z-40 flex items-center justify-between px-6 py-4 backdrop-blur-md md:px-10">
        <Link href="/" className="group flex items-center gap-2.5">
          <div
            className="relative flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#bfa68e]/[0.12] to-transparent overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-p.png" alt="Pralvex" className="size-6 object-contain" style={{ filter: 'drop-shadow(0 0 6px rgba(191,166,142,0.35))' }} />
          </div>
          <span className="font-serif text-[15px] tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Pralvex
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/empresas" className="text-on-surface-muted transition hover:text-on-surface">
            Empresas
          </Link>
          <Link href="/roi" className="hidden text-on-surface-muted transition hover:text-on-surface sm:inline">
            Calculadora
          </Link>
          <ThemeToggle variant="landing" />
          <Link
            href="/login"
            style={{ borderColor: 'var(--border)', background: 'var(--hover)', color: 'var(--text-primary)' }}
            className="rounded-full border px-4 py-1.5 text-sm transition hover:border-[#bfa68e]/40"
          >
            Entrar
          </Link>
        </nav>
      </header>

      <main id="main-content" className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <div className="mb-6 font-mono text-[0.65rem] uppercase tracking-[0.28em] text-[#bfa68e]">
          Nº 005 · Sobre · MMXXVI
        </div>

        <h1 className="text-balance text-4xl font-light leading-[1.08] tracking-tight text-on-surface sm:text-5xl md:text-[3.5rem]">
          Construído por quem{' '}
          <em className="text-grad-accent italic">
            escreve peças
          </em>{' '}
          de verdade.
        </h1>

        <p className="mt-8 text-base leading-relaxed text-on-surface-muted md:text-lg">
          A Pralvex nasceu em 2026 com uma premissa desconfortável
          para a indústria de IA generalista: um modelo não treinado no Direito brasileiro
          não serve para advogado brasileiro. Não adianta empacotar Claude em uma
          interface bonita se o advogado precisa conferir cada citação.
        </p>
        <p className="mt-5 text-base leading-relaxed text-on-surface-muted md:text-lg">
          Nós escolhemos o caminho mais difícil: curar o corpus, calibrar o modelo,
          rastrear origem, e negar a resposta quando ela não puder ser sustentada.
          Temos cliente com medo de IA virando erro na OAB. Nosso trabalho é fazer
          a IA pedir socorro antes de mentir.
        </p>

        <div className="my-14 h-px w-full" style={{ background: 'linear-gradient(to right, transparent, var(--border), transparent)' }} />

        <h2 className="mb-8 text-2xl font-medium tracking-tight text-on-surface md:text-3xl">
          Quatro pilares não-negociáveis
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {pillars.map((p) => (
            <article
              key={p.n}
              className="group relative overflow-hidden rounded-2xl border border-on-surface p-6 transition hover:border-[#bfa68e]/30"
              style={{ background: 'var(--card-bg)' }}
            >
              <div className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-[#bfa68e]/80">
                {p.n}
              </div>
              <h3 className="mb-2 text-lg font-medium text-on-surface">{p.title}</h3>
              <p className="text-sm leading-relaxed text-on-surface-muted">{p.body}</p>
            </article>
          ))}
        </div>

        <div className="my-14 h-px w-full" style={{ background: 'linear-gradient(to right, transparent, var(--border), transparent)' }} />

        <div className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.28em] text-[#bfa68e]">
          Nº 005/I · Carta do sócio-gestor
        </div>
        <h2 className="mb-8 text-2xl font-medium tracking-tight text-on-surface md:text-3xl">
          Por que isso existe
        </h2>

        <figure className="relative mb-10 rounded-2xl border border-on-surface p-8 md:p-10" style={{ background: 'var(--card-bg)' }}>
          <div
            aria-hidden="true"
            className="absolute left-0 top-8 h-[calc(100%-4rem)] w-px bg-gradient-to-b from-transparent via-[#bfa68e]/60 to-transparent"
          />
          {/* Audit polish: pull-quote editorial — Playfair italic + champagne */}
          <span
            aria-hidden="true"
            className="mb-2 block font-serif text-5xl leading-none text-[#bfa68e]/40 md:text-6xl"
          >
            &ldquo;
          </span>
          <blockquote className="mb-6 -mt-4 text-balance font-serif text-2xl font-light italic leading-[1.25] text-[#e6d4bd] md:text-[2rem]">
            A gente construiu a Pralvex porque cansou de ver IA generalista inventar
            jurisprudência de madrugada e o advogado assinar sem conferir.
          </blockquote>

          <div className="space-y-4 text-[0.95rem] leading-relaxed text-on-surface-muted md:text-base">
            <p>
              Sou o Renato, sócio-gestor do produto. Advogo em contencioso desde
              2008, com pé em vara cível e de família no interior de Minas. O Leonardo
              é quem escreve o código. A gente responde pelo produto juntos — jurídico
              de um lado, engenharia do outro, sem intermediário.
            </p>
            <p>
              Quando ChatGPT invadiu nosso escritório em 2024, vi dois desfechos
              possíveis pra IA no Direito. O primeiro é o que já virou rotina: IA
              cita tribunal errado, relator inexistente, data inventada. O
              advogado confere na pressa, deixa passar, assina. Às vezes o juiz
              não pega. Outras vezes pega e vira representação na OAB.
            </p>
            <p>
              O segundo desfecho é mais lento, mais caro de construir, mas é o
              único que sustenta: IA que nega a resposta quando não tem fonte
              rastreável. Nada de marketing com &ldquo;100% de precisão&rdquo; — o modelo
              erra. Nosso trabalho é fazer ele pedir socorro antes de mentir.
            </p>
            <p>
              A Pralvex atende escritório médio — de 1 a 15 advogados. A gente não
              vende pra departamento jurídico de banco, não serve tech bro. Serve
              quem bate ponto em fórum, quem perde almoço por peça, quem ainda
              cobra honorário de sucesso. Se você já perdeu noite conferindo IA
              generalista, esse produto foi desenhado pra você.
            </p>
          </div>

          <figcaption className="mt-8 flex flex-col gap-1 border-t border-on-surface pt-5 font-mono text-[0.7rem] uppercase tracking-[0.22em]" style={{ color: 'var(--text-muted)' }}>
            <span className="text-on-surface-muted">— Renato, sócio-gestor</span>
            <span>Leonardo, engenheiro fundador</span>
            <span>Pralvex · MMXXVI</span>
          </figcaption>
        </figure>

        <div className="my-14 h-px w-full" style={{ background: 'linear-gradient(to right, transparent, var(--border), transparent)' }} />

        <h2 className="mb-6 text-2xl font-medium tracking-tight text-on-surface md:text-3xl">
          O time
        </h2>
        <p className="text-base leading-relaxed text-on-surface-muted md:text-lg">
          A <strong className="text-on-surface">Pralvex</strong> é um estúdio de software
          do interior de Minas. Trabalhamos em células pequenas: dois engenheiros,
          um designer, um operador jurídico em residência, uma diretora de
          conformidade. Sem vendedor, sem gerente de produto. Quem escreve a feature
          fala com quem usa.
        </p>
        <p className="mt-5 text-base leading-relaxed text-on-surface-muted md:text-lg">
          Nosso compromisso com o escritório médio: suporte por WhatsApp em menos
          de 4 horas úteis, resposta de bug crítico em 24h, e roadmap público que
          você ajuda a votar.
        </p>

        <div className="my-14 h-px w-full" style={{ background: 'linear-gradient(to right, transparent, var(--border), transparent)' }} />

        <h2 className="mb-6 text-2xl font-medium tracking-tight text-on-surface md:text-3xl">
          Como chegar na gente
        </h2>
        <ul className="overflow-hidden rounded-2xl border border-on-surface" style={{ background: 'var(--card-bg)' }}>
          <li className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--border)' }}>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em]" style={{ color: 'var(--text-muted)' }}>
              Comercial
            </span>
            <a
              href="https://wa.me/5534993026456"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-on-surface transition hover:text-[#bfa68e]"
            >
              +55 34 99302-6456
            </a>
          </li>
          <li className="flex items-center justify-between px-5 py-4">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em]" style={{ color: 'var(--text-muted)' }}>
              E-mail
            </span>
            <a
              href="mailto:contato@pralvex.com.br"
              className="text-sm text-on-surface transition hover:text-[#bfa68e]"
            >
              contato@pralvex.com.br
            </a>
          </li>
        </ul>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="press-scale group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] px-5 py-2.5 text-sm font-medium text-[#0a0807] shadow-[0_0_28px_rgba(191,166,142,0.25)] transition-editorial hover:shadow-[0_0_40px_rgba(191,166,142,0.5)]"
          >
            Demo 50 min grátis
            <ArrowRight size={14} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/roi"
            style={{ borderColor: 'var(--border)', background: 'var(--hover)', color: 'var(--text-secondary)' }}
            className="press-scale inline-flex items-center rounded-full border px-5 py-2.5 text-sm backdrop-blur transition-editorial hover:border-[#bfa68e]/40 hover:text-on-surface"
          >
            Calcular ROI
          </Link>
        </div>

        <footer className="mt-20 flex flex-col items-start justify-between gap-3 border-t border-on-surface pt-6 font-mono text-[0.7rem] uppercase tracking-[0.2em] sm:flex-row sm:items-center" style={{ color: 'var(--text-muted)' }}>
          <span>© MMXXVI Pralvex</span>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacidade" className="transition hover:text-on-surface">
              Privacidade
            </Link>
            <Link href="/termos" className="transition hover:text-on-surface">
              Termos
            </Link>
            <a href="tel:+5534993026456" className="text-[#bfa68e]/80 transition hover:text-[#e6d4bd]">
              (34) 99302-6456
            </a>
          </div>
        </footer>
      </main>

      <WhatsAppFloat message="Olá! Conheci a Pralvex pela página Sobre e gostaria de saber mais." />
    </div>
  )
}
