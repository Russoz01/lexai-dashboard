/* ══════════════════════════════════════════════════════════════
   OC ADVOGADOS — Pure data + utilities (server-safe)
   NO 'use client' directive: this module must be importable from
   server components (generateMetadata, generateStaticParams).
   Dados confirmados do site ocadvogados.com.br + Instagram (460k).
   NUNCA inventar estatísticas, datas, OAB, depoimentos.
   ══════════════════════════════════════════════════════════════ */

// ── Contact data ───────────────────────────────────────────────
export const WHATSAPP_MAIN = '5519997519277'
export const WHATSAPP_MAIN_DISPLAY = '(19) 99751-9277'
export const WHATSAPP_DEFAULT_MSG =
  'Olá, venho do site e gostaria de informações.'
export const EMAIL = 'contato@ocadvogados.com.br'
export const INSTAGRAM_URL = 'https://instagram.com/ocadvogados'
export const INSTAGRAM_HANDLE = '@ocadvogados'
export const INSTAGRAM_FOLLOWERS = 460000
export const OFFICES_COUNT = 5
export const TEAM_COUNT = 10

// ── Service data (hardcoded) ───────────────────────────────────
export type Service = {
  slug: string
  name: string
  shortName: string
  icon: string
  tagline: string
  description: string
  eligibility: string
  paragraphs: string[]
}

