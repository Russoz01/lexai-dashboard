import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site-url'
import TermosClient from './TermosClient'

export const metadata: Metadata = {
  title: 'Termos de Uso | Pralvex',
  description:
    'Termos de Uso da Pralvex. Condicoes de contratacao, uso aceitavel, garantia de reembolso, propriedade intelectual e limitacoes de responsabilidade.',
  alternates: { canonical: `${SITE_URL}/termos` },
}

export default function TermosPage() {
  return <TermosClient />
}
