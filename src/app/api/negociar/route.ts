import { createAgentRoute } from '@/lib/api/create-agent-route'
import { SYSTEM_PROMPT } from '@/prompts/negociador'
import { NegociadorInputSchema, NegociadorOutputSchema } from '@/types/agents'

export const POST = createAgentRoute({
  agente: 'negociador',
  model: 'sonnet',
  maxTokens: 8192,
  systemPrompt: SYSTEM_PROMPT,
  inputSchema: NegociadorInputSchema,
  outputSchema: NegociadorOutputSchema,
  responseKey: 'resultado',
  buildUserMessage: ({ situacao }) => `Situation to analyze:\n\n${situacao}`,
  buildHistorico: ({ situacao }, resultado) => ({
    mensagem_usuario: `Negociacao: ${situacao.slice(0, 100)}`,
    resposta_agente: resultado.estrategia?.tipo ?? 'Analise realizada',
  }),
})