export const SERVICES: Service[] = [
  {
    slug: 'beneficio-bpc-loas',
    name: 'Benefício BPC-LOAS',
    shortName: 'BPC-LOAS',
    icon: 'bi-heart-pulse',
    tagline:
      'Benefício de Prestação Continuada para idosos e pessoas com deficiência.',
    description:
      'Auxiliamos na solicitação do Benefício de Prestação Continuada (BPC), garantindo o direito de idosos ou pessoas com deficiência em situação de vulnerabilidade social, conforme os critérios estabelecidos pelo LOAS.',
    eligibility:
      'Idosos com 65 anos ou mais e pessoas com deficiência em situação de vulnerabilidade social, conforme os critérios da Lei Orgânica da Assistência Social (LOAS).',
    paragraphs: [
      'O Benefício de Prestação Continuada (BPC), previsto pela Lei Orgânica da Assistência Social (LOAS), é um direito garantido a quem precisa e cumpre os critérios estabelecidos. No entanto, o pedido administrativo costuma ser rejeitado por detalhes de documentação ou enquadramento social.',
      'A OC Advogados acompanha todo o processo: da análise inicial da situação socioeconômica, passando pela organização documental, até a defesa em instância judicial quando o benefício é indevidamente negado pelo INSS.',
      'Nosso compromisso é com quem mais precisa: famílias em vulnerabilidade, idosos e pessoas com deficiência que dependem desse benefício para manter a dignidade e as condições mínimas de vida.',
    ],
  },
  {
    slug: 'concessao-de-aposentadoria',
    name: 'Concessão de Aposentadoria',
    shortName: 'Concessão',
    icon: 'bi-calendar-check',
    tagline:
      'Aposentadoria concedida no menor prazo, com todos os seus direitos preservados.',
    description:
      'Orientamos e representamos nossos clientes para assegurar a concessão da aposentadoria, analisando o tempo de contribuição e outros requisitos legais para garantir o benefício no menor prazo possível.',
    eligibility:
      'Trabalhadores segurados do INSS que preenchem os requisitos de idade, tempo de contribuição ou atividade especial previstos em lei.',
    paragraphs: [
      'Aposentar-se é um direito conquistado ao longo de décadas de contribuição — e merece ser exercido com segurança jurídica. A OC Advogados analisa em detalhe o seu histórico, identifica o enquadramento mais vantajoso e conduz o processo até a concessão.',
      'Avaliamos tempo de contribuição, períodos rurais, atividades especiais, contribuições como autônomo e lacunas de vínculo. O objetivo é simples: garantir que você se aposente no menor prazo possível, com o melhor valor possível.',
      'Atuamos em todas as modalidades: aposentadoria por idade, por tempo de contribuição, especial (atividades insalubres ou perigosas), por invalidez e as regras de transição da reforma da Previdência.',
    ],
  },
  {
    slug: 'revisoes-de-aposentadoria',
    name: 'Revisões de Aposentadoria',
    shortName: 'Revisão',
    icon: 'bi-arrow-repeat',
    tagline:
      'Aposentadoria já concedida? Ela pode valer mais do que você recebe hoje.',
    description:
      'Revisamos aposentadorias já concedidas para identificar eventuais erros no cálculo ou valores, buscando corrigir e aumentar o benefício de acordo com os direitos do segurado.',
    eligibility:
      'Aposentados que já recebem o benefício e querem verificar se o valor está correto, ou se há erros no cálculo feito pelo INSS.',
    paragraphs: [
      'Muitas aposentadorias são concedidas com valores abaixo do devido. Erros no cálculo, períodos não computados, atividades especiais ignoradas e aplicação incorreta de regras são mais comuns do que deveriam ser — e podem representar uma perda mensal significativa ao longo de toda a vida.',
      'A revisão de aposentadoria é o instrumento para corrigir esses erros. Analisamos seu processo de concessão, comparamos com os parâmetros legais e, quando há base jurídica, ingressamos com o pedido de revisão administrativo ou judicial.',
      'Revisar pode significar aumento no benefício mensal e, em muitos casos, o pagamento retroativo de valores devidos. É um direito do segurado e um trabalho que exige olhar técnico experiente.',
    ],
  },
  {
    slug: 'beneficios-por-incapacidade',
    name: 'Benefícios por Incapacidade',
    shortName: 'Incapacidade',
    icon: 'bi-hospital',
    tagline:
      'Auxílio-doença e aposentadoria por invalidez para quem não pode trabalhar.',
    description:
      'Prestamos suporte jurídico para a obtenção de benefícios como auxílio-doença e aposentadoria por invalidez, assegurando que os direitos de quem não pode trabalhar por motivos de saúde sejam respeitados.',
    eligibility:
      'Segurados do INSS que estejam temporária ou permanentemente incapacitados para o trabalho por motivos de saúde.',
    paragraphs: [
      'Quando a saúde impede o trabalho, o segurado do INSS tem direito a benefícios específicos: auxílio-doença (incapacidade temporária) e aposentadoria por invalidez (incapacidade permanente). Mas esses pedidos são frequentemente negados por perícias equivocadas ou documentação insuficiente.',
      'A OC Advogados cuida de todo o processo: preparação da documentação médica, acompanhamento da perícia do INSS e, quando o benefício é indevidamente negado, atuação judicial com laudos técnicos e argumentação consistente.',
      'Também atuamos em casos de cessação indevida, prorrogação, conversão de auxílio-doença em aposentadoria por invalidez e recuperação de valores atrasados.',
    ],
  },
]

// ── Team data (hardcoded, preserve hierarchy order) ────────────
export type Attorney = {
  name: string
  role: string
  initials: string
  tier: 'leadership' | 'partner' | 'associate'
}

export const TEAM: Attorney[] = [
  {
    name: 'Dr. Marco Oliveira',
    role: 'Sócio Diretor',
    initials: 'MO',
    tier: 'leadership',
  },
  {
    name: 'Dr. Diego Carneiro',
    role: 'Sócio Diretor',
    initials: 'DC',
    tier: 'leadership',
  },
  {
    name: 'Dr.ª Lucilady Ferreira',
    role: 'Sócia Gestora Geral',
    initials: 'LF',
    tier: 'partner',
  },
  {
    name: 'Dr.ª Isabel Cristina',
    role: 'Sócia Filial SP',
    initials: 'IC',
    tier: 'partner',
  },
  {
    name: 'Dr. Gustavo Baesso',
    role: 'Sócio Gestor de Equipe',
    initials: 'GB',
    tier: 'partner',
  },
  {
    name: 'Dr. Lucas Paiva',
    role: 'Sócio Gestor de Equipe',
    initials: 'LP',
    tier: 'partner',
  },
  {
    name: 'Dr.ª Giovanna Amendola',
    role: 'Sócia Gestora de Equipe',
    initials: 'GA',
    tier: 'partner',
  },
  {
    name: 'Dr.ª Marília Oliveira',
    role: 'Sócia Gestora de Equipe',
    initials: 'MO',
    tier: 'partner',
  },
  {
    name: 'Dr.ª Ana Beatriz',
    role: 'Sócia Gestora de Equipe',
    initials: 'AB',
    tier: 'partner',
  },
  {
    name: 'Dr.ª Ana Oliveira',
    role: 'Advogada',
    initials: 'AO',
    tier: 'associate',
  },
]

