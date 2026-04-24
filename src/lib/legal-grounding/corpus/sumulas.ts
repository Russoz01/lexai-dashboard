/**
 * Sumulas mais citadas - STF, STJ, TST.
 * Texto conforme enunciados oficiais. Vinculantes marcadas como tal.
 */

import type { Sumula } from '../types'

export const SUMULAS: Sumula[] = [
  // === STF Vinculantes ===
  {
    tribunal: 'STF',
    numero: '11',
    vinculante: true,
    texto: 'So e licito o uso de algemas em casos de resistencia e de fundado receio de fuga ou de perigo a integridade fisica propria ou alheia, por parte do preso ou de terceiros, justificada a excepcionalidade por escrito, sob pena de responsabilidade disciplinar, civil e penal do agente ou da autoridade e de nulidade da prisao ou do ato processual a que se refere, sem prejuizo da responsabilidade civil do Estado.',
    temas: ['algemas', 'prisao', 'excepcionalidade'],
    area: 'penal',
  },
  {
    tribunal: 'STF',
    numero: '13',
    vinculante: true,
    texto: 'A nomeacao de conjuge, companheiro ou parente em linha reta, colateral ou por afinidade, ate o terceiro grau, inclusive, da autoridade nomeante ou de servidor da mesma pessoa juridica investido em cargo de direcao, chefia ou assessoramento, para o exercicio de cargo em comissao ou de confianca ou, ainda, de funcao gratificada na administracao publica direta e indireta em qualquer dos Poderes da Uniao, dos Estados, do Distrito Federal e dos Municipios, compreendido o ajuste mediante designacoes reciprocas, viola a Constituicao Federal.',
    temas: ['nepotismo', 'administracao publica', 'moralidade'],
    area: 'administrativo',
  },
  {
    tribunal: 'STF',
    numero: '14',
    vinculante: true,
    texto: 'E direito do defensor, no interesse do representado, ter acesso amplo aos elementos de prova que, ja documentados em procedimento investigatorio realizado por orgao com competencia de policia judiciaria, digam respeito ao exercicio do direito de defesa.',
    temas: ['acesso autos', 'defesa', 'inquerito policial'],
    area: 'penal',
  },
  {
    tribunal: 'STF',
    numero: '25',
    vinculante: true,
    texto: 'E ilicita a prisao civil de depositario infiel, qualquer que seja a modalidade de deposito.',
    temas: ['prisao civil', 'depositario infiel'],
    area: 'constitucional',
  },

  // === STF nao-vinculantes ===
  {
    tribunal: 'STF',
    numero: '279',
    vinculante: false,
    texto: 'Para simples reexame de prova nao cabe recurso extraordinario.',
    temas: ['recurso extraordinario', 'reexame prova'],
    area: 'processual',
  },

  // === STJ ===
  {
    tribunal: 'STJ',
    numero: '7',
    texto: 'A pretensao de simples reexame de prova nao enseja recurso especial.',
    temas: ['recurso especial', 'reexame prova'],
    area: 'processual',
  },
  {
    tribunal: 'STJ',
    numero: '37',
    texto: 'Sao cumulaveis as indenizacoes por dano material e dano moral oriundos do mesmo fato.',
    temas: ['cumulacao', 'dano moral', 'dano material'],
    area: 'civel',
  },
  {
    tribunal: 'STJ',
    numero: '43',
    texto: 'Incide correcao monetaria sobre divida por ato ilicito a partir da data do efetivo prejuizo.',
    temas: ['correcao monetaria', 'ato ilicito', 'termo inicial'],
    area: 'civel',
  },
  {
    tribunal: 'STJ',
    numero: '54',
    texto: 'Os juros moratorios fluem a partir do evento danoso, em caso de responsabilidade extracontratual.',
    temas: ['juros mora', 'responsabilidade extracontratual'],
    area: 'civel',
  },
  {
    tribunal: 'STJ',
    numero: '362',
    texto: 'A correcao monetaria do valor da indenizacao do dano moral incide desde a data do arbitramento.',
    temas: ['correcao monetaria', 'dano moral', 'arbitramento'],
    area: 'civel',
  },
  {
    tribunal: 'STJ',
    numero: '385',
    texto: 'Da anotacao irregular em cadastro de protecao ao credito, nao cabe indenizacao por dano moral, quando preexistente legitima inscricao, ressalvado o direito ao cancelamento.',
    temas: ['negativacao', 'dano moral', 'inscricao preexistente', 'SPC SERASA'],
    area: 'consumidor',
  },
  {
    tribunal: 'STJ',
    numero: '479',
    texto: 'As instituicoes financeiras respondem objetivamente pelos danos gerados por fortuito interno relativo a fraudes e delitos praticados por terceiros no ambito de operacoes bancarias.',
    temas: ['banco', 'fraude terceiro', 'fortuito interno', 'responsabilidade objetiva'],
    area: 'consumidor',
  },
  {
    tribunal: 'STJ',
    numero: '543',
    texto: 'Na hipotese de resolucao de contrato de promessa de compra e venda de imovel submetido ao Codigo de Defesa do Consumidor, deve ocorrer a imediata restituicao das parcelas pagas pelo promitente comprador integralmente, em caso de culpa exclusiva do promitente vendedor ou parcialmente, caso tenha sido o comprador quem deu causa ao desfazimento.',
    temas: ['promessa compra venda', 'restituicao', 'resolucao'],
    area: 'consumidor',
  },

  // === TST ===
  {
    tribunal: 'TST',
    numero: '85',
    texto: 'A compensacao de jornada de trabalho deve ser ajustada por acordo individual escrito, acordo coletivo ou convencao coletiva. O acordo individual para compensacao de horas e valido, salvo se houver norma coletiva em sentido contrario.',
    temas: ['compensacao jornada', 'banco horas', 'acordo individual'],
    area: 'trabalhista',
  },
  {
    tribunal: 'TST',
    numero: '126',
    texto: 'Cabivel a alegacao de suspeicao ou impedimento de perito contra laudo pericial.',
    temas: ['pericia', 'suspeicao', 'impedimento'],
    area: 'processual',
  },
  {
    tribunal: 'TST',
    numero: '212',
    texto: 'O onus de provar o termino do contrato de trabalho, quando negados a prestacao de servico e o despedimento, e do empregador, pois o principio da continuidade da relacao de emprego constitui presuncao favoravel ao empregado.',
    temas: ['continuidade emprego', 'onus prova', 'rescisao'],
    area: 'trabalhista',
  },
  {
    tribunal: 'TST',
    numero: '330',
    texto: 'A quitacao passada pelo empregado, com assistencia de entidade sindical de sua categoria, ao empregador, com observancia dos requisitos exigidos nos paragrafos do art. 477 da CLT, tem eficacia liberatoria em relacao as parcelas expressamente consignadas no recibo, salvo se oposta ressalva expressa e especificada ao valor dado a parcela ou parcelas impugnadas.',
    temas: ['quitacao', 'assistencia sindical', 'eficacia liberatoria'],
    area: 'trabalhista',
  },
  {
    tribunal: 'TST',
    numero: '338',
    texto: 'E onus do empregador que conta com mais de 10 empregados o registro da jornada de trabalho na forma do art. 74, § 2o, da CLT. A nao-apresentacao injustificada dos controles de frequencia gera presuncao relativa de veracidade da jornada de trabalho.',
    temas: ['registro ponto', 'onus prova jornada', 'presuncao'],
    area: 'trabalhista',
  },
  {
    tribunal: 'TST',
    numero: '443',
    texto: 'Presume-se discriminatoria a despedida de empregado portador do virus HIV ou de outra doenca grave que suscite estigma ou preconceito. Invalido o ato, o empregado tem direito a reintegracao no emprego.',
    temas: ['despedida discriminatoria', 'doenca grave', 'reintegracao'],
    area: 'trabalhista',
  },
]
