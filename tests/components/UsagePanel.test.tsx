import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

// Mock next/link to render a plain <a>
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, className }: any) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

import { UsagePanel } from '@/components/UsagePanel'

const mockUsage = (overrides: Record<string, unknown> = {}) => ({
  ok: true,
  data: {
    plan: 'escritorio',
    isTrialing: false,
    limit: 200,
    totalUsed: 42,
    remaining: 158,
    percentUsed: 21,
    byAgent: { peticao: 30, contrato: 12 },
    month: '2026-04',
    nextResetAt: '2026-05-01T00:00:00Z',
    ...overrides,
  },
})

function mockFetch(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  })
}

describe('UsagePanel', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    // Pin "now" so daysUntil is deterministic
    vi.setSystemTime(new Date('2026-04-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('shows loading state initially', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {})) as any
    const { container } = render(<UsagePanel />)
    const panel = container.querySelector('.usage-loading')
    expect(panel).toBeInTheDocument()
  })

  it('renders plan name, usage count, and progress bar', async () => {
    global.fetch = mockFetch(mockUsage()) as any
    render(<UsagePanel />)

    await waitFor(() => {
      expect(screen.getByText('Escritorio')).toBeInTheDocument()
    })

    // Usage count: "42" followed by " / 200"
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText(/\/ 200/)).toBeInTheDocument()

    // Progress bar fill should exist
    expect(document.querySelector('.usage-fill')).toBeInTheDocument()
  })

  it('shows "Fazer upgrade" link when usage >= 80%', async () => {
    global.fetch = mockFetch(mockUsage({ percentUsed: 85, totalUsed: 170, remaining: 30 })) as any
    render(<UsagePanel />)

    await waitFor(() => {
      const link = screen.getByText(/Fazer upgrade/)
      expect(link).toBeInTheDocument()
      expect(link.closest('a')).toHaveAttribute('href', '/dashboard/planos')
    })
  })

  it('does NOT show upgrade link when usage is low', async () => {
    global.fetch = mockFetch(mockUsage({ percentUsed: 21 })) as any
    render(<UsagePanel />)

    await waitFor(() => {
      expect(screen.getByText('Escritorio')).toBeInTheDocument()
    })

    expect(screen.queryByText(/Fazer upgrade/)).not.toBeInTheDocument()
  })

  it('renders nothing on fetch error (silent fail)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    }) as any

    const { container } = render(<UsagePanel />)

    await waitFor(() => {
      // After error, loading is done and component returns null
      expect(container.querySelector('.usage-loading')).not.toBeInTheDocument()
    })

    expect(container.querySelector('.usage-panel')).not.toBeInTheDocument()
  })

  it('shows trial tag when isTrialing is true', async () => {
    global.fetch = mockFetch(mockUsage({ isTrialing: true })) as any
    render(<UsagePanel />)

    await waitFor(() => {
      expect(screen.getByText('trial')).toBeInTheDocument()
    })
  })

  it('shows "ilimitado" for firma/enterprise plans', async () => {
    global.fetch = mockFetch(
      mockUsage({ plan: 'firma', limit: 100000, percentUsed: 0.05, totalUsed: 50 })
    ) as any
    render(<UsagePanel />)

    await waitFor(() => {
      expect(screen.getByText(/ilimitado/)).toBeInTheDocument()
    })
  })
})
