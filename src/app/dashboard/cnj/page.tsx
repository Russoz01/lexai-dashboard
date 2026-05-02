'use client'

import {
  Network,
  RefreshCw,
  Bell,
  Building2,
  FileSearch,
  History,
  Scale,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { AgentPreviewStage } from '@/components/ui/agent-preview-stage'
import { AgentHero } from '@/components/AgentHero'

/* /dashboard/cnj — v1 preview stage · 2026-04-23
 * Integração com DataJud (API pública do CNJ). Consulta andamentos em 20
 * tribunais via um número só de processo. Monitora mudanças, avisa quando
 * tem movimentação nova. Elimina o ritual de abrir 5 abas de tribunal. */

export default function CnjPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <AgentHero
        edition="Nº VIII"
        Icon={Scale}
        name="CNJ"
        discipline="Movimentação em tempo real"
        description="Integração com a API DataJud do CNJ para acompanhar processos em 20 tribunais. Um número só, monitoramento automático e alerta no WhatsApp quando tem despacho novo."
        accent="copper"
        meta={[
          { Icon: Clock, label: 'Atualização', value: 'A cada 6h' },
          { Icon: Network, label: 'Cobertura', value: '20 tribunais' },
          { Icon: ShieldCheck, label: 'Compliance', value: 'API pública CNJ' },
        ]}
        steps={[
          { n: 'I', title: 'Digite o CNJ', desc: 'Número único do processo no padrão 0000000-00.0000.0.00.0000.' },
          { n: 'II', title: 'Consulta automática', desc: 'Agente puxa partes, movimentações e última atualização dos tribunais conectados.' },
          { n: 'III', title: 'Receba alertas', desc: 'Dashboard + WhatsApp avisam quando houver andamento novo.' },
        ]}
      />
      <AgentPreviewStage
      Icon={Network}
      kicker="Nº 024 · Agente CNJ"
      name="CNJ"
      tagline="O tribunal te avisa quando tem andamento novo. Sem refresh, sem alerta perdido no e-mail."
      description="A API pública do CNJ DataJud é gratuita, sem chave, e cobre 20 tribunais. A gente faz o trabalho chato: você digita o número CNJ, o agente puxa partes, movimentações, última atualização, e cruza com o seu Casos. Se o tribunal publica despacho novo, chega alerta no dashboard e no WhatsApp. Zero polling manual."
      statusLabel="Beta aberto · Quota 50/dia"
      planBadge="Pro"
      capabilities={[
        {
          Icon: Network,
          title: 'Um número, 20 tribunais',
          body: 'STF, STJ, TRF1-6, TJ de todos os estados, TST, TRT. Mesmo esquema pra todos.',
          featured: true,
        },
        {
          Icon: RefreshCw,
          title: 'Monitoramento automático',
          body: 'A cada 6h o agente refaz a consulta. Movimentação nova? Notificação push + e-mail.',
        },
        {
          Icon: Bell,
          title: 'Alerta no WhatsApp',
          body: 'Integrado ao número do escritório. "Tribunal publicou decisão em 12h úteis — abra a peça".',
        },
        {
          Icon: Building2,
          title: 'Partes e representantes',
          body: 'Puxa nome das partes, advogados das duas pontas, valor da causa, assunto CNJ.',
        },
        {
          Icon: History,
          title: 'Histórico completo',
          body: 'Todos os andamentos do processo desde o ingresso. Exportável em CSV ou PDF.',
        },
        {
          Icon: FileSearch,
          title: 'Cruzamento com Casos',
          body: 'Se o processo já está no seu Casos, atualização entra direto na timeline do cliente.',
        },
      ]}
      example={{
        prompt:
          'Puxa o andamento do processo 0001234-56.2026.8.13.0702 e me avisa se tiver coisa nova.',
        outputLabel: 'CNJ DataJud · consulta ao vivo',
        response: `Processo 0001234-56.2026.8.13.0702
Tribunal   TJ-MG · 2ª Vara do Trabalho · Uberaba
Distribuído 2026-02-14
Assunto     Verbas rescisórias · vínculo empregatício
Valor       R$ 48.000,00

Partes
  Autor      Marina Dias (CPF oculto)
  Réu        Construtora Horizonte Ltda
  Advs aut.  Renato Pereira (você · OAB/MG 98.234)
  Advs réu   2 advogados

Última movimentação: 2026-04-22 (ontem)
  "Juntada de petição · contestação"

Movimento novo detectado desde 2026-04-21 (seu último check)
→ Timeline atualizada no Caso #0142
→ Notificação enviada: WhatsApp · 14:23`,
      }}
    />
    </div>
  )
}
