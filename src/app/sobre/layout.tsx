import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site-url'

export const metadata: Metadata = {
  title: 'Sobre | Pralvex',
  description: 'A Pralvex foi construida por quem vive o Direito brasileiro. Conheca o time, a missao e como pensamos automacao juridica.',
  alternates: { canonical: `${SITE_URL}/sobre` },
  openGraph: {
    title: 'Sobre a Pralvex',
    description: 'Construido por quem vive o Direito brasileiro.',
    url: `${SITE_URL}/sobre`,
    siteName: 'Pralvex',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function SobreLayout({ children }: { children: React.ReactNode }) {
  return children
}
