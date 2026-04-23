import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sobre | LexAI, uma marca Pralvex',
  description: 'A LexAI foi construida por quem vive o Direito brasileiro. Conheca o time, a missao e como pensamos automacao juridica.',
  alternates: { canonical: 'https://lexai.com.br/sobre' },
  openGraph: {
    title: 'Sobre a LexAI',
    description: 'Construido por quem vive o Direito brasileiro.',
    url: 'https://lexai.com.br/sobre',
    siteName: 'LexAI',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function SobreLayout({ children }: { children: React.ReactNode }) {
  return children
}
