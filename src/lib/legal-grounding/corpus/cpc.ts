/**
 * Codigo de Processo Civil (Lei 13.105/2015) - dispositivos mais citados.
 * Redacoes sintetizadas para grounding. Texto integral em planalto.gov.br.
 */

import type { LegalProvision } from '../types'

export const CPC: LegalProvision[] = [
  {
    diploma: 'CPC',
    artigo: '1',
    caput: 'O processo civil sera ordenado, disciplinado e interpretado conforme os valores e as normas fundamentais estabelecidos na Constituicao Federal.',
    temas: ['normas fundamentais', 'interpretacao constitucional', 'processo civil'],
    area: 'processo civil',
  },
  {
    diploma: 'CPC',
    artigo: '6',
    caput: 'Todos os sujeitos do processo devem cooperar entre si para que se obtenha, em tempo razoavel, decisao de merito justa e efetiva.',
    temas: ['cooperacao', 'boa-fe processual', 'duracao razoavel'],
    area: 'processo civil',
  },
  {
    diploma: 'CPC',
    artigo: '77',
    caput: 'Sao deveres das partes, de seus procuradores e de todos aqueles que de qualquer forma participem do processo:',
    incisos: {
      I: 'expor os fatos em juizo conforme a verdade',
      II: 'nao formular pretensao ou de apresentar defesa quando cientes de que sao destituidas de fundamento',
      III: 'nao produzir provas e nao praticar atos inuteis ou desnecessarios a declaracao ou a defesa do direito',
      IV: 'cumprir com exatidao as decisoes jurisdicionais',
    },
    temas: ['deveres partes', 'boa-fe', 'litigancia ma-fe', 'veracidade'],
    area: 'processo civil',
  },
  {
    diploma: 'CPC',
    artigo: '85',
    caput: 'A sentenca condenara o vencido a pagar honorarios ao advogado do vencedor.',
    paragrafos: {
      '§2': 'Os honorarios serao fixados entre dez e vinte por cento sobre o valor da condenacao, do proveito economico obtido ou, nao sendo possivel mensura-lo, sobre o valor atualizado da causa.',
      '§3': 'Nas causas em que a Fazenda Publica for parte, a fixacao dos honorarios observara os seguintes percentuais, aplicaveis cumulativamente.',
      '§11': 'O tribunal, ao julgar recurso, majorara os honorarios fixados anteriormente, levando em conta o trabalho adicional realizado em grau recursal.',
    },
    temas: ['honorarios sucumbencia', 'honorarios advocaticios', 'honorarios recursais', 'fazenda publica'],
    area: 'processo civil',
    observacoes: 'Base para calculo de honorarios em cumprimento e execucao.',
  },
  {
    diploma: 'CPC',
    artigo: '98',
    caput: 'A pessoa natural ou juridica, brasileira ou estrangeira, com insuficiencia de recursos para pagar as custas, as despesas processuais e os honorarios advocaticios, tem direito a gratuidade da justica, na forma da lei.',
    temas: ['gratuidade justica', 'assistencia judiciaria', 'hipossuficiencia'],
    area: 'processo civil',
  },
  {
    diploma: 'CPC',
    artigo: '190',
    caput: 'Versando o processo sobre direitos que admitam autocomposicao, e licito as partes plenamente capazes estipular mudancas no procedimento para ajusta-lo as especificidades da causa e convencionar sobre os seus onus, poderes, faculdades e deveres processuais, antes ou durante o processo.',
    temas: ['negocio juridico processual', 'autocomposicao', 'calendario processual'],
    area: 'processo civil',
    observacoes: 'Permite flexibilizacao procedimental por acordo entre partes capazes.',
  },
  {
    diploma: 'CPC',
    artigo: '300',
    caput: 'A tutela de urgencia sera concedida quando houver elementos que evidenciem a probabilidade do direito e o perigo de dano ou o risco ao resultado util do processo.',
    paragrafos: {
      '§1': 'Para a concessao da tutela de urgencia, o juiz pode, conforme o caso, exigir caucao real ou fidejussoria idonea para ressarcir os danos que a outra parte possa vir a sofrer, podendo a caucao ser dispensada se a parte economicamente hipossuficiente nao puder oferece-la.',
      '§2': 'A tutela de urgencia pode ser concedida liminarmente ou apos justificacao previa.',
      '§3': 'A tutela de urgencia de natureza antecipada nao sera concedida quando houver perigo de irreversibilidade dos efeitos da decisao.',
    },
    temas: ['tutela urgencia', 'tutela antecipada', 'liminar', 'fumus boni iuris', 'periculum in mora'],
    area: 'processo civil',
  },
  {
    diploma: 'CPC',
    artigo: '311',
    caput: 'A tutela da evidencia sera concedida, independentemente da demonstracao de perigo de dano ou de risco ao resultado util do processo, quando:',
    incisos: {
      I: 'ficar caracterizado o abuso do direito de defesa ou o manifesto proposito protelatorio da parte',
      II: 'as alegacoes de fato puderem ser comprovadas apenas documentalmente e houver tese firmada em julgamento de casos repetitivos ou em sumula vinculante',
      IV: 'a peticao inicial for instruida com prova documental suficiente dos fatos constitutivos do direito do autor, a que o reu nao oponha prova capaz de gerar duvida razoavel',
    },
    temas: ['tutela evidencia', 'abuso defesa', 'prova documental', 'sumula vinculante'],
    area: 'processo civil',
  },
  {
    diploma: 'CPC',
    artigo: '319',
    caput: 'A peticao inicial indicara:',
    incisos: {
      I: 'o juizo a que e dirigida',
      II: 'os nomes, os prenomes, o estado civil, a existencia de uniao estavel, a profissao, o numero de inscricao no CPF ou no CNPJ, o endereco eletronico, o domicilio e a residencia do autor e do reu',
      III: 'o fato e os fundamentos juridicos do pedido',
      IV: 'o pedido com as suas especificacoes',
      V: 'o valor da causa',
      VI: 'as provas com que o autor pretende demonstrar a verdade dos fatos alegados',
      VII: 'a opcao do autor pela realizacao ou nao de audiencia de conciliacao ou de mediacao',
    },
    temas: ['peticao inicial', 'requisitos', 'enderecamento', 'qualificacao partes', 'pedido', 'valor causa'],
    area: 'processo civil',
  },
  {
    diploma: 'CPC',
    artigo: '330',
    caput: 'A peticao inicial sera indeferida quando:',
    incisos: {
      I: 'for inepta',
      II: 'a parte for manifestamente ilegitima',
      III: 'o autor carecer de interesse processual',
      IV: 'nao atendidas as prescricoes dos arts. 106 e 321',
    },
    temas: ['inepcia', 'indeferimento peticao', 'ilegitimidade', 'interesse processual'],
    area: 'processo civil',
  },
  {
    diploma: 'CPC',
    artigo: '373',
    caput: 'O onus da prova incumbe:',
    incisos: {
      I: 'ao autor, quanto ao fato constitutivo de seu direito',
      II: 'ao reu, quanto a existencia de fato impeditivo, modificativo ou extintivo do direito do autor',
    },
    paragrafos: {
      '§1': 'Nos casos previstos em lei ou diante de peculiaridades da causa relacionadas a impossibilidade ou a excessiva dificuldade de cumprir o encargo nos termos do caput ou a maior facilidade de obtencao da prova do fato contrario, podera o juiz atribuir o onus da prova de modo diverso, desde que o faca por decisao fundamentada.',
    },
    temas: ['onus prova', 'distribuicao dinamica', 'fato constitutivo', 'fato impeditivo'],
    area: 'processo civil',
  },
  {
    diploma: 'CPC',
    artigo: '489',
    caput: 'Sao elementos essenciais da sentenca:',
    incisos: {
      I: 'o relatorio, que contera os nomes das partes, a identificacao do caso, com a suma do pedido e da contestacao, e o registro das principais ocorrencias havidas no andamento do processo',
      II: 'os fundamentos, em que o juiz analisara as questoes de fato e de direito',
      III: 'o dispositivo, em que o juiz resolvera as questoes principais que as partes lhe submeterem',
    },
    paragrafos: {
      '§1': 'Nao se considera fundamentada qualquer decisao judicial que se limitar a indicacao, a reproducao ou a parafrase de ato normativo, sem explicar sua relacao com a causa, que empregar conceitos juridicos indeterminados sem explicar o motivo concreto de sua incidencia, que invocar motivos que se prestariam a justificar qualquer outra decisao, que nao enfrentar todos os argumentos deduzidos no processo capazes de, em tese, infirmar a conclusao adotada, que se limitar a invocar precedente ou enunciado de sumula sem identificar seus fundamentos determinantes, que deixar de seguir enunciado de sumula, jurisprudencia ou precedente invocado pela parte, sem demonstrar a existencia de distincao ou de superacao.',
    },
    temas: ['sentenca', 'fundamentacao', 'relatorio', 'dispositivo', 'nulidade por falta de fundamentacao'],
    area: 'processo civil',
    observacoes: 'Pilar da exigencia de fundamentacao analitica.',
  },
  {
    diploma: 'CPC',
    artigo: '926',
    caput: 'Os tribunais devem uniformizar sua jurisprudencia e mante-la estavel, integra e coerente.',
    paragrafos: {
      '§1': 'Na forma estabelecida e segundo os pressupostos fixados no regimento interno, os tribunais editarao enunciados de sumula correspondentes a sua jurisprudencia dominante.',
      '§2': 'Ao editar enunciados de sumula, os tribunais devem ater-se as circunstancias faticas dos precedentes que motivaram sua criacao.',
    },
    temas: ['precedentes', 'jurisprudencia estavel', 'sumulas tribunais', 'integridade coerencia'],
    area: 'processo civil',
  },
  {
    diploma: 'CPC',
    artigo: '927',
    caput: 'Os juizes e os tribunais observarao:',
    incisos: {
      I: 'as decisoes do Supremo Tribunal Federal em controle concentrado de constitucionalidade',
      II: 'os enunciados de sumula vinculante',
      III: 'os acordaos em incidente de assuncao de competencia ou de resolucao de demandas repetitivas e em julgamento de recursos extraordinario e especial repetitivos',
      IV: 'os enunciados das sumulas do Supremo Tribunal Federal em materia constitucional e do Superior Tribunal de Justica em materia infraconstitucional',
      V: 'a orientacao do plenario ou do orgao especial aos quais estiverem vinculados',
    },
    temas: ['precedentes vinculantes', 'sumula vinculante', 'repetitivos', 'IAC', 'IRDR'],
    area: 'processo civil',
  },
  {
    diploma: 'CPC',
    artigo: '1013',
    caput: 'A apelacao devolvera ao tribunal o conhecimento da materia impugnada.',
    paragrafos: {
      '§3': 'Se o processo estiver em condicoes de imediato julgamento, o tribunal deve decidir desde logo o merito quando: I - reformar sentenca fundada no art. 485; II - decretar a nulidade da sentenca por nao ser ela congruente com os limites do pedido ou da causa de pedir; III - constatar a omissao no exame de um dos pedidos; IV - decretar a nulidade de sentenca por falta de fundamentacao.',
    },
    temas: ['apelacao', 'efeito devolutivo', 'teoria causa madura', 'julgamento merito tribunal'],
    area: 'processo civil',
  },
  {
    diploma: 'CPC',
    artigo: '1022',
    caput: 'Cabem embargos de declaracao contra qualquer decisao judicial para:',
    incisos: {
      I: 'esclarecer obscuridade ou eliminar contradicao',
      II: 'suprir omissao de ponto ou questao sobre o qual devia se pronunciar o juiz de oficio ou a requerimento',
      III: 'corrigir erro material',
    },
    temas: ['embargos declaracao', 'omissao', 'obscuridade', 'contradicao', 'prequestionamento'],
    area: 'processo civil',
  },
]
