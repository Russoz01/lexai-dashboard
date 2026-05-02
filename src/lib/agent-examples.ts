/* ════════════════════════════════════════════════════════════════════
 * agent-examples · v1.0 (2026-05-02)
 * ────────────────────────────────────────────────────────────────────
 * Exemplos pre-prontos por agente para facilitar demo e onboarding.
 * Cada agente tem 1-3 exemplos: texto curto, realista, jurídico-BR,
 * sem PII real (nomes/CPFs ficcionais).
 *
 * Uso:
 *   import { AGENT_EXAMPLES } from '@/lib/agent-examples'
 *   const exemplo = AGENT_EXAMPLES.resumidor[0]
 *   setForm(exemplo.payload)
 *
 * Razão de existir: Demo-mode UX. Em vez de pedir pro prospect digitar
 * "qualquer caso" durante apresentação, um clique carrega caso real
 * com complexidade média que mostra todas as features do agente.
 * ═══════════════════════════════════════════════════════════════════ */

export interface AgentExample {
  label: string
  descricao: string
  payload: Record<string, string>
}

export const AGENT_EXAMPLES = {
  resumidor: [
    {
      label: 'Contrato de prestação de serviços',
      descricao: 'Contrato simples com cláusula de rescisão controversa',
      payload: {
        texto: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CONSULTORIA EMPRESARIAL

Pelo presente instrumento particular, de um lado VANIX SOLUÇÕES LTDA., pessoa jurídica de direito privado, inscrita no CNPJ sob o n° 12.345.678/0001-90, com sede na Rua Exemplo, 100, São Paulo/SP, neste ato representada por seu administrador, doravante denominada CONTRATANTE; e de outro lado JOÃO DA SILVA CONSULTORIA ME, inscrita no CNPJ sob o n° 98.765.432/0001-10, doravante denominada CONTRATADA, têm entre si justo e contratado o seguinte:

CLÁUSULA 1ª - OBJETO. A CONTRATADA prestará serviços de consultoria em gestão empresarial à CONTRATANTE, conforme escopo descrito no Anexo I.

CLÁUSULA 2ª - PRAZO. O presente contrato vigorará por 12 (doze) meses a partir de sua assinatura, podendo ser prorrogado por igual período mediante termo aditivo.

CLÁUSULA 3ª - VALOR. A CONTRATANTE pagará à CONTRATADA o valor mensal de R$ 8.500,00 (oito mil e quinhentos reais), até o 5° dia útil do mês subsequente à prestação dos serviços, mediante transferência bancária.

CLÁUSULA 4ª - RESCISÃO. O presente contrato poderá ser rescindido por qualquer das partes, mediante aviso prévio de 30 (trinta) dias, sem qualquer ônus. Em caso de rescisão antecipada pela CONTRATANTE sem motivação, esta deverá pagar multa equivalente a 100% (cem por cento) do valor remanescente do contrato.

CLÁUSULA 5ª - CONFIDENCIALIDADE. As partes se comprometem a manter sigilo absoluto sobre as informações trocadas durante a vigência deste contrato e por 5 (cinco) anos após seu término.

CLÁUSULA 6ª - FORO. Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer questões oriundas do presente contrato.

São Paulo, 15 de outubro de 2025.`,
      },
    },
  ],
  redator: [
    {
      label: 'Petição inicial - cobrança de honorários',
      descricao: 'Pedido de cobrança de honorários advocatícios não pagos',
      payload: {
        contexto: `Cliente: VANIX SOLUÇÕES LTDA.
Réu: ALPHA TECH SISTEMAS LTDA.
Honorários contratados: R$ 25.000,00 (parcelado em 5x de R$ 5.000)
Valor pago: R$ 10.000,00 (apenas as 2 primeiras parcelas)
Saldo devedor: R$ 15.000,00 + correção monetária + juros
Contrato assinado em 10/01/2025, serviços prestados de janeiro a agosto/2025
Última parcela vencida em 10/06/2025 — inadimplência há 4 meses
Cliente foi notificado extrajudicialmente em 15/09/2025 e não respondeu

Pedidos:
- Condenação ao pagamento do saldo devedor
- Correção monetária pelo INPC desde cada vencimento
- Juros de mora de 1% ao mês desde a citação
- Honorários sucumbenciais
- Custas processuais`,
      },
    },
  ],
  contestador: [
    {
      label: 'Contestação - ação de cobrança',
      descricao: 'Defesa em ação de cobrança com tese de prescrição',
      payload: {
        teseInicial: `Autor pleiteia cobrança de R$ 50.000,00 referentes a serviços supostamente prestados em fevereiro de 2019. Alega que houve contrato verbal e que o réu se recusou a pagar após emissão da nota fiscal em 15/02/2019. Junta apenas troca de e-mails de 2019 e a nota fiscal. Pede condenação ao pagamento + juros + correção desde a emissão da NF.`,
        teseDefesa: `O réu nega a existência da prestação dos serviços nos termos alegados. Defende: (1) prescrição da pretensão (5 anos do art. 206, §5°, I do CC já transcorridos da emissão da NF até a propositura da ação em 12/2025); (2) ausência de contrato escrito conforme exigido pela própria atividade alegada; (3) os e-mails juntados não comprovam a contratação dos serviços, apenas tratativas iniciais que não se concretizaram; (4) a nota fiscal foi emitida unilateralmente e nunca foi aceita ou paga, sem reclamação do autor por mais de 6 anos.`,
      },
    },
  ],
  parecerista: [
    {
      label: 'Parecer - rescisão indireta CLT',
      descricao: 'Análise de viabilidade de rescisão indireta por atraso salarial',
      payload: {
        consulta: `Empregado contratado em 03/2022 como Analista Pleno, salário R$ 6.500,00. A empresa atrasou os salários nos últimos 3 meses (julho, agosto, setembro/2025). Os atrasos têm sido de 15 a 25 dias do vencimento previsto no 5° dia útil. O empregado foi advertido verbalmente quando questionou o RH. Quer ajuizar reclamação trabalhista pleiteando rescisão indireta (art. 483, "d" CLT), além das verbas rescisórias completas, multa do art. 477, FGTS + 40%, seguro-desemprego, danos morais por R$ 30.000,00. Há viabilidade jurídica? Quais cuidados na prova?`,
      },
    },
  ],
  consultor: [
    {
      label: 'Consulta - validade de cláusula de não-concorrência',
      descricao: 'Análise de cláusula de non-compete em contrato de trabalho',
      payload: {
        pergunta: `Empresa de tecnologia em SP quer incluir cláusula de não-concorrência no contrato de trabalho de seus desenvolvedores seniores: vigência de 24 meses após o desligamento, abrangência nacional, sem pagamento de compensação financeira durante o período de restrição. Empregado ganha R$ 15.000,00/mês. Essa cláusula é válida no Brasil? Quais os requisitos jurisprudenciais para validade? Como redigir uma versão que seja juridicamente sustentável?`,
      },
    },
  ],
  pesquisador: [
    {
      label: 'Jurisprudência - dano moral por atraso de voo',
      descricao: 'Buscar precedentes sobre indenização em casos de atraso aéreo',
      payload: {
        query: 'dano moral por atraso de voo superior a 4 horas com perda de conexão internacional',
      },
    },
  ],
  risco: [
    {
      label: 'Análise de contrato SaaS empresarial',
      descricao: 'Cláusulas de SLA, indenização e auto-renovação automática',
      payload: {
        documento: `CONTRATO DE LICENCIAMENTO DE SOFTWARE (SaaS)

CLÁUSULA 7ª - DISPONIBILIDADE. A LICENCIANTE não garante disponibilidade ininterrupta do serviço. Eventuais indisponibilidades não geram direito a abatimento, indenização ou rescisão.

CLÁUSULA 9ª - LIMITAÇÃO DE RESPONSABILIDADE. A responsabilidade total da LICENCIANTE em qualquer hipótese fica limitada ao valor de 1 (uma) mensalidade paga pela LICENCIADA, ainda que se trate de dano direto, indireto, lucros cessantes, perda de dados ou qualquer outro prejuízo.

CLÁUSULA 11ª - REAJUSTE. Os valores serão reajustados anualmente pelo IPCA + 5% (cinco por cento) ao ano, independentemente de notificação prévia.

CLÁUSULA 14ª - RENOVAÇÃO AUTOMÁTICA. O contrato será renovado automaticamente por períodos sucessivos de 24 (vinte e quatro) meses, salvo manifestação em contrário com antecedência mínima de 90 (noventa) dias do término. A não-manifestação implica renovação por novo período.

CLÁUSULA 18ª - RESCISÃO. Em caso de rescisão antecipada pela LICENCIADA, será devida multa equivalente a 80% (oitenta por cento) do valor remanescente do contrato, atualizado monetariamente.

CLÁUSULA 22ª - FORO. Fica eleito o foro da Comarca de Cidade-Sede da LICENCIANTE, renunciando as partes a qualquer outro, por mais privilegiado que seja.`,
      },
    },
  ],
  calculador: [
    {
      label: 'Correção de débito trabalhista',
      descricao: 'Verbas rescisórias atrasadas com juros + correção',
      payload: {
        consulta: 'Calcular correção monetária e juros sobre R$ 8.500,00 (verbas rescisórias) devidos desde 15/03/2024 até hoje. Aplicar TR + 1% ao mês conforme jurisprudência atual do STF.',
      },
    },
  ],
  legislacao: [
    {
      label: 'Art. 422 CC - boa-fé objetiva',
      descricao: 'Consultar dispositivo + jurisprudência aplicada',
      payload: {
        consulta: 'Artigo 422 do Código Civil — princípio da boa-fé objetiva nos contratos. Aplicação prática e jurisprudência recente do STJ.',
      },
    },
  ],
  audiencia: [
    {
      label: 'Audiência de instrução - ação trabalhista',
      descricao: 'Roteiro para defender empregador em rescisão indireta',
      payload: {
        contexto: `Cliente: empresa de tecnologia (empregador, polo passivo). Empregado pleiteia rescisão indireta alegando atraso salarial de 3 meses + danos morais por R$ 30.000,00. Empresa nega o atraso (alegando pagamento em datas próximas mas não exatas) e contesta valores das verbas rescisórias e o dano moral. Audiência de instrução marcada para próxima semana. Testemunhas: 2 do empregado (colegas), 2 da empresa (gerente RH e diretor financeiro). Documentos juntados: extratos bancários, contrato de trabalho, advertências do empregado.`,
      },
    },
  ],
  recursos: [
    {
      label: 'Apelação - sentença improcedente',
      descricao: 'Recurso contra sentença que julgou improcedente cobrança',
      payload: {
        decisao: `Sentença de improcedência em ação de cobrança no valor de R$ 45.000,00. O juízo entendeu que: (1) os e-mails juntados não comprovariam a contratação dos serviços; (2) a nota fiscal emitida unilateralmente não teria força probatória; (3) caberia ao autor produzir prova testemunhal da prestação dos serviços, o que não fez. O autor apelará alegando: (a) cerceamento de defesa - não foi oportunizada produção de prova testemunhal; (b) os e-mails comprovariam sim a contratação, com troca de escopo e aceite; (c) a nota fiscal foi enviada à ré que não a recusou em tempo razoável; (d) violação do princípio da primazia do mérito.`,
      },
    },
  ],
  estrategista: [
    {
      label: 'Estratégia - litígio de valor alto',
      descricao: 'Plano para defesa em ação de R$ 2 milhões',
      payload: {
        caso: `Cliente é réu em ação de indenização por R$ 2.000.000,00 por suposto descumprimento de contrato de fornecimento. Autor alega que cliente entregou produtos defeituosos que causaram parada de produção em fábrica do autor por 15 dias. Cliente nega defeitos e atribui parada a problemas internos do autor. Provas em poder das partes: laudos técnicos de ambos os lados (conflitantes), e-mails de tratativas pós-incidente, contrato com cláusula de limitação de responsabilidade.`,
        objetivo: 'Vencer a ação ou reduzir condenação a no máximo R$ 200.000,00 (10%)',
      },
    },
  ],
  tradutor: [
    {
      label: 'NDA em inglês',
      descricao: 'Traduzir Mutual NDA do inglês para português',
      payload: {
        texto: `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of the date last signed below ("Effective Date") by and between the parties identified in the signature blocks below ("Parties" or each a "Party").

1. Confidential Information. "Confidential Information" means any non-public information disclosed by one Party (the "Disclosing Party") to the other Party (the "Receiving Party"), whether orally, in writing, or by any other means, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure.

2. Obligations. The Receiving Party agrees: (a) to hold the Disclosing Party's Confidential Information in strict confidence; (b) not to use such Confidential Information for any purpose other than the purpose for which it was disclosed; (c) to limit access to such Confidential Information to those of its employees who have a legitimate need to know.

3. Term. This Agreement shall remain in effect for a period of three (3) years from the Effective Date.`,
      },
    },
  ],
  compliance: [
    {
      label: 'Operação societária - merger',
      descricao: 'Análise de compliance em fusão entre empresas',
      payload: {
        descricao: `Cliente (empresa de tecnologia em SP, faturamento R$ 50M/ano, 200 funcionários) está adquirindo concorrente menor (R$ 12M/ano, 40 funcionários). Ambas operam no mesmo segmento (SaaS B2B). Quais riscos de compliance: CADE (concentração de mercado), LGPD (transferência de dados de clientes), trabalhistas (sucessão de funcionários), tributários (eventual ágio dedutível), regulatórios (nenhuma é regulada por agência específica)?`,
      },
    },
  ],
  negociador: [
    {
      label: 'Acordo trabalhista pré-audiência',
      descricao: 'Estratégia para acordo em ação de R$ 80k',
      payload: {
        situacao: `Cliente (empresa) é réu em ação trabalhista no valor de R$ 80.000,00. Audiência inicial em 15 dias. O empregado pleiteia: rescisão indireta, verbas rescisórias completas, horas extras de 36 meses + reflexos, danos morais R$ 20.000. Provas: extratos com atrasos salariais comprovados, controle de ponto irregular, mas testemunhas fracas. Risco de procedência total: 60%. Risco de procedência parcial (50%): 30%. Risco de improcedência: 10%. Cliente quer fazer proposta na audiência inicial. BATNA: pagar até R$ 35.000 à vista.`,
      },
    },
  ],
  simulado: [
    {
      label: 'Caso prático - dano moral',
      descricao: 'Cliente teve nome negativado indevidamente',
      payload: {
        tema: 'Dano moral por inscrição indevida em cadastro de inadimplentes',
        contexto: `Cliente teve nome negativado pela empresa Alpha em maio/2025 por suposta dívida de R$ 1.200,00 que ele alega ter pago em janeiro/2024 (recibo em mãos). Notificou a empresa por 3x em 2024, sem retorno. Em maio/2025 descobriu a negativação ao tentar financiar veículo. O financiamento foi negado. Cliente sofreu constrangimento na concessionária e quer ajuizar ação por dano moral, indenização por danos materiais (perda da promoção do financiamento), além da retirada da negativação.`,
      },
    },
  ],
} as const

export type AgentExampleKey = keyof typeof AGENT_EXAMPLES
