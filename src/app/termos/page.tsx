import type { Metadata } from 'next'
import TermosClient from './TermosClient'

export const metadata: Metadata = {
  title: 'Termos de Uso | LexAI',
  description:
    'Termos de Uso da LexAI. Condicoes de contratacao, uso aceitavel, garantia de reembolso, propriedade intelectual e limitacoes de responsabilidade.',
  alternates: { canonical: 'https://lexai.com.br/termos' },
}

export default function TermosPage() {
  return <TermosClient />
}
