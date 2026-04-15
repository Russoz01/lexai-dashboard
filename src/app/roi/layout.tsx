import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calculadora de ROI | LexAI para escritorios',
  description: 'Calcule em 30 segundos quanto seu escritorio economiza com LexAI. Insira horas mensais, valor/hora e numero de advogados.',
  alternates: { canonical: 'https://lexai.com.br/roi' },
  openGraph: {
    title: 'Quanto seu escritorio economiza com LexAI?',
    description: 'Calculadora gratuita. 30 segundos. Sem cadastro.',
    url: 'https://lexai.com.br/roi',
    siteName: 'LexAI',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function RoiLayout({ children }: { children: React.ReactNode }) {
  return children
}
