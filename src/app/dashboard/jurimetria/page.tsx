'use client'

import {
  BarChart3,
  LineChart,
  PieChart,
  Trophy,
  MapPinned,
  Scale,
  Clock,
  ShieldCheck,
  Gauge,
} from 'lucide-react'
import { AgentPreviewStage } from '@/components/ui/agent-preview-stage'
import { AgentHero } from '@/components/AgentHero'

/* /dashboard/jurimetria — v1 preview stage · 2026-04-23
 * Métricas processuais + benchmarks. O que tribunal X decide em ações
 * Y? Quanto demora? Qual valor médio de condenação? Diferencial real
 * pra quem tem dados. */

export default function JurimetriaPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <AgentHero
        edition="Nº XII"
        Icon={BarChart3}
        name="Jurimetria"
        discipline="Dados reais de decisões"
        description="Métricas processuais e benchmarks por tribunal, vara, relator e tipo de ação. Tempo médio, taxa de procedência, valor mediano de condenação e precedentes aplicáveis. Dados para fundamentar expectativa de cliente, honorário de êxito e estratégia."
        accent="pearl"
        meta={[
          { Icon: Clock, label: 'Amostra', value: 'Milhares de decisões' },
          { Icon: Gauge, label: 'Granularidade', value: 'Vara · relator · causa' },
          { Icon: ShieldCheck, label: 'Compliance', value: 'Decisões públicas' },
        ]}
        steps={[
          { n: 'I', title: 'Descreva a ação', desc: 'Tipo de causa, comarca, valor pretendido e recorte temporal.' },
          { n: 'II', title: 'Escolha o corte', desc: 'Por tribunal, vara, relator ou benchmark comparativo.' },
          { n: 'III', title: 'Receba o dashboard', desc: 'Procedência, valores, tempo processual e recomendação estratégica em PDF.' },
        ]}
      />
      <AgentPreviewStage
      Icon={BarChart3}
      kicker="Nº 029 · Módulo Jurimetria"
      name="Jurimetria"
      tagline="Qual é a média do valor de condenação em dano moral por negativação indevida no TJ-MG? O agente responde com gráfico."
      description="Escritório grande tem departamento de BI. Escritório médio opera no achismo — 'acho que esse juiz é rigoroso', 'acho que ação assim demora 18 meses'. Jurimetria corrige isso: cruza milhares de decisões públicas e devolve estatística real por vara, por relator, por tipo de ação, por valor. Dados pra fundamentar expectativa de cliente, honorário de êxito e estratégia processual."
      statusLabel="Beta fechado · Release 2026-06"
      planBadge="Pro"
      glowTint="#b8946d"
      capabilities={[
        {
          Icon: LineChart,
          title: 'Tempo médio por fase',
          body: 'Distribuição até citação: mediana 23d. Contestação: 45d. Sentença: 8-14 meses. Por comarca.',
          featured: true,
        },
        {
          Icon: PieChart,
          title: 'Taxa de procedência',
          body: '% de ações julgadas procedentes/improcedentes/extintas. Filtrável por tribunal, vara, tipo.',
        },
        {
          Icon: Trophy,
          title: 'Valor médio de condenação',
          body: 'Mediana + quartis de condenação em dano moral, rescisão, honorários. Segmentado por causa.',
        },
        {
          Icon: MapPinned,
          title: 'Benchmark por comarca',
          body: 'Juiz A é mais ou menos rigoroso que média do tribunal? Relator X nega liminar em que %?',
        },
        {
          Icon: Scale,
          title: 'Precedentes vinculantes',
          body: 'Súmulas, repetitivos e IRDRs aplicáveis ao seu caso, com índice de citação real.',
        },
        {
          Icon: BarChart3,
          title: 'Export pra cliente/edital',
          body: 'Dashboard exportável PDF. "Expectativa de ganho em ação similar: 63% · R$ 8-15k mediana".',
        },
      ]}
      example={{
        prompt:
          'Jurimetria de ação de dano moral por negativação indevida em SPC/Serasa no TJ-MG, comarca Uberaba.',
        outputLabel: 'Jurimetria · amostra 847 processos',
        response: `Ação: dano moral · negativação indevida · TJ-MG/Uberaba
Amostra: 847 processos decididos entre 2022-2025
─────────────────────────────────────────────────────

Procedência
  Procedente             64.3%   (545 casos)
  Procedente em parte    21.1%   (179 casos)
  Improcedente           12.6%   (107 casos)
  Extinta sem mérito      2.0%   ( 16 casos)

Valor de condenação (quando procedente)
  Mediana     R$  6.800
  Q1          R$  3.500
  Q3          R$ 12.000
  Máximo      R$ 45.000

Tempo processual
  Distribuição → sentença   mediana 7.2 meses
  Sentença → trânsito       mediana 4.8 meses
  Total até pagamento       mediana 1 ano 2 meses

Varas mais rigorosas (condenação menor que mediana)
  2ª Vara Cível · Juiz Marcos Ribeiro   R$ 4.500
  4ª Vara Cível · Juíza Ana Beatriz      R$ 5.200

Recomendação estratégica
  Pedido ideal: R$ 10.000 (entre Q3 e mediana — alto
  o suficiente pra permitir "parcial procedente" sem
  sinalizar litigância exagerada).`,
      }}
    />
    </div>
  )
}
