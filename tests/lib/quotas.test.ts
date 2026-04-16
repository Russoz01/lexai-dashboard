import { describe, it, expect } from 'vitest'
import { PLAN_QUOTAS } from '@/lib/quotas'

describe('PLAN_QUOTAS', () => {
  const expectedPlans = ['free', 'starter', 'escritorio', 'pro', 'firma', 'enterprise']

  it('has entries for every expected plan', () => {
    for (const plan of expectedPlans) {
      expect(PLAN_QUOTAS).toHaveProperty(plan)
    }
  })

  it('every quota value is a positive number', () => {
    for (const plan of expectedPlans) {
      const value = PLAN_QUOTAS[plan]
      expect(typeof value).toBe('number')
      expect(value).toBeGreaterThan(0)
    }
  })

  it('follows ascending hierarchy: free < escritorio < firma', () => {
    expect(PLAN_QUOTAS.free).toBeLessThan(PLAN_QUOTAS.escritorio)
    expect(PLAN_QUOTAS.escritorio).toBeLessThanOrEqual(PLAN_QUOTAS.firma)
  })

  it('firma and enterprise are unlimited tier (>= 100000)', () => {
    expect(PLAN_QUOTAS.firma).toBeGreaterThanOrEqual(100_000)
    expect(PLAN_QUOTAS.enterprise).toBeGreaterThanOrEqual(100_000)
  })

  it('legacy slugs match their current equivalents', () => {
    expect(PLAN_QUOTAS.starter).toBe(PLAN_QUOTAS.escritorio)
    expect(PLAN_QUOTAS.pro).toBe(PLAN_QUOTAS.firma)
  })
})
