import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politica de Privacidade | LexAI',
  description: 'Politica de Privacidade da LexAI em conformidade com a Lei Geral de Protecao de Dados (LGPD, Lei 13.709/2018). Saiba como coletamos, usamos e protegemos seus dados.',
  alternates: { canonical: 'https://lexai.com.br/privacidade' },
}

const sectionStyle: React.CSSProperties = {
  marginBottom: 48,
}

const h2Style: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: '#fff',
  letterSpacing: '-0.5px',
  marginBottom: 16,
  marginTop: 0,
}

const h3Style: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: '#fff',
  marginBottom: 8,
  marginTop: 20,
}

const pStyle: React.CSSProperties = {
  fontSize: 15,
  color: 'rgba(255,255,255,0.70)',
  lineHeight: 1.75,
  marginBottom: 14,
}

const ulStyle: React.CSSProperties = {
  fontSize: 15,
  color: 'rgba(255,255,255,0.70)',
  lineHeight: 1.75,
  paddingLeft: 22,
  marginBottom: 14,
}

export default function PrivacidadePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#F1F1F1', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#F1F1F1' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #141414, #2A2A2A)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(59,130,246,0.20)' }}>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>LX</span>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>LexAI</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 500 }}>Inicio</Link>
          <Link href="/termos" style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 500 }}>Termos</Link>
          <Link href="/login" style={{ fontSize: 14, color: '#fff', background: '#2563EB', padding: '8px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
            Entrar
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '60px 48px' }}>

        {/* Back link */}
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', marginBottom: 32,
        }}>
          <i className="bi bi-arrow-left" /> Voltar
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#10B981', marginBottom: 16, padding: '6px 12px', borderRadius: 20, background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.20)' }}>
            <i className="bi bi-shield-check" />LGPD Compliant
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', marginBottom: 12, lineHeight: 1.15 }}>
            Politica de Privacidade
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0 }}>
            Ultima atualizacao: 07 de abril de 2026 &middot; Em conformidade com a Lei 13.709/2018 (LGPD).
          </p>
        </div>

        {/* Section 1: Quem somos */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>1. Quem somos</h2>
          <p style={pStyle}>
            A LexAI (&ldquo;nos&rdquo;, &ldquo;nossa&rdquo; ou &ldquo;plataforma&rdquo;) e uma plataforma de inteligencia artificial voltada para advogados, estudantes de Direito e departamentos juridicos brasileiros. Nossos 10 agentes especializados auxiliam em analise de documentos, pesquisa jurisprudencial, redacao de pecas processuais, calculos juridicos e outras tarefas de apoio juridico.
          </p>
          <h3 style={h3Style}>Controlador dos dados</h3>
          <p style={pStyle}>
            Para fins da Lei 13.709/2018 (LGPD), a LexAI atua como <strong style={{ color: '#fff' }}>controladora</strong> dos dados pessoais coletados pela plataforma. Nosso encarregado de dados (DPO) pode ser contatado pelos canais listados no item 10 desta politica.
          </p>
        </section>

        {/* Section 2: Dados coletados */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>2. Quais dados coletamos</h2>
          <p style={pStyle}>
            Coletamos apenas os dados necessarios para prestar o servico e atender requisitos legais. Os dados coletados sao organizados em tres categorias:
          </p>
          <h3 style={h3Style}>2.1 Dados de cadastro e autenticacao</h3>
          <ul style={ulStyle}>
            <li>Nome completo e nome de usuario</li>
            <li>Endereco de e-mail</li>
            <li>Senha (armazenada com hash bcrypt, nunca em texto claro)</li>
            <li>Tokens de autenticacao gerados pelo Supabase Auth</li>
            <li>Data de criacao e ultimo acesso</li>
          </ul>
          <h3 style={h3Style}>2.2 Dados de uso e documentos enviados</h3>
          <ul style={ulStyle}>
            <li>Documentos carregados para analise (peticoes, contratos, decisoes)</li>
            <li>Prompts enviados aos agentes IA e respostas geradas</li>
            <li>Historico de interacoes com a plataforma</li>
            <li>Logs de uso (quantidade de requisicoes, agentes acessados)</li>
            <li>Preferencias de interface (tema escuro/claro, idioma)</li>
          </ul>
          <h3 style={h3Style}>2.3 Dados tecnicos e de navegacao</h3>
          <ul style={ulStyle}>
            <li>Endereco IP e dados de geolocalizacao aproximada</li>
            <li>Tipo de navegador, sistema operacional e dispositivo</li>
            <li>Datas e horarios de acesso</li>
            <li>Cookies de autenticacao (necessarios) e analytics (opcionais)</li>
          </ul>
        </section>

        {/* Section 3: Como usamos */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>3. Como usamos seus dados</h2>
          <p style={pStyle}>
            Os dados coletados sao utilizados exclusivamente para as seguintes finalidades:
          </p>
          <ul style={ulStyle}>
            <li><strong style={{ color: '#fff' }}>Prestar o servico contratado:</strong> processar documentos, gerar respostas dos agentes IA e manter seu historico de uso.</li>
            <li><strong style={{ color: '#fff' }}>Autenticar e proteger sua conta:</strong> verificar sua identidade, detectar acessos suspeitos e prevenir fraudes.</li>
            <li><strong style={{ color: '#fff' }}>Faturamento e cobranca:</strong> processar pagamentos via Stripe e emitir notas fiscais quando aplicavel.</li>
            <li><strong style={{ color: '#fff' }}>Melhorar o servico:</strong> analisar metricas agregadas e anonimas para identificar gargalos, bugs e oportunidades de melhoria.</li>
            <li><strong style={{ color: '#fff' }}>Comunicacao:</strong> enviar notificacoes essenciais sobre sua conta, faturas e atualizacoes criticas.</li>
          </ul>
          <div style={{
            marginTop: 20, padding: '20px 24px', borderRadius: 12,
            background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#10B981', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <i className="bi bi-shield-lock-fill" style={{ marginRight: 6 }} />Compromissos firmes
            </div>
            <ul style={{ ...ulStyle, margin: 0, color: 'rgba(255,255,255,0.82)' }}>
              <li><strong style={{ color: '#fff' }}>NAO vendemos</strong> seus dados pessoais, prompts ou documentos para terceiros.</li>
              <li><strong style={{ color: '#fff' }}>NAO usamos</strong> seus documentos ou prompts para treinar modelos de IA, proprios ou de terceiros.</li>
              <li><strong style={{ color: '#fff' }}>NAO compartilhamos</strong> seus dados com anunciantes ou redes de publicidade.</li>
              <li>Seus documentos sao processados pelos agentes IA e retornam apenas para voce.</li>
            </ul>
          </div>
        </section>

        {/* Section 4: Base legal */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>4. Base legal para o tratamento</h2>
          <p style={pStyle}>
            O tratamento dos seus dados pessoais se fundamenta nas bases legais previstas no artigo 7 da LGPD:
          </p>
          <ul style={ulStyle}>
            <li><strong style={{ color: '#fff' }}>Execucao de contrato (art. 7, V):</strong> para prestar o servico de IA juridica que voce contratou, incluindo processamento de documentos e geracao de respostas.</li>
            <li><strong style={{ color: '#fff' }}>Consentimento (art. 7, I):</strong> para cookies nao essenciais (analytics), comunicacoes de marketing e qualquer tratamento adicional que voce autorize expressamente.</li>
            <li><strong style={{ color: '#fff' }}>Obrigacao legal (art. 7, II):</strong> para cumprir obrigacoes fiscais, tributarias e de prevencao a fraude.</li>
            <li><strong style={{ color: '#fff' }}>Legitimo interesse (art. 7, IX):</strong> para garantir seguranca da plataforma, prevenir abusos e melhorar a experiencia, sempre respeitando seus direitos fundamentais.</li>
          </ul>
        </section>

        {/* Section 5: Compartilhamento */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>5. Compartilhamento com terceiros</h2>
          <p style={pStyle}>
            Para prestar o servico, contamos com operadores (processadores de dados) que atendem aos mais altos padroes de seguranca e compliance. Nenhum desses parceiros tem permissao para usar seus dados para fins proprios:
          </p>
          <ul style={ulStyle}>
            <li><strong style={{ color: '#fff' }}>Anthropic (Claude API):</strong> processa os prompts e documentos para gerar as respostas dos agentes IA. A Anthropic declara nao reter ou treinar modelos com dados da API comercial.</li>
            <li><strong style={{ color: '#fff' }}>Supabase:</strong> hospeda nosso banco de dados PostgreSQL (autenticacao, assinaturas, historico). Dados armazenados na Uniao Europeia com criptografia em repouso.</li>
            <li><strong style={{ color: '#fff' }}>Stripe:</strong> processa pagamentos e assinaturas. A Stripe e certificada PCI-DSS nivel 1 e jamais expomos dados de cartao a nossa infraestrutura.</li>
            <li><strong style={{ color: '#fff' }}>Vercel:</strong> hospeda e entrega a aplicacao web atraves da CDN global, com isolamento por regiao.</li>
          </ul>
          <p style={pStyle}>
            Eventualmente, dados podem ser compartilhados com autoridades publicas mediante ordem judicial fundamentada, nos termos do art. 11, II, da LGPD.
          </p>
        </section>

        {/* Section 6: Direitos do titular */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>6. Direitos do titular dos dados</h2>
          <p style={pStyle}>
            Voce, como titular dos dados, possui todos os direitos garantidos pelo artigo 18 da LGPD. A qualquer momento, voce pode solicitar:
          </p>
          <ul style={ulStyle}>
            <li><strong style={{ color: '#fff' }}>Confirmacao e acesso (art. 18, I e II):</strong> saber se tratamos seus dados e receber copia completa deles.</li>
            <li><strong style={{ color: '#fff' }}>Correcao (art. 18, III):</strong> corrigir dados incompletos, inexatos ou desatualizados.</li>
            <li><strong style={{ color: '#fff' }}>Anonimizacao, bloqueio ou eliminacao (art. 18, IV):</strong> solicitar que dados desnecessarios ou excessivos sejam anonimizados, bloqueados ou apagados.</li>
            <li><strong style={{ color: '#fff' }}>Portabilidade (art. 18, V):</strong> receber seus dados em formato estruturado e interoperavel para transferir a outro fornecedor.</li>
            <li><strong style={{ color: '#fff' }}>Eliminacao (art. 18, VI):</strong> solicitar exclusao dos dados tratados com base no seu consentimento, respeitadas as obrigacoes legais de retencao.</li>
            <li><strong style={{ color: '#fff' }}>Informacao sobre compartilhamentos (art. 18, VII):</strong> saber com quais entidades publicas ou privadas compartilhamos seus dados.</li>
            <li><strong style={{ color: '#fff' }}>Revogacao do consentimento (art. 18, IX):</strong> retirar, a qualquer momento, o consentimento concedido, sem prejuizo da licitude do tratamento anterior.</li>
          </ul>
          <p style={pStyle}>
            Para exercer qualquer desses direitos, envie um e-mail ao nosso DPO (item 10). Responderemos em ate 15 dias corridos.
          </p>
        </section>

        {/* Section 7: Seguranca */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>7. Seguranca da informacao</h2>
          <p style={pStyle}>
            Adotamos medidas tecnicas e organizacionais de seguranca proporcionais aos riscos, em conformidade com o artigo 46 da LGPD:
          </p>
          <ul style={ulStyle}>
            <li><strong style={{ color: '#fff' }}>Criptografia em transito:</strong> TLS 1.3 em todas as conexoes (HTTPS obrigatorio).</li>
            <li><strong style={{ color: '#fff' }}>Criptografia em repouso:</strong> banco de dados PostgreSQL com criptografia AES-256 no Supabase.</li>
            <li><strong style={{ color: '#fff' }}>Row Level Security (RLS):</strong> politicas no banco garantem que cada usuario so acesse seus proprios dados.</li>
            <li><strong style={{ color: '#fff' }}>Headers de seguranca:</strong> CSP, HSTS, X-Frame-Options, X-Content-Type-Options e Referrer-Policy configurados.</li>
            <li><strong style={{ color: '#fff' }}>Hashing de senhas:</strong> bcrypt com cost factor alto, senhas nunca armazenadas em texto.</li>
            <li><strong style={{ color: '#fff' }}>Monitoramento e logs:</strong> detecao de anomalias e tentativas de acesso suspeitas.</li>
            <li><strong style={{ color: '#fff' }}>Backups diarios:</strong> com retencao de 30 dias e testes periodicos de restauracao.</li>
          </ul>
          <p style={pStyle}>
            Em caso de incidente de seguranca que possa gerar risco ou dano relevante ao titular, comunicaremos voce e a ANPD em prazo razoavel, conforme art. 48 da LGPD.
          </p>
        </section>

        {/* Section 8: Retencao */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>8. Retencao dos dados</h2>
          <p style={pStyle}>
            Os dados sao mantidos apenas pelo periodo necessario para as finalidades descritas nesta politica ou para cumprir obrigacoes legais. Os prazos tipicos sao:
          </p>
          <ul style={ulStyle}>
            <li><strong style={{ color: '#fff' }}>Conta ativa:</strong> enquanto sua assinatura estiver vigente.</li>
            <li><strong style={{ color: '#fff' }}>Documentos e historico:</strong> conforme o plano contratado (Starter 30 dias, Pro 90 dias, Enterprise ilimitado enquanto ativo).</li>
            <li><strong style={{ color: '#fff' }}>Dados de cadastro apos cancelamento:</strong> ate 90 dias para permitir reativacao, depois anonimizados.</li>
            <li><strong style={{ color: '#fff' }}>Dados fiscais e de faturamento:</strong> 5 anos, em cumprimento ao Codigo Tributario Nacional (art. 173 CTN).</li>
            <li><strong style={{ color: '#fff' }}>Logs de seguranca:</strong> 6 meses, para detecao de fraudes e investigacoes.</li>
          </ul>
          <p style={pStyle}>
            Apos expirados os prazos legais, os dados sao eliminados de forma segura ou anonimizados de modo irreversivel.
          </p>
        </section>

        {/* Section 9: Cookies */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>9. Cookies e tecnologias similares</h2>
          <p style={pStyle}>
            Utilizamos cookies para garantir o funcionamento da plataforma e, quando autorizado, para analise de uso. Os cookies sao divididos em duas categorias:
          </p>
          <h3 style={h3Style}>9.1 Cookies necessarios</h3>
          <p style={pStyle}>
            Indispensaveis para o funcionamento do site. Incluem cookies de autenticacao (sessao, CSRF token) e preferencias basicas (tema). Esses cookies nao exigem consentimento, conforme art. 7, VIII, da LGPD (execucao de contrato).
          </p>
          <h3 style={h3Style}>9.2 Cookies de analytics (opcionais)</h3>
          <p style={pStyle}>
            Usados para medir uso agregado da plataforma (paginas mais acessadas, tempo de sessao, erros). Sao anonimizados e so sao ativados com seu consentimento expresso atraves do banner de cookies. Voce pode revogar o consentimento a qualquer momento.
          </p>
        </section>

        {/* Section 10: Contato DPO */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>10. Contato do Encarregado (DPO)</h2>
          <p style={pStyle}>
            Para exercer seus direitos, tirar duvidas sobre o tratamento dos seus dados ou reportar incidentes, entre em contato com nosso Encarregado pela Protecao de Dados:
          </p>
          <div style={{
            padding: '20px 24px', borderRadius: 12,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            marginBottom: 14,
          }}>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
              <i className="bi bi-envelope-fill" style={{ marginRight: 8, color: '#3B82F6' }} />
              <strong style={{ color: '#fff' }}>E-mail:</strong> luizfernandoleonardoleonardo@gmail.com
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
              <i className="bi bi-telephone-fill" style={{ marginRight: 8, color: '#3B82F6' }} />
              <strong style={{ color: '#fff' }}>Telefone:</strong> (34) 99302-6456
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>
              <i className="bi bi-geo-alt-fill" style={{ marginRight: 8, color: '#3B82F6' }} />
              <strong style={{ color: '#fff' }}>Endereco:</strong> Uberlandia, Minas Gerais &mdash; Brasil
            </div>
          </div>
          <p style={pStyle}>
            Voce tambem pode apresentar reclamacao diretamente a Autoridade Nacional de Protecao de Dados (ANPD) atraves do site <span style={{ color: '#3B82F6' }}>www.gov.br/anpd</span>.
          </p>
        </section>

        {/* Section 11: Atualizacoes */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>11. Atualizacoes desta politica</h2>
          <p style={pStyle}>
            Esta politica pode ser atualizada periodicamente para refletir mudancas na legislacao, em nossos servicos ou em nossas praticas de privacidade. Quando houver alteracoes materiais, notificaremos voce por e-mail e/ou atraves de aviso destacado na plataforma com antecedencia minima de 15 dias.
          </p>
          <p style={pStyle}>
            A data da ultima atualizacao esta indicada no topo deste documento: <strong style={{ color: '#fff' }}>07 de abril de 2026</strong>.
          </p>
          <p style={pStyle}>
            Ao continuar utilizando a LexAI apos as atualizacoes, voce concorda com os termos revisados. Caso nao concorde, voce pode solicitar o cancelamento da conta a qualquer momento.
          </p>
        </section>

      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.30)' }}>© 2026 LexAI · uma marca <strong style={{ color: 'rgba(255,255,255,0.55)' }}>Vanix Corp</strong></div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.50)', textDecoration: 'none' }}>Inicio</Link>
            <Link href="/empresas" style={{ color: 'rgba(255,255,255,0.50)', textDecoration: 'none' }}>Para Empresas</Link>
            <Link href="/privacidade" style={{ color: 'rgba(255,255,255,0.50)', textDecoration: 'none' }}>Privacidade (LGPD)</Link>
            <Link href="/termos" style={{ color: 'rgba(255,255,255,0.50)', textDecoration: 'none' }}>Termos de Uso</Link>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, fontSize: 13, flexWrap: 'wrap' }}>
          <span style={{ color: 'rgba(255,255,255,0.30)' }}>luizfernandoleonardoleonardo@gmail.com</span>
          <span style={{ color: 'rgba(255,255,255,0.30)' }}>(34) 99302-6456</span>
        </div>
      </footer>

      <style>{`
        @media (max-width: 640px) {
          nav { padding: 16px 20px !important; }
          main { padding: 40px 20px !important; }
          h1 { font-size: 32px !important; }
          h2 { font-size: 20px !important; }
        }
      `}</style>
    </div>
  )
}
