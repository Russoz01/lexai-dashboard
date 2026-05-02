'use client'

import {
  Sparkles,
  CalendarRange,
  Shield,
  Images,
  TrendingUp,
  Hash,
  Megaphone,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { AgentPreviewStage } from '@/components/ui/agent-preview-stage'
import { AgentHero } from '@/components/AgentHero'

/* /dashboard/marketing — v1 preview stage · 2026-04-23
 * Calendário editorial compliant com Provimento 205/2021 OAB. Agenda
 * conteúdo, sugere ganchos de pauta, valida cada post contra regras
 * do CED. Exclusive ao plano Enterprise. */

export default function MarketingPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <AgentHero
        edition="Nº XIII"
        Icon={Megaphone}
        name="Marketing"
        discipline="Calendário compliant OAB"
        description="Calendário editorial de 30 dias pré-validado contra o Provimento 205/2021 e o Código de Ética. Pautas cruzadas com atualidade jurídica, briefing visual e semáforo de compliance em cada post, com artigo do CED citado."
        accent="gold"
        meta={[
          { Icon: Clock, label: 'Horizonte', value: '30 dias' },
          { Icon: Sparkles, label: 'Formato', value: 'Posts · reels · carrosséis' },
          { Icon: ShieldCheck, label: 'Compliance', value: 'Provimento 205 + CED' },
        ]}
        steps={[
          { n: 'I', title: 'Descreva o escritório', desc: 'Área de atuação, público e tom editorial preferido.' },
          { n: 'II', title: 'Agente gera agenda', desc: 'Pautas com ganchos de atualidade, roteiro e briefing visual por post.' },
          { n: 'III', title: 'Aprovação por semáforo', desc: 'Verde publica, amarelo ajusta, vermelho reescreve — com artigo do CED na justificativa.' },
        ]}
      />
      <AgentPreviewStage
      Icon={Sparkles}
      kicker="Nº 030 · Módulo Marketing"
      name="Marketing"
      tagline="Calendário de 30 dias pré-validado contra o Provimento 205. Você foca em advogar, não em achar assunto."
      description="Marketing jurídico vive num campo minado: qualquer post pode virar representação na OAB se roçar 'captação de cliente' ou 'promessa de resultado'. Marketing aplica o Provimento 205/2021 + Código de Ética em cada post antes de você publicar. Agenda editorial de 30 dias com ganchos de atualidade, roteiros de vídeo, posts pra Instagram/LinkedIn, tudo pré-auditado. Aprovação via semáforo (verde/amarelo/vermelho) com justificativa."
      statusLabel="Beta fechado · Enterprise release 2026-07"
      planBadge="Enterprise"
      glowTint="#d9b584"
      capabilities={[
        {
          Icon: CalendarRange,
          title: 'Calendário 30 dias',
          body: 'Agenda editorial pronta: 20 posts, 5 reels, 3 carrosséis. Pautas cruzadas com efeméride + atualidade jurídica.',
          featured: true,
        },
        {
          Icon: Shield,
          title: 'Validação Provimento 205',
          body: 'Cada post passa por check-list: sem captação, sem resultado prometido, sem mercantilização, sem imagem de cliente.',
        },
        {
          Icon: Hash,
          title: 'Hashtags permitidas',
          body: 'Banco de hashtags já filtrado. Fora "advogadoqueganha", dentro "direitodomorto" quando fizer sentido.',
        },
        {
          Icon: Images,
          title: 'Briefing visual',
          body: 'Pra cada post: paleta, tom, estilo (editorial, manifesto, explicativo). Pronto pra mandar pro designer.',
        },
        {
          Icon: TrendingUp,
          title: 'Ganchos de atualidade',
          body: 'Conecta pauta com julgamento STF semana, nova súmula, mudança legislativa — sem virar opinativo político.',
        },
        {
          Icon: Sparkles,
          title: 'Semáforo de compliance',
          body: '🟢 publica direto · 🟡 revisa item X · 🔴 reescreve. Sempre com artigo do CED citado.',
        },
      ]}
      example={{
        prompt:
          'Me dá a primeira semana do calendário editorial do meu escritório. Foco em direito de família, tom editorial.',
        outputLabel: 'Semana 1 · 2026-04-28 a 05-04',
        response: `Calendário · Pereira Advocacia Família · semana 1/4
─────────────────────────────────────────────────

SEG 28/abr · Instagram carrossel
  Pauta: "Guarda compartilhada não é divisão de filho — é
          divisão de responsabilidade"
  Ângulo: desmistificar equívoco comum · tom editorial sóbrio
  Hashtags: #guardacompartilhada #direitodefamilia
  Compliance: 🟢 verde · informativo puro · sem captação

TER 29/abr · LinkedIn texto curto
  Pauta: STJ e a pensão alimentícia de ex-conjuge no
         julgamento REsp 1.XXX.XXX (publicar dia após)
  Ângulo: análise técnica sem opinião · 3 parágrafos
  Compliance: 🟢 verde · jurisprudência pública

QUA 30/abr · Instagram reels 45s
  Pauta: "3 mitos sobre divórcio que o cinema ensina errado"
  Ângulo: educativo leve · cortes rápidos · B-roll estoque
  Briefing visual: champagne + noir, tipografia serif
  Compliance: 🟡 amarelo · evite linguagem "proteger
              seu patrimônio" (soa captação) · substituir
              por "entender o processo"

QUI 01/mai · folga conteúdo (feriado Dia do Trabalho)
  Story único · meme OAB interno do time · 🟢

SEX 02/mai · Instagram carrossel editorial
  Pauta: "Pensão alimentícia: 7 perguntas que todo mundo
          faz e quase ninguém sabe a resposta"
  Ângulo: FAQ organizado · referência ao art. 1.694 CC
  Compliance: 🟢 verde (seu melhor formato esse mês)

Total semana · 5 posts · 0 vermelho · 1 amarelo (ajustável)
Semana 2 desbloqueia ao publicar 3 desses.`,
      }}
    />
    </div>
  )
}
