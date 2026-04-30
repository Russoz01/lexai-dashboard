'use client'

/* ════════════════════════════════════════════════════════════════════
 * EditorialDivider — separador entre secoes da landing.
 * Hairline gold com ornamento central (rombus/dot) que respira sutil.
 * Reusavel: <EditorialDivider /> ou <EditorialDivider variant="ornament">.
 * ═══════════════════════════════════════════════════════════════════ */

interface EditorialDividerProps {
  variant?: 'line' | 'ornament' | 'numeral'
  numeral?: string
  className?: string
}

export function EditorialDivider({
  variant = 'ornament',
  numeral,
  className = '',
}: EditorialDividerProps) {
  if (variant === 'line') {
    return (
      <div
        aria-hidden
        className={`relative mx-auto h-px w-full max-w-3xl ${className}`}
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(191,166,142,0.32) 50%, transparent 100%)',
        }}
      />
    )
  }

  return (
    <div
      aria-hidden
      className={`relative mx-auto flex w-full max-w-4xl items-center justify-center gap-4 px-6 py-4 ${className}`}
    >
      {/* hairline esquerda */}
      <span
        className="flex-1 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(191,166,142,0.30) 90%)',
        }}
      />

      {/* ornamento central */}
      {variant === 'numeral' && numeral ? (
        <span
          className="font-mono text-[10px] font-semibold tracking-[0.32em] text-[#bfa68e]/70 uppercase"
          style={{ letterSpacing: '0.32em' }}
        >
          {numeral}
        </span>
      ) : (
        <span className="relative flex items-center gap-2">
          <span className="block size-1 rounded-full bg-[#bfa68e]/50" />
          <span
            className="block size-2 rotate-45"
            style={{
              border: '1px solid rgba(191,166,142,0.55)',
              boxShadow: '0 0 12px rgba(191,166,142,0.18)',
            }}
          />
          <span className="block size-1 rounded-full bg-[#bfa68e]/50" />
        </span>
      )}

      {/* hairline direita */}
      <span
        className="flex-1 h-px"
        style={{
          background: 'linear-gradient(90deg, rgba(191,166,142,0.30) 10%, transparent)',
        }}
      />
    </div>
  )
}
