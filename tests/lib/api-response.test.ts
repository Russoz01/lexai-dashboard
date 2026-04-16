import { describe, it, expect, vi } from 'vitest'

// Mock next/server before importing the module under test
vi.mock('next/server', () => ({
  NextResponse: {
    json: <T>(body: T, init?: ResponseInit) => ({
      body,
      status: init?.status ?? 200,
    }),
  },
}))

// Mock @sentry/nextjs to avoid real Sentry calls
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}))

import { ok, fail, unauthorized, forbidden, notFound, rateLimited, serverError } from '@/lib/api-response'

describe('API response helpers', () => {
  describe('ok()', () => {
    it('returns { ok: true, data } with status 200', () => {
      const result = ok({ items: [1, 2, 3] }) as any
      expect(result.body).toEqual({ ok: true, data: { items: [1, 2, 3] } })
      expect(result.status).toBe(200)
    })

    it('forwards custom ResponseInit', () => {
      const result = ok('hello', { status: 201 }) as any
      expect(result.body).toEqual({ ok: true, data: 'hello' })
      expect(result.status).toBe(201)
    })
  })

  describe('fail()', () => {
    it('returns { ok: false, error } with given status', () => {
      const result = fail('Deu ruim', 422) as any
      expect(result.body).toEqual({ ok: false, error: 'Deu ruim' })
      expect(result.status).toBe(422)
    })

    it('defaults to status 400', () => {
      const result = fail('Erro generico') as any
      expect(result.status).toBe(400)
    })

    it('includes optional code field', () => {
      const result = fail('Erro', 400, 'validation_error') as any
      expect(result.body).toEqual({ ok: false, error: 'Erro', code: 'validation_error' })
    })

    it('omits code when not provided', () => {
      const result = fail('Erro') as any
      expect(result.body).not.toHaveProperty('code')
    })
  })

  describe('unauthorized()', () => {
    it('returns 401 with default message', () => {
      const result = unauthorized() as any
      expect(result.status).toBe(401)
      expect(result.body.ok).toBe(false)
      expect(result.body.code).toBe('unauthorized')
    })

    it('accepts a custom message', () => {
      const result = unauthorized('Token expirado') as any
      expect(result.body.error).toBe('Token expirado')
    })
  })

  describe('forbidden()', () => {
    it('returns 403', () => {
      const result = forbidden() as any
      expect(result.status).toBe(403)
      expect(result.body.code).toBe('forbidden')
    })
  })

  describe('notFound()', () => {
    it('returns 404', () => {
      const result = notFound() as any
      expect(result.status).toBe(404)
      expect(result.body.code).toBe('not_found')
    })
  })

  describe('rateLimited()', () => {
    it('returns 429', () => {
      const result = rateLimited() as any
      expect(result.status).toBe(429)
      expect(result.body.code).toBe('rate_limited')
    })
  })

  describe('serverError()', () => {
    it('returns 500 for a generic Error', () => {
      const result = serverError('test-route', new Error('kaboom')) as any
      expect(result.status).toBe(500)
      expect(result.body.ok).toBe(false)
      expect(result.body.code).toBe('internal_error')
    })

    it('returns 503 when error mentions 401 / invalid_api_key', () => {
      const result = serverError('chat', new Error('401 Unauthorized')) as any
      expect(result.status).toBe(503)
      expect(result.body.code).toBe('ai_auth_failed')
    })

    it('returns 429 when error mentions rate_limit', () => {
      const result = serverError('chat', new Error('rate_limit_exceeded')) as any
      expect(result.status).toBe(429)
      expect(result.body.code).toBe('ai_rate_limit')
    })

    it('returns 504 when error mentions timeout', () => {
      const result = serverError('chat', new Error('ETIMEDOUT')) as any
      expect(result.status).toBe(504)
      expect(result.body.code).toBe('ai_timeout')
    })

    it('returns 503 when error mentions overloaded', () => {
      const result = serverError('chat', new Error('overloaded_error')) as any
      expect(result.status).toBe(503)
      expect(result.body.code).toBe('ai_overloaded')
    })

    it('handles non-Error values gracefully', () => {
      const result = serverError('test', 'string error') as any
      expect(result.status).toBe(500)
      expect(result.body.ok).toBe(false)
    })
  })
})
