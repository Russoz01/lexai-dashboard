'use client'

import { useEffect, useState, useCallback } from 'react'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import s from './Toast.module.css'

type ToastKind = 'success' | 'error' | 'info'
interface ToastMsg { id: number; kind: ToastKind; text: string }

let push: ((kind: ToastKind, text: string) => void) | null = null

export function toast(kind: ToastKind, text: string) {
  if (push) push(kind, text)
  // Fallback before provider mounts — no-op is safe
}

const ICONS = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
} as const

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
      {items.map(t => {
        const Icon = ICONS[t.kind]
        return (
          <div key={t.id} className={`${s.item} ${bgClass(t.kind)}`}>
            <Icon size={16} strokeWidth={2} className={s.icon} aria-hidden />
            <span>{t.text}</span>
          </div>
        )
      })}
    </div>
  )
}
