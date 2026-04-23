import type { Metadata } from 'next'
import { Nav, Footer, FloatingWhatsApp } from './components'
import s from './layout.module.css'

export const metadata: Metadata = {
  title: 'OC Advogados — Especialistas em Direito Previdenciário',
  description:
    'Escritório de advocacia especializado em Direito Previdenciário, Cível e Trabalhista. Atuamos em todo Brasil com 5 escritórios em SP e atendimento humanizado.',
  keywords:
    'oc advogados, advogado previdenciário, aposentadoria, bpc loas, auxílio doença, revisão aposentadoria, advocacia previdenciária, INSS, direito trabalhista, direito civil',
  openGraph: {
    title: 'OC Advogados — Advocacia Previdenciária, Cível e Trabalhista',
    description:
      'Seus direitos. Nossa especialidade. Escritório com 10+ advogados e 5 unidades em São Paulo. Atendimento em todo Brasil.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'OC Advogados',
  },
  robots: { index: true, follow: true },
}

export default function OcAdvogadosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div data-theme="dark" className={s.ocRoot}>
      <Nav />
      <main id="oc-main" className={s.ocMain}>
        {children}
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  )
}
