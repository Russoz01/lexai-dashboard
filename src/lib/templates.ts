/**
 * Template gallery used by /dashboard/modelos.
 * Each template is a starting-point prompt that gets piped into the
 * matching agent with the right system context pre-loaded.
 *
 * Categories map to OAB-style areas of practice. The `agent` field tells us
 * which dashboard page to navigate to, and `prompt` is seeded in the input
 * via URL parameter `prompt=` on the agent's page.
 */

export type TemplateArea =
  | 'civil'
  | 'trabalhista'
  | 'tributario'
  | 'empresarial'
  | 'penal'
  | 'familia'
  | 'consumidor'
  | 'imobiliario'
  | 'administrativo'

export type TemplateAgent =
  | 'redator'
  | 'resumidor'
  | 'pesquisador'
  | 'calculador'
  | 'negociador'
  | 'consultor'
  | 'simulado'
  | 'compliance'

export interface Template {
  id: string
  area: TemplateArea
  agent: TemplateAgent
  title: string
  subtitle: string
  prompt: string
  estimatedMinutes: number
  tags: string[]
}

export const AREA_LABELS: Record<TemplateArea, string> = {
  civil: 'Civil',
  trabalhista: 'Trabalhista',
  tributario: 'Tributario',
  empresarial: 'Empresarial',
  penal: 'Penal',
  familia: 'Familia',
  consumidor: 'Consumidor',
  imobiliario: 'Imobiliario',
  administrativo: 'Administrativo',
}

export const AGENT_LABELS: Record<TemplateAgent, string> = {
  redator: 'Redator',
  resumidor: 'Resumidor',
  pesquisador: 'Pesquisador',
  calculador: 'Calculador',
  negociador: 'Negociador',
  consultor: 'Estrategista',
  simulado: 'Parecerista',
  compliance: 'Compliance',
}

