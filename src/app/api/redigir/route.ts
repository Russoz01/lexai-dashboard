import { createAgentRoute } from '@/lib/api/create-agent-route'
import { SYSTEM_PROMPT } from '@/prompts/redator'
import { RedatorInputSchema, RedatorOutputSchema, REDATOR_TEMPLATES } from '@/types/agents'

export const POST = createAgentRoute({
  agente: 'redator',
  model: 'sonnet',
  maxTokens: 8192,
  systemPrompt: SYSTEM_PROMPT,
  inputSchema: RedatorInputSchema,
  outputSchema: RedatorOutputSchema,
  responseKey: 'peca',
  buildUserMessage: ({ template, instrucoes }) =>
    `Type of document: ${REDATOR_TEMPLATES[template]}\n\nFacts of the case:\n${instrucoes}`,
  buildHistorico: ({ template }, peca) => ({
    mensagem_usuario: `Redigir: ${REDATOR_TEMPLATES[template]}`,
    resposta_agente: peca.titulo ?? REDATOR_TEMPLATES[template],
  }),
})
