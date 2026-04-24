'use client'

import {
  GitCompare,
  FileDiff,
  Eye,
  MessageCircleQuestion,
  Download,
  Clock4,
  Clock,
  ShieldCheck,
  Gauge,
} from 'lucide-react'
import { AgentPreviewStage } from '@/components/ui/agent-preview-stage'
import { AgentHero } from '@/components/AgentHero'

/* /dashboard/comparador — v1 preview stage · 2026-04-23
 * Diff visual entre 2 versões de contrato/peça + explicação IA do que
 * mudou. Export em PDF pra cliente revisar. Feature corporativa que
 * escritórios médios pagariam caro. */

export default function ComparadorPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <AgentHero
        edition="Nº IX"
        Icon={GitCompare}
        name="Comparador"
        discipline="Diff jurídico explicado"
        description="Duas versões do mesmo contrato, peça ou minuta, lado a lado. Adições, remoções e mudanças significativas destacadas com análise jurídica por cláusula. Exporta PDF colorido para cliente revisar."
        accent="rose"
        meta={[
          { Icon: Clock, label: 'Tempo médio', value: '~35s' },
          { Icon: Gauge, label: 'Cobertura', value: 'Cláusula a cláusula' },
          { Icon: ShieldCheck, label: 'Compliance', value: 'DOCX · PDF · TXT' },
        ]}
        steps={[
          { n: 'I', title: 'Cole v1 e v2', desc: 'As duas versões do documento em qualquer formato comum.' },
          { n: 'II', title: 'Escolha visualização', desc: 'Inline ou side-by-side, com destaque palavra a palavra.' },
          { n: 'III', title: 'Receba o diff + análise', desc: 'Mudanças agrupadas por cláusula com comentário jurídico e PDF exportável.' },
        ]}
      />
      <AgentPreviewStage
      Icon={GitCompare}
      kicker="Nº 025 · Agente Comparador"
      name="Comparador"
      tagline="Versão 1 de um lado, versão 2 do outro. O que mudou aparece destacado — e explicado."
      description="Cliente mandou contrato revisado e você tem que achar o que foi alterado. Hoje: leitura parágrafo por parágrafo, 40 minutos, atenção que você não tem no fim da tarde. Comparador: cola as duas versões, vê o diff igual GitHub, e ganha uma análise IA do que cada mudança significa juridicamente. Exporta PDF pra cliente revisar."
      statusLabel="Beta fechado · Release 2026-05"
      planBadge="Pro"
      capabilities={[
        {
          Icon: FileDiff,
          title: 'Diff visual palavra-a-palavra',
          body: 'Adições em verde suave, remoções riscadas em champagne. Inline ou side-by-side — sua escolha.',
          featured: true,
        },
        {
          Icon: MessageCircleQuestion,
          title: 'Explicação IA por mudança',
          body: '"Cláusula 12 aumentou multa de 2% pra 10%. Possível agressão ao art. 413 do CC." Resumo em linguagem clara.',
        },
        {
          Icon: Eye,
          title: 'Cláusula-por-cláusula',
          body: 'Se o documento tem cabeçalhos (Cláusula 1, 2, 3…), o agente agrupa mudanças e mostra só o que foi tocado.',
        },
        {
          Icon: Clock4,
          title: 'Histórico de versões',
          body: 'Versões v1, v2, v3 ficam salvas. Você consegue comparar v1 × v3 mesmo 3 meses depois.',
        },
        {
          Icon: Download,
          title: 'Export PDF colorido',
          body: 'PDF formatado com diff + análise lado a lado. Pronto pra mandar pro cliente ou imprimir.',
        },
        {
          Icon: GitCompare,
          title: 'Suporta DOCX, PDF, TXT',
          body: 'Entrada em qualquer formato comum. Detecta automaticamente e normaliza pra comparar.',
        },
      ]}
      example={{
        prompt:
          'Compara essas duas versões do contrato de prestação de serviço com a Construtora Horizonte e me diz o que mudou.',
        outputLabel: 'Diff + análise',
        response: `Comparador · 14 cláusulas · 3 mudanças significativas

CLÁUSULA 5 (Prazo)
  v1: "vigência de 12 (doze) meses"
  v2: "vigência de 24 (vinte e quatro) meses"
  → Dobrou o prazo. Avalie se renovação automática continua fazendo sentido.

CLÁUSULA 12 (Multa rescisória)
  v1: "multa equivalente a 2 (dois) meses de serviço"
  v2: "multa equivalente a 6 (seis) meses de serviço"
  → Multa triplicou. Possível caracterização como cláusula penal
    excessiva (art. 413 do CC) — cabe pedido de redução em juízo
    se houver descumprimento parcial.

CLÁUSULA 18 (Foro)
  v1: "Comarca de Uberaba/MG"
  v2: "Comarca de São Paulo/SP"
  → Foro mudou pra capital paulista. Se seu cliente é de MG,
    aumenta custo operacional de disputa.

11 cláusulas idênticas · 3 alteradas · 0 novas · 0 removidas
PDF comparativo disponível em /dashboard/comparador/r-0042`,
      }}
    />
    </div>
  )
}
