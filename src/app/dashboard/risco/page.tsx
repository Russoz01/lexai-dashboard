'use client'

import {
  AlertTriangle,
  Gauge,
  ShieldAlert,
  TrendingUp,
  FileWarning,
  Presentation,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { AgentPreviewStage } from '@/components/ui/agent-preview-stage'
import { AgentHero } from '@/components/AgentHero'

/* /dashboard/risco — v1 preview stage · 2026-04-23
 * Risk Score: 0-100 de risco jurídico em qualquer documento. Com
 * disclaimer, sem marketing de 'precisão 100%'. Produção gráfica pra
 * levar pra reunião com cliente. */

export default function RiscoPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <AgentHero
        edition="Nº X"
        Icon={AlertTriangle}
        name="Risco"
        discipline="Score executivo de contratos"
        description="Análise 0–100 de risco jurídico em documentos contratuais. Top 3 pontos de atenção com peso, probabilidade estimada de sucesso em contencioso e comparação com padrão de mercado. Com disclaimer firme: a IA erra, a decisão é do advogado."
        accent="bronze"
        meta={[
          { Icon: Clock, label: 'Tempo médio', value: '~30s' },
          { Icon: Gauge, label: 'Formato', value: 'Score + gauge + PDF' },
          { Icon: ShieldCheck, label: 'Compliance', value: 'Disclaimer assinado' },
        ]}
        steps={[
          { n: 'I', title: 'Cole o documento', desc: 'Contrato, aditivo ou peça em texto, DOCX ou PDF.' },
          { n: 'II', title: 'Análise ponderada', desc: 'Agente atribui peso explícito a cada ponto e calcula risco global.' },
          { n: 'III', title: 'Slide 1-page', desc: 'Score, top 3 riscos, recomendação e benchmarks em layout pronto para reunião.' },
        ]}
      />
      <AgentPreviewStage
      Icon={AlertTriangle}
      kicker="Nº 026 · Agente Risco"
      name="Risco"
      tagline="Nota 0 a 100 de risco jurídico. Gráfico pronto pra reunião. Zero marketing de 'precisão absoluta'."
      description="Cliente entrega contrato e pergunta 'vale fechar?'. Você precisa de 30 segundos pra formar opinião executiva, não de 2 horas lendo. Risco analisa o documento e devolve score + top 3 pontos de atenção + probabilidade estimada de sucesso em contencioso. Tudo com disclaimer: a IA erra, a decisão é do advogado."
      statusLabel="Beta fechado · Release 2026-05"
      planBadge="Pro"
      glowTint="#d4a574"
      capabilities={[
        {
          Icon: Gauge,
          title: 'Score 0-100 transparente',
          body: 'Cada ponto de risco contribui com peso explícito. Você vê a matemática, não só o número.',
          featured: true,
        },
        {
          Icon: ShieldAlert,
          title: 'Top 3 pontos de atenção',
          body: 'Não é lista de 40 itens genéricos. Top 3 que realmente mudariam sua posição jurídica.',
        },
        {
          Icon: TrendingUp,
          title: 'Probabilidade de sucesso',
          body: 'Estimativa contencioso — baseada em jurisprudência majoritária em casos análogos. Com disclaimer firme.',
        },
        {
          Icon: FileWarning,
          title: 'Comparação com padrão de mercado',
          body: '"Cláusula de multa está 3x acima da média dos contratos B2B comparáveis." Benchmarks reais.',
        },
        {
          Icon: Presentation,
          title: 'Slide 1-page pra cliente',
          body: 'Export visual pronto pra apresentar: score, gauge, top 3, recomendação. PDF ou PNG.',
        },
        {
          Icon: AlertTriangle,
          title: 'Disclaimer assinado',
          body: 'Cada relatório sai com rodapé: "análise assistida por IA · decisão final do advogado responsável".',
        },
      ]}
      example={{
        prompt:
          'Avalia o risco desse contrato de distribuição exclusiva com a Varejista Sul Ltda. Cliente quer fechar amanhã.',
        outputLabel: 'Risco · análise executiva',
        response: `Risk Score · contrato Varejista Sul Ltda
─────────────────────────────────────────
Risco global      72 / 100   ALTO
Sucesso estimado  ~38%       em contencioso

Top 3 pontos de atenção
  1. [Peso 28] Exclusividade sem cláusula de performance.
     Seu cliente fica travado 5 anos mesmo se a Varejista não
     atingir volumes mínimos. Padrão de mercado exige metas.

  2. [Peso 22] Foro em SP + lei do estado indefinida.
     Disputa obriga cliente (de MG) a litigar em capital paulista
     sem custo fixado. Custo operacional estimado 2-4x maior.

  3. [Peso 22] Multa por quebra 20% do contrato total (~R$ 1.2M).
     Jurisprudência do TJ-SP em casos análogos: 60% das vezes o
     juiz reduz pra 10-15% (art. 413 CC). Mas não tem garantia.

Recomendação
  Não assinar sem renegociar itens 1 e 3. Item 2 é menos crítico
  mas vale tentar.

Precisão desta análise: IA alucina. Este relatório não substitui
seu parecer. Disclaimer completo no rodapé do PDF.`,
      }}
    />
    </div>
  )
}
