/**
 * Marco Civil da Internet - Lei 12.965/14.
 *
 * Foco: principios, direitos e garantias dos usuarios, protecao de
 * registros + dados pessoais e responsabilidade do provedor (art. 19 e
 * sua exegese pelo STF na ADI 7.100/RS e tema 533).
 */

import type { LegalProvision } from '../types'

export const MARCO_CIVIL_LAST_UPDATE = '2026-05-03'

export const MARCO_CIVIL: LegalProvision[] = [
  {
    diploma: 'Marco Civil',
    artigo: '1',
    caput: 'Esta Lei estabelece principios, garantias, direitos e deveres para o uso da internet no Brasil e determina as diretrizes para atuacao da Uniao, dos Estados, do Distrito Federal e dos Municipios em relacao a materia.',
    temas: ['marco civil internet', 'principios', 'ambito'],
    area: 'civel',
  },
  {
    diploma: 'Marco Civil',
    artigo: '2',
    caput: 'A disciplina do uso da internet no Brasil tem como fundamento o respeito a liberdade de expressao, bem como:',
    incisos: {
      I: 'o reconhecimento da escala mundial da rede',
      II: 'os direitos humanos, o desenvolvimento da personalidade e o exercicio da cidadania em meios digitais',
      III: 'a pluralidade e a diversidade',
      IV: 'a abertura e a colaboracao',
      V: 'a livre iniciativa, a livre concorrencia e a defesa do consumidor',
    },
    temas: ['fundamentos', 'liberdade expressao', 'direitos humanos digitais'],
    area: 'civel',
  },
  {
    diploma: 'Marco Civil',
    artigo: '3',
    caput: 'A disciplina do uso da internet no Brasil tem os seguintes principios:',
    incisos: {
      I: 'garantia da liberdade de expressao, comunicacao e manifestacao de pensamento, nos termos da Constituicao Federal',
      II: 'protecao da privacidade',
      III: 'protecao dos dados pessoais, na forma da lei',
      IV: 'preservacao e garantia da neutralidade de rede',
      V: 'preservacao da estabilidade, seguranca e funcionalidade da rede',
      VI: 'responsabilizacao dos agentes de acordo com suas atividades, nos termos da lei',
      VII: 'preservacao da natureza participativa da rede',
      VIII: 'liberdade dos modelos de negocios promovidos na internet, desde que nao conflitem com os demais principios estabelecidos nesta Lei',
    },
    temas: ['principios marco civil', 'neutralidade rede', 'privacidade', 'protecao dados'],
    area: 'civel',
  },
  {
    diploma: 'Marco Civil',
    artigo: '7',
    caput: 'O acesso a internet e essencial ao exercicio da cidadania, e ao usuario sao assegurados os seguintes direitos:',
    incisos: {
      I: 'inviolabilidade da intimidade e da vida privada, sua protecao e indenizacao pelo dano material ou moral decorrente de sua violacao',
      II: 'inviolabilidade e sigilo do fluxo de suas comunicacoes pela internet, salvo por ordem judicial, na forma da lei',
      III: 'inviolabilidade e sigilo de suas comunicacoes privadas armazenadas, salvo por ordem judicial',
      VII: 'nao fornecimento a terceiros de seus dados pessoais, inclusive registros de conexao, e de acesso a aplicacoes de internet, salvo mediante consentimento livre, expresso e informado ou nas hipoteses previstas em lei',
      VIII: 'informacoes claras e completas sobre coleta, uso, armazenamento, tratamento e protecao de seus dados pessoais',
      IX: 'consentimento expresso sobre coleta, uso, armazenamento e tratamento de dados pessoais, que devera ocorrer de forma destacada das demais clausulas contratuais',
      X: 'exclusao definitiva dos dados pessoais que tiver fornecido a determinada aplicacao de internet, a seu requerimento, ao termino da relacao entre as partes, ressalvadas as hipoteses de guarda obrigatoria de registros previstas nesta Lei',
    },
    temas: ['direitos usuario', 'sigilo comunicacao', 'consentimento dados', 'exclusao definitiva'],
    area: 'civel',
  },
  {
    diploma: 'Marco Civil',
    artigo: '8',
    caput: 'A garantia do direito a privacidade e a liberdade de expressao nas comunicacoes e condicao para o pleno exercicio do direito de acesso a internet.',
    paragrafos: {
      'unico': 'Sao nulas de pleno direito as clausulas contratuais que violem o disposto no caput, tais como aquelas que: I - impliquem ofensa a inviolabilidade e ao sigilo das comunicacoes privadas, pela internet; ou II - em contrato de adesao, nao ofereçam como alternativa ao contratante a adocao do foro brasileiro para solucao de controversias decorrentes de servicos prestados no Brasil.',
    },
    temas: ['direito privacidade', 'sigilo comunicacao', 'clausulas nulas', 'foro brasileiro'],
    area: 'civel',
  },
  {
    diploma: 'Marco Civil',
    artigo: '10',
    caput: 'A guarda e a disponibilizacao dos registros de conexao e de acesso a aplicacoes de internet de que trata esta Lei, bem como de dados pessoais e do conteudo de comunicacoes privadas, devem atender a preservacao da intimidade, da vida privada, da honra e da imagem das partes direta ou indiretamente envolvidas.',
    paragrafos: {
      '§1': 'O provedor responsavel pela guarda somente sera obrigado a disponibilizar os registros mencionados no caput, de forma autonoma ou associados a dados pessoais ou a outras informacoes que possam contribuir para a identificacao do usuario ou do terminal, mediante ordem judicial.',
    },
    temas: ['guarda registros', 'ordem judicial', 'preservacao intimidade'],
    area: 'civel',
  },
  {
    diploma: 'Marco Civil',
    artigo: '13',
    caput: 'Na provisao de conexao a internet, cabe ao administrador de sistema autonomo respectivo o dever de manter os registros de conexao, sob sigilo, em ambiente controlado e de seguranca, pelo prazo de 1 (um) ano, nos termos do regulamento.',
    temas: ['registros conexao', 'guarda um ano', 'provedor conexao'],
    area: 'civel',
  },
  {
    diploma: 'Marco Civil',
    artigo: '15',
    caput: 'O provedor de aplicacoes de internet constituido na forma de pessoa juridica e que exerca essa atividade de forma organizada, profissionalmente e com fins economicos devera manter os respectivos registros de acesso a aplicacoes de internet, sob sigilo, em ambiente controlado e de seguranca, pelo prazo de 6 (seis) meses, nos termos do regulamento.',
    temas: ['registros acesso aplicacoes', 'guarda seis meses', 'provedor aplicacoes'],
    area: 'civel',
  },
  {
    diploma: 'Marco Civil',
    artigo: '19',
    caput: 'Com o intuito de assegurar a liberdade de expressao e impedir a censura, o provedor de aplicacoes de internet somente podera ser responsabilizado civilmente por danos decorrentes de conteudo gerado por terceiros se, apos ordem judicial especifica, nao tomar as providencias para, no ambito e nos limites tecnicos do seu servico e dentro do prazo assinalado, tornar indisponivel o conteudo apontado como infringente, ressalvadas as disposicoes legais em contrario.',
    paragrafos: {
      '§1': 'A ordem judicial de que trata o caput devera conter, sob pena de nulidade, identificacao clara e especifica do conteudo apontado como infringente, que permita a localizacao inequivoca do material.',
      '§2': 'A aplicacao do disposto neste artigo para infracoes a direitos de autor ou a direitos conexos depende de previsao legal especifica, que devera respeitar a liberdade de expressao e demais garantias previstas no art. 5o da Constituicao Federal.',
    },
    temas: ['responsabilidade provedor', 'ordem judicial especifica', 'liberdade expressao', 'remocao conteudo'],
    area: 'civel',
    observacoes: 'STF (Tema 533, RE 1037396, j. 2025) reafirmou constitucionalidade do art. 19, mas reconheceu hipoteses excepcionais de responsabilidade direta (porno infantil, ataques democracia).',
  },
  {
    diploma: 'Marco Civil',
    artigo: '21',
    caput: 'O provedor de aplicacoes de internet que disponibilize conteudo gerado por terceiros sera responsabilizado subsidiariamente pela violacao da intimidade decorrente da divulgacao, sem autorizacao de seus participantes, de imagens, de videos ou de outros materiais contendo cenas de nudez ou de atos sexuais de carater privado quando, apos o recebimento de notificacao pelo participante ou seu representante legal, deixar de promover, de forma diligente, no ambito e nos limites tecnicos do seu servico, a indisponibilizacao desse conteudo.',
    temas: ['responsabilidade subsidiaria', 'nudez nao consensual', 'pornografia revanche'],
    area: 'civel',
  },
  // TODO: arts. 11 (jurisdicao), 12 (sancoes administrativas), 14 (vedacao
  // guardar conteudo), 16-18 (deveres provedor), 22 (procedimento judicial
  // identificacao usuario), 23-32 (atuacao poder publico).
]
