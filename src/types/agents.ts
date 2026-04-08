// Zod schemas for every agent.
//
// Input schemas are strict: they validate POST bodies and surface the
// route-specific error messages the old hand-written routes used
// ("Texto muito curto...", "Template invalido.", etc.) through the
// createAgentRoute HOF so clients see the same 400 strings as before.
//
// Output schemas power the Anthropic Tool Use input_schema (via
// zod-to-json-schema) so the model's response is guaranteed to be a
// well-formed tool call matching these types. Design notes:
// - Fields mirror each prompt's "Return this JSON" section verbatim.
// - Every output field is optional so a slightly abbreviated response never
//   makes the whole request 500. The HOF validates with .safeParse and logs
//   mismatches but always passes the raw tool input through.
// - These schemas are permissive on purpose. They are a safety net, not a
//   contract enforcement mechanism — Tool Use already guarantees the shape
//   at the protocol level.
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Shared input constraints — match the legacy validation in each route.
// ---------------------------------------------------------------------------
const MAX_INPUT_CHARS = 50_000
const MAX_INPUT_MSG = 'Texto excede o limite maximo de 50.000 caracteres.'

// ---------------------------------------------------------------------------
// resumidor — input
// ---------------------------------------------------------------------------
export const ResumidorInputSchema = z.object({
  texto: z
    .string()
    .trim()
    .min(50, 'Texto muito curto. Forneca pelo menos 50 caracteres.')
    .max(MAX_INPUT_CHARS, MAX_INPUT_MSG),
})
export type ResumidorInput = z.infer<typeof ResumidorInputSchema>

// ---------------------------------------------------------------------------
// pesquisador — input
// ---------------------------------------------------------------------------
export const PesquisadorInputSchema = z.object({
  query: z
    .string()
    .trim()
    .min(3, 'Consulta muito curta.')
    .max(MAX_INPUT_CHARS, MAX_INPUT_MSG),
  tribunal: z.string().optional(),
  area: z.string().optional(),
  periodo: z.string().optional(),
})
export type PesquisadorInput = z.infer<typeof PesquisadorInputSchema>

// ---------------------------------------------------------------------------
// redator — input
// ---------------------------------------------------------------------------
export const REDATOR_TEMPLATES = {
  peticao: 'Peticao Inicial',
  recurso: 'Recurso (Apelacao)',
  contestacao: 'Contestacao',
  parecer: 'Parecer Juridico',
  contrato: 'Contrato',
  notificacao: 'Notificacao Extrajudicial',
} as const
export type RedatorTemplate = keyof typeof REDATOR_TEMPLATES

export const RedatorInputSchema = z.object({
  template: z.enum(['peticao', 'recurso', 'contestacao', 'parecer', 'contrato', 'notificacao'], {
    message: 'Template invalido.',
  }),
  instrucoes: z
    .string()
    .trim()
    .min(20, 'Instrucoes muito curtas.')
    .max(MAX_INPUT_CHARS, MAX_INPUT_MSG),
})
export type RedatorInput = z.infer<typeof RedatorInputSchema>

// ---------------------------------------------------------------------------
// professor — input
// ---------------------------------------------------------------------------
export const ProfessorInputSchema = z.object({
  tema: z
    .string()
    .trim()
    .min(3, 'Informe o tema.')
    .max(MAX_INPUT_CHARS, MAX_INPUT_MSG),
  videoContent: z.string().optional(),
  instituicao: z.string().optional(),
  historico: z.string().optional(),
})
export type ProfessorInput = z.infer<typeof ProfessorInputSchema>

// ---------------------------------------------------------------------------
// calculador — input
// ---------------------------------------------------------------------------
export const CalculadorInputSchema = z.object({
  consulta: z
    .string()
    .trim()
    .min(10, 'Descreva o calculo com mais detalhes.')
    .max(MAX_INPUT_CHARS, MAX_INPUT_MSG),
})
export type CalculadorInput = z.infer<typeof CalculadorInputSchema>

// ---------------------------------------------------------------------------
// legislacao — input
// ---------------------------------------------------------------------------
export const LegislacaoInputSchema = z.object({
  consulta: z
    .string()
    .trim()
    .min(5, 'Informe o dispositivo legal.')
    .max(MAX_INPUT_CHARS, MAX_INPUT_MSG),
})
export type LegislacaoInput = z.infer<typeof LegislacaoInputSchema>

// ---------------------------------------------------------------------------
// negociador — input
// ---------------------------------------------------------------------------
export const NegociadorInputSchema = z.object({
  situacao: z
    .string()
    .trim()
    .min(30, 'Descreva a situacao com mais detalhes (min. 30 caracteres).')
    .max(MAX_INPUT_CHARS, MAX_INPUT_MSG),
})
export type NegociadorInput = z.infer<typeof NegociadorInputSchema>

