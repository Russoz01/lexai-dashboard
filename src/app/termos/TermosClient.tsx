'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Scale,
  FileText,
  AlertTriangle,
  UserCircle2,
  CreditCard,
  Sparkles,
  RotateCcw,
  ShieldAlert,
  Copyright,
  Gavel,
  RefreshCw,
  Map,
  Mail,
  MapPin,
  Handshake,
} from 'lucide-react'
import { Reveal, WordReveal } from '@/components/ui/reveal'
import { RetroGrid } from '@/components/ui/retro-grid'
import { AnimatedShaderBackground } from '@/components/ui/animated-shader-background'

/* ════════════════════════════════════════════════════════════════════
 * /termos — Termos de Uso (Tailwind · 2026-04-18)
 * ────────────────────────────────────────────────────────────────────
 * Migrado de inline-styles + bi-icons para Tailwind + lucide + Reveal.
 * Mesmo template da /privacidade (hero shader + indice + secoes Reveal).
 * Disclaimer juridico em destaque vermelho champagne (nao mais EF4444 puro).
 * Conteudo preservado palavra por palavra.
 * ═══════════════════════════════════════════════════════════════════ */

const SECTIONS: Array<{
  id: string
  n: string
  title: string
  Icon: typeof FileText
  body: React.ReactNode
  emphasis?: 'danger'
}> = [
  {
    id: 'aceitacao',
    n: '01',
    title: 'Aceitacao dos termos',
    Icon: Handshake,
    body: (
      <>
        <p>
          Ao se cadastrar, acessar ou utilizar a plataforma Pralvex
          (&ldquo;Plataforma&rdquo;), voce (&ldquo;Usuario&rdquo;) declara ter lido,
          compreendido e aceito integralmente estes Termos de Uso (&ldquo;Termos&rdquo;)
          e a nossa{' '}
          <Link
            href="/privacidade"
            className="text-[#bfa68e] underline decoration-[#bfa68e]/40 underline-offset-2 transition hover:decoration-[#bfa68e]"
          >
            Politica de Privacidade
          </Link>
          , formando um contrato juridicamente vinculante entre voce e a Pralvex.
        </p>
        <p>
          Se voce nao concordar com qualquer disposicao destes Termos, voce deve
          imediatamente interromper o uso da Plataforma. O uso continuado sera
          considerado aceitacao tacita dos Termos vigentes.
        </p>
        <p>
          Voce declara ter pelo menos 18 anos ou capacidade civil plena para contratar,
          nos termos do art. 5 do Codigo Civil Brasileiro.
        </p>
      </>
    ),
  },
  {
    id: 'descricao',
    n: '02',
    title: 'Descricao do servico',
    Icon: FileText,
    body: (
      <>
        <p>
          A Pralvex e uma plataforma de software como servico (SaaS) que oferece 27
          agentes de inteligencia artificial especializados para apoiar profissionais
          do Direito brasileiro em tarefas como analise de documentos, pesquisa
          jurisprudencial, redacao de pecas, calculos juridicos, estudo de legislacao
          e organizacao de rotina.
        </p>
        <p>
          <strong>
            A Pralvex e uma ferramenta de apoio tecnologico e NAO substitui o trabalho de
            advogado habilitado.
          </strong>{' '}
          Os agentes utilizam modelos de linguagem (LLMs) treinados em textos
          juridicos, mas suas respostas devem ser entendidas como ponto de partida e
          jamais como parecer juridico definitivo.
        </p>
      </>
    ),
  },
  {
    id: 'disclaimer',
    n: '03',
    title: 'Disclaimer juridico',
    Icon: AlertTriangle,
    emphasis: 'danger',
    body: (
      <>
        <p>
          <strong>
            A Pralvex nao presta consultoria juridica, parecer tecnico, assessoria ou
            representacao processual.
          </strong>{' '}
          A Plataforma e exclusivamente uma ferramenta de produtividade baseada em
          inteligencia artificial generativa.
        </p>
        <p>
          Os outputs gerados pelos agentes devem ser{' '}
          <strong>
            obrigatoriamente revisados, validados e adaptados por advogado regularmente
            inscrito na Ordem dos Advogados do Brasil (OAB)
          </strong>{' '}
          antes de qualquer uso processual, contratual, negocial ou extrajudicial.
        </p>
        <p>
          A Pralvex nao se responsabiliza, sob qualquer hipotese, por decisoes, peticoes,
          contratos, acordos, pareceres ou quaisquer atos juridicos baseados
          exclusivamente em outputs gerados pela Plataforma. Modelos de IA podem
          apresentar imprecisoes, citacoes inexistentes (&ldquo;alucinacoes&rdquo;),
          informacoes desatualizadas ou interpretacoes incorretas da legislacao e da
          jurisprudencia.
        </p>
        <p>
          O Usuario assume integral responsabilidade pela verificacao da precisao,
          aplicabilidade e conformidade dos conteudos gerados com o caso concreto e com
          a legislacao vigente.
        </p>
      </>
    ),
  },
  {
    id: 'conta',
    n: '04',
    title: 'Conta do usuario',
    Icon: UserCircle2,
    body: (
      <>
        <p>
          Para utilizar a Plataforma, voce deve criar uma conta pessoal fornecendo
          informacoes verdadeiras, completas e atualizadas. As seguintes regras se
          aplicam:
        </p>
        <ul>
          <li>
            <strong>Unica conta por pessoa:</strong> cada Usuario deve manter apenas
            uma conta ativa. Contas multiplas criadas pela mesma pessoa poderao ser
            suspensas sem aviso previo.
          </li>
          <li>
            <strong>Proibido o compartilhamento:</strong> credenciais de acesso
            (e-mail e senha) sao pessoais e intransferiveis. O compartilhamento de
            conta com terceiros viola estes Termos e pode resultar em suspensao
            imediata.
          </li>
          <li>
            <strong>Seguranca das credenciais:</strong> voce e responsavel por manter
            suas credenciais em sigilo e por todas as atividades realizadas atraves da
            sua conta. Notifique-nos imediatamente em caso de acesso nao autorizado.
          </li>
          <li>
            <strong>Planos Enterprise:</strong> podem contratar multiplos assentos
            (seats) mediante contrato especifico, caso em que cada seat corresponde a
            um usuario nominal.
          </li>
        </ul>
        <p>
          A Pralvex se reserva o direito de recusar, suspender ou encerrar contas que
          violem estes Termos, apresentem comportamento suspeito ou indicadores de
          fraude.
        </p>
      </>
    ),
  },
  {
    id: 'pagamento',
    n: '05',
    title: 'Pagamento e assinatura',
    Icon: CreditCard,
    body: (
      <>
        <p>
          A Pralvex oferece assinaturas recorrentes nos planos Starter, Pro e Enterprise,
          com preco e recursos descritos na pagina de planos. As condicoes comerciais
          sao as seguintes:
        </p>
        <ul>
          <li>
            <strong>Processador de pagamento:</strong> todos os pagamentos sao
            processados pela Stripe, empresa certificada PCI-DSS nivel 1. A Pralvex
            jamais armazena dados de cartao de credito.
          </li>
          <li>
            <strong>Cobranca mensal recorrente:</strong> o valor do plano escolhido e
            cobrado automaticamente a cada periodo contratual (mensal ou anual,
            conforme selecao).
          </li>
          <li>
            <strong>Sem fidelidade ou multa de rescisao:</strong> voce pode cancelar
            sua assinatura a qualquer momento, sem penalidades ou carencia, direto pelo
            portal do cliente Stripe ou pela area logada.
          </li>
          <li>
            <strong>Reajuste:</strong> os precos podem ser reajustados anualmente, com
            notificacao previa minima de 30 dias. Reajustes nao afetam o periodo ja
            pago.
          </li>
          <li>
            <strong>Inadimplencia:</strong> em caso de falha no pagamento, a Pralvex
            tentara nova cobranca por ate 7 dias. Persistindo a inadimplencia, o acesso
            sera suspenso ate regularizacao.
          </li>
          <li>
            <strong>Notas fiscais:</strong> emitidas conforme legislacao tributaria
            aplicavel, mediante solicitacao do cliente.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'trial',
    n: '06',
    title: 'Trial gratuito',
    Icon: Sparkles,
    body: (
      <>
        <p>
          Novos usuarios podem experimentar a Plataforma gratuitamente por 7 (sete)
          dias corridos, a contar da criacao da conta, sob as seguintes regras:
        </p>
        <ul>
          <li>
            <strong>1 trial por pessoa:</strong> cada pessoa fisica tem direito a
            apenas 1 trial, mesmo que crie contas diferentes. A tentativa de obter
            multiplos trials e vedada.
          </li>
          <li>
            <strong>Detecao de fraude:</strong> a Pralvex monitora padroes de uso
            (e-mails descartaveis, IPs, dispositivos, dados de cadastro) para
            identificar tentativas de fraude. Contas suspeitas podem ser bloqueadas sem
            aviso previo.
          </li>
          <li>
            <strong>Sem cobranca na demo:</strong> a demo nao exige cartao de credito
            cadastrado. Ao final dos 30 minutos, o acesso e limitado ate a contratacao
            de um plano pago.
          </li>
          <li>
            <strong>Limites:</strong> durante a demo de 30 minutos, o Usuario tem
            acesso aos recursos do plano Enterprise, respeitados os limites de uso
            descritos na pagina de planos.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'reembolso',
    n: '07',
    title: 'Garantia de reembolso',
    Icon: RotateCcw,
    body: (
      <>
        <p>
          Em conformidade com o artigo 49 do Codigo de Defesa do Consumidor (Lei
          8.078/1990) e como politica comercial adicional, a Pralvex oferece garantia de
          reembolso integral nas seguintes condicoes:
        </p>
        <ul>
          <li>
            <strong>Prazo de 7 dias:</strong> voce pode solicitar o reembolso integral
            da primeira cobranca ate 7 (sete) dias corridos apos a contratacao, sem
            necessidade de justificativa.
          </li>
          <li>
            <strong>Devolucao via Stripe:</strong> o valor e devolvido integralmente
            pelo mesmo meio de pagamento usado na compra, em ate 10 dias uteis apos a
            solicitacao.
          </li>
          <li>
            <strong>Cancelamento da conta:</strong> ao solicitar o reembolso, sua
            assinatura sera cancelada e o acesso a Plataforma interrompido.
          </li>
          <li>
            <strong>Abusos:</strong> solicitacoes reiteradas de reembolso pelo mesmo
            usuario, bem como fraudes, nao serao aceitas.
          </li>
        </ul>
        <p>Para solicitar reembolso, envie e-mail para o contato listado no item 13.</p>
      </>
    ),
  },
  {
    id: 'uso-aceitavel',
    n: '08',
    title: 'Uso aceitavel',
    Icon: ShieldAlert,
    body: (
      <>
        <p>
          Voce se compromete a utilizar a Pralvex de forma licita, etica e em
          conformidade com estes Termos. E expressamente proibido:
        </p>
        <ul>
          <li>Enviar spam, mensagens em massa ou conteudo nao solicitado atraves da Plataforma.</li>
          <li>
            Tentar burlar limites de uso, quotas, rate limits ou mecanismos tecnicos de
            controle da Plataforma.
          </li>
          <li>
            Realizar scraping, coleta automatizada, engenharia reversa ou minerar dados
            da Plataforma sem autorizacao expressa.
          </li>
          <li>
            Utilizar a Plataforma para gerar, processar ou armazenar conteudo ilegal,
            discriminatorio, difamatorio, obsceno, violento ou que incite crimes.
          </li>
          <li>
            Usar a Plataforma para infringir direitos autorais, marcas, patentes,
            segredos comerciais ou qualquer direito de propriedade intelectual de
            terceiros.
          </li>
          <li>Transmitir virus, malware, cavalos de Troia ou qualquer codigo malicioso.</li>
          <li>
            Realizar ataques de negacao de servico (DoS/DDoS), exploits, sondagens de
            seguranca nao autorizadas ou qualquer tentativa de comprometer a
            infraestrutura.
          </li>
          <li>
            Revender, sublicenciar ou oferecer a Plataforma como servico proprio sem
            autorizacao por escrito da Pralvex.
          </li>
          <li>Criar produtos ou servicos concorrentes com base no uso da Pralvex.</li>
        </ul>
        <p>
          O descumprimento das regras de uso aceitavel resulta em suspensao imediata da
          conta, sem direito a reembolso, e pode acarretar responsabilizacao civil e
          criminal do infrator.
        </p>
      </>
    ),
  },
  {
    id: 'propriedade',
    n: '09',
    title: 'Propriedade intelectual',
    Icon: Copyright,
    body: (
      <>
        <h3>9.1 Propriedade da Pralvex</h3>
        <p>
          Todo o codigo-fonte, design, marca, nome &ldquo;Pralvex&rdquo;, logotipos,
          textos institucionais, prompts proprietarios, modelos customizados,
          documentacao e arquitetura da Plataforma sao de propriedade exclusiva da
          Pralvex, protegidos pela Lei 9.610/1998 (Direitos Autorais), Lei 9.279/1996
          (Propriedade Industrial) e demais normas aplicaveis.
        </p>
        <p>
          A assinatura da Pralvex concede ao Usuario uma licenca nao exclusiva,
          intransferivel, revogavel e limitada para utilizar a Plataforma conforme o
          plano contratado. Nenhuma outra cessao de direitos e realizada.
        </p>
        <h3>9.2 Conteudo gerado pelo usuario</h3>
        <p>
          O conteudo produzido pelos agentes IA a partir dos prompts e documentos
          enviados pelo Usuario (&ldquo;Outputs&rdquo;) pertence ao Usuario, que pode
          utiliza-lo livremente para qualquer finalidade licita, respeitados os
          direitos de terceiros.
        </p>
        <p>
          O Usuario garante que tem os direitos necessarios sobre os documentos e dados
          que submete a Plataforma e assume integral responsabilidade pelo conteudo
          inserido. A Pralvex nao revisa previamente os conteudos processados.
        </p>
      </>
    ),
  },
  {
    id: 'limitacao',
    n: '10',
    title: 'Limitacao de responsabilidade',
    Icon: Gavel,
    body: (
      <>
        <p>
          Na medida maxima permitida pela legislacao brasileira, a Pralvex nao se
          responsabiliza por:
        </p>
        <ul>
          <li>
            Decisoes, peticoes, contratos ou atos juridicos baseados exclusivamente em
            outputs da Plataforma, sem revisao por advogado habilitado.
          </li>
          <li>
            Danos indiretos, lucros cessantes, perda de oportunidade, perda de dados,
            custas processuais ou honorarios sucumbenciais decorrentes do uso ou da
            incapacidade de uso da Plataforma.
          </li>
          <li>
            Indisponibilidades temporarias decorrentes de manutencao programada, falhas
            de terceiros (Anthropic, Supabase, Stripe, Vercel) ou casos fortuitos.
          </li>
          <li>
            Conteudo incorreto, desatualizado ou alucinacoes tipicas de modelos de
            linguagem, embora envidemos esforcos para mitigar esses riscos.
          </li>
          <li>
            Atos praticados por terceiros com base em informacoes obtidas na
            Plataforma.
          </li>
        </ul>
        <p>
          Em qualquer hipotese, a responsabilidade total da Pralvex fica limitada ao
          valor efetivamente pago pelo Usuario nos 12 (doze) meses anteriores ao evento
          que gerou a responsabilizacao.
        </p>
        <p>
          Nada nestes Termos exclui responsabilidades que nao podem ser limitadas ou
          excluidas pela legislacao brasileira aplicavel, como obrigacoes decorrentes
          do Codigo de Defesa do Consumidor em relacao aos direitos basicos do
          consumidor.
        </p>
      </>
    ),
  },
  {
    id: 'alteracoes',
    n: '11',
    title: 'Alteracoes nos termos',
    Icon: RefreshCw,
    body: (
      <>
        <p>
          A Pralvex pode alterar estes Termos periodicamente para refletir mudancas
          legais, em seus servicos ou em suas praticas comerciais. As alteracoes
          materiais serao comunicadas por e-mail e/ou aviso destacado na Plataforma com
          antecedencia minima de 15 dias.
        </p>
        <p>
          O uso continuado da Plataforma apos a entrada em vigor das alteracoes
          constituira aceitacao tacita dos novos Termos. Caso nao concorde, voce pode
          cancelar sua assinatura a qualquer momento sem penalidades.
        </p>
        <p>
          A versao mais recente dos Termos estara sempre disponivel nesta pagina, com a
          data da ultima atualizacao indicada no topo.
        </p>
      </>
    ),
  },
  {
    id: 'lei-foro',
    n: '12',
    title: 'Lei aplicavel e foro',
    Icon: Map,
    body: (
      <>
        <p>
          Estes Termos sao regidos pelas leis da Republica Federativa do Brasil, em
          especial pelo Codigo Civil (Lei 10.406/2002), Codigo de Defesa do Consumidor
          (Lei 8.078/1990), Marco Civil da Internet (Lei 12.965/2014) e Lei Geral de
          Protecao de Dados (Lei 13.709/2018).
        </p>
        <p>
          Fica eleito o foro da Comarca de{' '}
          <strong>Ituverava, Sao Paulo</strong>, para dirimir quaisquer questoes
          decorrentes destes Termos, salvo se o Usuario for consumidor, hipotese em que
          podera optar pelo foro do seu domicilio, nos termos do artigo 101, I, do
          CDC.
        </p>
        <p>
          As partes concordam em tentar resolver qualquer disputa amigavelmente, por
          meio de contato direto com a Pralvex, antes de recorrer a medidas judiciais.
        </p>
      </>
    ),
  },
  {
    id: 'contato',
    n: '13',
    title: 'Contato',
    Icon: Mail,
    body: (
      <>
        <p>Para duvidas, reclamacoes, solicitacoes ou suporte, entre em contato:</p>

        <div className="not-prose mt-6 space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-start gap-3 text-sm text-white/70">
            <Mail
              className="mt-0.5 size-4 shrink-0 text-[#bfa68e]"
              strokeWidth={1.75}
            />
            <div>
              <div className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/50">
                E-mail
              </div>
              <div className="mt-0.5 text-white">contato@pralvex.com</div>
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
          O prazo de resposta para solicitacoes comuns e de ate 3 dias uteis. Em caso
          de urgencias ou suspensoes indevidas, prioridade total.
        </p>
      </>
    ),
  },
]

export default function TermosClient() {
  return (
    <div className="min-h-screen bg-black text-white antialiased">
      {/* ═══ NAV ══════════════════════════════════════════════════════ */}
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
              href="/privacidade"
              className="hidden text-sm text-white/70 transition-colors hover:text-white sm:inline"
            >
              Privacidade
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

      {/* ═══ HERO ═════════════════════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden pt-36 pb-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-30">
          <AnimatedShaderBackground
            className="absolute inset-0 h-full w-full"
            opacity={0.22}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black" />
        </div>
        <div aria-hidden className="absolute inset-x-0 bottom-0 top-1/2 -z-20">
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
              <FileText
                className="size-3.5 text-[#bfa68e]"
                strokeWidth={2}
              />
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#e6d4bd]">
                Termos e Condicoes
              </span>
            </div>
          </Reveal>

          {/* H1 — gradient line sem WordReveal (bg-clip-text nao convive com
              inline-block do word-reveal; usamos Reveal simples para animar) */}
          <h1 className="text-balance text-4xl font-medium leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
            <WordReveal text="Termos de" className="block" stagger={0.06} />
            <Reveal delay={0.35}>
              <span
                className="mt-1 block bg-gradient-to-br from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] bg-clip-text text-transparent"
                style={{ WebkitBackgroundClip: 'text' }}
              >
                Uso
              </span>
            </Reveal>
          </h1>

          <Reveal delay={0.45}>
            <p className="mx-auto mt-6 max-w-xl text-sm text-white/60 md:text-base">
              Ultima atualizacao: 07 de abril de 2026. Regidos pela legislacao
              brasileira &mdash; Lei 10.406/2002 (Codigo Civil) e Lei 8.078/1990 (CDC).
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ CORPO ═════════════════════════════════════════════════════ */}
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
              const danger = s.emphasis === 'danger'

              return (
                <Reveal key={s.id} as="section" delay={0.04 + (i % 3) * 0.04}>
                  <section id={s.id} className="scroll-mt-24">
                    <div className="mb-6 flex items-center gap-4">
                      <div
                        className={
                          'flex size-11 items-center justify-center rounded-xl border ' +
                          (danger
                            ? 'border-red-400/30 bg-gradient-to-br from-red-400/15 to-transparent'
                            : 'border-white/10 bg-gradient-to-br from-[#bfa68e]/15 to-transparent')
                        }
                      >
                        <Icon
                          className={
                            'size-5 ' +
                            (danger ? 'text-red-300' : 'text-[#bfa68e]')
                          }
                          strokeWidth={1.75}
                        />
                      </div>
                      <div>
                        <div
                          className={
                            'font-mono text-[0.6rem] uppercase tracking-[0.2em] ' +
                            (danger ? 'text-red-300/70' : 'text-white/40')
                          }
                        >
                          {danger ? 'Atencao — Secao ' + s.n : 'Secao ' + s.n}
                        </div>
                        <h2 className="text-2xl font-medium tracking-tight text-white md:text-[1.75rem]">
                          {s.title}
                        </h2>
                      </div>
                    </div>

                    <div
                      className={
                        'legal-prose ' +
                        (danger
                          ? 'rounded-2xl border border-red-400/20 bg-red-400/[0.03] p-6 md:p-8'
                          : '')
                      }
                    >
                      {s.body}
                    </div>
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
                Ferramenta de apoio. Resultados devem ser revisados por advogado
                habilitado pela OAB.
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
            <span className="text-white/35">contato@pralvex.com</span>
          </div>
        </div>
      </footer>

      {/* ═══ Tipografia legal (compartilhada com /privacidade) ═════════ */}
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
