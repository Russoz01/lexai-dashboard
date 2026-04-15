import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LexAI para Escritórios e Bancas | Solução B2B',
  description: 'Doze agentes de IA calibrados para o Direito brasileiro. A partir de R$1.399 por advogado/mês. Demonstração gratuita, cancelamento a qualquer momento, sem taxa de setup.',
  keywords: 'lexai empresas, ia para escritorios, b2b direito, bancas juridicas, api juridica, compliance LGPD',
  alternates: { canonical: 'https://lexai.com.br/empresas' },
  openGraph: {
    title: 'LexAI para Escritórios | Doze especialistas, uma assinatura',
    description: 'Agentes de IA para Direito brasileiro. R$1.399/adv/mês. 7 dias grátis.',
    url: 'https://lexai.com.br/empresas',
    siteName: 'LexAI',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LexAI para Escritórios e Bancas',
    description: 'Doze agentes de IA para o Direito brasileiro. R$1.399/adv/mês.',
  },
}

export default function EmpresasLayout({ children }: { children: React.ReactNode }) {
  return children
}
