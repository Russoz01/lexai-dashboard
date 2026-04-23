import type { Metadata } from 'next'
import StatusClient from './StatusClient'

export const metadata: Metadata = {
  title: 'Status da plataforma | Pralvex',
  description:
    'Status em tempo real da Pralvex — uptime dos 27 agentes, latencia media, incidentes recentes, janela de manutencao e historico de 90 dias.',
  alternates: { canonical: 'https://pralvex.com.br/status' },
}

export default function StatusPage() {
  return <StatusClient />
}
