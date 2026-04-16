'use client'

import Link from 'next/link'
import { WhatsAppFloat } from '@/components/WhatsAppFloat'
import s from './page.module.css'

const pillars = [
  {
    n: 'I',
    title: 'Precisao acima de viralidade',
    body: 'A LexAI nunca inventa jurisprudencia. Cada citacao tem origem rastreavel. Em producao juridica, uma alucinacao nao e bug: e risco de sancao.',
  },
  {
    n: 'II',
    title: 'Construido por quem vive o caso',
    body: 'Prompt, interface e fluxo sao desenhados com advogados militantes. Testamos cada agente em varas reais antes de liberar para o mercado.',
  },
  {
    n: 'III',
    title: 'LGPD sem asterisco',
    body: 'Processamos no Brasil quando possivel. Nenhum dado do cliente treina modelo publico. Retencao e direitos do titular atendem Art. 18 \u2014 exportacao e exclusao em minutos.',
  },
  {
    n: 'IV',
    title: 'O escritorio e o cliente',
    body: 'Nao vendemos para departamentos juridicos de banco. Nao servimos tech bros. Servimos quem bate ponto em forum, quem perde almoco por peca e quem ainda cobra honorario de sucesso.',
  },
]

export default function SobrePage() {
  return (
    <div className={s.sbRoot}>
      <header className={s.sbNav}>
        <Link href="/" className={s.sbBrand}>LexAI</Link>
        <nav className={s.sbNavLinks}>
          <Link href="/empresas" className={s.sbNavLink}>Empresas</Link>
          <Link href="/roi" className={s.sbNavLink}>Calculadora</Link>
          <Link href="/login" className={s.sbNavCta}>Entrar</Link>
        </nav>
      </header>

      <main id="main-content" className={s.sbShell}>
        <div className={s.sbSerial}>Nº 005 · SOBRE · MMXXVI</div>

        <h1 className={s.sbTitle}>
          Construido por quem <em>escreve pecas</em> de verdade.
        </h1>
        <p className={s.sbLede}>
          A LexAI nasceu dentro da Vanix Corp em 2026 com uma premissa desconfortavel
          para a industria de IA generalista: um modelo nao treinado no Direito brasileiro
          nao serve para advogado brasileiro. Nao adianta empacotar Claude em uma
          interface bonita se o advogado precisa conferir cada citacao.
        </p>
        <p className={s.sbLede}>
          Nos escolhemos o caminho mais dificil: curar o corpus, calibrar o modelo,
          rastrear origem, e negar a resposta quando ela nao puder ser sustentada.
          Temos cliente com medo de IA virando erro na OAB. Nosso trabalho e fazer
          a IA pedir socorro antes de mentir.
        </p>

        <div className={s.sbDivider} aria-hidden />

        <h2 className={s.sbH2}>Quatro pilares nao-negociaveis</h2>
        <div className={s.sbPillars}>
          {pillars.map((p) => (
            <article key={p.n} className={s.sbPillar}>
              <div className={s.sbPillarN}>{p.n}</div>
              <h3 className={s.sbPillarTitle}>{p.title}</h3>
              <p className={s.sbPillarBody}>{p.body}</p>
            </article>
          ))}
        </div>

        <div className={s.sbDivider} aria-hidden />

        <h2 className={s.sbH2}>O time</h2>
        <p className={s.sbLede}>
          A LexAI e um produto da <strong>Vanix Corp</strong>, estudio de software
          do interior de Minas. Trabalhamos em celulas pequenas: dois engenheiros,
          um designer, um operador juridico em residencia, uma diretora de
          conformidade. Sem vendedor, sem gerente de produto. Quem escreve a feature
          fala com quem usa.
        </p>
        <p className={s.sbLede}>
          Nosso compromisso com o escritorio medio: suporte por WhatsApp em menos
          de 4 horas uteis, resposta de bug critico em 24h, e roadmap publico que
          voce ajuda a votar.
        </p>

        <div className={s.sbDivider} aria-hidden />

        <h2 className={s.sbH2}>Como chegar na gente</h2>
        <ul className={s.sbContact}>
          <li className={s.sbContactItem}>
            <span className={s.sbContactLabel}>Comercial</span>
            <a href="https://wa.me/5534993026456" target="_blank" rel="noopener noreferrer" className={s.sbContactLink}>
              +55 34 99302-6456
            </a>
          </li>
          <li className={s.sbContactItem}>
            <span className={s.sbContactLabel}>E-mail</span>
            <a href="mailto:contato@vanixcorp.com" className={s.sbContactLink}>contato@vanixcorp.com</a>
          </li>
          <li className={s.sbContactItem}>
            <span className={s.sbContactLabel}>Imprensa</span>
            <a href="mailto:imprensa@vanixcorp.com" className={s.sbContactLink}>imprensa@vanixcorp.com</a>
          </li>
        </ul>

        <div className={s.sbCta}>
          <Link href="/empresas" className={s.sbCtaBtn}>
            Agendar demonstracao
            <span aria-hidden>&rarr;</span>
          </Link>
          <Link href="/roi" className={s.sbCtaGhost}>
            Calcular ROI
          </Link>
        </div>

        <footer className={s.sbFooter}>
          <span>© MMXXVI Vanix Corp · LexAI</span>
          <div className={s.sbFooterLinks}>
            <Link href="/privacidade" className={s.sbFooterLink}>Privacidade</Link>
            <Link href="/termos" className={s.sbFooterLink}>Termos</Link>
          </div>
        </footer>
      </main>

      <WhatsAppFloat message="Ola! Conheci a LexAI pela pagina Sobre e gostaria de saber mais." />
    </div>
  )
}
