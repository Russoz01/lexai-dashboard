'use client'

import {
  FolderKanban,
  Users,
  Clock,
  Tags,
  Timer,
  SearchCheck,
} from 'lucide-react'
import { AgentPreviewStage } from '@/components/ui/agent-preview-stage'

/* /dashboard/casos — v1 preview stage · 2026-04-23
 * Núcleo operacional do escritório. CRM-lite jurídico: cliente → processo
 * → timeline → tags → documentos. Transforma Pralvex de ferramenta pontual
 * em base de dados viva do escritório. */

export default function CasosPage() {
  return (
    <AgentPreviewStage
      Icon={FolderKanban}
      kicker="Nº 023 · Módulo Casos"
      name="Casos"
      tagline="Cada cliente vira um dossiê. Cada peça, cada prazo, cada andamento — dentro de uma pasta só."
      description="Hoje o histórico da Pralvex é linear — você conversa com os agentes, mas não consegue organizar o que é do cliente X versus cliente Y. Casos resolve isso: cliente → processos CNJ → fase atual → tags → valor da causa. Toda interação dos agentes pode ser anexada a um caso e recuperada com 'me mostra tudo do cliente João'."
      statusLabel="Beta fechado · Release 2026-05"
      planBadge="Pro"
      capabilities={[
        {
          Icon: Users,
          title: 'Cliente como raiz',
          body: 'Cada cliente tem processos, documentos, histórico de chat e timeline. Busca global: "tudo do João Silva nos últimos 30 dias".',
          featured: true,
        },
        {
          Icon: Clock,
          title: 'Timeline por caso',
          body: 'Ordem cronológica de tudo: ingresso da peça, despacho, audiência, acordo. Filtra por tipo de evento.',
        },
        {
          Icon: Tags,
          title: 'Tags livres + fase',
          body: 'Classificação por área (trabalhista, cível), fase (inicial, instrução, recurso), status (ativo, acordo, arquivado).',
        },
        {
          Icon: Timer,
          title: 'Relógio por caso',
          body: 'Time tracking integrado. Cobrança por hora sai direto do histórico. Relatório mensal exportável.',
        },
        {
          Icon: SearchCheck,
          title: 'Busca semântica',
          body: 'Encontra "aquele contrato que tinha cláusula 23b" mesmo que você não lembre o número do processo.',
        },
        {
          Icon: FolderKanban,
          title: 'Dossiê exportável',
          body: 'Exporta o caso inteiro em PDF único — pronto pra audiência, pro sócio revisar, ou pro arquivo morto.',
        },
      ]}
      example={{
        prompt:
          'Abre uma pasta pro cliente Marina Dias · processo 0001234-56.2026.8.13.0702 · tag trabalhista, fase instrução · valor da causa 48 mil · próxima audiência 12 de maio.',
        outputLabel: 'Caso criado',
        response: `Pasta #0142 criada · Marina Dias
────────────────────────────────────
Processo   0001234-56.2026.8.13.0702
Vara       2ª Vara do Trabalho · Uberaba/MG
Valor      R$ 48.000,00
Tag        #trabalhista  #instrucao
Status     ativo

Próxima audiência: 2026-05-12 às 14h
Alerta criado 3d antes (2026-05-09).

3 documentos anexados desde chat:
  · petição inicial (2026-03-12)
  · contestação (2026-04-02)
  · réplica draft v2 (ontem)

Timeline disponível em /dashboard/casos/142`,
      }}
    />
  )
}
