import { createAgentRoute } from '@/lib/api/create-agent-route'
import { SYSTEM_PROMPT } from '@/prompts/pesquisador'
import { PesquisadorInputSchema, PesquisadorOutputSchema } from '@/types/agents'

export const POST = createAgentRoute({
  agente: 'pesquisador',
  model: 'sonnet',
  maxTokens: 8192,
  systemPrompt: SYSTEM_PROMPT,
  inputSchema: PesquisadorInputSchema,
  outputSchema: PesquisadorOutputSchema,
  responseKey: 'pesquisa',
  buildUserMessage: ({ query, tribunal, area, periodo }) => {
    const filtros = [
      tribunal && tribunal !== 'Todos' ? `Tribunal: ${tribunal}` : null,
      area && area !== 'Todas' ? `Area: ${area}` : null,
      periodo && periodo !== 'Qualquer periodo' ? `Period: ${periodo}` : null,
    ]
      .filter(Boolean)
      .join('\n')
    return `Research topic: ${query}${filtros ? `\n\nFilters:\n${filtros}` : ''}`
  },
  buildHistorico: ({ query }, pesquisa) => ({
    mensagem_usuario: `Pesquisa: ${query}`,
    resposta_agente: pesquisa.enquadramento?.slice(0, 200) ?? 'Pesquisa realizada',
  }),
})
