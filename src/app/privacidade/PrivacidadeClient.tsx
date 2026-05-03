'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Scale,
  ShieldCheck,
  Mail,
  MapPin,
  Lock,
  FileCheck2,
  Share2,
  UserCheck,
  Database,
  Clock,
  Cookie,
  RefreshCw,
  Info,
} from 'lucide-react'
import { Reveal, WordReveal } from '@/components/ui/reveal'
import { RetroGrid } from '@/components/ui/retro-grid'
import { AnimatedShaderBackground } from '@/components/ui/animated-shader-background'

/* ════════════════════════════════════════════════════════════════════
 * /privacidade — Politica de Privacidade LGPD (Tailwind · 2026-04-18)
 * ────────────────────────────────────────────────────────────────────
 * Migrado de inline-styles + bi-icons para Tailwind + lucide + Reveal.
 * Hero com shader + retro-grid (leve, nao compete com leitura).
 * Corpo do documento em max-w-3xl para legibilidade juridica.
 * Paleta Noir Atelier · champagne #bfa68e substitui o verde LGPD antigo.
 * Conteudo legal preservado palavra por palavra.
 * ═══════════════════════════════════════════════════════════════════ */

/* Lista tipada de secoes: cada uma vira um bloco Reveal */
const SECTIONS: Array<{
  id: string
  n: string
  title: string
  Icon: typeof ShieldCheck
  body: React.ReactNode
}> = [
  {
    id: 'quem-somos',
    n: '01',
    title: 'Quem somos',
    Icon: Info,
    body: (
      <>
        <p>
          A Pralvex (&ldquo;nos&rdquo;, &ldquo;nossa&rdquo; ou &ldquo;plataforma&rdquo;) e uma
          plataforma de inteligencia artificial voltada para advogados e departamentos
          juridicos brasileiros. Nossos 27 agentes especializados auxiliam em analise
          de documentos, pesquisa jurisprudencial, redacao de pecas processuais,
          calculos juridicos e outras tarefas de apoio juridico.
        </p>
        <h3>Controlador dos dados</h3>
        <p>
          Para fins da Lei 13.709/2018 (LGPD), a Pralvex atua como{' '}
          <strong>controladora</strong> dos dados pessoais coletados pela plataforma.
          Nosso encarregado de dados (DPO) pode ser contatado pelos canais listados no
          item 10 desta politica.
        </p>
      </>
    ),
  },
  {
    id: 'dados-coletados',
    n: '02',
    title: 'Quais dados coletamos',
    Icon: Database,
    body: (
      <>
        <p>
          Coletamos apenas os dados necessarios para prestar o servico e atender
          requisitos legais. Os dados coletados sao organizados em tres categorias:
        </p>
        <h3>2.1 Dados de cadastro e autenticacao</h3>
        <ul>
          <li>Nome completo e nome de usuario</li>
          <li>Endereco de e-mail</li>
          <li>Senha (armazenada com hash bcrypt, nunca em texto claro)</li>
          <li>Tokens de autenticacao gerados pelo Supabase Auth</li>
          <li>Data de criacao e ultimo acesso</li>
        </ul>
        <h3>2.2 Dados de uso e documentos enviados</h3>
        <ul>
          <li>Documentos carregados para analise (peticoes, contratos, decisoes)</li>
          <li>Prompts enviados aos agentes IA e respostas geradas</li>
          <li>Historico de interacoes com a plataforma</li>
          <li>Logs de uso (quantidade de requisicoes, agentes acessados)</li>
          <li>Preferencias de interface (tema escuro/claro, idioma)</li>
        </ul>
        <h3>2.3 Dados tecnicos e de navegacao</h3>
        <ul>
          <li>Endereco IP e dados de geolocalizacao aproximada</li>
          <li>Tipo de navegador, sistema operacional e dispositivo</li>
          <li>Datas e horarios de acesso</li>
          <li>Cookies de autenticacao (necessarios) e analytics (opcionais)</li>
        </ul>
      </>
    ),
  },
  {
    id: 'como-usamos',
    n: '03',
    title: 'Como usamos seus dados',
    Icon: FileCheck2,
    body: (
      <>
        <p>
          Os dados coletados sao utilizados exclusivamente para as seguintes
          finalidades:
        </p>
        <ul>
          <li>
            <strong>Prestar o servico contratado:</strong> processar documentos, gerar
            respostas dos agentes IA e manter seu historico de uso.
          </li>
          <li>
            <strong>Autenticar e proteger sua conta:</strong> verificar sua identidade,
            detectar acessos suspeitos e prevenir fraudes.
          </li>
          <li>
            <strong>Faturamento e cobranca:</strong> processar pagamentos via Stripe e
            emitir notas fiscais quando aplicavel.
          </li>
          <li>
            <strong>Melhorar o servico:</strong> analisar metricas agregadas e anonimas
            para identificar gargalos, bugs e oportunidades de melhoria.
          </li>
          <li>
            <strong>Comunicacao:</strong> enviar notificacoes essenciais sobre sua
            conta, faturas e atualizacoes criticas.
          </li>
        </ul>

        {/* Compromissos firmes — bloco destacado champagne */}
        <div className="not-prose mt-6 rounded-xl border border-[#bfa68e]/25 bg-[#bfa68e]/[0.05] p-6">
          <div className="mb-3 flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#bfa68e]">
            <Lock className="size-3.5" strokeWidth={2} />
            Compromissos firmes
          </div>
          <ul className="space-y-2 text-sm leading-relaxed text-white/75">
            <li>
              <strong className="text-white">NAO vendemos</strong> seus dados pessoais,
              prompts ou documentos para terceiros.
            </li>
            <li>
              <strong className="text-white">NAO usamos</strong> seus documentos ou
              prompts para treinar modelos de IA, proprios ou de terceiros.
            </li>
            <li>
              <strong className="text-white">NAO compartilhamos</strong> seus dados com
              anunciantes ou redes de publicidade.
            </li>
            <li>
              Seus documentos sao processados pelos agentes IA e retornam apenas para
              voce.
            </li>
          </ul>
        </div>
      </>
    ),
  },
  {
    id: 'base-legal',
    n: '04',
    title: 'Base legal para o tratamento',
    Icon: Scale,
    body: (
      <>
        <p>
          O tratamento dos seus dados pessoais se fundamenta nas bases legais previstas
          no artigo 7 da LGPD:
        </p>
        <ul>
          <li>
            <strong>Execucao de contrato (art. 7, V):</strong> para prestar o servico
            de IA juridica que voce contratou, incluindo processamento de documentos e
            geracao de respostas.
          </li>
          <li>
            <strong>Consentimento (art. 7, I):</strong> para cookies nao essenciais
            (analytics), comunicacoes de marketing e qualquer tratamento adicional que
            voce autorize expressamente.
          </li>
          <li>
            <strong>Obrigacao legal (art. 7, II):</strong> para cumprir obrigacoes
            fiscais, tributarias e de prevencao a fraude.
          </li>
          <li>
            <strong>Legitimo interesse (art. 7, IX):</strong> para garantir seguranca
            da plataforma, prevenir abusos e melhorar a experiencia, sempre respeitando
            seus direitos fundamentais.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'compartilhamento',
    n: '05',
    title: 'Compartilhamento com terceiros',
    Icon: Share2,
    body: (
      <>
        <p>
          Para prestar o servico, contamos com operadores (processadores de dados) que
          atendem aos mais altos padroes de seguranca e compliance. Nenhum desses
          parceiros tem permissao para usar seus dados para fins proprios:
        </p>
        <ul>
          <li>
            <strong>Anthropic (Claude API):</strong> processa os prompts e documentos
            para gerar as respostas dos agentes IA. A Anthropic declara nao reter ou
            treinar modelos com dados da API comercial.
          </li>
          <li>
            <strong>Supabase:</strong> hospeda nosso banco de dados PostgreSQL
            (autenticacao, assinaturas, historico). Dados armazenados na Uniao Europeia
            com criptografia em repouso.
          </li>
          <li>
            <strong>Stripe:</strong> processa pagamentos e assinaturas. A Stripe e
            certificada PCI-DSS nivel 1 e jamais expomos dados de cartao a nossa
            infraestrutura.
          </li>
          <li>
            <strong>Vercel:</strong> hospeda e entrega a aplicacao web atraves da CDN
            global, com isolamento por regiao.
          </li>
        </ul>
        <p>
          Eventualmente, dados podem ser compartilhados com autoridades publicas
          mediante ordem judicial fundamentada, nos termos do art. 11, II, da LGPD.
        </p>
      </>
    ),
  },
  {
    id: 'direitos',
    n: '06',
    title: 'Direitos do titular dos dados',
    Icon: UserCheck,
    body: (
      <>
        <p>
          Voce, como titular dos dados, possui todos os direitos garantidos pelo artigo
          18 da LGPD. A qualquer momento, voce pode solicitar:
        </p>
        <ul>
          <li>
            <strong>Confirmacao e acesso (art. 18, I e II):</strong> saber se tratamos
            seus dados e receber copia completa deles.
          </li>
          <li>
            <strong>Correcao (art. 18, III):</strong> corrigir dados incompletos,
            inexatos ou desatualizados.
          </li>
          <li>
            <strong>Anonimizacao, bloqueio ou eliminacao (art. 18, IV):</strong>{' '}
            solicitar que dados desnecessarios ou excessivos sejam anonimizados,
            bloqueados ou apagados.
          </li>
          <li>
            <strong>Portabilidade (art. 18, V):</strong> receber seus dados em formato
            estruturado e interoperavel para transferir a outro fornecedor.
          </li>
          <li>
            <strong>Eliminacao (art. 18, VI):</strong> solicitar exclusao dos dados
            tratados com base no seu consentimento, respeitadas as obrigacoes legais de
            retencao.
          </li>
          <li>
            <strong>Informacao sobre compartilhamentos (art. 18, VII):</strong> saber
            com quais entidades publicas ou privadas compartilhamos seus dados.
          </li>
          <li>
            <strong>Revogacao do consentimento (art. 18, IX):</strong> retirar, a
            qualquer momento, o consentimento concedido, sem prejuizo da licitude do
            tratamento anterior.
          </li>
        </ul>
        <p>
          Para exercer qualquer desses direitos, envie um e-mail ao nosso DPO (item
          10). Responderemos em ate 15 dias corridos.
        </p>
      </>
    ),
  },
  {
    id: 'seguranca',
    n: '07',
    title: 'Seguranca da informacao',
    Icon: ShieldCheck,
    body: (
      <>
        <p>
          Adotamos medidas tecnicas e organizacionais de seguranca proporcionais aos
          riscos, em conformidade com o artigo 46 da LGPD:
        </p>
        <ul>
          <li>
            <strong>Criptografia em transito:</strong> TLS 1.3 em todas as conexoes
            (HTTPS obrigatorio).
          </li>
          <li>
            <strong>Criptografia em repouso:</strong> banco de dados PostgreSQL com
            criptografia AES-256 no Supabase.
          </li>
          <li>
            <strong>Row Level Security (RLS):</strong> politicas no banco garantem que
            cada usuario so acesse seus proprios dados.
          </li>
          <li>
            <strong>Headers de seguranca:</strong> CSP, HSTS, X-Frame-Options,
            X-Content-Type-Options e Referrer-Policy configurados.
          </li>
          <li>
            <strong>Hashing de senhas:</strong> bcrypt com cost factor alto, senhas
            nunca armazenadas em texto.
          </li>
          <li>
            <strong>Monitoramento e logs:</strong> detecao de anomalias e tentativas de
            acesso suspeitas.
          </li>
          <li>
            <strong>Backups diarios:</strong> com retencao de 30 dias e testes
            periodicos de restauracao.
          </li>
        </ul>
        <p>
          Em caso de incidente de seguranca que possa gerar risco ou dano relevante ao
          titular, comunicaremos voce e a ANPD em prazo razoavel, conforme art. 48 da
          LGPD.
        </p>
      </>
    ),
  },
  {
    id: 'retencao',
    n: '08',
    title: 'Retencao dos dados',
    Icon: Clock,
    body: (
      <>
        <p>
          Os dados sao mantidos apenas pelo periodo necessario para as finalidades
          descritas nesta politica ou para cumprir obrigacoes legais. Os prazos tipicos
          sao:
        </p>
        <ul>
          <li>
            <strong>Conta ativa:</strong> enquanto sua assinatura estiver vigente.
          </li>
          <li>
            <strong>Documentos e historico:</strong> conforme o plano contratado
            (Starter 30 dias, Pro 90 dias, Enterprise ilimitado enquanto ativo).
          </li>
          <li>
            <strong>Dados de cadastro apos cancelamento:</strong> ate 90 dias para
            permitir reativacao, depois anonimizados.
          </li>
          <li>
            <strong>Dados fiscais e de faturamento:</strong> 5 anos, em cumprimento ao
            Codigo Tributario Nacional (art. 173 CTN).
          </li>
          <li>
            <strong>Logs de seguranca:</strong> 6 meses, para detecao de fraudes e
            investigacoes.
          </li>
        </ul>
        <p>
          Apos expirados os prazos legais, os dados sao eliminados de forma segura ou
          anonimizados de modo irreversivel.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    n: '09',
    title: 'Cookies e tecnologias similares',
    Icon: Cookie,
    body: (
      <>
        <p>
          Utilizamos cookies para garantir o funcionamento da plataforma e, quando
          autorizado, para analise de uso. Os cookies sao divididos em duas categorias:
        </p>
        <h3>9.1 Cookies necessarios</h3>
        <p>
          Indispensaveis para o funcionamento do site. Incluem cookies de autenticacao
          (sessao, CSRF token) e preferencias basicas (tema). Esses cookies nao exigem
          consentimento, conforme art. 7, VIII, da LGPD (execucao de contrato).
        </p>
        <h3>9.2 Cookies de analytics (opcionais)</h3>
        <p>
          Usados para medir uso agregado da plataforma (paginas mais acessadas, tempo
          de sessao, erros). Sao anonimizados e so sao ativados com seu consentimento
          expresso atraves do banner de cookies. Voce pode revogar o consentimento a
          qualquer momento.
        </p>
      </>
    ),
  },
  {
    id: 'contato-dpo',
    n: '10',
    title: 'Contato do Encarregado (DPO)',
    Icon: Mail,
    body: (
      <>
        <p>
          Para exercer seus direitos, tirar duvidas sobre o tratamento dos seus dados
          ou reportar incidentes, entre em contato com nosso Encarregado pela Protecao
          de Dados:
        </p>

        {/* Contato — card destacado */}
        <div className="not-prose mt-6 space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-start gap-3 text-sm text-white/70">
            <Mail className="mt-0.5 size-4 shrink-0 text-[#bfa68e]" strokeWidth={1.75} />
            <div>
              <div className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/50">
                E-mail
              </div>
              <div className="mt-0.5 text-white">contato@pralvex.com.br</div>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm text-white/70">
            <MapPin
              className="mt-0.5 size-4 shrink-0 text-[#bfa68e]"
              strokeWidth={1.75}
            />
            <div>
              <div className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/50">
                Endereco
              </div>
              <div className="mt-0.5 text-white">
                Ituverava, Sao Paulo &mdash; Brasil
              </div>
            </div>
          </div>
        </div>

        <p>
          Voce tambem pode apresentar reclamacao diretamente a Autoridade Nacional de
          Protecao de Dados (ANPD) atraves do site{' '}
          <span className="text-[#bfa68e]">www.gov.br/anpd</span>.
        </p>
      </>
    ),
  },
  {
    id: 'atualizacoes',
    n: '11',
    title: 'Atualizacoes desta politica',
    Icon: RefreshCw,
    body: (
      <>
        <p>
          Esta politica pode ser atualizada periodicamente para refletir mudancas na
          legislacao, em nossos servicos ou em nossas praticas de privacidade. Quando
          houver alteracoes materiais, notificaremos voce por e-mail e/ou atraves de
          aviso destacado na plataforma com antecedencia minima de 15 dias.
        </p>
        <p>
          A data da ultima atualizacao esta indicada no topo deste documento:{' '}
          <strong>07 de abril de 2026</strong>.
        </p>
        <p>
          Ao continuar utilizando a Pralvex apos as atualizacoes, voce concorda com os
          termos revisados. Caso nao concorde, voce pode solicitar o cancelamento da
          conta a qualquer momento.
        </p>
      </>
    ),
  },
]

export default function PrivacidadeClient() {
  return (
    <div className="min-h-screen surface-base">
      {/* ═══ NAV ═══════════════════════════════════════════════════════ */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md border border-white/10 bg-gradient-to-br from-[#bfa68e]/20 to-transparent">
              <Scale className="size-4 text-[#bfa68e]" strokeWidth={1.75} />
            </div>
            <span className="text-sm font-medium tracking-tight">Pralvex</span>
          </Link>
          <nav className="flex items-center gap-5">
            <Link
              href="/"
              className="hidden text-sm text-white/70 transition-colors hover:text-white sm:inline"
            >
              Inicio
            </Link>
            <Link
              href="/termos"
              className="hidden text-sm text-white/70 transition-colors hover:text-white sm:inline"
            >
              Termos
            </Link>
            <Link
              href="/login"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-xs font-medium text-black transition hover:bg-white/90"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      {/* ═══ HERO — shader + retro-grid leve ══════════════════════════ */}
      <section className="relative isolate overflow-hidden pt-36 pb-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-30">
          <AnimatedShaderBackground
            className="absolute inset-0 h-full w-full"
            opacity={0.22}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black" />
        </div>
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 top-1/2 -z-20"
        >
          <RetroGrid opacity={0.18} />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(60%_50%_at_50%_0%,rgba(191,166,142,0.10)_0%,transparent_70%)]"
        />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <Link
              href="/"
              className="mb-10 inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/55 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-3" strokeWidth={2} />
              Voltar para o inicio
            </Link>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#bfa68e]/25 bg-[#bfa68e]/[0.06] px-4 py-1.5 backdrop-blur-sm">
              <ShieldCheck
                className="size-3.5 text-[#bfa68e]"
                strokeWidth={2}
              />
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#e6d4bd]">
                LGPD · Lei 13.709/2018
              </span>
            </div>
          </Reveal>

          {/* H1 — gradient line sem WordReveal (bg-clip-text nao convive com
              inline-block do word-reveal; usamos Reveal simples para animar) */}
          <h1 className="text-balance text-4xl font-medium leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
            <WordReveal text="Politica de" className="block" stagger={0.06} />
            <Reveal delay={0.35}>
              <span className="mt-1 block text-grad-accent">
                Privacidade
              </span>
            </Reveal>
          </h1>

          <Reveal delay={0.45}>
            <p className="mx-auto mt-6 max-w-xl text-sm text-white/60 md:text-base">
              Ultima atualizacao: 07 de abril de 2026. Em conformidade com a Lei
              13.709/2018 (LGPD) e demais normas brasileiras de protecao de dados.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ CORPO — 11 secoes ══════════════════════════════════════════ */}
      <main className="relative bg-black pb-24">
        <div className="mx-auto max-w-3xl px-6">
          {/* Indice rapido */}
          <Reveal>
            <nav
              aria-label="Indice"
              className="mb-16 rounded-2xl border border-white/10 bg-neutral-950/60 p-6 backdrop-blur"
            >
              <div className="mb-4 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/50">
                Indice
              </div>
              <ol className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="group flex items-center gap-3 py-1 text-sm text-white/65 transition-colors hover:text-white"
                    >
                      <span className="font-mono text-[0.65rem] tabular-nums text-[#bfa68e]/70 group-hover:text-[#bfa68e]">
                        {s.n}
                      </span>
                      <span>{s.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </Reveal>

          {/* Secoes */}
          <div className="space-y-20">
            {SECTIONS.map((s, i) => {
              const Icon = s.Icon
              return (
                <Reveal key={s.id} as="section" delay={0.04 + (i % 3) * 0.04}>
                  <section id={s.id} className="scroll-mt-24">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-[#bfa68e]/15 to-transparent">
                        <Icon
                          className="size-5 text-[#bfa68e]"
                          strokeWidth={1.75}
                        />
                      </div>
                      <div>
                        <div className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/40">
                          Secao {s.n}
                        </div>
                        <h2 className="text-2xl font-medium tracking-tight text-white md:text-[1.75rem]">
                          {s.title}
                        </h2>
                      </div>
                    </div>

                    <div className="legal-prose">{s.body}</div>
                  </section>
                </Reveal>
              )
            })}
          </div>
        </div>
      </main>

      {/* ═══ FOOTER ═══════════════════════════════════════════════════════ */}
      <footer className="relative border-t border-white/10 bg-black">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div>
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-md border border-white/10 bg-gradient-to-br from-[#bfa68e]/20 to-transparent">
                  <Scale
                    className="size-4 text-[#bfa68e]"
                    strokeWidth={1.75}
                  />
                </div>
                <span className="text-sm font-medium tracking-tight">Pralvex</span>
              </Link>
              <p className="mt-3 max-w-xs text-sm text-white/50">
                Dados processados no Brasil. Modelo nao treina com seu conteudo.
              </p>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {[
                { l: 'Inicio', h: '/' },
                { l: 'Empresas', h: '/empresas' },
                { l: 'Privacidade LGPD', h: '/privacidade' },
                { l: 'Termos de uso', h: '/termos' },
                { l: 'Entrar', h: '/login' },
              ].map((l) => (
                <li key={l.l}>
                  <Link
                    href={l.h}
                    className="text-white/60 transition-colors hover:text-white"
                  >
                    {l.l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-white/45">
            <span>© MMXXVI · Pralvex</span>
            <span className="text-white/35">contato@pralvex.com.br</span>
          </div>
        </div>
      </footer>

      {/* ═══ Tipografia legal ══════════════════════════════════════════
           Estilo enxuto pro corpo do contrato. Garante leitura 60-70ch,
           h3 hierarquia, strong champagne, ul com bullet tight.
         ═════════════════════════════════════════════════════════════ */}
      <style jsx global>{`
        .legal-prose {
          color: rgba(255, 255, 255, 0.72);
          font-size: 0.95rem;
          line-height: 1.78;
        }
        .legal-prose p {
          margin: 0 0 1.1rem 0;
        }
        .legal-prose p:last-child {
          margin-bottom: 0;
        }
        .legal-prose h3 {
          color: #fff;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          margin: 1.6rem 0 0.6rem 0;
        }
        .legal-prose ul {
          list-style: none;
          padding: 0;
          margin: 0 0 1.1rem 0;
        }
        .legal-prose ul li {
          position: relative;
          padding-left: 1.25rem;
          margin-bottom: 0.55rem;
        }
        .legal-prose ul li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.65rem;
          width: 6px;
          height: 1px;
          background: #bfa68e;
          opacity: 0.7;
        }
        .legal-prose strong {
          color: #fff;
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}
