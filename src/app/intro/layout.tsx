import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Apresentando — Pralvex',
  description:
    'Vinte e sete agentes. Um compromisso: nunca inventar. Pralvex, o sistema operacional da advocacia brasileira.',
  robots: { index: false, follow: true },
}

export default function IntroLayout({ children }: { children: React.ReactNode }) {
  return <div data-intro-shell>{children}</div>
}
