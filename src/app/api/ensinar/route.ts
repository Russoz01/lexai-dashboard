import { createAgentRoute } from '@/lib/api/create-agent-route'
import { SYSTEM_PROMPT } from '@/prompts/professor'
import { ProfessorInputSchema, ProfessorOutputSchema } from '@/types/agents'

export const POST = createAgentRoute({
  agente: 'professor',
  model: 'sonnet',
  maxTokens: 8192,
  systemPrompt: SYSTEM_PROMPT,
  inputSchema: ProfessorInputSchema,
  outputSchema: ProfessorOutputSchema,
  responseKey: 'aula',
  buildUserMessage: ({ tema, videoContent, instituicao, historico }) => {
    let userMessage = `Topic to teach:\n\n${tema}`
    if (videoContent) userMessage += `\n\nVIDEO TRANSCRIPT/CONTENT to analyze:\n${videoContent}`
    if (instituicao) userMessage += `\n\nINSTITUTION for exam pattern analysis: ${instituicao}`
    if (historico) userMessage += `\n\nSTUDENT HISTORY (previous topics studied): ${historico}`
    return userMessage
  },
  buildHistorico: ({ tema, instituicao }) => ({
    mensagem_usuario: `Ensinar: ${tema}${instituicao ? ` (${instituicao})` : ''}`,
    resposta_agente: `Aula sobre ${tema}`,
  }),
})
