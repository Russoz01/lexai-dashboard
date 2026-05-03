/**
 * Codigo Tributario Nacional - Lei 5.172/66.
 *
 * MVP corpus expansion (2026-05-03): top dispositivos cobertos. Faltam
 * artigos sobre solidariedade tributaria, sucessao, garantias e processo
 * administrativo — adicionar conforme demanda dos agentes consumir.
 *
 * Fonte: planalto.gov.br, texto consolidado em vigor 2026-04 (LC 214/2025
 * Reforma Tributaria ainda nao revogou nada estrutural — IBS/CBS sao novos).
 */

import type { LegalProvision } from '../types'

export const CTN_LAST_UPDATE = '2026-05-03'

export const CTN: LegalProvision[] = [
  {
    diploma: 'CTN',
    artigo: '3',
    caput: 'Tributo e toda prestacao pecuniaria compulsoria, em moeda ou cujo valor nela se possa exprimir, que nao constitua sancao de ato ilicito, instituida em lei e cobrada mediante atividade administrativa plenamente vinculada.',
    temas: ['definicao tributo', 'compulsoriedade', 'pecuniaria', 'sancao ato ilicito'],
    area: 'tributario',
  },
  {
    diploma: 'CTN',
    artigo: '4',
    caput: 'A natureza juridica especifica do tributo e determinada pelo fato gerador da respectiva obrigacao, sendo irrelevantes para qualifica-la:',
    incisos: {
      I: 'a denominacao e demais caracteristicas formais adotadas pela lei',
      II: 'a destinacao legal do produto da sua arrecadacao',
    },
    temas: ['natureza juridica tributo', 'fato gerador', 'denominacao'],
    area: 'tributario',
  },
  {
    diploma: 'CTN',
    artigo: '5',
    caput: 'Os tributos sao impostos, taxas e contribuicoes de melhoria.',
    temas: ['especies tributos', 'imposto', 'taxa', 'contribuicao melhoria'],
    area: 'tributario',
    observacoes: 'STF reconhece 5 especies (CF/88): impostos, taxas, contribuicao melhoria, emprestimos compulsorios e contribuicoes especiais.',
  },
  {
    diploma: 'CTN',
    artigo: '16',
    caput: 'Imposto e o tributo cuja obrigacao tem por fato gerador uma situacao independente de qualquer atividade estatal especifica, relativa ao contribuinte.',
    temas: ['imposto', 'definicao', 'fato gerador'],
    area: 'tributario',
  },
  {
    diploma: 'CTN',
    artigo: '77',
    caput: 'As taxas cobradas pela Uniao, pelos Estados, pelo Distrito Federal ou pelos Municipios, no ambito de suas respectivas atribuicoes, tem como fato gerador o exercicio regular do poder de policia, ou a utilizacao, efetiva ou potencial, de servico publico especifico e divisivel, prestado ao contribuinte ou posto a sua disposicao.',
    temas: ['taxa', 'poder policia', 'servico publico', 'especifico divisivel'],
    area: 'tributario',
  },
  {
    diploma: 'CTN',
    artigo: '81',
    caput: 'A contribuicao de melhoria cobrada pela Uniao, pelos Estados, pelo Distrito Federal ou pelos Municipios, no ambito de suas respectivas atribuicoes, e instituida para fazer face ao custo de obras publicas de que decorra valorizacao imobiliaria, tendo como limite total a despesa realizada e como limite individual o acrescimo de valor que da obra resultar para cada imovel beneficiado.',
    temas: ['contribuicao melhoria', 'obra publica', 'valorizacao imobiliaria'],
    area: 'tributario',
  },
  {
    diploma: 'CTN',
    artigo: '113',
    caput: 'A obrigacao tributaria e principal ou acessoria.',
    paragrafos: {
      '§1': 'A obrigacao principal surge com a ocorrencia do fato gerador, tem por objeto o pagamento de tributo ou penalidade pecuniaria e extingue-se juntamente com o credito dela decorrente.',
      '§2': 'A obrigacao acessoria decorre da legislacao tributaria e tem por objeto as prestacoes, positivas ou negativas, nela previstas no interesse da arrecadacao ou da fiscalizacao dos tributos.',
      '§3': 'A obrigacao acessoria, pelo simples fato da sua inobservancia, converte-se em obrigacao principal relativamente a penalidade pecuniaria.',
    },
    temas: ['obrigacao tributaria', 'principal', 'acessoria', 'fato gerador'],
    area: 'tributario',
  },
  {
    diploma: 'CTN',
    artigo: '114',
    caput: 'Fato gerador da obrigacao principal e a situacao definida em lei como necessaria e suficiente a sua ocorrencia.',
    temas: ['fato gerador', 'obrigacao principal', 'lei'],
    area: 'tributario',
  },
  {
    diploma: 'CTN',
    artigo: '121',
    caput: 'Sujeito passivo da obrigacao principal e a pessoa obrigada ao pagamento de tributo ou penalidade pecuniaria.',
    paragrafos: {
      'unico': 'O sujeito passivo da obrigacao principal diz-se: I - contribuinte, quando tenha relacao pessoal e direta com a situacao que constitua o respectivo fato gerador; II - responsavel, quando, sem revestir a condicao de contribuinte, sua obrigacao decorra de disposicao expressa de lei.',
    },
    temas: ['sujeito passivo', 'contribuinte', 'responsavel tributario'],
    area: 'tributario',
  },
  {
    diploma: 'CTN',
    artigo: '142',
    caput: 'Compete privativamente a autoridade administrativa constituir o credito tributario pelo lancamento, assim entendido o procedimento administrativo tendente a verificar a ocorrencia do fato gerador da obrigacao correspondente, determinar a materia tributavel, calcular o montante do tributo devido, identificar o sujeito passivo e, sendo caso, propor a aplicacao da penalidade cabivel.',
    paragrafos: {
      'unico': 'A atividade administrativa de lancamento e vinculada e obrigatoria, sob pena de responsabilidade funcional.',
    },
    temas: ['lancamento', 'credito tributario', 'autoridade administrativa', 'atividade vinculada'],
    area: 'tributario',
  },
  {
    diploma: 'CTN',
    artigo: '150',
    caput: 'O lancamento por homologacao, que ocorre quanto aos tributos cuja legislacao atribua ao sujeito passivo o dever de antecipar o pagamento sem previo exame da autoridade administrativa, opera-se pelo ato em que a referida autoridade, tomando conhecimento da atividade assim exercida pelo obrigado, expressamente a homologa.',
    paragrafos: {
      '§4': 'Se a lei nao fixar prazo a homologacao, sera ele de cinco anos, a contar da ocorrencia do fato gerador; expirado esse prazo sem que a Fazenda Publica se tenha pronunciado, considera-se homologado o lancamento e definitivamente extinto o credito, salvo se comprovada a ocorrencia de dolo, fraude ou simulacao.',
    },
    temas: ['lancamento homologacao', 'autolancamento', 'prazo cinco anos'],
    area: 'tributario',
  },
  {
    diploma: 'CTN',
    artigo: '156',
    caput: 'Extinguem o credito tributario:',
    incisos: {
      I: 'o pagamento',
      II: 'a compensacao',
      III: 'a transacao',
      IV: 'remissao',
      V: 'a prescricao e a decadencia',
      VI: 'a conversao de deposito em renda',
      VII: 'o pagamento antecipado e a homologacao do lancamento',
      VIII: 'a consignacao em pagamento',
      IX: 'a decisao administrativa irreformavel',
      X: 'a decisao judicial passada em julgado',
      XI: 'a dacao em pagamento em bens imoveis',
    },
    temas: ['extincao credito tributario', 'pagamento', 'compensacao', 'prescricao', 'decadencia', 'dacao pagamento'],
    area: 'tributario',
  },
  {
    diploma: 'CTN',
    artigo: '173',
    caput: 'O direito de a Fazenda Publica constituir o credito tributario extingue-se apos 5 (cinco) anos, contados:',
    incisos: {
      I: 'do primeiro dia do exercicio seguinte aquele em que o lancamento poderia ter sido efetuado',
      II: 'da data em que se tornar definitiva a decisao que houver anulado, por vicio formal, o lancamento anteriormente efetuado',
    },
    temas: ['decadencia', 'cinco anos', 'lancamento'],
    area: 'tributario',
  },
  {
    diploma: 'CTN',
    artigo: '174',
    caput: 'A acao para a cobranca do credito tributario prescreve em cinco anos, contados da data da sua constituicao definitiva.',
    paragrafos: {
      'unico': 'A prescricao se interrompe: I - pelo despacho do juiz que ordenar a citacao em execucao fiscal; II - pelo protesto judicial; III - por qualquer ato judicial que constitua em mora o devedor; IV - por qualquer ato inequivoco ainda que extrajudicial, que importe em reconhecimento do debito pelo devedor.',
    },
    temas: ['prescricao tributaria', 'cinco anos', 'execucao fiscal', 'interrupcao prescricao'],
    area: 'tributario',
  },
  {
    diploma: 'CTN',
    artigo: '175',
    caput: 'Excluem o credito tributario:',
    incisos: {
      I: 'a isencao',
      II: 'a anistia',
    },
    paragrafos: {
      'unico': 'A exclusao do credito tributario nao dispensa o cumprimento das obrigacoes acessorias dependentes da obrigacao principal cujo credito seja excluido, ou dela consequentes.',
    },
    temas: ['exclusao credito tributario', 'isencao', 'anistia'],
    area: 'tributario',
  },
  // TODO(corpus expansion 2026-05-03): adicionar arts. 60-70 (taxas detalhadas),
  // 110-112 (interpretacao tributaria), 124-127 (solidariedade + capacidade),
  // 128-138 (responsabilidade tributaria), 176-179 (isencoes), 201-204 (divida ativa).
]