// ── Office data ────────────────────────────────────────────────
export type Office = {
  name: string
  city: string
  state: string
  isHq: boolean
  phone: string | null
  whatsapp: string
  whatsappRaw: string
  address: string
  cep: string | null
}

export const OFFICES: Office[] = [
  {
    name: 'Matriz Ituverava – SP',
    city: 'Ituverava',
    state: 'SP',
    isHq: true,
    phone: '(16) 3839-9153',
    whatsapp: '(16) 99413-3339',
    whatsappRaw: '5516994133339',
    address:
      'Rua Coronel Flauzino Barbosa Sandoval, 1634 · Cidade Universitária, Ituverava – SP',
    cep: '14503-192',
  },
  {
    name: 'Campinas – SP',
    city: 'Campinas',
    state: 'SP',
    isHq: false,
    phone: '(19) 3238-9497',
    whatsapp: '(19) 99659-3941',
    whatsappRaw: '5519996593941',
    address: 'Rua Barão de Paranapanema, 257 · Bosque, Campinas – SP',
    cep: '13026-010',
  },
  {
    name: 'Ribeirão Preto – SP',
    city: 'Ribeirão Preto',
    state: 'SP',
    isHq: false,
    phone: null,
    whatsapp: '(16) 99291-1984',
    whatsappRaw: '5516992911984',
    address:
      'Av. Presidente Vargas, 2121 · Sala 1702 Ed. Times Square, Jardim América, Ribeirão Preto – SP',
    cep: '14020-260',
  },
  {
    name: 'São Paulo – SP',
    city: 'São Paulo',
    state: 'SP',
    isHq: false,
    phone: '(11) 2307-4429',
    whatsapp: '(11) 99299-6363',
    whatsappRaw: '5511992996363',
    address: 'Av. Paulista, 1159 · Sala 806, Jardim Paulista, São Paulo – SP',
    cep: null,
  },
  {
    name: 'Bebedouro – SP',
    city: 'Bebedouro',
    state: 'SP',
    isHq: false,
    phone: '(17) 3343-9052',
    whatsapp: '(17) 98138-3250',
    whatsappRaw: '5517981383250',
    address: 'Rua General Osório, 1.311 · Jardim Paraíso, Bebedouro – SP',
    cep: null,
  },
]

// ── Practice areas ─────────────────────────────────────────────
export const PRACTICE_AREAS = [
  {
    name: 'Direito Previdenciário',
    icon: 'bi-shield-check',
    primary: true,
    description:
      'Especialistas em garantir seus benefícios, como aposentadorias e auxílios, com suporte completo em processos administrativos e judiciais.',
  },
  {
    name: 'Direito Cível',
    icon: 'bi-file-earmark-text',
    primary: false,
    description:
      'Resolução de conflitos, contratos, cobranças e direitos do consumidor, sempre buscando soluções rápidas e eficazes.',
  },
  {
    name: 'Direito Trabalhista',
    icon: 'bi-briefcase',
    primary: false,
    description:
      'Defendemos seus direitos em casos de rescisões, indenizações e outras questões trabalhistas, com foco em justiça e resultados.',
  },
]

// ── Utilities ──────────────────────────────────────────────────
export function buildWhatsAppLink(
  phone: string,
  message: string = WHATSAPP_DEFAULT_MSG
): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export function buildMapsLink(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`
}
