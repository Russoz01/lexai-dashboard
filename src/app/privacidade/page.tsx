import type { Metadata } from 'next'
import PrivacidadeClient from './PrivacidadeClient'

export const metadata: Metadata = {
  title: 'Politica de Privacidade | LexAI',
  description:
    'Politica de Privacidade da LexAI em conformidade com a Lei Geral de Protecao de Dados (LGPD, Lei 13.709/2018). Saiba como coletamos, usamos e protegemos seus dados.',
  alternates: { canonical: 'https://lexai.com.br/privacidade' },
}

export default function PrivacidadePage() {
  return <PrivacidadeClient />
}
