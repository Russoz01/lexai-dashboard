import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

// Temporary diagnostic endpoint to verify ANTHROPIC_API_KEY in prod.
// Returns masked metadata only — never the full key.
// REMOVE AFTER DEBUGGING.
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    return NextResponse.json({ status: 'missing', detail: 'ANTHROPIC_API_KEY env var is not set' })
  }

  const meta = {
    length: key.length,
    prefix: key.slice(0, 10),
    suffix: key.slice(-4),
    hasWhitespace: /\s/.test(key),
    startsWithSkAnt: key.startsWith('sk-ant-'),
  }

  try {
    const client = new Anthropic({ apiKey: key })
    const m = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 20,
      messages: [{ role: 'user', content: 'Say "pong" and nothing else.' }],
    })
    const textBlock = m.content.find(
      (b): b is Anthropic.Messages.TextBlock => b.type === 'text',
    )
    return NextResponse.json({
      status: 'ok',
      meta,
      model: m.model,
      stopReason: m.stop_reason,
      text: textBlock?.text ?? null,
    })
  } catch (e: unknown) {
    const err = e as { name?: string; message?: string; status?: number; error?: unknown }
    return NextResponse.json({
      status: 'error',
      meta,
      errorName: err.name ?? null,
      errorMessage: err.message ?? String(e),
      httpStatus: err.status ?? null,
      errorBody: err.error ?? null,
    })
  }
}
