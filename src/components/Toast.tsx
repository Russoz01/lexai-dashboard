'use client'

import { useEffect, useState, useCallback } from 'react'

type ToastKind = 'success' | 'error' | 'info'
interface ToastMsg { id: number; kind: ToastKind; text: string }

let push: ((kind: ToastKind, text: string) => void) | null = null

export function toast(kind: ToastKind, text: string) {
  if (push) push(kind, text)
  // Fallback before provider mounts — no-op is safe
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastMsg[]>([])

  const pushInternal = useCallback((kind: ToastKind, text: string) => {
    const id = Date.now() + Math.random()
    setItems(prev => [...prev, { id, kind, text }])
    setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  useEffect(() => {
    push = pushInternal
    return () => { push = null }
  }, [pushInternal])

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360, pointerEvents: 'none',
    }}>
      {items.map(t => (
        <div key={t.id} className="toast-item" style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          padding: '12px 16px', borderRadius: 12,
          background: t.kind === 'error'
            ? 'rgba(239,68,68,0.95)'
            : t.kind === 'success'
              ? 'rgba(16,185,129,0.95)'
              : 'rgba(30,30,30,0.95)',
          color: '#fff',
          boxShadow: '0 8px 32px rgba(0,0,0,0.30)',
          backdropFilter: 'blur(16px)',
          fontSize: 13, fontWeight: 500, lineHeight: 1.4,
          pointerEvents: 'auto',
          animation: 'toast-in 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
          <i className={`bi ${
            t.kind === 'error'
              ? 'bi-exclamation-circle-fill'
              : t.kind === 'success'
                ? 'bi-check-circle-fill'
                : 'bi-info-circle-fill'
          }`} style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }} />
          <span>{t.text}</span>
        </div>
      ))}
      <style jsx>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
