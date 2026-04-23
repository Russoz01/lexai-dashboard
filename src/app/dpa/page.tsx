import type { Metadata } from 'next'
import DpaClient from './DpaClient'

export const metadata: Metadata = {
  title: 'DPA — Data Processing Agreement | Pralvex',
  description:
    'Contrato de Processamento de Dados (DPA) da Pralvex em conformidade com a LGPD (Lei 13.709/18). Obrigacoes de operador/controlador, clausulas-padrao, sub-processadores e medidas de seguranca.',
  alternates: { canonical: 'https://pralvex.com.br/dpa' },
}

export default function DpaPage() {
  return <DpaClient />
}