// ---------------------------------------------------------------------------
// resumidor
// ---------------------------------------------------------------------------
export const ResumidorOutputSchema = z.object({
  classificacao: z
    .object({
      tipo: z.string().optional(),
      data: z.string().optional(),
      jurisdicao: z.string().optional(),
      protocolo: z.string().optional(),
    })
    .optional(),
  partes: z
    .array(
      z.object({
        nome: z.string().optional(),
        qualificacao: z.string().optional(),
        documento: z.string().optional(),
        representacao: z.string().optional(),
      }),
    )
    .optional(),
  objeto: z.string().optional(),
  pontos_chave: z.array(z.string()).optional(),
  obrigacoes: z
    .array(
      z.object({
        parte: z.string().optional(),
        obrigacao: z.string().optional(),
        clausula: z.string().optional(),
        prazo: z.string().optional(),
        penalidade: z.string().optional(),
      }),
    )
    .optional(),
  valores: z
    .array(
      z.object({
        descricao: z.string().optional(),
        valor: z.string().optional(),
        pagamento: z.string().optional(),
        reajuste: z.string().optional(),
        base_legal: z.string().optional(),
      }),
    )
    .optional(),
  prazos: z
    .array(
      z.object({
        evento: z.string().optional(),
        data: z.string().optional(),
        consequencia: z.string().optional(),
        clausula: z.string().optional(),
      }),
    )
    .optional(),
  fundamentacao: z.array(z.string()).optional(),
  riscos: z
    .array(
      z.object({
        descricao: z.string().optional(),
        gravidade: z.string().optional(),
        clausula: z.string().optional(),
        consequencia: z.string().optional(),
        mitigacao: z.string().optional(),
      }),
    )
    .optional(),
  conclusao: z.string().optional(),
  confianca: z
    .object({
      nivel: z.string().optional(),
      nota: z.string().optional(),
    })
    .optional(),
})
export type ResumidorOutput = z.infer<typeof ResumidorOutputSchema>

// ---------------------------------------------------------------------------
// pesquisador
// ---------------------------------------------------------------------------
export const PesquisadorOutputSchema = z.object({
  enquadramento: z.string().optional(),
  legislacao: z
    .array(
      z.object({
        diploma: z.string().optional(),
        dispositivo: z.string().optional(),
        conteudo: z.string().optional(),
        vigencia: z.string().optional(),
        observacoes: z.string().optional(),
      }),
    )
    .optional(),
  doutrina: z
    .array(
      z.object({
        corrente: z.string().optional(),
        tipo: z.string().optional(),
        tese: z.string().optional(),
        autores: z.string().optional(),
        pontos_fortes: z.string().optional(),
        pontos_fracos: z.string().optional(),
      }),
    )
    .optional(),
  jurisprudencia: z
    .array(
      z.object({
        tribunal: z.string().optional(),
        orgao: z.string().optional(),
        tipo_numero: z.string().optional(),
        relator: z.string().optional(),
        data: z.string().optional(),
        tese_firmada: z.string().optional(),
      }),
    )
    .optional(),
  posicionamento_atual: z.string().optional(),
  conclusao: z.string().optional(),
  termos_relacionados: z.array(z.string()).optional(),
  legislacao_aplicavel: z.array(z.string()).optional(),
  confianca: z
    .object({
      nivel: z.string().optional(),
      nota: z.string().optional(),
    })
    .optional(),
})
export type PesquisadorOutput = z.infer<typeof PesquisadorOutputSchema>

// ---------------------------------------------------------------------------
// redator
// ---------------------------------------------------------------------------
export const RedatorOutputSchema = z.object({
  titulo: z.string().optional(),
  documento: z.string().optional(),
  referencias_legais: z.array(z.string()).optional(),
  observacoes: z.array(z.string()).optional(),
  tipo: z.string().optional(),
  confianca: z
    .object({
      nivel: z.string().optional(),
      nota: z.string().optional(),
    })
    .optional(),
})
export type RedatorOutput = z.infer<typeof RedatorOutputSchema>

