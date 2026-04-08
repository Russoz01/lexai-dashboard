import { createAgentRoute } from '@/lib/api/create-agent-route'
import { SYSTEM_PROMPT } from '@/prompts/legislacao'
import { LegislacaoInputSchema, LegislacaoOutputSchema } from '@/types/agents'

export const POST = createAgentRoute({
  agente: 'legislacao',
  model: 'haiku',
  maxTokens: 4096,
  systemPrompt: SYSTEM_PROMPT,
  inputSchema: LegislacaoInputSchema,
  outputSchema: LegislacaoOutputSchema,
  responseKey: 'resultado',
  buildUserMessage: ({ consulta }) => `Legal provision to explain:\n\n${consulta}`,
  buildHistorico: ({ consulta }, resultado) => ({
    mensagem_usuario: `Legislacao: ${consulta.slice(0, 100)}`,
    resposta_agente: resultado.dispositivo ?? 'Consulta realizada',
  }),
})
