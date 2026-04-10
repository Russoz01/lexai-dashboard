import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementQuota } from '@/lib/quotas'
import { events } from '@/lib/analytics'
import { resolveUsuarioIdServer } from '@/lib/api-utils'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

/* ─────────────────────────────────────────────────────────────────────────────
 * LexAI — Chat / Orquestrador
 *
 * Recebe texto livre (opcionalmente com contexto de arquivo anexado) e:
 *   1. Classifica a intencao
 *   2. Se for pergunta generica/explicacao curta → responde direto
 *   3. Se for tarefa especializada → sugere/roteia para o agente certo
 *
 * Retorna sempre JSON com { tipo, mensagem, agente?, acao? } para a UI renderizar.
 * ──────────────────────────────────────────────────────────────────────────── */

type ChatMessage = { role: 'user' | 'assistant'; content: string }

const AGENTES_CATALOGO = {
  resumidor: {
    titulo: 'Resumidor',
    rota: '/dashboard/resumidor',
    quando: 'Analisar documentos juridicos (contratos, peticoes, acordaos). Extrair clausulas, riscos, prazos, partes, obrigacoes e valores.',
  },
  redator: {
    titulo: 'Redator',
    rota: '/dashboard/redator',
    quando: 'Escrever peticoes iniciais, contestacoes, recursos, pareceres, notificacoes e outras pecas processuais estruturadas.',
  },
  pesquisador: {
    titulo: 'Pesquisador',
    rota: '/dashboard/pesquisador',
    quando: 'Buscar jurisprudencia do STF, STJ, TJ-SP e demais tribunais. Encontrar precedentes, sumulas e teses aplicaveis a um caso.',
  },
  negociador: {
    titulo: 'Negociador',
    rota: '/dashboard/negociador',
    quando: 'Montar estrategia de negociacao, BATNA, ZOPA, roteiros de audiencia de conciliacao, tatica de acordo.',
  },
  professor: {
    titulo: 'Professor',
    rota: '/dashboard/professor',
    quando: 'Explicar conceitos juridicos em profundidade, dar aulas, gerar questoes no estilo OAB, concursos e magistratura.',
  },
  calculador: {
    titulo: 'Calculador',
    rota: '/dashboard/calculador',
    quando: 'Calcular prazos processuais, correcao monetaria, juros, multas, custas, indenizacoes trabalhistas.',
  },
  legislacao: {
    titulo: 'Legislacao',
    rota: '/dashboard/legislacao',
    quando: 'Consultar artigos especificos de leis, codigos e estatutos, com explicacao tecnica e jurisprudencia aplicada.',
  },
  rotina: {
    titulo: 'Rotina',
    rota: '/dashboard/rotina',
    quando: 'Organizar agenda, tarefas repetitivas, rotinas do escritorio, checklists e fluxos de trabalho.',
  },
  planilhas: {
    titulo: 'Planilhas',
    rota: '/dashboard/planilhas',
    quando: 'Gerar planilhas juridicas (controle de honorarios, timesheet, controle processual, previsao de receita).',
  },
} as const

type AgenteKey = keyof typeof AGENTES_CATALOGO

function buildSystemPrompt(): string {
  const now = new Date()
  const dataHora = now.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const horaExata = now.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  })

  return `Voce e o Orquestrador LexAI — o ponto de entrada conversacional de um gabinete juridico digital premium.

CONTEXTO TEMPORAL (fornecido pelo servidor — use estes valores exatos):
- Data e hora atual: ${dataHora} (horario de Brasilia)
- Hora atual: ${horaExata}
- Se perguntarem "que horas sao?" ou "qual a data?", responda com estes valores exatos. Nunca invente, estime ou arredonde data/hora.

Seu papel tem duas facetas:
1. CONVERSAR com o advogado como um colega senior — respondendo perguntas rapidas sobre conceitos juridicos, duvidas pontuais, orientacao geral, contexto de direito brasileiro.
2. ROTEAR para o agente especialista certo quando a tarefa exigir uma ferramenta especifica do atelier.

AGENTES DISPONIVEIS (use a tool "rotear_agente" quando for o caso):
${Object.entries(AGENTES_CATALOGO).map(([k, v]) => `- ${k}: ${v.quando}`).join('\n')}

REGRAS DE DECISAO:
- Pergunta rapida/conceitual ("o que e ZOPA?", "qual prazo da contestacao no CPC?") → responda voce mesmo, sem rotear.
- Usuario enviou documento inteiro para analise → rotear para "resumidor".
- Usuario pede para "escrever", "redigir", "minutar" peca → rotear para "redator".
- Usuario busca "jurisprudencia", "precedente", "acordao", "STF", "STJ" → rotear para "pesquisador".
- Usuario pede "calcular prazo", "juros", "correcao monetaria" → rotear para "calculador".
- Quando rotear, explique em uma frase POR QUE aquele agente e o certo.
- Nunca invente jurisprudencia, artigo de lei, numero de processo ou dado factual que voce nao tem certeza.
- Responda SEMPRE em portugues brasileiro.

TOM:
- Colega senior, nao chatbot. Nada de "Ola! Como posso ajudar?". Nada de emojis.
- Direto, caloroso, tecnico. Maximo 4 paragrafos quando responder direto.
- Quando rotear, use no maximo 2 frases + a chamada da tool.

HUMANIZACAO:
- Cite o artigo/lei quando fizer sentido, mas explique por que importa para o caso.
- Se algo for ambiguo, seja transparente: "Para responder com precisao eu precisaria de X".
- Sugira o proximo passo natural quando possivel.`
}

