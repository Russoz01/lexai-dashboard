/**
 * Provimento CNJ 205/2021 - regulamentacao do marketing juridico.
 * Relevante para agente Marketing IA (compliance com OAB).
 */

import type { LegalProvision } from '../types'

export const PROVIMENTO_205: LegalProvision[] = [
  {
    diploma: 'Provimento CNJ 205',
    artigo: '1',
    caput: 'A publicidade profissional do advogado e da sociedade de advogados tem carater meramente informativo e deve primar pela discricao e sobriedade, vedada qualquer pratica mercantilista.',
    temas: ['publicidade advogado', 'carater informativo', 'discricao', 'sobriedade', 'vedacao mercantilista'],
    area: 'etica advocacia',
    observacoes: 'Principio basilar do marketing juridico regulado.',
  },
  {
    diploma: 'Provimento CNJ 205',
    artigo: '3',
    caput: 'A publicidade profissional do advogado tem por finalidade a divulgacao de informacoes objetivas relacionadas a atividade advocaticia, sendo permitido:',
    incisos: {
      I: 'a utilizacao de conteudo informativo-juridico em sitios eletronicos',
      II: 'a divulgacao do escritorio, nome dos advogados que o integram, enderecos, horarios de atendimento, areas de atuacao e outros elementos objetivos',
      III: 'a manutencao de blog, redes sociais, sitios eletronicos e canais de comunicacao digitais',
    },
    temas: ['publicidade permitida', 'conteudo informativo', 'redes sociais', 'areas atuacao'],
    area: 'etica advocacia',
  },
  {
    diploma: 'Provimento CNJ 205',
    artigo: '4',
    caput: 'E vedada ao advogado e as sociedades de advogados a publicidade que:',
    incisos: {
      I: 'contenha mencao a valores de servicos, promocoes ou tabelas de honorarios',
      II: 'utilize meios promocionais tipicos de atividade mercantil',
      III: 'oferte servicos juridicos pro bono de forma a captar clientela',
      IV: 'divulgue causas em que tenha patrocinado ou patrocine com mencao a nomes, qualificacoes ou particularidades dos envolvidos',
      V: 'utilize expressoes persuasivas, comparativas, superlativas ou que ofendam a classe',
      VI: 'apresente-se em sites de compras coletivas',
      VII: 'realize captacao de clientela, incluindo por meio de disparo massivo de mensagens',
    },
    temas: ['publicidade vedada', 'valores honorarios', 'captacao clientela', 'mercantilismo', 'disparo massivo'],
    area: 'etica advocacia',
    observacoes: 'Lista principal de vedacoes. Violacao gera processo disciplinar na OAB.',
  },
  {
    diploma: 'Provimento CNJ 205',
    artigo: '5',
    caput: 'E permitido ao advogado divulgar conteudo juridico em redes sociais, desde que com carater meramente informativo, sem ofensa a dignidade da advocacia, observadas as vedacoes deste Provimento.',
    temas: ['redes sociais', 'conteudo juridico', 'informativo', 'dignidade advocacia'],
    area: 'etica advocacia',
  },
  {
    diploma: 'Provimento CNJ 205',
    artigo: '6',
    caput: 'E vedado ao advogado, na publicidade profissional, utilizar-se de depoimentos de clientes ou de terceiros, fotografias de clientes, imagens de tribunais, magistrados ou autoridades, ou qualquer elemento que possa induzir ou sugerir captacao de clientela.',
    temas: ['depoimentos clientes', 'fotos tribunais', 'inducao', 'captacao'],
    area: 'etica advocacia',
  },
  {
    diploma: 'Provimento CNJ 205',
    artigo: '7',
    caput: 'O patrocinio de conteudo, impulsionamento de publicacoes e anuncios em redes sociais sao permitidos, desde que observem os requisitos e vedacoes deste Provimento, sendo vedada a promocao de servicos, a utilizacao de palavras-chave relacionadas a captacao de clientela ou a identificacao de advogados concorrentes.',
    temas: ['impulsionamento', 'anuncios pagos', 'palavras-chave', 'concorrentes'],
    area: 'etica advocacia',
    observacoes: 'Base para validacao de campanhas pagas de escritorios.',
  },
]
