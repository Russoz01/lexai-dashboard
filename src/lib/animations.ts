import { useState } from 'react'

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
}

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

export const breathe = {
  animate: {
    scale: [1, 1.03, 1],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
  }
}

export const glassHover = {
  whileHover: {
    y: -3,
    scale: 1.01,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
  }
}

export function useCardTilt() {
  const [rotate, setRotate] = useState({ x: 0, y: 0 })

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientY - rect.top - rect.height / 2) / rect.height * -4
    const y = (e.clientX - rect.left - rect.width / 2) / rect.width * 4
    setRotate({ x, y })
  }

  const onMouseLeave = () => setRotate({ x: 0, y: 0 })

  return { rotate, onMouseMove, onMouseLeave }
}
