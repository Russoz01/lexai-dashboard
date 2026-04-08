import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso | LexAI',
  description: 'Termos de Uso da LexAI. Condicoes de contratacao, uso aceitavel, garantia de reembolso, propriedade intelectual e limitacoes de responsabilidade.',
  alternates: { canonical: 'https://lexai.com.br/termos' },
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

export default function TermosPage() {
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
          <Link href="/privacidade" style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 500 }}>Privacidade</Link>
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#3B82F6', marginBottom: 16, padding: '6px 12px', borderRadius: 20, background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.20)' }}>
            <i className="bi bi-file-text" />Termos e Condicoes
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', marginBottom: 12, lineHeight: 1.15 }}>
            Termos de Uso
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0 }}>
            Ultima atualizacao: 07 de abril de 2026 &middot; Regidos pela legislacao brasileira (Lei 10.406/2002 &mdash; Codigo Civil e Lei 8.078/1990 &mdash; CDC).
          </p>
        </div>

        {/* Section 1: Aceitacao */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>1. Aceitacao dos termos</h2>
          <p style={pStyle}>
            Ao se cadastrar, acessar ou utilizar a plataforma LexAI (&ldquo;Plataforma&rdquo;), voce (&ldquo;Usuario&rdquo;) declara ter lido, compreendido e aceito integralmente estes Termos de Uso (&ldquo;Termos&rdquo;) e a nossa <Link href="/privacidade" style={{ color: '#3B82F6', textDecoration: 'underline' }}>Politica de Privacidade</Link>, formando um contrato juridicamente vinculante entre voce e a LexAI.
          </p>
          <p style={pStyle}>
            Se voce nao concordar com qualquer disposicao destes Termos, voce deve imediatamente interromper o uso da Plataforma. O uso continuado sera considerado aceitacao tacita dos Termos vigentes.
          </p>
          <p style={pStyle}>
            Voce declara ter pelo menos 18 anos ou capacidade civil plena para contratar, nos termos do art. 5 do Codigo Civil Brasileiro.
          </p>
        </section>

        {/* Section 2: Descricao do servico */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>2. Descricao do servico</h2>
          <p style={pStyle}>
            A LexAI e uma plataforma de software como servico (SaaS) que oferece 10 agentes de inteligencia artificial especializados para apoiar profissionais e estudantes do Direito brasileiro em tarefas como analise de documentos, pesquisa jurisprudencial, redacao de pecas, calculos juridicos, estudo de legislacao e organizacao de rotina.
          </p>
          <p style={pStyle}>
            <strong style={{ color: '#fff' }}>A LexAI e uma ferramenta de apoio tecnologico e NAO substitui o trabalho de advogado habilitado.</strong> Os agentes utilizam modelos de linguagem (LLMs) treinados em textos juridicos, mas suas respostas devem ser entendidas como ponto de partida e jamais como parecer juridico definitivo.
          </p>
        </section>

        {/* Section 3: Disclaimer juridico forte */}
        <section style={sectionStyle}>
          <div style={{
            padding: '28px 32px', borderRadius: 16,
            background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.25)',
          }}>
            <h2 style={{ ...h2Style, color: '#EF4444', marginBottom: 16, fontSize: 22 }}>
              <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: 10 }} />
              3. Disclaimer juridico
            </h2>
            <p style={{ ...pStyle, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
              A LexAI nao presta consultoria juridica, parecer tecnico, assessoria ou representacao processual. A Plataforma e exclusivamente uma ferramenta de produtividade baseada em inteligencia artificial generativa.
            </p>
            <p style={{ ...pStyle, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
              <strong style={{ color: '#fff' }}>Os outputs gerados pelos agentes devem ser obrigatoriamente revisados, validados e adaptados por advogado regularmente inscrito na Ordem dos Advogados do Brasil (OAB) antes de qualquer uso processual, contratual, negocial ou extrajudicial.</strong>
            </p>
            <p style={{ ...pStyle, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
              A LexAI nao se responsabiliza, sob qualquer hipotese, por decisoes, peticoes, contratos, acordos, pareceres ou quaisquer atos juridicos baseados exclusivamente em outputs gerados pela Plataforma. Modelos de IA podem apresentar imprecisoes, citacoes inexistentes (&ldquo;alucinacoes&rdquo;), informacoes desatualizadas ou interpretacoes incorretas da legislacao e da jurisprudencia.
            </p>
            <p style={{ ...pStyle, color: 'rgba(255,255,255,0.85)', fontWeight: 500, marginBottom: 0 }}>
              O Usuario assume integral responsabilidade pela verificacao da precisao, aplicabilidade e conformidade dos conteudos gerados com o caso concreto e com a legislacao vigente.
            </p>
          </div>
        </section>

        {/* Section 4: Conta do usuario */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>4. Conta do usuario</h2>
          <p style={pStyle}>
            Para utilizar a Plataforma, voce deve criar uma conta pessoal fornecendo informacoes verdadeiras, completas e atualizadas. As seguintes regras se aplicam:
          </p>
          <ul style={ulStyle}>
            <li><strong style={{ color: '#fff' }}>Unica conta por pessoa:</strong> cada Usuario deve manter apenas uma conta ativa. Contas multiplas criadas pela mesma pessoa poderao ser suspensas sem aviso previo.</li>
            <li><strong style={{ color: '#fff' }}>Proibido o compartilhamento:</strong> credenciais de acesso (e-mail e senha) sao pessoais e intransferiveis. O compartilhamento de conta com terceiros viola estes Termos e pode resultar em suspensao imediata.</li>
            <li><strong style={{ color: '#fff' }}>Seguranca das credenciais:</strong> voce e responsavel por manter suas credenciais em sigilo e por todas as atividades realizadas atraves da sua conta. Notifique-nos imediatamente em caso de acesso nao autorizado.</li>
            <li><strong style={{ color: '#fff' }}>Planos Enterprise:</strong> podem contratar multiplos assentos (seats) mediante contrato especifico, caso em que cada seat corresponde a um usuario nominal.</li>
          </ul>
          <p style={pStyle}>
            A LexAI se reserva o direito de recusar, suspender ou encerrar contas que violem estes Termos, apresentem comportamento suspeito ou indicadores de fraude.
          </p>
        </section>

        {/* Section 5: Pagamento */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>5. Pagamento e assinatura</h2>
          <p style={pStyle}>
            A LexAI oferece assinaturas recorrentes nos planos Starter, Pro e Enterprise, com preco e recursos descritos na pagina de planos. As condicoes comerciais sao as seguintes:
          </p>
          <ul style={ulStyle}>
            <li><strong style={{ color: '#fff' }}>Processador de pagamento:</strong> todos os pagamentos sao processados pela Stripe, empresa certificada PCI-DSS nivel 1. A LexAI jamais armazena dados de cartao de credito.</li>
            <li><strong style={{ color: '#fff' }}>Cobranca mensal recorrente:</strong> o valor do plano escolhido e cobrado automaticamente a cada periodo contratual (mensal ou anual, conforme selecao).</li>
            <li><strong style={{ color: '#fff' }}>Sem fidelidade ou multa de rescisao:</strong> voce pode cancelar sua assinatura a qualquer momento, sem penalidades ou carencia, direto pelo portal do cliente Stripe ou pela area logada.</li>
            <li><strong style={{ color: '#fff' }}>Reajuste:</strong> os precos podem ser reajustados anualmente, com notificacao previa minima de 30 dias. Reajustes nao afetam o periodo ja pago.</li>
            <li><strong style={{ color: '#fff' }}>Inadimplencia:</strong> em caso de falha no pagamento, a LexAI tentara nova cobranca por ate 7 dias. Persistindo a inadimplencia, o acesso sera suspenso ate regularizacao.</li>
            <li><strong style={{ color: '#fff' }}>Notas fiscais:</strong> emitidas conforme legislacao tributaria aplicavel, mediante solicitacao do cliente.</li>
          </ul>
        </section>

        {/* Section 6: Trial gratuito */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>6. Trial gratuito</h2>
          <p style={pStyle}>
            Novos usuarios podem experimentar a Plataforma gratuitamente por 2 (dois) dias corridos, a contar da criacao da conta, sob as seguintes regras:
          </p>
          <ul style={ulStyle}>
            <li><strong style={{ color: '#fff' }}>1 trial por pessoa:</strong> cada pessoa fisica tem direito a apenas 1 trial, mesmo que crie contas diferentes. A tentativa de obter multiplos trials e vedada.</li>
            <li><strong style={{ color: '#fff' }}>Detecao de fraude:</strong> a LexAI monitora padroes de uso (e-mails descartaveis, IPs, dispositivos, dados de cadastro) para identificar tentativas de fraude. Contas suspeitas podem ser bloqueadas sem aviso previo.</li>
            <li><strong style={{ color: '#fff' }}>Sem cobranca no trial:</strong> o trial nao exige cartao de credito cadastrado. Ao final dos 2 dias, o acesso e limitado ate a contratacao de um plano pago.</li>
            <li><strong style={{ color: '#fff' }}>Limites:</strong> durante o trial, o Usuario tem acesso aos recursos do plano Starter, respeitados os limites de uso descritos na pagina de planos.</li>
          </ul>
        </section>

        {/* Section 7: Garantia de reembolso */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>7. Garantia de reembolso</h2>
          <p style={pStyle}>
            Em conformidade com o artigo 49 do Codigo de Defesa do Consumidor (Lei 8.078/1990) e como politica comercial adicional, a LexAI oferece garantia de reembolso integral nas seguintes condicoes:
          </p>
          <ul style={ulStyle}>
            <li><strong style={{ color: '#fff' }}>Prazo de 7 dias:</strong> voce pode solicitar o reembolso integral da primeira cobranca ate 7 (sete) dias corridos apos a contratacao, sem necessidade de justificativa.</li>
            <li><strong style={{ color: '#fff' }}>Devolucao via Stripe:</strong> o valor e devolvido integralmente pelo mesmo meio de pagamento usado na compra, em ate 10 dias uteis apos a solicitacao.</li>
            <li><strong style={{ color: '#fff' }}>Cancelamento da conta:</strong> ao solicitar o reembolso, sua assinatura sera cancelada e o acesso a Plataforma interrompido.</li>
            <li><strong style={{ color: '#fff' }}>Abusos:</strong> solicitacoes reiteradas de reembolso pelo mesmo usuario, bem como fraudes, nao serao aceitas.</li>
          </ul>
          <p style={pStyle}>
            Para solicitar reembolso, envie e-mail para o contato listado no item 13 desta pagina.
          </p>
        </section>

        {/* Section 8: Uso aceitavel */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>8. Uso aceitavel</h2>
          <p style={pStyle}>
            Voce se compromete a utilizar a LexAI de forma licita, etica e em conformidade com estes Termos. E expressamente proibido:
          </p>
          <ul style={ulStyle}>
            <li>Enviar spam, mensagens em massa ou conteudo nao solicitado atraves da Plataforma.</li>
            <li>Tentar burlar limites de uso, quotas, rate limits ou mecanismos tecnicos de controle da Plataforma.</li>
            <li>Realizar scraping, coleta automatizada, engenharia reversa ou minerar dados da Plataforma sem autorizacao expressa.</li>
            <li>Utilizar a Plataforma para gerar, processar ou armazenar conteudo ilegal, discriminatorio, difamatorio, obsceno, violento ou que incite crimes.</li>
            <li>Usar a Plataforma para infringir direitos autorais, marcas, patentes, segredos comerciais ou qualquer direito de propriedade intelectual de terceiros.</li>
            <li>Transmitir virus, malware, cavalos de Troia ou qualquer codigo malicioso.</li>
            <li>Realizar ataques de negacao de servico (DoS/DDoS), exploits, sondagens de seguranca nao autorizadas ou qualquer tentativa de comprometer a infraestrutura.</li>
            <li>Revender, sublicenciar ou oferecer a Plataforma como servico proprio sem autorizacao por escrito da LexAI.</li>
            <li>Criar produtos ou servicos concorrentes com base no uso da LexAI.</li>
          </ul>
          <p style={pStyle}>
            O descumprimento das regras de uso aceitavel resulta em suspensao imediata da conta, sem direito a reembolso, e pode acarretar responsabilizacao civil e criminal do infrator.
          </p>
        </section>

        {/* Section 9: Propriedade intelectual */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>9. Propriedade intelectual</h2>
          <h3 style={h3Style}>9.1 Propriedade da LexAI</h3>
          <p style={pStyle}>
            Todo o codigo-fonte, design, marca, nome &ldquo;LexAI&rdquo;, logotipos, textos institucionais, prompts proprietarios, modelos customizados, documentacao e arquitetura da Plataforma sao de propriedade exclusiva da LexAI, protegidos pela Lei 9.610/1998 (Direitos Autorais), Lei 9.279/1996 (Propriedade Industrial) e demais normas aplicaveis.
          </p>
          <p style={pStyle}>
            A assinatura da LexAI concede ao Usuario uma licenca nao exclusiva, intransferivel, revogavel e limitada para utilizar a Plataforma conforme o plano contratado. Nenhuma outra cessao de direitos e realizada.
          </p>
          <h3 style={h3Style}>9.2 Conteudo gerado pelo usuario</h3>
          <p style={pStyle}>
            O conteudo produzido pelos agentes IA a partir dos prompts e documentos enviados pelo Usuario (&ldquo;Outputs&rdquo;) pertence ao Usuario, que pode utiliza-lo livremente para qualquer finalidade licita, respeitados os direitos de terceiros.
          </p>
          <p style={pStyle}>
            O Usuario garante que tem os direitos necessarios sobre os documentos e dados que submete a Plataforma e assume integral responsabilidade pelo conteudo inserido. A LexAI nao revisa previamente os conteudos processados.
          </p>
        </section>

        {/* Section 10: Limitacao de responsabilidade */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>10. Limitacao de responsabilidade</h2>
          <p style={pStyle}>
            Na medida maxima permitida pela legislacao brasileira, a LexAI nao se responsabiliza por:
          </p>
          <ul style={ulStyle}>
            <li>Decisoes, peticoes, contratos ou atos juridicos baseados exclusivamente em outputs da Plataforma, sem revisao por advogado habilitado.</li>
            <li>Danos indiretos, lucros cessantes, perda de oportunidade, perda de dados, custas processuais ou honorarios sucumbenciais decorrentes do uso ou da incapacidade de uso da Plataforma.</li>
            <li>Indisponibilidades temporarias decorrentes de manutencao programada, falhas de terceiros (Anthropic, Supabase, Stripe, Vercel) ou casos fortuitos.</li>
            <li>Conteudo incorreto, desatualizado ou alucinacoes tipicas de modelos de linguagem, embora envidemos esforcos para mitigar esses riscos.</li>
            <li>Atos praticados por terceiros com base em informacoes obtidas na Plataforma.</li>
          </ul>
          <p style={pStyle}>
            Em qualquer hipotese, a responsabilidade total da LexAI fica limitada ao valor efetivamente pago pelo Usuario nos 12 (doze) meses anteriores ao evento que gerou a responsabilizacao.
          </p>
          <p style={pStyle}>
            Nada nestes Termos exclui responsabilidades que nao podem ser limitadas ou excluidas pela legislacao brasileira aplicavel, como obrigacoes decorrentes do Codigo de Defesa do Consumidor em relacao aos direitos basicos do consumidor.
          </p>
        </section>

        {/* Section 11: Alteracoes */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>11. Alteracoes nos termos</h2>
          <p style={pStyle}>
            A LexAI pode alterar estes Termos periodicamente para refletir mudancas legais, em seus servicos ou em suas praticas comerciais. As alteracoes materiais serao comunicadas por e-mail e/ou aviso destacado na Plataforma com antecedencia minima de 15 dias.
          </p>
          <p style={pStyle}>
            O uso continuado da Plataforma apos a entrada em vigor das alteracoes constituira aceitacao tacita dos novos Termos. Caso nao concorde, voce pode cancelar sua assinatura a qualquer momento sem penalidades.
          </p>
          <p style={pStyle}>
            A versao mais recente dos Termos estara sempre disponivel nesta pagina, com a data da ultima atualizacao indicada no topo.
          </p>
        </section>

        {/* Section 12: Lei aplicavel e foro */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>12. Lei aplicavel e foro</h2>
          <p style={pStyle}>
            Estes Termos sao regidos pelas leis da Republica Federativa do Brasil, em especial pelo Codigo Civil (Lei 10.406/2002), Codigo de Defesa do Consumidor (Lei 8.078/1990), Marco Civil da Internet (Lei 12.965/2014) e Lei Geral de Protecao de Dados (Lei 13.709/2018).
          </p>
          <p style={pStyle}>
            Fica eleito o foro da Comarca de <strong style={{ color: '#fff' }}>Uberlandia, Minas Gerais</strong>, para dirimir quaisquer questoes decorrentes destes Termos, salvo se o Usuario for consumidor, hipotese em que podera optar pelo foro do seu domicilio, nos termos do artigo 101, I, do CDC.
          </p>
          <p style={pStyle}>
            As partes concordam em tentar resolver qualquer disputa amigavelmente, por meio de contato direto com a LexAI, antes de recorrer a medidas judiciais.
          </p>
        </section>

        {/* Section 13: Contato */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>13. Contato</h2>
          <p style={pStyle}>
            Para duvidas, reclamacoes, solicitacoes ou suporte, entre em contato:
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
            O prazo de resposta para solicitacoes comuns e de ate 3 dias uteis. Em caso de urgencias ou suspensoes indevidas, prioridade total.
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
