'use client'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
  style?: React.CSSProperties
  circle?: boolean
}

export function Skeleton({ width = '100%', height = 16, circle = false, style = {}, className = '' }: SkeletonProps) {
  return (
    <div
      className={`pralvex-skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius: circle ? '50%' : 6,
        ...style,
      }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Skeleton height={20} width="60%" />
      <Skeleton height={12} width="100%" />
      <Skeleton height={12} width="80%" />
      <Skeleton height={12} width="90%" />
    </div>
  )
}

export function SkeletonResult() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 12 }}>
        <Skeleton height={24} width="70%" style={{ marginBottom: 12 }} />
        <Skeleton height={14} />
        <Skeleton height={14} width="95%" style={{ marginTop: 8 }} />
        <Skeleton height={14} width="88%" style={{ marginTop: 8 }} />
      </div>
      <div style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 12 }}>
        <Skeleton height={18} width="40%" style={{ marginBottom: 12 }} />
        <Skeleton height={12} width="100%" style={{ marginTop: 6 }} />
        <Skeleton height={12} width="75%" style={{ marginTop: 6 }} />
      </div>
    </div>
  )
}
