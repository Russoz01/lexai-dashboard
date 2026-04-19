import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Apresentando — LexAI',
  description:
    'Vinte e dois agentes. Um compromisso: nunca inventar. LexAI, o sistema operacional da advocacia brasileira.',
  robots: { index: false, follow: true },
}

export default function IntroLayout({ children }: { children: React.ReactNode }) {
  return <div data-intro-shell>{children}</div>
}
