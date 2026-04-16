import type { Metadata } from 'next'
import { Inter, Oswald } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DAN Barbearia — Barbearia em Ituverava/SP',
  description:
    'DAN Barbearia em Ituverava/SP. Corte social, degradê, barba e mais. Desde 2019, fazendo o melhor pelo seu visual com técnicas avançadas. Agende pelo WhatsApp.',
  keywords:
    'barbearia, ituverava, corte, barba, degradê, agendamento, dan barbearia, barba e cabelo, barbearia ituverava sp',
  openGraph: {
    title: 'DAN Barbearia — Ituverava/SP',
    description:
      'Desde 2019 fazendo o melhor pelo seu visual. Corte, barba e degradê com técnicas avançadas. Agende agora.',
    type: 'website',
    locale: 'pt_BR',
  },
}

export default function DanBarbeariaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.variable} ${oswald.variable}`}>
      {children}
    </div>
  )
}