// ---------------------------------------------------------------------------
// professor
// ---------------------------------------------------------------------------
export const ProfessorOutputSchema = z.object({
  basico: z
    .object({
      titulo: z.string().optional(),
      definicao: z.string().optional(),
      analogia: z.string().optional(),
      origem: z.string().optional(),
      vocabulario: z
        .array(
          z.object({
            termo: z.string().optional(),
            definicao: z.string().optional(),
          }),
        )
        .optional(),
      caso_pratico: z.string().optional(),
    })
    .optional(),
  intermediario: z
    .object({
      titulo: z.string().optional(),
      definicao_tecnica: z.string().optional(),
      legislacao: z.array(z.string()).optional(),
      exemplos: z.array(z.string()).optional(),
      erros_comuns: z.array(z.string()).optional(),
      distincoes: z.array(z.string()).optional(),
      dica_prova: z.string().optional(),
    })
    .optional(),
  avancado: z
    .object({
      titulo: z.string().optional(),
      controversias: z.array(z.string()).optional(),
      jurisprudencia_divergente: z.string().optional(),
      tendencias: z.string().optional(),
      analise_critica: z.string().optional(),
      conexoes: z.string().optional(),
    })
    .optional(),
  questoes: z
    .array(
      z.object({
        enunciado: z.string().optional(),
        alternativas: z
          .object({
            a: z.string().optional(),
            b: z.string().optional(),
            c: z.string().optional(),
            d: z.string().optional(),
            e: z.string().optional(),
          })
          .optional(),
        resposta_correta: z.string().optional(),
        justificativa: z.string().optional(),
        nivel: z.string().optional(),
        estilo_prova: z.string().optional(),
        armadilha: z.string().optional(),
      }),
    )
    .optional(),
  mapa_mental: z.string().optional(),
  plano_estudo: z.string().optional(),
  analise_video: z.string().optional(),
  padrao_provas: z.string().optional(),
  confianca: z
    .object({
      nivel: z.string().optional(),
      nota: z.string().optional(),
    })
    .optional(),
})
export type ProfessorOutput = z.infer<typeof ProfessorOutputSchema>

// ---------------------------------------------------------------------------
// calculador
// ---------------------------------------------------------------------------
export const CalculadorOutputSchema = z.object({
  tipo_calculo: z.string().optional(),
  resultado: z.string().optional(),
  passos: z.array(z.string()).optional(),
  base_legal: z.array(z.string()).optional(),
  observacoes: z.array(z.string()).optional(),
  valores: z
    .object({
      principal: z.string().optional(),
      correcao: z.string().optional(),
      juros: z.string().optional(),
      total: z.string().optional(),
    })
    .optional(),
  confianca: z
    .object({
      nivel: z.string().optional(),
      nota: z.string().optional(),
    })
    .optional(),
})
export type CalculadorOutput = z.infer<typeof CalculadorOutputSchema>

// ---------------------------------------------------------------------------
// legislacao
// ---------------------------------------------------------------------------
export const LegislacaoOutputSchema = z.object({
  dispositivo: z.string().optional(),
  texto_legal: z.string().optional(),
  explicacao: z.string().optional(),
  exemplos_praticos: z.array(z.string()).optional(),
  jurisprudencia: z.array(z.string()).optional(),
  artigos_relacionados: z.array(z.string()).optional(),
  alteracoes_recentes: z.string().optional(),
  observacoes: z.array(z.string()).optional(),
  confianca: z
    .object({
      nivel: z.string().optional(),
      nota: z.string().optional(),
    })
    .optional(),
})
export type LegislacaoOutput = z.infer<typeof LegislacaoOutputSchema>

// ---------------------------------------------------------------------------
// negociador
// ---------------------------------------------------------------------------
export const NegociadorOutputSchema = z.object({
  mapa_conflito: z
    .object({
      parte_a: z
        .object({
          posicao: z.string().optional(),
          interesses: z.string().optional(),
          batna: z.string().optional(),
          resistencia: z.string().optional(),
          poder: z.string().optional(),
        })
        .optional(),
      parte_b: z
        .object({
          posicao: z.string().optional(),
          interesses: z.string().optional(),
          batna: z.string().optional(),
          resistencia: z.string().optional(),
          poder: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  zopa: z.string().optional(),
  cenarios: z
    .array(
      z.object({
        cenario: z.string().optional(),
        probabilidade: z.string().optional(),
        resultado: z.string().optional(),
        custo: z.string().optional(),
        tempo: z.string().optional(),
        risco: z.string().optional(),
      }),
    )
    .optional(),
  estrategia: z
    .object({
      tipo: z.string().optional(),
      abordagem: z.string().optional(),
      mensagens_chave: z.string().optional(),
      concessoes: z.string().optional(),
      linhas_vermelhas: z.string().optional(),
    })
    .optional(),
  proposta_acordo: z.string().optional(),
  riscos_mitigacao: z
    .array(
      z.object({
        risco: z.string().optional(),
        mitigacao: z.string().optional(),
      }),
    )
    .optional(),
  confianca: z
    .object({
      nivel: z.string().optional(),
      nota: z.string().optional(),
    })
    .optional(),
})
export type NegociadorOutput = z.infer<typeof NegociadorOutputSchema>
