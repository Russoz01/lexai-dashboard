/**
 * Codigo Civil (Lei 10.406/2002) - dispositivos mais citados.
 */

import type { LegalProvision } from '../types'

export const CC: LegalProvision[] = [
  {
    diploma: 'CC',
    artigo: '186',
    caput: 'Aquele que, por acao ou omissao voluntaria, negligencia ou imprudencia, violar direito e causar dano a outrem, ainda que exclusivamente moral, comete ato ilicito.',
    temas: ['ato ilicito', 'responsabilidade civil', 'dano moral', 'culpa'],
    area: 'civel',
  },
  {
    diploma: 'CC',
    artigo: '187',
    caput: 'Tambem comete ato ilicito o titular de um direito que, ao exerce-lo, excede manifestamente os limites impostos pelo seu fim economico ou social, pela boa-fe ou pelos bons costumes.',
    temas: ['abuso direito', 'boa-fe objetiva', 'fim social'],
    area: 'civel',
  },
  {
    diploma: 'CC',
    artigo: '188',
    caput: 'Nao constituem atos ilicitos:',
    incisos: {
      I: 'os praticados em legitima defesa ou no exercicio regular de um direito reconhecido',
      II: 'a deterioracao ou destruicao da coisa alheia, ou a lesao a pessoa, a fim de remover perigo iminente',
    },
    temas: ['excludentes ilicitude', 'legitima defesa', 'estado necessidade'],
    area: 'civel',
  },
  {
    diploma: 'CC',
    artigo: '206',
    caput: 'Prescreve em:',
    paragrafos: {
      '§3': 'Em tres anos: V - a pretensao de reparacao civil.',
      '§5': 'Em cinco anos: I - a pretensao de cobranca de dividas liquidas constantes de instrumento publico ou particular.',
    },
    temas: ['prescricao', 'reparacao civil', 'tres anos', 'cinco anos', 'cobranca dividas'],
    area: 'civel',
    observacoes: 'Prazos prescricionais mais citados. Art. 206 tem 18 hipoteses no total.',
  },
  {
    diploma: 'CC',
    artigo: '389',
    caput: 'Nao cumprida a obrigacao, responde o devedor por perdas e danos, mais juros e atualizacao monetaria segundo indices oficiais regularmente estabelecidos, e honorarios de advogado.',
    temas: ['inadimplemento', 'perdas danos', 'juros', 'honorarios advogado'],
    area: 'civel',
  },
  {
    diploma: 'CC',
    artigo: '402',
    caput: 'Salvo as excecoes expressamente previstas em lei, as perdas e danos devidas ao credor abrangem, alem do que ele efetivamente perdeu, o que razoavelmente deixou de lucrar.',
    temas: ['perdas danos', 'dano emergente', 'lucros cessantes'],
    area: 'civel',
  },
  {
    diploma: 'CC',
    artigo: '421',
    caput: 'A liberdade contratual sera exercida nos limites da funcao social do contrato.',
    temas: ['funcao social contrato', 'liberdade contratual'],
    area: 'civel',
  },
  {
    diploma: 'CC',
    artigo: '422',
    caput: 'Os contratantes sao obrigados a guardar, assim na conclusao do contrato, como em sua execucao, os principios de probidade e boa-fe.',
    temas: ['boa-fe objetiva', 'probidade', 'deveres anexos'],
    area: 'civel',
  },
  {
    diploma: 'CC',
    artigo: '475',
    caput: 'A parte lesada pelo inadimplemento pode pedir a resolucao do contrato, se nao preferir exigir-lhe o cumprimento, cabendo, em qualquer dos casos, indenizacao por perdas e danos.',
    temas: ['resolucao contratual', 'inadimplemento', 'cumprimento especifico'],
    area: 'civel',
  },
  {
    diploma: 'CC',
    artigo: '927',
    caput: 'Aquele que, por ato ilicito (arts. 186 e 187), causar dano a outrem, fica obrigado a repara-lo.',
    paragrafos: {
      'unico': 'Havera obrigacao de reparar o dano, independentemente de culpa, nos casos especificados em lei, ou quando a atividade normalmente desenvolvida pelo autor do dano implicar, por sua natureza, risco para os direitos de outrem.',
    },
    temas: ['obrigacao indenizar', 'responsabilidade objetiva', 'teoria risco', 'atividade perigosa'],
    area: 'civel',
  },
  {
    diploma: 'CC',
    artigo: '944',
    caput: 'A indenizacao mede-se pela extensao do dano.',
    paragrafos: {
      'unico': 'Se houver excessiva desproporcao entre a gravidade da culpa e o dano, podera o juiz reduzir, equitativamente, a indenizacao.',
    },
    temas: ['quantum indenizatorio', 'extensao dano', 'reducao equitativa'],
    area: 'civel',
  },
  {
    diploma: 'CC',
    artigo: '1228',
    caput: 'O proprietario tem a faculdade de usar, gozar e dispor da coisa, e o direito de reave-la do poder de quem quer que injustamente a possua ou detenha.',
    paragrafos: {
      '§1': 'O direito de propriedade deve ser exercido em consonancia com as suas finalidades economicas e sociais e de modo que sejam preservados a flora, a fauna, as belezas naturais, o equilibrio ecologico e o patrimonio historico e artistico.',
    },
    temas: ['propriedade', 'jus utendi fruendi abutendi', 'funcao social propriedade'],
    area: 'civel',
  },
  {
    diploma: 'CC',
    artigo: '1723',
    caput: 'E reconhecida como entidade familiar a uniao estavel entre o homem e a mulher, configurada na convivencia publica, continua e duradoura e estabelecida com o objetivo de constituicao de familia.',
    temas: ['uniao estavel', 'entidade familiar', 'convivencia'],
    area: 'familia',
    observacoes: 'STF em ADI 4277/2011 estendeu a casais homoafetivos.',
  },
]
