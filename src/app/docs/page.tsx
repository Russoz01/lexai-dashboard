import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site-url'
import DocsClient from './DocsClient'

export const metadata: Metadata = {
  title: 'Documentacao | Pralvex',
  description:
    'Documentacao completa da Pralvex — guias de uso dos 27 agentes, integracoes, API, boas praticas de prompt e troubleshooting para escritorios de advocacia.',
  alternates: { canonical: `${SITE_URL}/docs` },
}

export default function DocsPage() {
  return <DocsClient />
}
