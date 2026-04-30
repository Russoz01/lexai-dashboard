import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/site-url'
import PrivacidadeClient from './PrivacidadeClient'

export const metadata: Metadata = {
  title: 'Politica de Privacidade | Pralvex',
  description:
    'Politica de Privacidade da Pralvex em conformidade com a Lei Geral de Protecao de Dados (LGPD, Lei 13.709/2018). Saiba como coletamos, usamos e protegemos seus dados.',
  alternates: { canonical: `${SITE_URL}/privacidade` },
}

export default function PrivacidadePage() {
  return <PrivacidadeClient />
}
