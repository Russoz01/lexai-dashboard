import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calculadora de ROI | Pralvex para escritorios',
  description: 'Calcule em 30 segundos quanto seu escritorio economiza com Pralvex. Insira horas mensais, valor/hora e numero de advogados.',
  alternates: { canonical: 'https://pralvex.com.br/roi' },
  openGraph: {
    title: 'Quanto seu escritorio economiza com Pralvex?',
    description: 'Calculadora gratuita. 30 segundos. Sem cadastro.',
    url: 'https://pralvex.com.br/roi',
    siteName: 'Pralvex',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function RoiLayout({ children }: { children: React.ReactNode }) {
  return children
}
