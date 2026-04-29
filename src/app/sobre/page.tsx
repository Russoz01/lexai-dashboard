'use client'

import Link from 'next/link'
import { WhatsAppFloat } from '@/components/WhatsAppFloat'
import { ArrowRight } from 'lucide-react'
import { AmbientMesh } from '@/components/ui/ambient-mesh'
import { ScrollProgress } from '@/components/ui/scroll-progress'

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
    <div className="relative isolate min-h-screen overflow-hidden bg-black text-white antialiased">
      <ScrollProgress />
      <AmbientMesh dust dustCount={8} intensity={0.5} />
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-black/70 px-6 py-4 backdrop-blur-md md:px-10">
        <Link href="/" className="font-mono text-sm uppercase tracking-[0.3em] text-white">
          Pralvex
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/empresas" className="text-white/60 transition hover:text-white">
            Empresas
          </Link>
          <Link href="/roi" className="hidden text-white/60 transition hover:text-white sm:inline">
            Calculadora
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white transition hover:border-[#bfa68e]/40 hover:bg-white/10"
          >
            Entrar
          </Link>
        </nav>
      </header>

      <main id="main-content" className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <div className="mb-6 font-mono text-[0.65rem] uppercase tracking-[0.28em] text-[#bfa68e]">
          Nº 005 · Sobre · MMXXVI
        </div>

        <h1 className="text-balance text-4xl font-light leading-[1.08] tracking-tight text-white sm:text-5xl md:text-[3.5rem]">
          Construído por quem{' '}
          <em className="bg-gradient-to-r from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] bg-clip-text italic text-transparent">
            escreve peças
          </em>{' '}
          de verdade.
        </h1>

        <p className="mt-8 text-base leading-relaxed text-white/70 md:text-lg">
          A Pralvex nasceu em 2026 com uma premissa desconfortável
          para a indústria de IA generalista: um modelo não treinado no Direito brasileiro
          não serve para advogado brasileiro. Não adianta empacotar Claude em uma
          interface bonita se o advogado precisa conferir cada citação.
        </p>
        <p className="mt-5 text-base leading-relaxed text-white/70 md:text-lg">
          Nós escolhemos o caminho mais difícil: curar o corpus, calibrar o modelo,
          rastrear origem, e negar a resposta quando ela não puder ser sustentada.
          Temos cliente com medo de IA virando erro na OAB. Nosso trabalho é fazer
          a IA pedir socorro antes de mentir.
        </p>

        <div className="my-14 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <h2 className="mb-8 text-2xl font-medium tracking-tight text-white md:text-3xl">
          Quatro pilares não-negociáveis
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {pillars.map((p) => (
            <article
              key={p.n}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-6 transition hover:border-[#bfa68e]/30"
            >
              <div className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-[#bfa68e]/80">
                {p.n}
              </div>
              <h3 className="mb-2 text-lg font-medium text-white">{p.title}</h3>
              <p className="text-sm leading-relaxed text-white/60">{p.body}</p>
            </article>
          ))}
        </div>

        <div className="my-14 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.28em] text-[#bfa68e]">
          Nº 005/I · Carta do sócio-gestor
        </div>
        <h2 className="mb-8 text-2xl font-medium tracking-tight text-white md:text-3xl">
          Por que isso existe
        </h2>

        <figure className="relative mb-10 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-8 md:p-10">
          <div
            aria-hidden="true"
            className="absolute left-0 top-8 h-[calc(100%-4rem)] w-px bg-gradient-to-b from-transparent via-[#bfa68e]/60 to-transparent"
          />
          <blockquote className="mb-6 text-balance text-xl font-light italic leading-[1.35] text-white/90 md:text-2xl">
            &ldquo;A gente construiu a Pralvex porque cansou de ver IA generalista inventar
            jurisprudência de madrugada e o advogado assinar sem conferir.&rdquo;
          </blockquote>

          <div className="space-y-4 text-[0.95rem] leading-relaxed text-white/70 md:text-base">
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

          <figcaption className="mt-8 flex flex-col gap-1 border-t border-white/10 pt-5 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-white/50">
            <span className="text-white/75">— Renato, sócio-gestor</span>
            <span>Leonardo, engenheiro fundador</span>
            <span>Pralvex · MMXXVI</span>
          </figcaption>
        </figure>

        <div className="my-14 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <h2 className="mb-6 text-2xl font-medium tracking-tight text-white md:text-3xl">
          O time
        </h2>
        <p className="text-base leading-relaxed text-white/70 md:text-lg">
          A <strong className="text-white">Pralvex</strong> é um estúdio de software
          do interior de Minas. Trabalhamos em células pequenas: dois engenheiros,
          um designer, um operador jurídico em residência, uma diretora de
          conformidade. Sem vendedor, sem gerente de produto. Quem escreve a feature
          fala com quem usa.
        </p>
        <p className="mt-5 text-base leading-relaxed text-white/70 md:text-lg">
          Nosso compromisso com o escritório médio: suporte por WhatsApp em menos
          de 4 horas úteis, resposta de bug crítico em 24h, e roadmap público que
          você ajuda a votar.
        </p>

        <div className="my-14 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <h2 className="mb-6 text-2xl font-medium tracking-tight text-white md:text-3xl">
          Como chegar na gente
        </h2>
        <ul className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <li className="flex items-center justify-between px-5 py-4">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-white/50">
              Comercial
            </span>
            <a
              href="https://wa.me/5534993026456"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white transition hover:text-[#bfa68e]"
            >
              +55 34 99302-6456
            </a>
          </li>
          <li className="flex items-center justify-between px-5 py-4">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-white/50">
              E-mail
            </span>
            <a
              href="mailto:contato@pralvex.com"
              className="text-sm text-white transition hover:text-[#bfa68e]"
            >
              contato@pralvex.com
            </a>
          </li>
          <li className="flex items-center justify-between px-5 py-4">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-white/50">
              Imprensa
            </span>
            <a
              href="mailto:imprensa@pralvex.com"
              className="text-sm text-white transition hover:text-[#bfa68e]"
            >
              imprensa@pralvex.com
            </a>
          </li>
        </ul>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/empresas"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] px-5 py-2.5 text-sm font-medium text-[#0a0807] shadow-[0_0_28px_rgba(191,166,142,0.25)] transition hover:shadow-[0_0_40px_rgba(191,166,142,0.5)]"
          >
            Agendar demonstração
            <ArrowRight size={14} strokeWidth={2} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/roi"
            className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.03] px-5 py-2.5 text-sm text-white/80 backdrop-blur transition hover:border-[#bfa68e]/40 hover:text-white"
          >
            Calcular ROI
          </Link>
        </div>

        <footer className="mt-20 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-white/40 sm:flex-row sm:items-center">
          <span>© MMXXVI Pralvex</span>
          <div className="flex gap-4">
            <Link href="/privacidade" className="transition hover:text-white">
              Privacidade
            </Link>
            <Link href="/termos" className="transition hover:text-white">
              Termos
            </Link>
          </div>
        </footer>
      </main>

      <WhatsAppFloat message="Olá! Conheci a Pralvex pela página Sobre e gostaria de saber mais." />
    </div>
  )
}
