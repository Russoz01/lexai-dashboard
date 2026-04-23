import type { Metadata } from 'next'
import DocsClient from './DocsClient'

export const metadata: Metadata = {
  title: 'Documentacao | LexAI',
  description:
    'Documentacao completa da LexAI — guias de uso dos 22 agentes, integracoes, API, boas praticas de prompt e troubleshooting para escritorios de advocacia.',
  alternates: { canonical: 'https://lexai.com.br/docs' },
}

export default function DocsPage() {
  return <DocsClient />
}
