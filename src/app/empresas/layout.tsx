import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site-url'

export const metadata: Metadata = {
  title: 'Pralvex para Escritórios e Bancas | Solução B2B',
  description: 'Doze agentes de IA calibrados para o Direito brasileiro. A partir de R$1.399 por advogado/mês. Demonstração gratuita, cancelamento a qualquer momento, sem taxa de setup.',
  keywords: 'pralvex empresas, ia para escritorios, b2b direito, bancas juridicas, api juridica, compliance LGPD',
  alternates: { canonical: `${SITE_URL}/empresas` },
  openGraph: {
    title: 'Pralvex para Escritórios | Doze especialistas, uma assinatura',
    description: 'Agentes de IA para Direito brasileiro. R$1.399/adv/mês. Demo 30 min grátis.',
    url: `${SITE_URL}/empresas`,
    siteName: 'Pralvex',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pralvex para Escritórios e Bancas',
    description: 'Doze agentes de IA para o Direito brasileiro. R$1.399/adv/mês.',
  },
}

export default function EmpresasLayout({ children }: { children: React.ReactNode }) {
  return children
}