export const TEMPLATES: Template[] = [
  // ── CIVIL ─────────────────────────────────────────────────────────────
  {
    id: 'civ-001',
    area: 'civil',
    agent: 'redator',
    title: 'Peticao inicial de cobranca',
    subtitle: 'Rito comum, com juros e correcao monetaria',
    prompt: 'Redija peticao inicial de cobranca em rito comum. Credor: [NOME]. Devedor: [NOME]. Valor principal: R$ [VALOR]. Vencimento: [DATA]. Fundamento: contrato/nota promissoria/cheque. Inclua pedido de correcao pelo INPC e juros de 1% ao mes desde o vencimento.',
    estimatedMinutes: 4,
    tags: ['cobranca', 'inicial', 'rito comum'],
  },
  {
    id: 'civ-002',
    area: 'civil',
    agent: 'redator',
    title: 'Contestacao em acao de cobranca',
    subtitle: 'Preliminar de prescricao + merito',
    prompt: 'Elabore contestacao em acao de cobranca. Argue em preliminar a prescricao (art. 206 CC). No merito, alegue quitacao parcial, exceptio non adimpleti contractus e ausencia de constituicao em mora. Peca a improcedencia.',
    estimatedMinutes: 5,
    tags: ['contestacao', 'prescricao', 'defesa'],
  },
  {
    id: 'civ-003',
    area: 'civil',
    agent: 'redator',
    title: 'Acao de despejo por falta de pagamento',
    subtitle: 'Com pedido liminar de desocupacao',
    prompt: 'Redija acao de despejo por falta de pagamento cumulada com cobranca, com pedido liminar de desocupacao mediante caucao (art. 59, Lei 8.245/91). Inclua calculo de alugueis em atraso com correcao.',
    estimatedMinutes: 5,
    tags: ['despejo', 'locacao', 'liminar'],
  },
  {
    id: 'civ-004',
    area: 'civil',
    agent: 'pesquisador',
    title: 'Jurisprudencia STJ sobre dano moral consumidor',
    subtitle: 'Ultimos 3 anos, com quantum indenizatorio',
    prompt: 'Pesquise jurisprudencia do STJ dos ultimos 3 anos sobre dano moral em relacao de consumo. Traga 5 acórdaos com ementa, relator, data e valor fixado. Organize por quantum crescente.',
    estimatedMinutes: 3,
    tags: ['dano moral', 'STJ', 'consumidor'],
  },
  // ── TRABALHISTA ───────────────────────────────────────────────────────
  {
    id: 'trab-001',
    area: 'trabalhista',
    agent: 'redator',
    title: 'Reclamacao trabalhista \u2014 verbas rescisorias',
    subtitle: 'Demissao sem justa causa nao homologada',
    prompt: 'Redija reclamacao trabalhista. Reclamante: [NOME], [FUNCAO], admitido em [DATA], demitido sem justa causa em [DATA], salario R$ [VALOR]. Pedidos: aviso previo indenizado, 13o proporcional, ferias proporcionais + 1/3, FGTS + 40%, horas extras alem da 8a diaria com adicional de 50%, multa do art. 477.',
    estimatedMinutes: 5,
    tags: ['CLT', 'verbas rescisorias', 'inicial'],
  },
  {
    id: 'trab-002',
    area: 'trabalhista',
    agent: 'calculador',
    title: 'Calculo de verbas rescisorias completo',
    subtitle: 'Com FGTS, 13o, ferias e multa de 40%',
    prompt: 'Calcule verbas rescisorias. Admissao: [DATA]. Desligamento: [DATA]. Tipo: sem justa causa. Ultimo salario: R$ [VALOR]. Saldo FGTS: R$ [VALOR]. Horas extras habituais: [SIM/NAO]. Traga valor bruto, desconto INSS/IRRF e liquido.',
    estimatedMinutes: 3,
    tags: ['rescisao', 'FGTS', 'calculo'],
  },
  {
    id: 'trab-003',
    area: 'trabalhista',
    agent: 'redator',
    title: 'Defesa em reclamacao \u2014 horas extras',
    subtitle: 'Controle de ponto britanico + compensacao',
    prompt: 'Elabore defesa em reclamacao trabalhista cuja tese principal e pagamento de horas extras. Invoque: controles de ponto validos como prova, banco de horas regularmente ajustado, intervalo intrajornada cumprido, e aplicacao de regime de compensacao. Junte tabela com jornada real vs alegada.',
    estimatedMinutes: 5,
    tags: ['defesa', 'horas extras', 'ponto'],
  },
  {
    id: 'trab-004',
    area: 'trabalhista',
    agent: 'pesquisador',
    title: 'TST sobre grupo economico pos-reforma',
    subtitle: 'Teses atuais, art. 2o \u00a72o CLT',
    prompt: 'Pesquise jurisprudencia do TST posterior a reforma trabalhista (Lei 13.467/2017) sobre caracterizacao de grupo economico. Foco: distincao entre mera coordenacao e integracao real, onus da prova, responsabilidade solidaria.',
    estimatedMinutes: 3,
    tags: ['grupo economico', 'reforma', 'TST'],
  },
  // ── TRIBUTARIO ────────────────────────────────────────────────────────
  {
    id: 'trib-001',
    area: 'tributario',
    agent: 'redator',
    title: 'Mandado de seguranca \u2014 ICMS substituicao tributaria',
    subtitle: 'Diferenca de base de calculo',
    prompt: 'Redija mandado de seguranca preventivo/repressivo para discutir diferenca entre base de calculo presumida (ICMS-ST) e base efetiva. Fundamento: tema 201 STF. Pedido liminar para que o Fisco se abstenha de autuar durante a liquidacao administrativa.',
    estimatedMinutes: 5,
    tags: ['ICMS', 'ST', 'mandado de seguranca'],
  },
  {
    id: 'trib-002',
    area: 'tributario',
    agent: 'consultor',
    title: 'Analise de risco \u2014 exclusao ISS base PIS/COFINS',
    subtitle: 'Tese derivada do tema 69 STF',
    prompt: 'Analise estrategica do risco e probabilidade de procedencia de acao para excluir ISS da base de PIS/COFINS, por analogia ao tema 69 STF (ICMS). Traga precedentes favoraveis e contrarios, custas estimadas e sugestao de tutela antecipada.',
    estimatedMinutes: 4,
    tags: ['ISS', 'PIS/COFINS', 'tese 69'],
  },
  {
    id: 'trib-003',
    area: 'tributario',
    agent: 'calculador',
    title: 'Calculo de repeticao de indebito \u2014 SELIC',
    subtitle: 'Atualizacao pela taxa oficial',
    prompt: 'Calcule valor atualizado de repeticao de indebito tributario. Valor original: R$ [VALOR]. Data do recolhimento indevido: [DATA]. Atualize pela SELIC acumulada ate hoje.',
    estimatedMinutes: 2,
    tags: ['repeticao', 'SELIC', 'indebito'],
  },
  // ── EMPRESARIAL ───────────────────────────────────────────────────────
  {
    id: 'emp-001',
    area: 'empresarial',
    agent: 'resumidor',
    title: 'Resumo executivo de contrato SaaS',
    subtitle: 'Clausulas de SLA, exit e LGPD',
    prompt: 'Analise este contrato SaaS e produza resumo executivo (max 1 pagina) destacando: prazo e renovacao automatica, SLA e penalidades por indisponibilidade, clausulas de saida/portabilidade, tratamento LGPD (papel do fornecedor, subcontratacao, incidentes), e foro. Marque em vermelho o que for abusivo.',
    estimatedMinutes: 3,
    tags: ['SaaS', 'SLA', 'LGPD'],
  },
  {
    id: 'emp-002',
    area: 'empresarial',
    agent: 'redator',
    title: 'Contrato de prestacao de servico B2B',
    subtitle: 'Com multa de rescisao e non-solicit',
    prompt: 'Elabore contrato de prestacao de servicos B2B. Contratante: [EMPRESA]. Contratada: [EMPRESA]. Objeto: [SERVICO]. Prazo: 12 meses, renovacao automatica salvo aviso de 60 dias. Multa rescisoria: 2 mensalidades. Clausula de non-solicit (12 meses). Foro de eleicao: [CIDADE].',
    estimatedMinutes: 5,
    tags: ['B2B', 'servico', 'non-solicit'],
  },
  {
    id: 'emp-003',
    area: 'empresarial',
    agent: 'redator',
    title: 'Acordo de socios Ltda.',
    subtitle: 'Drag-along, tag-along, vesting',
    prompt: 'Redija acordo de socios para sociedade limitada com clausulas de: vesting de 4 anos com cliff de 12 meses, drag-along (acionista majoritario pode arrastar minoritario em M&A), tag-along (minoritario tem direito de venda conjunta), quorum qualificado para decisoes relevantes, e resolucao parcial por falecimento.',
    estimatedMinutes: 6,
    tags: ['socios', 'vesting', 'M&A'],
  },
  {
    id: 'emp-004',
    area: 'empresarial',
    agent: 'compliance',
    title: 'Due diligence LGPD rapida',
    subtitle: 'Checklist para contratacao de fornecedor',
    prompt: 'Produza checklist de due diligence LGPD para contratacao de novo fornecedor que tratara dados pessoais de clientes. Inclua: papel (controlador/operador), base legal, seguranca da informacao, incidentes, DPO, transferencia internacional, subcontratacao, termino e devolucao.',
    estimatedMinutes: 3,
    tags: ['LGPD', 'due diligence', 'vendor'],
  },
  // ── FAMILIA ───────────────────────────────────────────────────────────
  {
    id: 'fam-001',
    area: 'familia',
    agent: 'redator',
    title: 'Acao de divorcio consensual',
    subtitle: 'Com partilha e alimentos',
    prompt: 'Redija acao de divorcio consensual. Comunhao parcial. Conjuges: [NOMES]. Bens a partilhar: [LISTA]. Filho menor: [NOME], guarda compartilhada, residencia com [NOME]. Alimentos: 30% rendimentos do alimentante. Regime de visitas: finais de semana alternados.',
    estimatedMinutes: 5,
    tags: ['divorcio', 'guarda', 'alimentos'],
  },
  {
    id: 'fam-002',
    area: 'familia',
    agent: 'calculador',
    title: 'Calculo de alimentos gravidicos + revisional',
    subtitle: 'Percentual sobre salario minimo / rendimentos',
    prompt: 'Calcule valor de alimentos. Genitor(a): rendimento mensal R$ [VALOR]. Dependentes: [NUMERO]. Percentual usual por crianca: 15-25% dos rendimentos liquidos. Compare com minimo de 30% do salario minimo (Lei de Alimentos).',
    estimatedMinutes: 2,
    tags: ['alimentos', 'pensao', 'calculo'],
  },
  // ── CONSUMIDOR ────────────────────────────────────────────────────────
  {
    id: 'cons-001',
    area: 'consumidor',
    agent: 'redator',
    title: 'Acao de consumidor \u2014 vicio oculto do produto',
    subtitle: 'Devolucao do valor + dano moral',
    prompt: 'Redija acao de consumidor por vicio oculto de produto. Produto: [DESCRICAO]. Valor: R$ [VALOR]. Data compra: [DATA]. Reclamacao ignorada: [DATA]. Pedidos: devolucao em dobro do valor pago (art. 42 CDC), danos morais (R$ 5.000 a R$ 10.000), inversao do onus da prova.',
    estimatedMinutes: 4,
    tags: ['CDC', 'vicio oculto', 'dano moral'],
  },
  {
    id: 'cons-002',
    area: 'consumidor',
    agent: 'redator',
    title: 'Acao contra banco \u2014 descontos indevidos',
    subtitle: 'Devolucao em dobro + tutela de urgencia',
    prompt: 'Elabore acao contra banco por descontos indevidos em conta corrente. Pedido: tutela de urgencia para cessar os descontos, devolucao em dobro dos valores pagos, danos morais, e inversao do onus da prova. Prequestione art. 42 CDC.',
    estimatedMinutes: 4,
    tags: ['banco', 'descontos', 'tutela'],
  },
  // ── PENAL ─────────────────────────────────────────────────────────────
  {
    id: 'pen-001',
    area: 'penal',
    agent: 'redator',
    title: 'Pedido de liberdade provisoria',
    subtitle: 'Com fianca ou medidas cautelares',
    prompt: 'Redija pedido de liberdade provisoria. Argue: primariedade, residencia fixa, emprego formal, ausencia dos requisitos da prisao preventiva (art. 312 CPP), e possibilidade de substituicao por medidas cautelares alternativas (art. 319). Se for o caso, requeira fianca.',
    estimatedMinutes: 4,
    tags: ['liberdade', 'flagrante', 'preventiva'],
  },
  {
    id: 'pen-002',
    area: 'penal',
    agent: 'redator',
    title: 'Alegacoes finais de defesa',
    subtitle: 'Absolvicao por insuficiencia probatoria',
    prompt: 'Elabore memoriais/alegacoes finais de defesa pleiteando absolvicao por insuficiencia de prova (art. 386, VII CPP). Analise individualmente cada prova dos autos, aponte contradicoes nos depoimentos, e invoque in dubio pro reo.',
    estimatedMinutes: 6,
    tags: ['memoriais', 'absolvicao', 'in dubio'],
  },
  // ── IMOBILIARIO ───────────────────────────────────────────────────────
  {
    id: 'imob-001',
    area: 'imobiliario',
    agent: 'redator',
    title: 'Contrato de locacao residencial',
    subtitle: 'Com fiador e clausula de indice',
    prompt: 'Redija contrato de locacao residencial pelo prazo de 30 meses. Indice de reajuste: IGPM/FGV (com clausula alternativa de IPCA caso IGPM deixe de ser divulgado). Garantia: fianca. Multa rescisoria: proporcional (art. 4o Lei 8.245/91). Vistoria inicial anexa.',
    estimatedMinutes: 4,
    tags: ['locacao', 'fianca', 'IGPM'],
  },
  {
    id: 'imob-002',
    area: 'imobiliario',
    agent: 'resumidor',
    title: 'Analise de escritura + matricula',
    subtitle: 'Riscos antes de comprar',
    prompt: 'Analise estes documentos de imovel (escritura + matricula atualizada + certidao negativa de onus). Identifique: onus reais, penhoras, acoes em andamento, divergencias entre descricao fisica e registrada, pendencias fiscais, e riscos para comprador. Produza parecer em 1 pagina.',
    estimatedMinutes: 4,
    tags: ['escritura', 'matricula', 'due diligence'],
  },
  // ── ADMINISTRATIVO ────────────────────────────────────────────────────
  {
    id: 'adm-001',
    area: 'administrativo',
    agent: 'redator',
    title: 'Mandado de seguranca contra ato administrativo',
    subtitle: 'Violacao de direito liquido e certo',
    prompt: 'Redija mandado de seguranca contra ato de autoridade administrativa. Impetrante: [NOME/EMPRESA]. Autoridade coatora: [CARGO/ORGAO]. Direito liquido e certo violado: [DESCRICAO]. Ilegalidade/abuso: [FUNDAMENTO]. Pedido liminar: [MEDIDA]. Prequestione art. 5o LXIX CF e Lei 12.016/2009.',
    estimatedMinutes: 5,
    tags: ['mandado de seguranca', 'MS', 'liminar'],
  },
  {
    id: 'adm-002',
    area: 'administrativo',
    agent: 'pesquisador',
    title: 'Licitacao \u2014 impugnacao de edital',
    subtitle: 'Precedentes TCU e STJ',
    prompt: 'Pesquise precedentes do TCU e STJ sobre clausulas restritivas em editais de licitacao (competitividade, descricao direcionada, exigencias excessivas). Traga 5 decisoes com resumo e citacao.',
    estimatedMinutes: 3,
    tags: ['licitacao', 'edital', 'TCU'],
  },
  // ── ADICIONAIS (para completar 30) ────────────────────────────────────
  {
    id: 'civ-005',
    area: 'civil',
    agent: 'redator',
    title: 'Acao de indenizacao por danos morais',
    subtitle: 'Evento danoso com nexo e culpa demonstrados',
    prompt: 'Redija acao indenizatoria. Fato: [DESCRICAO]. Nexo causal: [DEMONSTRE]. Culpa/dolo: [DEMONSTRE]. Dano moral: [VALOR PEDIDO]. Cite jurisprudencia STJ sobre quantum.',
    estimatedMinutes: 4,
    tags: ['dano moral', 'indenizatoria'],
  },
  {
    id: 'civ-006',
    area: 'civil',
    agent: 'negociador',
    title: 'Proposta de acordo em acao em andamento',
    subtitle: 'Tres cenarios (conservador, medio, agressivo)',
    prompt: 'Construa tres cenarios de proposta de acordo para acao em andamento. Valor atualizado da causa: R$ [VALOR]. Fase processual: [FASE]. Probabilidade de exito (defesa): [PCT]. Traga cenario conservador, medio e agressivo com argumentos de sustentacao em audiencia.',
    estimatedMinutes: 3,
    tags: ['acordo', 'negociacao', 'cenarios'],
  },
  {
    id: 'trab-005',
    area: 'trabalhista',
    agent: 'consultor',
    title: 'Diagnostico de passivo trabalhista \u2014 M&A',
    subtitle: 'Auditoria rapida pre-deal',
    prompt: 'Produza diagnostico de passivo trabalhista para operacao de M&A. Avalie: reclamacoes em andamento, risco de solidariedade por grupo economico, passivo oculto (horas extras habituais, jornada, equiparacao), adequacao a reforma trabalhista, exposicao LGPD de dados de empregados.',
    estimatedMinutes: 5,
    tags: ['M&A', 'passivo', 'auditoria'],
  },
  {
    id: 'trib-004',
    area: 'tributario',
    agent: 'simulado',
    title: 'Parecer \u2014 tributacao de bonificacao de acoes',
    subtitle: 'Receita pessoa fisica vs empresa',
    prompt: 'Elabore parecer sobre tributacao de bonificacao em acoes (stock split, desdobramento, novas acoes). Distinga: pessoa fisica (IR ganho capital), pessoa juridica (IRPJ/CSLL), e pratica usual da RFB. Cite SC COSIT e precedentes CARF.',
    estimatedMinutes: 6,
    tags: ['bonificacao', 'acoes', 'parecer'],
  },
  {
    id: 'fam-003',
    area: 'familia',
    agent: 'redator',
    title: 'Acao de reconhecimento e dissolucao de uniao estavel',
    subtitle: 'Com partilha de bens',
    prompt: 'Redija acao de reconhecimento e dissolucao de uniao estavel cumulada com partilha. Conviventes: [NOMES]. Inicio da uniao: [DATA]. Fim: [DATA]. Regime: comunhao parcial. Bens a partilhar: [LISTA].',
    estimatedMinutes: 5,
    tags: ['uniao estavel', 'partilha'],
  },
]

/** Utility: group templates by area for sectioned rendering */
export function groupByArea(templates: Template[]) {
  return templates.reduce<Record<TemplateArea, Template[]>>((acc, t) => {
    if (!acc[t.area]) acc[t.area] = []
    acc[t.area].push(t)
    return acc
  }, {} as Record<TemplateArea, Template[]>)
}
