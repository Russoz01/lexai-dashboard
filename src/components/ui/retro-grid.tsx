'use client'

import { cn } from '@/lib/utils'

/* RetroGrid — perspective floor grid with animation.
 * Popular pattern from magic-ui / 21st.dev community. */

export function RetroGrid({
  className,
  angle = 65,
  opacity = 0.5,
}: {
  className?: string
  angle?: number
  opacity?: number
}) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute size-full overflow-hidden [perspective:200px]',
        className,
      )}
      style={{ '--grid-angle': `${angle}deg`, opacity } as React.CSSProperties}
      aria-hidden
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div
          className={cn(
            'animate-grid',
            '[background-repeat:repeat] [background-size:60px_60px] [height:300vh] [inset:0%_0px] [margin-left:-50%] [transform-origin:100%_0_0] [width:600vw]',
            '[background-image:linear-gradient(to_right,rgba(191,166,142,0.25)_1px,transparent_0),linear-gradient(to_bottom,rgba(191,166,142,0.25)_1px,transparent_0)]',
          )}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent to-90%" />
    </div>
  )
}
