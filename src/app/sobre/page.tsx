'use client'

import Link from 'next/link'
import { WhatsAppFloat } from '@/components/WhatsAppFloat'

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
    <div className="sb-root">
      <header className="sb-nav">
        <Link href="/" className="sb-brand">LexAI</Link>
        <nav className="sb-nav-links">
          <Link href="/empresas" className="sb-nav-link">Empresas</Link>
          <Link href="/roi" className="sb-nav-link">Calculadora</Link>
          <Link href="/login" className="sb-nav-cta">Entrar</Link>
        </nav>
      </header>

      <main id="main-content" className="sb-shell">
        <div className="sb-serial">Nº 005 · SOBRE · MMXXVI</div>

        <h1 className="sb-title">
          Construido por quem <em>escreve pecas</em> de verdade.
        </h1>
        <p className="sb-lede">
          A LexAI nasceu dentro da Vanix Corp em 2026 com uma premissa desconfortavel
          para a industria de IA generalista: um modelo nao treinado no Direito brasileiro
          nao serve para advogado brasileiro. Nao adianta empacotar Claude em uma
          interface bonita se o advogado precisa conferir cada citacao.
        </p>
        <p className="sb-lede">
          Nos escolhemos o caminho mais dificil: curar o corpus, calibrar o modelo,
          rastrear origem, e negar a resposta quando ela nao puder ser sustentada.
          Temos cliente com medo de IA virando erro na OAB. Nosso trabalho e fazer
          a IA pedir socorro antes de mentir.
        </p>

        <div className="sb-divider" aria-hidden />

        <h2 className="sb-h2">Quatro pilares nao-negociaveis</h2>
        <div className="sb-pillars">
          {pillars.map((p) => (
            <article key={p.n} className="sb-pillar">
              <div className="sb-pillar-n">{p.n}</div>
              <h3 className="sb-pillar-title">{p.title}</h3>
              <p className="sb-pillar-body">{p.body}</p>
            </article>
          ))}
        </div>

        <div className="sb-divider" aria-hidden />

        <h2 className="sb-h2">O time</h2>
        <p className="sb-lede">
          A LexAI e um produto da <strong>Vanix Corp</strong>, estudio de software
          do interior de Minas. Trabalhamos em celulas pequenas: dois engenheiros,
          um designer, um operador juridico em residencia, uma diretora de
          conformidade. Sem vendedor, sem gerente de produto. Quem escreve a feature
          fala com quem usa.
        </p>
        <p className="sb-lede">
          Nosso compromisso com o escritorio medio: suporte por WhatsApp em menos
          de 4 horas uteis, resposta de bug critico em 24h, e roadmap publico que
          voce ajuda a votar.
        </p>

        <div className="sb-divider" aria-hidden />

        <h2 className="sb-h2">Como chegar na gente</h2>
        <ul className="sb-contact">
          <li>
            <span className="sb-contact-label">Comercial</span>
            <a href="https://wa.me/5534993026456" target="_blank" rel="noopener noreferrer">
              +55 34 99302-6456
            </a>
          </li>
          <li>
            <span className="sb-contact-label">E-mail</span>
            <a href="mailto:contato@vanixcorp.com">contato@vanixcorp.com</a>
          </li>
          <li>
            <span className="sb-contact-label">Imprensa</span>
            <a href="mailto:imprensa@vanixcorp.com">imprensa@vanixcorp.com</a>
          </li>
        </ul>

        <div className="sb-cta">
          <Link href="/empresas" className="sb-cta-btn">
            Agendar demonstracao
            <span aria-hidden>&rarr;</span>
          </Link>
          <Link href="/roi" className="sb-cta-ghost">
            Calcular ROI
          </Link>
        </div>

        <footer className="sb-footer">
          <span>© MMXXVI Vanix Corp · LexAI</span>
          <div className="sb-footer-links">
            <Link href="/privacidade">Privacidade</Link>
            <Link href="/termos">Termos</Link>
          </div>
        </footer>
      </main>

      <WhatsAppFloat message="Ola! Conheci a LexAI pela pagina Sobre e gostaria de saber mais." />

      <style jsx global>{`
        .sb-root {
          min-height: 100vh;
          background: var(--bg-base);
          color: var(--text-primary);
          font-family: var(--font-dm-sans, 'DM Sans'), system-ui, sans-serif;
        }
        .sb-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 40px;
          border-bottom: 1px solid var(--stone-line);
        }
        .sb-brand {
          font-family: var(--font-playfair), serif;
          font-style: italic; font-weight: 700;
          font-size: 22px; letter-spacing: -0.02em;
          color: var(--text-primary); text-decoration: none;
        }
        .sb-nav-links { display: flex; align-items: center; gap: 28px; }
        .sb-nav-link {
          font-size: 13px; color: var(--text-secondary);
          text-decoration: none; letter-spacing: 0.02em;
          transition: color .16s ease;
        }
        .sb-nav-link:hover { color: var(--text-primary); }
        .sb-nav-cta {
          font-size: 13px; color: var(--text-primary);
          border: 1px solid var(--stone-line);
          padding: 10px 20px; border-radius: 2px;
          text-decoration: none; letter-spacing: 0.04em;
          transition: border-color .16s ease, background .16s ease;
        }
        .sb-nav-cta:hover { border-color: var(--accent); background: var(--accent-bg); }

        .sb-shell { max-width: 880px; margin: 0 auto; padding: 96px 40px 120px; }
        .sb-serial {
          font-size: 11px; letter-spacing: 0.24em;
          text-transform: uppercase; color: var(--text-muted);
          margin-bottom: 28px;
        }
        .sb-title {
          font-family: var(--font-playfair), serif;
          font-weight: 700;
          font-size: clamp(40px, 6vw, 70px);
          line-height: 1.05; letter-spacing: -0.015em;
          margin: 0 0 28px;
        }
        .sb-title em { font-style: italic; color: var(--accent); }
        .sb-lede {
          font-size: 18px; line-height: 1.65;
          color: var(--text-secondary);
          max-width: 720px; margin: 0 0 22px;
        }
        .sb-lede strong { color: var(--text-primary); font-weight: 600; }

        .sb-divider { width: 48px; height: 1px; background: var(--stone-line); margin: 64px 0; }
        .sb-h2 {
          font-family: var(--font-playfair), serif;
          font-weight: 700; font-size: clamp(26px, 3vw, 36px);
          line-height: 1.15; margin: 0 0 28px;
          letter-spacing: -0.01em;
        }

        .sb-pillars {
          display: grid; grid-template-columns: 1fr 1fr; gap: 32px;
        }
        @media (max-width: 720px) { .sb-pillars { grid-template-columns: 1fr; } }
        .sb-pillar { padding-top: 18px; border-top: 1px solid var(--stone-line); }
        .sb-pillar-n {
          font-family: var(--font-playfair), serif;
          font-style: italic; font-weight: 700;
          font-size: 20px; color: var(--accent);
          margin-bottom: 10px;
        }
        .sb-pillar-title {
          font-size: 18px; font-weight: 600;
          margin: 0 0 10px; letter-spacing: -0.005em;
        }
        .sb-pillar-body {
          font-size: 15px; line-height: 1.6;
          color: var(--text-secondary); margin: 0;
        }

        .sb-contact { list-style: none; padding: 0; margin: 0; }
        .sb-contact li {
          display: flex; gap: 24px;
          padding: 18px 0;
          border-bottom: 1px solid var(--stone-line);
          align-items: baseline;
        }
        .sb-contact-label {
          font-size: 11px; letter-spacing: 0.24em;
          text-transform: uppercase; color: var(--text-muted);
          min-width: 110px;
        }
        .sb-contact a {
          color: var(--text-primary);
          text-decoration: none;
          font-size: 16px; font-weight: 500;
          border-bottom: 1px solid transparent;
          transition: border-color .16s ease;
        }
        .sb-contact a:hover { border-bottom-color: var(--accent); }

        .sb-cta {
          margin-top: 72px;
          display: flex; gap: 16px; flex-wrap: wrap;
        }
        .sb-cta-btn {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 16px 28px;
          background: var(--primary); color: var(--bg-base);
          text-decoration: none;
          font-size: 14px; font-weight: 600; letter-spacing: 0.04em;
          border-radius: 2px;
          transition: transform .16s ease;
        }
        .sb-cta-btn:hover { transform: translateY(-1px); }
        .sb-cta-ghost {
          display: inline-flex; align-items: center;
          padding: 16px 28px;
          border: 1px solid var(--stone-line);
          color: var(--text-primary);
          text-decoration: none;
          font-size: 14px; letter-spacing: 0.04em;
          border-radius: 2px;
        }

        .sb-footer {
          margin-top: 96px; padding-top: 24px;
          border-top: 1px solid var(--stone-line);
          display: flex; justify-content: space-between; flex-wrap: wrap;
          gap: 12px; font-size: 12px; color: var(--text-muted);
          letter-spacing: 0.06em;
        }
        .sb-footer-links { display: flex; gap: 18px; }
        .sb-footer a { color: var(--text-muted); text-decoration: none; }
        .sb-footer a:hover { color: var(--text-primary); }
      `}</style>
    </div>
  )
}
