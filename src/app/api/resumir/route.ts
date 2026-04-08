import { createAgentRoute } from '@/lib/api/create-agent-route'
import { SYSTEM_PROMPT } from '@/prompts/resumidor'
import { ResumidorInputSchema, ResumidorOutputSchema } from '@/types/agents'

// Legacy note: the original route never inserted into `historico`, so we omit
// `buildHistorico` to preserve exact parity. The response stays under the
// `analise` key so the dashboard consumer keeps working unchanged.
export const POST = createAgentRoute({
  agente: 'resumidor',
  model: 'haiku',
  maxTokens: 8192,
  systemPrompt: SYSTEM_PROMPT,
  inputSchema: ResumidorInputSchema,
  outputSchema: ResumidorOutputSchema,
  responseKey: 'analise',
  buildUserMessage: ({ texto }) => `Document to analyze:\n\n${texto}`,
})
