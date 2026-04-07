import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import { ThemeProvider } from '@/context/ThemeContext'
import CookieConsent from '@/components/CookieConsent'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://lexai.com.br'),
  title: 'LexAI — Assistente Juridico Inteligente com IA',
  description: 'Plataforma de inteligencia artificial para advogados e estudantes de Direito. 10 agentes IA especializados: analise de documentos, pesquisa jurisprudencial, redacao de pecas, negociacao, calculos juridicos e mais. Powered by LexAI.',
  keywords: 'lexai, assistente juridico, inteligencia artificial, direito, advogado, oab, jurisprudencia, pecas processuais, ia juridica',
  authors: [{ name: 'LexAI' }],
  openGraph: {
    title: 'LexAI — Assistente Juridico Inteligente',
    description: '10 agentes de IA para profissionais do Direito. Analise documentos, pesquise jurisprudencia e gere pecas processuais.',
    type: 'website',
    locale: 'pt_BR',
    url: 'https://lexai.com.br',
    siteName: 'LexAI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LexAI - IA para Direito',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LexAI',
    description: '10 agentes de IA para advogados e estudantes de Direito. Analise documentos, pesquise jurisprudencia e gere pecas processuais.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://lexai.com.br',
  },
  robots: { index: true, follow: true },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'LexAI',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'Plataforma de inteligencia artificial para advogados brasileiros. 10 agentes IA especializados em analise de documentos, pesquisa jurisprudencial, redacao de pecas, calculos juridicos e mais.',
  offers: [
    { '@type': 'Offer', name: 'Starter', price: '59', priceCurrency: 'BRL', billingIncrement: 'P1M' },
    { '@type': 'Offer', name: 'Pro', price: '119', priceCurrency: 'BRL', billingIncrement: 'P1M' },
    { '@type': 'Offer', name: 'Enterprise', price: '239', priceCurrency: 'BRL', billingIncrement: 'P1M' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('lexai-theme');
              if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              document.documentElement.setAttribute('data-theme', t);
            } catch(e) {
              document.documentElement.setAttribute('data-theme', 'dark');
            }
          })();
        `}} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${dmSans.variable} ${playfair.variable}`}>
        <ThemeProvider>{children}</ThemeProvider>
        <CookieConsent />
      </body>
    </html>
  )
}
