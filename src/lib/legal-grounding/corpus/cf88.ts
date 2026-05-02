/**
 * Constituicao Federal de 1988 - dispositivos mais citados na advocacia.
 *
 * Fonte: texto consolidado em vigor em 2026-04, conforme EC 132/2023.
 * Todas as redacoes sao literais. Incisos/paragrafos truncados onde extensos
 * sao marcados em observacoes.
 */

import type { LegalProvision } from '../types'

export const CF88: LegalProvision[] = [
  {
    diploma: 'CF/88',
    artigo: '1',
    caput: 'A Republica Federativa do Brasil, formada pela uniao indissoluvel dos Estados e Municipios e do Distrito Federal, constitui-se em Estado Democratico de Direito e tem como fundamentos:',
    incisos: {
      I: 'a soberania',
      II: 'a cidadania',
      III: 'a dignidade da pessoa humana',
      IV: 'os valores sociais do trabalho e da livre iniciativa',
      V: 'o pluralismo politico',
    },
    paragrafos: {
      'unico': 'Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituicao.',
    },
    temas: ['fundamentos', 'estado democratico', 'dignidade', 'soberania', 'cidadania', 'trabalho', 'livre iniciativa', 'pluralismo'],
    area: 'constitucional',
  },
  {
    diploma: 'CF/88',
    artigo: '5',
    caput: 'Todos sao iguais perante a lei, sem distincao de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no Pais a inviolabilidade do direito a vida, a liberdade, a igualdade, a seguranca e a propriedade, nos termos seguintes:',
    incisos: {
      II: 'ninguem sera obrigado a fazer ou deixar de fazer alguma coisa senao em virtude de lei',
      X: 'sao inviolaveis a intimidade, a vida privada, a honra e a imagem das pessoas, assegurado o direito a indenizacao pelo dano material ou moral decorrente de sua violacao',
      XXII: 'e garantido o direito de propriedade',
      XXIII: 'a propriedade atendera a sua funcao social',
      XXXV: 'a lei nao excluira da apreciacao do Poder Judiciario lesao ou ameaca a direito',
      XXXVI: 'a lei nao prejudicara o direito adquirido, o ato juridico perfeito e a coisa julgada',
      XXXIX: 'nao ha crime sem lei anterior que o defina, nem pena sem previa cominacao legal',
      XL: 'a lei penal nao retroagira, salvo para beneficiar o reu',
      LIV: 'ninguem sera privado da liberdade ou de seus bens sem o devido processo legal',
      LV: 'aos litigantes, em processo judicial ou administrativo, e aos acusados em geral sao assegurados o contraditorio e ampla defesa, com os meios e recursos a ela inerentes',
      LVI: 'sao inadmissiveis, no processo, as provas obtidas por meios ilicitos',
      LXXIV: 'o Estado prestara assistencia juridica integral e gratuita aos que comprovarem insuficiencia de recursos',
      LXXVIII: 'a todos, no ambito judicial e administrativo, sao assegurados a razoavel duracao do processo e os meios que garantam a celeridade de sua tramitacao',
    },
    temas: ['direitos fundamentais', 'igualdade', 'devido processo', 'contraditorio', 'ampla defesa', 'dano moral', 'propriedade', 'funcao social', 'inafastabilidade', 'coisa julgada', 'legalidade penal', 'provas ilicitas', 'assistencia judiciaria', 'duracao razoavel'],
    area: 'constitucional',
    observacoes: 'Art. 5o tem 78 incisos. Aqui estao os mais citados. Texto completo disponivel em planalto.gov.br.',
  },
  {
    diploma: 'CF/88',
    artigo: '7',
    caput: 'Sao direitos dos trabalhadores urbanos e rurais, alem de outros que visem a melhoria de sua condicao social:',
    incisos: {
      I: 'relacao de emprego protegida contra despedida arbitraria ou sem justa causa, nos termos de lei complementar, que preveera indenizacao compensatoria, dentre outros direitos',
      IV: 'salario minimo, fixado em lei, nacionalmente unificado, capaz de atender as suas necessidades vitais basicas e as de sua familia',
      XIII: 'duracao do trabalho normal nao superior a oito horas diarias e quarenta e quatro semanais, facultada a compensacao de horarios e a reducao da jornada, mediante acordo ou convencao coletiva de trabalho',
      XV: 'repouso semanal remunerado, preferencialmente aos domingos',
      XVI: 'remuneracao do servico extraordinario superior, no minimo, em cinquenta por cento a do normal',
      XVII: 'gozo de ferias anuais remuneradas com, pelo menos, um terco a mais do que o salario normal',
      XVIII: 'licenca a gestante, sem prejuizo do emprego e do salario, com a duracao de cento e vinte dias',
      XXII: 'reducao dos riscos inerentes ao trabalho, por meio de normas de saude, higiene e seguranca',
      XXIII: 'adicional de remuneracao para as atividades penosas, insalubres ou perigosas, na forma da lei',
      XXVI: 'reconhecimento das convencoes e acordos coletivos de trabalho',
      XXIX: 'acao, quanto aos creditos resultantes das relacoes de trabalho, com prazo prescricional de cinco anos para os trabalhadores urbanos e rurais, ate o limite de dois anos apos a extincao do contrato de trabalho',
    },
    temas: ['trabalhista', 'direitos trabalhadores', 'jornada', 'horas extras', 'ferias', 'licenca maternidade', 'insalubridade', 'periculosidade', 'prescricao trabalhista', 'salario minimo', 'despedida arbitraria'],
    area: 'trabalhista',
    observacoes: 'Art. 7o tem 34 incisos. Aqui estao os mais citados.',
  },
  {
    diploma: 'CF/88',
    artigo: '37',
    caput: 'A administracao publica direta e indireta de qualquer dos Poderes da Uniao, dos Estados, do Distrito Federal e dos Municipios obedecera aos principios de legalidade, impessoalidade, moralidade, publicidade e eficiencia e, tambem, ao seguinte:',
    incisos: {
      II: 'a investidura em cargo ou emprego publico depende de aprovacao previa em concurso publico de provas ou de provas e titulos, de acordo com a natureza e a complexidade do cargo ou emprego, na forma prevista em lei, ressalvadas as nomeacoes para cargo em comissao declarado em lei de livre nomeacao e exoneracao',
      XXI: 'ressalvados os casos especificados na legislacao, as obras, servicos, compras e alienacoes serao contratados mediante processo de licitacao publica que assegure igualdade de condicoes a todos os concorrentes',
    },
    paragrafos: {
      '§6': 'As pessoas juridicas de direito publico e as de direito privado prestadoras de servicos publicos responderao pelos danos que seus agentes, nessa qualidade, causarem a terceiros, assegurado o direito de regresso contra o responsavel nos casos de dolo ou culpa.',
    },
    temas: ['administrativo', 'principios administracao', 'legalidade', 'impessoalidade', 'moralidade', 'publicidade', 'eficiencia', 'concurso publico', 'licitacao', 'responsabilidade objetiva estado'],
    area: 'administrativo',
  },
  {
    diploma: 'CF/88',
    artigo: '93',
    caput: 'Lei complementar, de iniciativa do Supremo Tribunal Federal, dispora sobre o Estatuto da Magistratura, observados os seguintes principios:',
    incisos: {
      IX: 'todos os julgamentos dos orgaos do Poder Judiciario serao publicos, e fundamentadas todas as decisoes, sob pena de nulidade, podendo a lei limitar a presenca, em determinados atos, as proprias partes e a seus advogados, ou somente a estes, em casos nos quais a preservacao do direito a intimidade do interessado no sigilo nao prejudique o interesse publico a informacao',
    },
    temas: ['magistratura', 'publicidade julgamentos', 'fundamentacao decisoes', 'sigilo processual'],
    area: 'constitucional',
  },
  {
    diploma: 'CF/88',
    artigo: '150',
    caput: 'Sem prejuizo de outras garantias asseguradas ao contribuinte, e vedado a Uniao, aos Estados, ao Distrito Federal e aos Municipios:',
    incisos: {
      I: 'exigir ou aumentar tributo sem lei que o estabeleca',
      II: 'instituir tratamento desigual entre contribuintes que se encontrem em situacao equivalente, proibida qualquer distincao em razao de ocupacao profissional ou funcao por eles exercida, independentemente da denominacao juridica dos rendimentos, titulos ou direitos',
      III: 'cobrar tributos: a) em relacao a fatos geradores ocorridos antes do inicio da vigencia da lei que os houver instituido ou aumentado; b) no mesmo exercicio financeiro em que haja sido publicada a lei que os instituiu ou aumentou; c) antes de decorridos noventa dias da data em que haja sido publicada a lei que os instituiu ou aumentou',
      IV: 'utilizar tributo com efeito de confisco',
    },
    temas: ['tributario', 'limitacoes tributar', 'legalidade tributaria', 'isonomia tributaria', 'irretroatividade', 'anterioridade', 'noventena', 'vedacao confisco'],
    area: 'tributario',
  },
  {
    diploma: 'CF/88',
    artigo: '170',
    caput: 'A ordem economica, fundada na valorizacao do trabalho humano e na livre iniciativa, tem por fim assegurar a todos existencia digna, conforme os ditames da justica social, observados os seguintes principios:',
    incisos: {
      II: 'propriedade privada',
      III: 'funcao social da propriedade',
      IV: 'livre concorrencia',
      V: 'defesa do consumidor',
      VI: 'defesa do meio ambiente',
      IX: 'tratamento favorecido para as empresas de pequeno porte constituidas sob as leis brasileiras e que tenham sua sede e administracao no Pais',
    },
    paragrafos: {
      'unico': 'E assegurado a todos o livre exercicio de qualquer atividade economica, independentemente de autorizacao de orgaos publicos, salvo nos casos previstos em lei.',
    },
    temas: ['ordem economica', 'livre iniciativa', 'livre concorrencia', 'defesa consumidor', 'funcao social propriedade', 'empresas pequeno porte'],
    area: 'constitucional',
  },
  {
    diploma: 'CF/88',
    artigo: '225',
    caput: 'Todos tem direito ao meio ambiente ecologicamente equilibrado, bem de uso comum do povo e essencial a sadia qualidade de vida, impondo-se ao Poder Publico e a coletividade o dever de defende-lo e preserva-lo para as presentes e futuras geracoes.',
    paragrafos: {
      '§3': 'As condutas e atividades consideradas lesivas ao meio ambiente sujeitarao os infratores, pessoas fisicas ou juridicas, a sancoes penais e administrativas, independentemente da obrigacao de reparar os danos causados.',
    },
    temas: ['ambiental', 'meio ambiente', 'dano ambiental', 'responsabilidade ambiental'],
    area: 'ambiental',
  },
  {
    diploma: 'CF/88',
    artigo: '226',
    caput: 'A familia, base da sociedade, tem especial protecao do Estado.',
    paragrafos: {
      '§3': 'Para efeito da protecao do Estado, e reconhecida a uniao estavel entre o homem e a mulher como entidade familiar, devendo a lei facilitar sua conversao em casamento.',
      '§5': 'Os direitos e deveres referentes a sociedade conjugal sao exercidos igualmente pelo homem e pela mulher.',
      '§6': 'O casamento civil pode ser dissolvido pelo divorcio.',
    },
    temas: ['familia', 'uniao estavel', 'casamento', 'divorcio', 'igualdade conjugal'],
    area: 'familia',
    observacoes: 'STF reconheceu uniao estavel homoafetiva em ADI 4277/2011.',
  },
  {
    diploma: 'CF/88',
    artigo: '227',
    caput: 'E dever da familia, da sociedade e do Estado assegurar a crianca, ao adolescente e ao jovem, com absoluta prioridade, o direito a vida, a saude, a alimentacao, a educacao, ao lazer, a profissionalizacao, a cultura, a dignidade, ao respeito, a liberdade e a convivencia familiar e comunitaria, alem de coloca-los a salvo de toda forma de negligencia, discriminacao, exploracao, violencia, crueldade e opressao.',
    temas: ['crianca', 'adolescente', 'prioridade absoluta', 'protecao integral'],
    area: 'familia',
  },
]
