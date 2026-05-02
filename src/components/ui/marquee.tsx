'use client'

import { cn } from '@/lib/utils'

/* Marquee — infinita horizontal com duplicação.
 * Requer animação `animate-marquee` no tailwind.config. */

export function Marquee({
  children,
  className,
  pauseOnHover = true,
  reverse = false,
}: {
  children: React.ReactNode
  className?: string
  pauseOnHover?: boolean
  reverse?: boolean
}) {
  return (
    <div className={cn('group flex overflow-hidden [--duration:40s] [gap:3rem]', className)}>
      {Array.from({ length: 2 }).map((_, idx) => (
        <div
          key={idx}
          className={cn(
            'flex shrink-0 items-center justify-around [gap:3rem]',
            reverse ? 'animate-marquee-reverse' : 'animate-marquee',
            pauseOnHover && 'group-hover:[animation-play-state:paused]',
          )}
          aria-hidden={idx === 1}
        >
          {children}
        </div>
      ))}
    </div>
  )
}
