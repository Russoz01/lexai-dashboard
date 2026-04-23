import type { Metadata } from 'next'
import TermosClient from './TermosClient'

export const metadata: Metadata = {
  title: 'Termos de Uso | Pralvex',
  description:
    'Termos de Uso da Pralvex. Condicoes de contratacao, uso aceitavel, garantia de reembolso, propriedade intelectual e limitacoes de responsabilidade.',
  alternates: { canonical: 'https://pralvex.com.br/termos' },
}

export default function TermosPage() {
  return <TermosClient />
}
