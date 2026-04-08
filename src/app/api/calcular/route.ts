import { createAgentRoute } from '@/lib/api/create-agent-route'
import { SYSTEM_PROMPT } from '@/prompts/calculador'
import { CalculadorInputSchema, CalculadorOutputSchema } from '@/types/agents'

export const POST = createAgentRoute({
  agente: 'calculador',
  model: 'haiku',
  maxTokens: 4096,
  systemPrompt: SYSTEM_PROMPT,
  inputSchema: CalculadorInputSchema,
  outputSchema: CalculadorOutputSchema,
  responseKey: 'resultado',
  buildUserMessage: ({ consulta }) => `Calculation request:\n\n${consulta}`,
  buildHistorico: ({ consulta }, resultado) => ({
    mensagem_usuario: `Calculo: ${consulta.slice(0, 100)}`,
    resposta_agente: resultado.tipo_calculo ?? 'Calculo realizado',
  }),
})