const ROUTING_TOOL = {
  name: 'rotear_agente',
  description: 'Encaminha o usuario para um agente especialista quando a tarefa exige uma ferramenta especifica do atelier LexAI. Use apenas quando o agente especialista for claramente a melhor opcao.',
  input_schema: {
    type: 'object' as const,
    properties: {
      agente: {
        type: 'string' as const,
        enum: Object.keys(AGENTES_CATALOGO),
        description: 'Chave do agente especialista que deve assumir a tarefa.',
      },
      justificativa: {
        type: 'string' as const,
        description: 'Uma frase curta (ate 160 caracteres) explicando POR QUE este agente e o certo para a tarefa do usuario. Em portugues brasileiro.',
      },
      pre_prompt: {
        type: 'string' as const,
        description: 'Texto de contexto que deve ser pre-preenchido no agente especialista. Pode ser uma reformulacao da pergunta do usuario ou o conteudo do documento anexado. Maximo 2000 caracteres.',
      },
    },
    required: ['agente', 'justificativa'],
  },
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    }
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Servico de IA indisponivel.' }, { status: 503 })
    }

    // Rate limit (20 req/min por usuario, padrao da plataforma)
    const { checkRateLimit, rateLimitResponse } = await import('@/lib/rate-limit')
    const rl = await checkRateLimit(supabase, `user:${user.id}:chat`)
    if (!rl.ok) return rateLimitResponse(rl)

    // Quota (chat conta como uso do orquestrador)
    const quota = await checkAndIncrementQuota(supabase, user.id, 'chat')
    if (!quota.ok && quota.response) {
      return quota.response
    }

    const body = await req.json().catch(() => ({}))
    const mensagem: string = typeof body?.mensagem === 'string' ? body.mensagem : ''
    const arquivoTexto: string | undefined = typeof body?.arquivoTexto === 'string' ? body.arquivoTexto : undefined
    const arquivoNome: string | undefined = typeof body?.arquivoNome === 'string' ? body.arquivoNome : undefined
    const historico: ChatMessage[] = Array.isArray(body?.historico) ? body.historico.slice(-8) : []

    if (!mensagem || mensagem.trim().length < 2) {
      if (!arquivoTexto) {
        return NextResponse.json({ error: 'Envie uma mensagem ou anexe um arquivo.' }, { status: 400 })
      }
    }

    // Monta o conteudo da mensagem do usuario (mensagem + arquivo se houver)
    let userContent = mensagem.trim()
    if (arquivoTexto && arquivoTexto.length > 0) {
      // Limite de seguranca — 40k chars pra nao estourar contexto na rota do chat
      const snippet = arquivoTexto.slice(0, 40000)
      userContent = `${userContent || 'Analise o documento a seguir.'}\n\n---\nDocumento anexado${arquivoNome ? ` (${arquivoNome})` : ''}:\n\n${snippet}${arquivoTexto.length > 40000 ? '\n\n[...texto truncado para caber no chat]' : ''}`
    }

    // Monta o array de mensagens incluindo historico
    const messages: Anthropic.MessageParam[] = [
      ...historico.map((m): Anthropic.MessageParam => ({
        role: m.role,
        content: m.content.slice(0, 4000),
      })),
      { role: 'user', content: userContent },
    ]

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1800,
      system: [
        {
          type: 'text' as const,
          text: buildSystemPrompt(),
        },
      ],
      tools: [ROUTING_TOOL],
      messages,
    })

    // Processa resposta — pode ser texto, tool use, ou ambos
    let textoResposta = ''
    let rotear: { agente: AgenteKey; justificativa: string; pre_prompt?: string } | null = null

    for (const block of response.content) {
      if (block.type === 'text') {
        textoResposta += block.text
      } else if (block.type === 'tool_use' && block.name === 'rotear_agente') {
        const input = block.input as { agente?: string; justificativa?: string; pre_prompt?: string }
        if (input.agente && input.agente in AGENTES_CATALOGO) {
          rotear = {
            agente: input.agente as AgenteKey,
            justificativa: input.justificativa || '',
            pre_prompt: input.pre_prompt,
          }
        }
      }
    }

    textoResposta = textoResposta.trim()

    // Payload final pra UI
    const payload = rotear
      ? {
          tipo: 'rotear' as const,
          mensagem: textoResposta || `Esta tarefa e perfeita para o agente ${AGENTES_CATALOGO[rotear.agente].titulo}.`,
          agente: {
            key: rotear.agente,
            titulo: AGENTES_CATALOGO[rotear.agente].titulo,
            rota: AGENTES_CATALOGO[rotear.agente].rota,
            justificativa: rotear.justificativa,
            pre_prompt: rotear.pre_prompt,
          },
        }
      : {
          tipo: 'resposta' as const,
          mensagem: textoResposta || 'Desculpe, nao consegui formular uma resposta. Tente reformular.',
        }

    // Grava historico
    const usuarioId = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
    if (usuarioId) {
      await supabase.from('historico').insert({
        usuario_id: usuarioId,
        agente: 'chat',
        mensagem_usuario: mensagem.slice(0, 500) || `[arquivo ${arquivoNome || 'anexado'}]`,
        resposta_agente: rotear
          ? `→ ${AGENTES_CATALOGO[rotear.agente].titulo}: ${rotear.justificativa}`.slice(0, 500)
          : textoResposta.slice(0, 500),
      })
    }

    events.agentUsed(user.id, 'chat', rotear?.agente || 'direct').catch(() => {})

    return NextResponse.json(payload)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    console.error('[API /chat]', message)
    return NextResponse.json({ error: 'Ocorreu um erro ao processar sua solicitacao. Tente novamente.' }, { status: 500 })
  }
}
