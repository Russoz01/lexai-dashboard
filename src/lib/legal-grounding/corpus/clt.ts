/**
 * CLT (Decreto-Lei 5.452/1943) - dispositivos mais citados.
 * Metadados para grounding - texto literal consultado via web_search.
 */

import type { LegalProvision } from '../types'

export const CLT: LegalProvision[] = [
  {
    diploma: 'CLT',
    artigo: '2',
    caput: 'Considera-se empregador a empresa, individual ou coletiva, que, assumindo os riscos da atividade economica, admite, assalaria e dirige a prestacao pessoal de servico.',
    temas: ['empregador', 'definicao', 'riscos atividade', 'grupo economico'],
    area: 'trabalhista',
  },
  {
    diploma: 'CLT',
    artigo: '3',
    caput: 'Considera-se empregado toda pessoa fisica que prestar servicos de natureza nao eventual a empregador, sob a dependencia deste e mediante salario.',
    temas: ['empregado', 'vinculo emprego', 'pessoalidade', 'habitualidade', 'subordinacao', 'onerosidade'],
    area: 'trabalhista',
    observacoes: 'Base dos 5 requisitos do vinculo empregaticio.',
  },
  {
    diploma: 'CLT',
    artigo: '7',
    caput: 'Os preceitos constantes da presente Consolidacao, salvo quando for, em cada caso, expressamente determinado em contrario, nao se aplicam a servidores publicos.',
    temas: ['aplicabilidade CLT', 'servidores publicos'],
    area: 'trabalhista',
  },
  {
    diploma: 'CLT',
    artigo: '58',
    caput: 'A duracao normal do trabalho, para os empregados em qualquer atividade privada, nao excedera de oito horas diarias, desde que nao seja fixado expressamente outro limite.',
    temas: ['jornada', 'duracao trabalho', 'horas extras'],
    area: 'trabalhista',
  },
  {
    diploma: 'CLT',
    artigo: '59',
    caput: 'A duracao diaria do trabalho podera ser acrescida de horas extras, em numero nao excedente de duas, por acordo individual, convencao coletiva ou acordo coletivo de trabalho.',
    temas: ['horas extras', 'limite diario', 'banco horas', 'acordo compensacao'],
    area: 'trabalhista',
  },
  {
    diploma: 'CLT',
    artigo: '62',
    caput: 'Nao sao abrangidos pelo regime previsto neste capitulo:',
    incisos: {
      I: 'os empregados que exercem atividade externa incompativel com a fixacao de horario de trabalho',
      II: 'os gerentes, assim considerados os exercentes de cargos de gestao',
      III: 'os empregados em regime de teletrabalho',
    },
    temas: ['excecoes jornada', 'cargo confianca', 'teletrabalho', 'atividade externa'],
    area: 'trabalhista',
  },
  {
    diploma: 'CLT',
    artigo: '71',
    caput: 'Em qualquer trabalho continuo, cuja duracao exceda de seis horas, e obrigatoria a concessao de um intervalo para repouso ou alimentacao, o qual sera, no minimo, de uma hora.',
    temas: ['intervalo intrajornada', 'repouso alimentacao'],
    area: 'trabalhista',
  },
  {
    diploma: 'CLT',
    artigo: '193',
    caput: 'Sao consideradas atividades ou operacoes perigosas, na forma da regulamentacao aprovada pelo Ministerio do Trabalho, aquelas que, por sua natureza ou metodos de trabalho, impliquem risco acentuado em virtude de exposicao permanente do trabalhador.',
    temas: ['periculosidade', 'adicional', 'risco acentuado'],
    area: 'trabalhista',
  },
  {
    diploma: 'CLT',
    artigo: '457',
    caput: 'Compreendem-se na remuneracao do empregado, para todos os efeitos legais, alem do salario devido e pago diretamente pelo empregador, como contraprestacao do servico, as gorjetas que receber.',
    temas: ['remuneracao', 'salario', 'gorjetas', 'integracao'],
    area: 'trabalhista',
  },
  {
    diploma: 'CLT',
    artigo: '461',
    caput: 'Sendo identica a funcao, a todo trabalho de igual valor, prestado ao mesmo empregador, no mesmo estabelecimento empresarial, correspondera igual salario, sem distincao de sexo, etnia, nacionalidade ou idade.',
    temas: ['equiparacao salarial', 'isonomia', 'mesma funcao'],
    area: 'trabalhista',
  },
  {
    diploma: 'CLT',
    artigo: '477',
    caput: 'Na extincao do contrato de trabalho, o empregador devera proceder a anotacao na Carteira de Trabalho, comunicar a dispensa aos orgaos competentes e realizar o pagamento das verbas rescisorias no prazo e na forma estabelecidos neste artigo.',
    temas: ['rescisao', 'verbas rescisorias', 'prazo pagamento', 'multa art 477'],
    area: 'trabalhista',
  },
  {
    diploma: 'CLT',
    artigo: '482',
    caput: 'Constituem justa causa para rescisao do contrato de trabalho pelo empregador os atos enumerados neste artigo.',
    incisos: {
      a: 'ato de improbidade',
      b: 'incontinencia de conduta ou mau procedimento',
      e: 'desidia no desempenho das respectivas funcoes',
      f: 'embriaguez habitual ou em servico',
      h: 'ato de indisciplina ou de insubordinacao',
      i: 'abandono de emprego',
    },
    temas: ['justa causa', 'rescisao motivada', 'improbidade', 'abandono'],
    area: 'trabalhista',
  },
  {
    diploma: 'CLT',
    artigo: '818',
    caput: 'O onus da prova incumbe ao reclamante quanto ao fato constitutivo de seu direito, e ao reclamado quanto a existencia de fato impeditivo, modificativo ou extintivo do direito do reclamante.',
    temas: ['onus prova trabalhista', 'distribuicao dinamica'],
    area: 'trabalhista',
  },
]
