import type { Metadata } from 'next'
import DpaClient from './DpaClient'

export const metadata: Metadata = {
  title: 'DPA — Data Processing Agreement | LexAI',
  description:
    'Contrato de Processamento de Dados (DPA) da LexAI em conformidade com a LGPD (Lei 13.709/18). Obrigacoes de operador/controlador, clausulas-padrao, sub-processadores e medidas de seguranca.',
  alternates: { canonical: 'https://lexai.com.br/dpa' },
}

export default function DpaPage() {
  return <DpaClient />
}
