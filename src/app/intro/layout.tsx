import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Apresentando — Pralvex',
  description:
    '33 agentes IA juridicos. Um compromisso: nunca inventar. Pralvex, atelier de inteligencia juridica.',
  robots: { index: false, follow: true },
}

export default function IntroLayout({ children }: { children: React.ReactNode }) {
  return <div data-intro-shell>{children}</div>
}
