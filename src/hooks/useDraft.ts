'use client'

import { useEffect, useRef } from 'react'

/**
 * Auto-save a value to localStorage after a debounce delay.
 * Use this to persist drafts of long-form content (textareas, etc.)
 * so users don't lose work on tab close, refresh, or browser crash.
 *
 * @example
 * const [text, setText] = useState('')
 * useDraft('pralvex-draft-resumidor', text, setText)
 */
export function useDraft<T extends string>(
  key: string,
  value: T,
  setValue: (v: T) => void,
  options: { debounce?: number; minLength?: number } = {}
) {
  const { debounce = 800, minLength = 10 } = options
  const restored = useRef(false)

  // Restore on mount (only once)
  useEffect(() => {
    if (restored.current) return
    restored.current = true
    try {
      const saved = localStorage.getItem(key)
      if (saved && saved.length >= minLength && !value) {
        setValue(saved as T)
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // Save on change (debounced)
  useEffect(() => {
    if (!restored.current) return
    const t = setTimeout(() => {
      try {
        if (value && value.length >= minLength) {
          localStorage.setItem(key, value)
        } else {
          localStorage.removeItem(key)
        }
      } catch { /* ignore */ }
    }, debounce)
    return () => clearTimeout(t)
  }, [key, value, debounce, minLength])
}

/**
 * Manually clear a saved draft (e.g. after successful submission).
 */
export function clearDraft(key: string) {
  try { localStorage.removeItem(key) } catch { /* ignore */ }
}
