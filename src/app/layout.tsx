import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import { ThemeProvider } from '@/context/ThemeContext'
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
  title: 'LexAI — Assistente Juridico Inteligente com IA',
  description: 'Plataforma de inteligencia artificial para advogados e estudantes de Direito. 10 agentes IA especializados: analise de documentos, pesquisa jurisprudencial, redacao de pecas, negociacao, calculos juridicos e mais. Powered by Claude.',
  keywords: 'lexai, assistente juridico, inteligencia artificial, direito, advogado, oab, jurisprudencia, pecas processuais, claude ai',
  authors: [{ name: 'LexAI' }],
  openGraph: {
    title: 'LexAI — Assistente Juridico Inteligente',
    description: '10 agentes de IA para profissionais do Direito. Analise documentos, pesquise jurisprudencia e gere pecas processuais.',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LexAI — Assistente Juridico com IA',
    description: '10 agentes de IA para advogados e estudantes de Direito.',
  },
  robots: { index: true, follow: true },
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
      </head>
      <body className={`${dmSans.variable} ${playfair.variable}`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
