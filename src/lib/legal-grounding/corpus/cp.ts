/**
 * Codigo Penal (Decreto-Lei 2.848/1940) - dispositivos mais citados.
 */

import type { LegalProvision } from '../types'

export const CP: LegalProvision[] = [
  {
    diploma: 'CP',
    artigo: '1',
    caput: 'Nao ha crime sem lei anterior que o defina. Nao ha pena sem previa cominacao legal.',
    temas: ['principio legalidade', 'anterioridade penal', 'nullum crimen'],
    area: 'penal',
  },
  {
    diploma: 'CP',
    artigo: '14',
    caput: 'Diz-se o crime:',
    incisos: {
      I: 'consumado, quando nele se reunem todos os elementos de sua definicao legal',
      II: 'tentado, quando, iniciada a execucao, nao se consuma por circunstancias alheias a vontade do agente',
    },
    paragrafos: {
      'unico': 'Salvo disposicao em contrario, pune-se a tentativa com a pena correspondente ao crime consumado, diminuida de um a dois tercos.',
    },
    temas: ['consumacao', 'tentativa', 'diminuicao pena'],
    area: 'penal',
  },
  {
    diploma: 'CP',
    artigo: '20',
    caput: 'O erro sobre elemento constitutivo do tipo legal de crime exclui o dolo, mas permite a punicao por crime culposo, se previsto em lei.',
    temas: ['erro de tipo', 'dolo', 'culpa'],
    area: 'penal',
  },
  {
    diploma: 'CP',
    artigo: '21',
    caput: 'O desconhecimento da lei e inescusavel. O erro sobre a ilicitude do fato, se inevitavel, isenta de pena; se evitavel, podera diminui-la de um sexto a um terco.',
    temas: ['erro de proibicao', 'desconhecimento lei'],
    area: 'penal',
  },
  {
    diploma: 'CP',
    artigo: '23',
    caput: 'Nao ha crime quando o agente pratica o fato:',
    incisos: {
      I: 'em estado de necessidade',
      II: 'em legitima defesa',
      III: 'em estrito cumprimento de dever legal ou no exercicio regular de direito',
    },
    temas: ['excludentes ilicitude', 'legitima defesa', 'estado necessidade', 'dever legal'],
    area: 'penal',
  },
  {
    diploma: 'CP',
    artigo: '59',
    caput: 'O juiz, atendendo a culpabilidade, aos antecedentes, a conduta social, a personalidade do agente, aos motivos, as circunstancias e consequencias do crime, bem como ao comportamento da vitima, estabelecera, conforme seja necessario e suficiente para reprovacao e prevencao do crime, a pena aplicavel.',
    temas: ['dosimetria pena', 'circunstancias judiciais', 'pena-base'],
    area: 'penal',
    observacoes: 'Base do sistema trifasico de dosimetria.',
  },
  {
    diploma: 'CP',
    artigo: '109',
    caput: 'A prescricao, antes de transitar em julgado a sentenca final, regula-se pelo maximo da pena privativa de liberdade cominada ao crime, verificando-se nos seguintes prazos.',
    temas: ['prescricao penal', 'pretensao punitiva', 'prazos'],
    area: 'penal',
  },
  {
    diploma: 'CP',
    artigo: '121',
    caput: 'Matar alguem.',
    temas: ['homicidio', 'crime contra vida'],
    area: 'penal',
    observacoes: 'Pena base: 6 a 20 anos. Qualificadoras nos §§ 2o e seguintes.',
  },
  {
    diploma: 'CP',
    artigo: '155',
    caput: 'Subtrair, para si ou para outrem, coisa alheia movel.',
    temas: ['furto', 'crime patrimonio'],
    area: 'penal',
    observacoes: 'Furto simples: 1-4 anos. Qualificadoras no § 4o.',
  },
  {
    diploma: 'CP',
    artigo: '157',
    caput: 'Subtrair coisa movel alheia, para si ou para outrem, mediante grave ameaca ou violencia a pessoa, ou depois de have-la, por qualquer meio, reduzido a impossibilidade de resistencia.',
    temas: ['roubo', 'violencia', 'grave ameaca'],
    area: 'penal',
  },
  {
    diploma: 'CP',
    artigo: '171',
    caput: 'Obter, para si ou para outrem, vantagem ilicita, em prejuizo alheio, induzindo ou mantendo alguem em erro, mediante artificio, ardil, ou qualquer outro meio fraudulento.',
    temas: ['estelionato', 'fraude', 'vantagem ilicita'],
    area: 'penal',
  },
  {
    diploma: 'CP',
    artigo: '312',
    caput: 'Apropriar-se o funcionario publico de dinheiro, valor ou qualquer outro bem movel, publico ou particular, de que tem a posse em razao do cargo, ou desvia-lo, em proveito proprio ou alheio.',
    temas: ['peculato', 'funcionario publico', 'crime funcional'],
    area: 'penal',
  },
  {
    diploma: 'CP',
    artigo: '317',
    caput: 'Solicitar ou receber, para si ou para outrem, direta ou indiretamente, ainda que fora da funcao ou antes de assumi-la, mas em razao dela, vantagem indevida, ou aceitar promessa de tal vantagem.',
    temas: ['corrupcao passiva', 'funcionario publico'],
    area: 'penal',
  },
]
