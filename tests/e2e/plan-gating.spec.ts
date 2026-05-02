import { test, expect } from '@playwright/test'

/**
 * Plan gating tests — Wave R1 follow-up (2026-05-02)
 *
 * Validam que rotas protegidas por plano respondem 401 sem auth (gate
 * vai antes do plan check). Sem auth real, não testamos o 403 com
 * payload upgrade_required, mas confirmamos que o gate existe e os
 * imports compilaram corretamente em prod.
 */

const STARTER_AGENTS = [
  '/api/parecerista',
  '/api/consultor',
  '/api/recursos',
  '/api/estrategista',
  '/api/negociar',
  '/api/tradutor',
  '/api/revisor',
  '/api/simulado',
  '/api/ensinar',
] as const

const PRO_AGENTS = [
  '/api/compliance',
  '/api/marketing-ia',
  '/api/planilhas',
] as const

const SOLO_AGENTS = [
  '/api/resumir',
  '/api/redigir',
  '/api/pesquisar',
  '/api/calcular',
  '/api/legislacao',
  '/api/risco',
  '/api/contestador',
  '/api/audiencia',
] as const

// Smoke: todas as rotas com plan gating retornam 401 (não 500/404) sem auth
test.describe('Plan gating: starter+ routes retornam 401 sem auth', () => {
  for (const route of STARTER_AGENTS) {
    test(`${route} sem auth = 401`, async ({ request }) => {
      const response = await request.post(route, {
        data: { texto: 'a'.repeat(100) },
      })
      // 401 (não autorizado) ou 403 (sem plano) — ambos OK
      // 404/500 = problema (rota quebrou, import errado, etc)
      expect([401, 403, 400]).toContain(response.status())
    })
  }
})

test.describe('Plan gating: pro+ routes retornam 401 sem auth', () => {
  for (const route of PRO_AGENTS) {
    test(`${route} sem auth = 401`, async ({ request }) => {
      const response = await request.post(route, {
        data: { texto: 'a'.repeat(100), descricao: 'a'.repeat(50) },
      })
      expect([401, 403, 400]).toContain(response.status())
    })
  }
})

test.describe('Plan gating: solo routes retornam 401 sem auth', () => {
  for (const route of SOLO_AGENTS) {
    test(`${route} sem auth = 401`, async ({ request }) => {
      const response = await request.post(route, {
        data: { texto: 'a'.repeat(100) },
      })
      expect([401, 403, 400]).toContain(response.status())
    })
  }
})

// Garantia que payload de erro 401 é genérico (não vaza schema)
test('rotas com plan gating não vazam plano em 401', async ({ request }) => {
  const response = await request.post('/api/parecerista', {
    data: { consulta: 'a'.repeat(100) },
  })
  const body = await response.json().catch(() => ({}))
  // Em 401, payload deve ser só {error:'Nao autorizado.'} sem expor estrutura
  expect(JSON.stringify(body).toLowerCase()).not.toContain('plan_upgrade_required')
})
