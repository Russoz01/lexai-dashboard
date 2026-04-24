/**
 * Codigo de Defesa do Consumidor (Lei 8.078/1990) - dispositivos mais citados.
 */

import type { LegalProvision } from '../types'

export const CDC: LegalProvision[] = [
  {
    diploma: 'CDC',
    artigo: '2',
    caput: 'Consumidor e toda pessoa fisica ou juridica que adquire ou utiliza produto ou servico como destinatario final.',
    temas: ['consumidor', 'definicao', 'destinatario final'],
    area: 'consumidor',
  },
  {
    diploma: 'CDC',
    artigo: '3',
    caput: 'Fornecedor e toda pessoa fisica ou juridica, publica ou privada, nacional ou estrangeira, bem como os entes despersonalizados, que desenvolvem atividade de producao, montagem, criacao, construcao, transformacao, importacao, exportacao, distribuicao ou comercializacao de produtos ou prestacao de servicos.',
    temas: ['fornecedor', 'definicao', 'cadeia fornecimento'],
    area: 'consumidor',
  },
  {
    diploma: 'CDC',
    artigo: '6',
    caput: 'Sao direitos basicos do consumidor:',
    incisos: {
      III: 'a informacao adequada e clara sobre os diferentes produtos e servicos, com especificacao correta de quantidade, caracteristicas, composicao, qualidade, tributos incidentes e preco, bem como sobre os riscos que apresentem',
      IV: 'a protecao contra a publicidade enganosa e abusiva, metodos comerciais coercitivos ou desleais, bem como contra praticas e clausulas abusivas',
      VI: 'a efetiva prevencao e reparacao de danos patrimoniais e morais, individuais, coletivos e difusos',
      VIII: 'a facilitacao da defesa de seus direitos, inclusive com a inversao do onus da prova, a seu favor, no processo civil, quando, a criterio do juiz, for verossimil a alegacao ou quando for ele hipossuficiente',
    },
    temas: ['direitos basicos', 'informacao', 'publicidade enganosa', 'dano moral consumidor', 'inversao onus prova'],
    area: 'consumidor',
  },
  {
    diploma: 'CDC',
    artigo: '14',
    caput: 'O fornecedor de servicos responde, independentemente da existencia de culpa, pela reparacao dos danos causados aos consumidores por defeitos relativos a prestacao dos servicos, bem como por informacoes insuficientes ou inadequadas sobre sua fruicao e riscos.',
    temas: ['responsabilidade objetiva', 'fornecedor servicos', 'defeito prestacao'],
    area: 'consumidor',
  },
  {
    diploma: 'CDC',
    artigo: '18',
    caput: 'Os fornecedores de produtos de consumo duraveis ou nao duraveis respondem solidariamente pelos vicios de qualidade ou quantidade que os tornem improprios ou inadequados ao consumo a que se destinam ou lhes diminuam o valor, assim como por aqueles decorrentes da disparidade, com as indicacoes constantes do recipiente, da embalagem, rotulagem ou mensagem publicitaria.',
    temas: ['vicio produto', 'responsabilidade solidaria', 'substituicao', 'devolucao valor'],
    area: 'consumidor',
  },
  {
    diploma: 'CDC',
    artigo: '26',
    caput: 'O direito de reclamar pelos vicios aparentes ou de facil constatacao caduca em:',
    incisos: {
      I: 'trinta dias, tratando-se de fornecimento de servico e de produtos nao duraveis',
      II: 'noventa dias, tratando-se de fornecimento de servico e de produtos duraveis',
    },
    temas: ['decadencia', 'prazo reclamacao', 'vicio aparente'],
    area: 'consumidor',
  },
  {
    diploma: 'CDC',
    artigo: '27',
    caput: 'Prescreve em cinco anos a pretensao a reparacao pelos danos causados por fato do produto ou do servico prevista na Secao II deste Capitulo, iniciando-se a contagem do prazo a partir do conhecimento do dano e de sua autoria.',
    temas: ['prescricao quinquenal', 'fato produto', 'dano consumidor'],
    area: 'consumidor',
  },
  {
    diploma: 'CDC',
    artigo: '42',
    caput: 'Na cobranca de debitos, o consumidor inadimplente nao sera exposto a ridiculo, nem sera submetido a qualquer tipo de constrangimento ou ameaca.',
    paragrafos: {
      'unico': 'O consumidor cobrado em quantia indevida tem direito a repeticao do indebito, por valor igual ao dobro do que pagou em excesso, acrescido de correcao monetaria e juros legais, salvo hipotese de engano justificavel.',
    },
    temas: ['cobranca indevida', 'repeticao indebito', 'dobro', 'constrangimento'],
    area: 'consumidor',
  },
  {
    diploma: 'CDC',
    artigo: '49',
    caput: 'O consumidor pode desistir do contrato, no prazo de sete dias a contar de sua assinatura ou do ato de recebimento do produto ou servico, sempre que a contratacao de fornecimento de produtos e servicos ocorrer fora do estabelecimento comercial, especialmente por telefone ou a domicilio.',
    temas: ['direito arrependimento', 'sete dias', 'compra distancia'],
    area: 'consumidor',
  },
  {
    diploma: 'CDC',
    artigo: '51',
    caput: 'Sao nulas de pleno direito, entre outras, as clausulas contratuais relativas ao fornecimento de produtos e servicos que:',
    incisos: {
      I: 'impossibilitem, exonerem ou atenuem a responsabilidade do fornecedor por vicios de qualquer natureza dos produtos e servicos ou impliquem renuncia ou disposicao de direitos',
      IV: 'estabelecam obrigacoes consideradas iniquas, abusivas, que coloquem o consumidor em desvantagem exagerada, ou sejam incompativeis com a boa-fe ou a equidade',
    },
    temas: ['clausulas abusivas', 'nulidade', 'desvantagem exagerada'],
    area: 'consumidor',
  },
]
