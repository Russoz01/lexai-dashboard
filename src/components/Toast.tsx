'use client'

import { useEffect, useState, useCallback } from 'react'
import s from './Toast.module.css'

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

  const bgClass = (kind: ToastKind) =>
    kind === 'error' ? s.itemError
    : kind === 'success' ? s.itemSuccess
    : s.itemInfo

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className={s.container}>
      {items.map(t => (
        <div key={t.id} className={`${s.item} ${bgClass(t.kind)}`}>
          <i className={`bi ${
            t.kind === 'error'
              ? 'bi-exclamation-circle-fill'
              : t.kind === 'success'
                ? 'bi-check-circle-fill'
                : 'bi-info-circle-fill'
          } ${s.icon}`} />
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  )
}
