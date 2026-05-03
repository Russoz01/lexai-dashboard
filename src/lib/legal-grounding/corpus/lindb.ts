/**
 * LINDB - Lei de Introducao as Normas do Direito Brasileiro.
 * Decreto-Lei 4.657/42, com alteracoes pela Lei 13.655/18.
 *
 * Foco: principios de direito intertemporal, interpretacao, lei aplicavel
 * pessoa, e os arts. 20-30 incluidos pela Lei 13.655 (consequencialismo
 * juridico no direito publico).
 */

import type { LegalProvision } from '../types'

export const LINDB_LAST_UPDATE = '2026-05-03'

export const LINDB: LegalProvision[] = [
  {
    diploma: 'LINDB',
    artigo: '1',
    caput: 'Salvo disposicao contraria, a lei comeca a vigorar em todo o pais quarenta e cinco dias depois de oficialmente publicada.',
    paragrafos: {
      '§1': 'Nos Estados estrangeiros, a obrigatoriedade da lei brasileira, quando admitida, se inicia tres meses depois de oficialmente publicada.',
    },
    temas: ['vacatio legis', 'vigencia lei', 'publicacao'],
    area: 'constitucional',
  },
  {
    diploma: 'LINDB',
    artigo: '2',
    caput: 'Nao se destinando a vigencia temporaria, a lei tera vigor ate que outra a modifique ou revogue.',
    paragrafos: {
      '§1': 'A lei posterior revoga a anterior quando expressamente o declare, quando seja com ela incompativel ou quando regule inteiramente a materia de que tratava a lei anterior.',
      '§2': 'A lei nova, que estabeleca disposicoes gerais ou especiais a par das ja existentes, nao revoga nem modifica a lei anterior.',
    },
    temas: ['revogacao lei', 'revogacao tacita', 'revogacao expressa'],
    area: 'constitucional',
  },
  {
    diploma: 'LINDB',
    artigo: '3',
    caput: 'Ninguem se escusa de cumprir a lei, alegando que nao a conhece.',
    temas: ['ignorantia legis', 'principio direito intertemporal', 'obrigatoriedade lei'],
    area: 'constitucional',
  },
  {
    diploma: 'LINDB',
    artigo: '4',
    caput: 'Quando a lei for omissa, o juiz decidira o caso de acordo com a analogia, os costumes e os principios gerais de direito.',
    temas: ['integracao norma', 'analogia', 'costumes', 'principios gerais'],
    area: 'constitucional',
  },
  {
    diploma: 'LINDB',
    artigo: '5',
    caput: 'Na aplicacao da lei, o juiz atendera aos fins sociais a que ela se dirige e as exigencias do bem comum.',
    temas: ['interpretacao teleologica', 'fins sociais', 'bem comum'],
    area: 'constitucional',
  },
  {
    diploma: 'LINDB',
    artigo: '6',
    caput: 'A Lei em vigor tera efeito imediato e geral, respeitados o ato juridico perfeito, o direito adquirido e a coisa julgada.',
    paragrafos: {
      '§1': 'Reputa-se ato juridico perfeito o ja consumado segundo a lei vigente ao tempo em que se efetuou.',
      '§2': 'Consideram-se adquiridos assim os direitos que o seu titular, ou alguem por ele, possa exercer, como aqueles cujo comeco do exercicio tenha termo pre-fixo, ou condicao pre-estabelecida inalteravel, a arbitrio de outrem.',
      '§3': 'Chama-se coisa julgada ou caso julgado a decisao judicial de que ja nao caiba recurso.',
    },
    temas: ['direito intertemporal', 'ato juridico perfeito', 'direito adquirido', 'coisa julgada', 'efeito imediato'],
    area: 'constitucional',
  },
  {
    diploma: 'LINDB',
    artigo: '7',
    caput: 'A lei do pais em que domiciliada a pessoa determina as regras sobre o comeco e o fim da personalidade, o nome, a capacidade e os direitos de familia.',
    paragrafos: {
      '§1': 'Realizando-se o casamento no Brasil, sera aplicada a lei brasileira quanto aos impedimentos dirimentes e as formalidades da celebracao.',
    },
    temas: ['lei aplicavel pessoa', 'domicilio', 'personalidade', 'capacidade', 'direito internacional privado'],
    area: 'civel',
  },
  {
    diploma: 'LINDB',
    artigo: '9',
    caput: 'Para qualificar e reger as obrigacoes, aplicar-se-a a lei do pais em que se constituirem.',
    paragrafos: {
      '§1': 'Destinando-se a obrigacao a ser executada no Brasil e dependendo de forma essencial, sera esta observada, admitidas as peculiaridades da lei estrangeira quanto aos requisitos extrinsecos do ato.',
      '§2': 'A obrigacao resultante do contrato reputa-se constituida no lugar em que residir o proponente.',
    },
    temas: ['lei aplicavel obrigacoes', 'contratos internacionais'],
    area: 'civel',
  },
  {
    diploma: 'LINDB',
    artigo: '20',
    caput: 'Nas esferas administrativa, controladora e judicial, nao se decidira com base em valores juridicos abstratos sem que sejam consideradas as consequencias praticas da decisao.',
    paragrafos: {
      'unico': 'A motivacao demonstrara a necessidade e a adequacao da medida imposta ou da invalidacao de ato, contrato, ajuste, processo ou norma administrativa, inclusive em face das possiveis alternativas.',
    },
    temas: ['consequencialismo juridico', 'motivacao', 'valores abstratos', 'Lei 13655/18'],
    area: 'administrativo',
    observacoes: 'Inserido pela Lei 13.655/18 — eixo do consequencialismo no direito publico.',
  },
  {
    diploma: 'LINDB',
    artigo: '21',
    caput: 'A decisao que, nas esferas administrativa, controladora ou judicial, decretar a invalidacao de ato, contrato, ajuste, processo ou norma administrativa devera indicar de modo expresso suas consequencias juridicas e administrativas.',
    paragrafos: {
      'unico': 'A decisao a que se refere o caput deste artigo devera, quando for o caso, indicar as condicoes para que a regularizacao ocorra de modo proporcional e equanime e sem prejuizo aos interesses gerais, nao se podendo impor aos sujeitos atingidos onus ou perdas que, em funcao das peculiaridades do caso, sejam anormais ou excessivos.',
    },
    temas: ['invalidacao ato administrativo', 'consequencias juridicas', 'proporcionalidade', 'Lei 13655/18'],
    area: 'administrativo',
  },
  {
    diploma: 'LINDB',
    artigo: '22',
    caput: 'Na interpretacao de normas sobre gestao publica, serao considerados os obstaculos e as dificuldades reais do gestor e as exigencias das politicas publicas a seu cargo, sem prejuizo dos direitos dos administrados.',
    paragrafos: {
      '§1': 'Em decisao sobre regularidade de conduta ou validade de ato, contrato, ajuste, processo ou norma administrativa, serao consideradas as circunstancias praticas que houverem imposto, limitado ou condicionado a acao do agente.',
      '§3': 'As sancoes aplicadas ao agente serao levadas em conta na dosimetria das demais sancoes de mesma natureza e relativas ao mesmo fato.',
    },
    temas: ['gestao publica', 'realidades fato', 'dosimetria sancao', 'Lei 13655/18'],
    area: 'administrativo',
  },
  {
    diploma: 'LINDB',
    artigo: '24',
    caput: 'A revisao, nas esferas administrativa, controladora ou judicial, quanto a validade de ato, contrato, ajuste, processo ou norma administrativa cuja producao ja se houver completado levara em conta as orientacoes gerais da epoca, sendo vedado que, com base em mudanca posterior de orientacao geral, se declarem invalidas situacoes plenamente constituidas.',
    paragrafos: {
      'unico': 'Consideram-se orientacoes gerais as interpretacoes e especificacoes contidas em atos publicos de carater geral ou em jurisprudencia judicial ou administrativa majoritaria, e ainda as adotadas por pratica administrativa reiterada e de amplo conhecimento publico.',
    },
    temas: ['seguranca juridica', 'mudanca orientacao', 'situacao constituida', 'Lei 13655/18'],
    area: 'administrativo',
  },
  // TODO: arts. 8 (bens situados pais), 10 (sucessao), 11-13 (pessoa juridica),
  // 17-19 (atos publicos estrangeiros), 23 (revisao decisao), 25-30 (regulamentacao
  // remanescente da Lei 13655). Adicionar conforme demanda.
]
