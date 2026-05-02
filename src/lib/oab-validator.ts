/* ════════════════════════════════════════════════════════════════════
 * oab-validator · v1.0 (2026-05-02)
 * ────────────────────────────────────────────────────────────────────
 * Validador server-side de output do agente marketing-ia contra
 * Provimento 205/2021 OAB (publicidade jurídica).
 *
 * Enforcement: o system prompt JÁ instrui o LLM a respeitar as regras,
 * mas LLM ocasionalmente gera output violador. Este validador é a
 * última linha de defesa antes do output sair pra UI do advogado.
 *
 * Resposta: se violar, retorna { ok: false, violations, sanitized }.
 * Sanitization é best-effort — mantém o resto do conteúdo, mascara
 * trechos com [VIOLAÇÃO PROVIMENTO 205 — TRECHO REMOVIDO].
 *
 * Audit Wave R1 fix SEC-12 — antes só UI marketing tinha lex-provimento
 * declarativo, sem validação real do output IA.
 * ═══════════════════════════════════════════════════════════════════ */

export interface OabViolation {
  rule: string
  severity: 'high' | 'medium' | 'low'
  trecho: string
  motivo: string
}

export interface OabValidationResult {
  ok: boolean
  violations: OabViolation[]
  sanitized: string
}

// Padrões proibidos por Provimento 205/2021. Cada um é regex case-insensitive
// + word-boundary safe. Severity high = bloqueia output, medium = warn + sanitize.
const PROHIBITED_PATTERNS: Array<{
  rule: string
  severity: 'high' | 'medium' | 'low'
  motivo: string
  regex: RegExp
}> = [
  // === Garantia de resultado (HIGH) ===
  {
    rule: 'garantia_resultado',
    severity: 'high',
    motivo: 'Provimento 205 Art. 4°, I — vedado garantir resultado',
    regex: /\b(garantimos|garantia\s+de\s+(?:vit[óo]ria|sucesso|resultado|ganho|reembolso\s+do\s+caso)|100%\s+de\s+chance|sucesso\s+garantido|certeza\s+(?:de\s+vit[óo]ria|de\s+ganhar))\b/gi,
  },
  {
    rule: 'promessa_resultado',
    severity: 'high',
    motivo: 'Provimento 205 Art. 4°, I — vedado prometer resultado',
    regex: /\b(prometemos\s+(?:vit[óo]ria|sucesso|ganhar|recuperar))\b/gi,
  },
  // === Mercantilização (HIGH) ===
  {
    rule: 'desconto_promocao',
    severity: 'high',
    motivo: 'Provimento 205 Art. 4°, II — vedada mercantilização',
    regex: /\b(promo[çc][ãa]o|black\s*friday|cupom\s+de\s+desconto|combo\s+jur[íi]dico|liquida[çc][ãa]o|frete\s+gr[áa]tis|leve\s+\d+\s+pague)\b/gi,
  },
  {
    rule: 'consulta_gratis_publica',
    severity: 'medium',
    motivo: 'Provimento 205 Art. 4°, II — captação indevida via gratuidade pública',
    regex: /\b(primeira\s+consulta\s+gr[áa]tis|atendimento\s+(?:gratuito|gr[áa]tis)\s+(?:pra\s+todos|aberto))\b/gi,
  },
  {
    rule: 'sorteio_brinde',
    severity: 'high',
    motivo: 'Provimento 205 Art. 4°, II — sorteios/brindes proibidos',
    regex: /\b(sorteio|brinde|premia[çc][ãa]o|concorra\s+(?:a|ao))\b/gi,
  },
  // === Captação indevida (HIGH) ===
  {
    rule: 'captacao_vulneravel',
    severity: 'high',
    motivo: 'Provimento 205 Art. 5° — captação de pessoa em vulnerabilidade',
    regex: /\b(visitamos\s+(?:hospital|UPA|delegacia)|abordagem\s+em\s+(?:hospital|vel[óo]rio|funeral))\b/gi,
  },
  // === Honorários públicos (HIGH) ===
  {
    rule: 'valores_honorarios_publicos',
    severity: 'medium',
    motivo: 'Provimento 205 Art. 4°, IV — valores de honorários em post público',
    regex: /\b(R\$\s*\d+(?:[.,]\d+)?\s*(?:por\s+(?:hora|consulta|caso)|fixo))\b/gi,
  },
  // === Sensacionalismo (MEDIUM) ===
  {
    rule: 'sensacionalismo',
    severity: 'medium',
    motivo: 'Provimento 205 Art. 4°, V — vedado sensacionalismo',
    regex: /\b(escândalo|chocante|inacreditável|você\s+não\s+vai\s+acreditar|veja\s+o\s+que\s+aconteceu)\b/gi,
  },
  // === Comparação com colegas (HIGH) ===
  {
    rule: 'comparacao_advogados',
    severity: 'high',
    motivo: 'Provimento 205 Art. 4°, VI — comparação com outros advogados',
    regex: /\b(melhor\s+(?:advogad[oa]|escrit[óo]rio)\s+(?:da\s+cidade|do\s+brasil|de\s+SP|do\s+RJ)|n[ºo°]\s*1\s+em\s+\w+|#1\s+em\s+\w+)\b/gi,
  },
  // === Depoimentos clientes (HIGH) ===
  {
    rule: 'depoimentos_clientes',
    severity: 'medium',
    motivo: 'Provimento 205 Art. 4°, III — depoimento/testemunho de cliente',
    regex: /\b(depoimento\s+do\s+cliente|cliente\s+(?:fulano|nome\s+real)\s+(?:disse|relatou|comentou))\b/gi,
  },
]

/**
 * Valida texto contra padrões proibidos pelo Provimento 205/2021.
 * Retorna lista de violações + texto sanitizado (com trechos high removidos).
 */
export function validateOabContent(text: string): OabValidationResult {
  if (!text || typeof text !== 'string') {
    return { ok: true, violations: [], sanitized: text || '' }
  }

  const violations: OabViolation[] = []
  let sanitized = text

  for (const pattern of PROHIBITED_PATTERNS) {
    const matches = Array.from(text.matchAll(pattern.regex))
    for (const match of matches) {
      violations.push({
        rule: pattern.rule,
        severity: pattern.severity,
        trecho: match[0],
        motivo: pattern.motivo,
      })
      // Sanitize só severity high — medium fica como flag pra revisão humana
      if (pattern.severity === 'high') {
        sanitized = sanitized.replace(
          match[0],
          '[VIOLAÇÃO PROVIMENTO 205 — TRECHO REMOVIDO]',
        )
      }
    }
  }

  return {
    ok: violations.filter(v => v.severity === 'high').length === 0,
    violations,
    sanitized,
  }
}

/**
 * Valida output JSON do marketing-ia agente (estrutura {conteudo:{variacoes:[...]}})
 * Aplica validateOabContent em cada variacao.corpo + cta.
 * Retorna versão sanitizada + lista consolidada de violações.
 */
export function validateMarketingOutput(
  output: unknown,
): { ok: boolean; violations: OabViolation[]; sanitized: unknown } {
  if (!output || typeof output !== 'object') {
    return { ok: true, violations: [], sanitized: output }
  }

  const violations: OabViolation[] = []
  // Faz deep clone via JSON pra manipular sem mutar original
  const sanitized = JSON.parse(JSON.stringify(output)) as Record<string, unknown>

  // Recurse em strings dentro do objeto (variacoes[].corpo, .titulo, .cta etc)
  function walk(obj: unknown, path: string[] = []): void {
    if (typeof obj === 'string') {
      const result = validateOabContent(obj)
      violations.push(...result.violations.map(v => ({ ...v, motivo: `${v.motivo} [path: ${path.join('.')}]` })))
      return
    }
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => walk(item, [...path, String(i)]))
      return
    }
    if (obj && typeof obj === 'object') {
      for (const [key, val] of Object.entries(obj)) {
        if (typeof val === 'string') {
          const result = validateOabContent(val)
          if (result.violations.length > 0) {
            violations.push(...result.violations.map(v => ({ ...v, motivo: `${v.motivo} [path: ${path.concat(key).join('.')}]` })))
            // Substitui valor sanitizado in-place
            ;(obj as Record<string, unknown>)[key] = result.sanitized
          }
        } else {
          walk(val, [...path, key])
        }
      }
    }
  }

  walk(sanitized)

  return {
    ok: violations.filter(v => v.severity === 'high').length === 0,
    violations,
    sanitized,
  }
}
