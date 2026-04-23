import type { Metadata } from 'next'
import StatusClient from './StatusClient'

export const metadata: Metadata = {
  title: 'Status da plataforma | LexAI',
  description:
    'Status em tempo real da LexAI — uptime dos 22 agentes, latencia media, incidentes recentes, janela de manutencao e historico de 90 dias.',
  alternates: { canonical: 'https://lexai.com.br/status' },
}

export default function StatusPage() {
  return <StatusClient />
}
