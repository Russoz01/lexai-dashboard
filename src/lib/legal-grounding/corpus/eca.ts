/**
 * ECA - Estatuto da Crianca e do Adolescente.
 * Lei 8.069/90.
 *
 * Top dispositivos sobre prioridade absoluta, direitos fundamentais,
 * medidas protetivas, ato infracional e sancoes.
 */

import type { LegalProvision } from '../types'

export const ECA_LAST_UPDATE = '2026-05-03'

export const ECA: LegalProvision[] = [
  {
    diploma: 'ECA',
    artigo: '2',
    caput: 'Considera-se crianca, para os efeitos desta Lei, a pessoa ate doze anos de idade incompletos, e adolescente aquela entre doze e dezoito anos de idade.',
    temas: ['crianca', 'adolescente', 'definicao', 'idade'],
    area: 'familia',
  },
  {
    diploma: 'ECA',
    artigo: '4',
    caput: 'E dever da familia, da comunidade, da sociedade em geral e do poder publico assegurar, com absoluta prioridade, a efetivacao dos direitos referentes a vida, a saude, a alimentacao, a educacao, ao esporte, ao lazer, a profissionalizacao, a cultura, a dignidade, ao respeito, a liberdade e a convivencia familiar e comunitaria.',
    paragrafos: {
      'unico': 'A garantia de prioridade compreende: a) primazia de receber protecao e socorro em quaisquer circunstancias; b) precedencia de atendimento nos servicos publicos ou de relevancia publica; c) preferencia na formulacao e na execucao das politicas sociais publicas; d) destinacao privilegiada de recursos publicos nas areas relacionadas com a protecao a infancia e a juventude.',
    },
    temas: ['prioridade absoluta', 'direitos fundamentais', 'protecao integral', 'familia comunidade'],
    area: 'familia',
  },
  {
    diploma: 'ECA',
    artigo: '5',
    caput: 'Nenhuma crianca ou adolescente sera objeto de qualquer forma de negligencia, discriminacao, exploracao, violencia, crueldade e opressao, punido na forma da lei qualquer atentado, por acao ou omissao, aos seus direitos fundamentais.',
    temas: ['protecao integral', 'violencia infantil', 'negligencia', 'crueldade'],
    area: 'familia',
  },
  {
    diploma: 'ECA',
    artigo: '7',
    caput: 'A crianca e o adolescente tem direito a protecao a vida e a saude, mediante a efetivacao de politicas sociais publicas que permitam o nascimento e o desenvolvimento sadio e harmonioso, em condicoes dignas de existencia.',
    temas: ['direito vida', 'direito saude', 'desenvolvimento sadio'],
    area: 'familia',
  },
  {
    diploma: 'ECA',
    artigo: '17',
    caput: 'O direito ao respeito consiste na inviolabilidade da integridade fisica, psiquica e moral da crianca e do adolescente, abrangendo a preservacao da imagem, da identidade, da autonomia, dos valores, ideias e crencas, dos espacos e objetos pessoais.',
    temas: ['direito respeito', 'integridade fisica', 'integridade moral', 'imagem adolescente'],
    area: 'familia',
  },
  {
    diploma: 'ECA',
    artigo: '18',
    caput: 'E dever de todos velar pela dignidade da crianca e do adolescente, pondo-os a salvo de qualquer tratamento desumano, violento, aterrorizante, vexatorio ou constrangedor.',
    temas: ['dignidade crianca', 'tratamento desumano', 'violencia psicologica'],
    area: 'familia',
  },
  {
    diploma: 'ECA',
    artigo: '53',
    caput: 'A crianca e o adolescente tem direito a educacao, visando ao pleno desenvolvimento de sua pessoa, preparo para o exercicio da cidadania e qualificacao para o trabalho, assegurando-se-lhes:',
    incisos: {
      I: 'igualdade de condicoes para o acesso e permanencia na escola',
      II: 'direito de ser respeitado por seus educadores',
      III: 'direito de contestar criterios avaliativos, podendo recorrer as instancias escolares superiores',
      IV: 'direito de organizacao e participacao em entidades estudantis',
      V: 'acesso a escola publica e gratuita, proxima de sua residencia, garantindo-se vagas no mesmo estabelecimento a irmaos que frequentem a mesma etapa ou ciclo de ensino da educacao basica',
    },
    temas: ['direito educacao', 'acesso escola', 'gratuidade', 'matricula irmaos'],
    area: 'familia',
  },
  {
    diploma: 'ECA',
    artigo: '54',
    caput: 'E dever do Estado assegurar a crianca e ao adolescente:',
    incisos: {
      I: 'ensino fundamental, obrigatorio e gratuito, inclusive para os que a ele nao tiveram acesso na idade propria',
      II: 'progressiva extensao da obrigatoriedade e gratuidade ao ensino medio',
      III: 'atendimento educacional especializado aos portadores de deficiencia, preferencialmente na rede regular de ensino',
      IV: 'atendimento em creche e pre-escola as criancas de zero a cinco anos de idade',
    },
    temas: ['dever estado', 'ensino fundamental', 'creche', 'inclusao deficiencia'],
    area: 'familia',
  },
  {
    diploma: 'ECA',
    artigo: '55',
    caput: 'Os pais ou responsavel tem a obrigacao de matricular seus filhos ou pupilos na rede regular de ensino.',
    temas: ['dever pais', 'matricula obrigatoria', 'rede ensino'],
    area: 'familia',
  },
  {
    diploma: 'ECA',
    artigo: '98',
    caput: 'As medidas de protecao a crianca e ao adolescente sao aplicaveis sempre que os direitos reconhecidos nesta Lei forem ameacados ou violados:',
    incisos: {
      I: 'por acao ou omissao da sociedade ou do Estado',
      II: 'por falta, omissao ou abuso dos pais ou responsavel',
      III: 'em razao de sua conduta',
    },
    temas: ['medidas protetivas', 'violacao direitos', 'omissao pais', 'omissao estado'],
    area: 'familia',
  },
  {
    diploma: 'ECA',
    artigo: '101',
    caput: 'Verificada qualquer das hipoteses previstas no art. 98, a autoridade competente podera determinar, dentre outras, as seguintes medidas:',
    incisos: {
      I: 'encaminhamento aos pais ou responsavel, mediante termo de responsabilidade',
      II: 'orientacao, apoio e acompanhamento temporarios',
      III: 'matricula e frequencia obrigatorias em estabelecimento oficial de ensino fundamental',
      IV: 'inclusao em servicos e programas oficiais ou comunitarios de protecao, apoio e promocao da familia, da crianca e do adolescente',
      V: 'requisicao de tratamento medico, psicologico ou psiquiatrico, em regime hospitalar ou ambulatorial',
      VII: 'acolhimento institucional',
      VIII: 'inclusao em programa de acolhimento familiar',
      IX: 'colocacao em familia substituta',
    },
    temas: ['medidas protetivas', 'acolhimento institucional', 'familia substituta', 'autoridade competente'],
    area: 'familia',
  },
  {
    diploma: 'ECA',
    artigo: '103',
    caput: 'Considera-se ato infracional a conduta descrita como crime ou contravencao penal.',
    temas: ['ato infracional', 'crime', 'contravencao'],
    area: 'familia',
  },
  {
    diploma: 'ECA',
    artigo: '104',
    caput: 'Sao penalmente inimputaveis os menores de dezoito anos, sujeitos as medidas previstas nesta Lei.',
    paragrafos: {
      'unico': 'Para os efeitos desta Lei, deve ser considerada a idade do adolescente a data do fato.',
    },
    temas: ['inimputabilidade penal', 'maioridade penal', 'idade fato'],
    area: 'familia',
  },
  {
    diploma: 'ECA',
    artigo: '112',
    caput: 'Verificada a pratica de ato infracional, a autoridade competente podera aplicar ao adolescente as seguintes medidas:',
    incisos: {
      I: 'advertencia',
      II: 'obrigacao de reparar o dano',
      III: 'prestacao de servicos a comunidade',
      IV: 'liberdade assistida',
      V: 'insercao em regime de semi-liberdade',
      VI: 'internacao em estabelecimento educacional',
      VII: 'qualquer uma das previstas no art. 101, I a VI',
    },
    temas: ['medidas socioeducativas', 'advertencia', 'liberdade assistida', 'internacao', 'semi-liberdade'],
    area: 'familia',
  },
  {
    diploma: 'ECA',
    artigo: '227',
    caput: 'Sao crimes desta Lei:',
    paragrafos: {
      'unico': 'A omissao ou retardamento injustificado da execucao de medidas socioeducativas e equiparado a crime de responsabilidade.',
    },
    temas: ['crimes ECA', 'omissao medidas socioeducativas'],
    area: 'familia',
  },
  // TODO: arts. 33-38 (poder familiar), 92-94 (entidades atendimento),
  // 121-125 (internacao), 129-130 (medidas pais responsaveis), 232+ (crimes
  // especificos), 240+ (porno infantil ECA atualizado pela Lei 11.829/08).
]
