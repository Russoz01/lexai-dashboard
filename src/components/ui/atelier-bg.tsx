'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { EASE_DRIFT } from '@/lib/motion-variants'
import { cn } from '@/lib/utils'

/* ══════════════════════════════════════════════════════════════════════
 * AtelierBg — fundo atmosférico reaproveitável Pralvex (v1 · 2026-04-23)
 * ──────────────────────────────────────────────────────────────────────
 * DNA visual compartilhado entre todas as páginas do atelier editorial.
 * Extraído dos padrões já validados em /intro e landing v9.
 *
 * Camadas (z-order, bottom → top):
 *   1. Base noir radial (deep #050403 → #0a0807)
 *   2. Dot grid fino (champagne 4% opacidade, mask radial)
 *   3. Champagne glow primário (top-right, drift lento)
 *   4. Champagne glow secundário (bottom-left, contraponto)
 *   5. Gold hairlines verticais drifting (ambient motion)
 *   6. Grain noise (SVG fractal, 3% opacity)
 *   7. Vignette circular (edge darkening pra foco central)
 *
 * Variants:
 *   · default  — hero pages, todas camadas ativas
 *   · dense    — dashboard, grid mais denso + noise forte
 *   · subtle   — modal/dialog/sidebar, só base + glow sutil
 *   · hero     — landing cinematográfica, tudo no máximo
 *   · legal    — /termos /privacidade, leitura longa, camadas minimais
 *
 * Consumo:
 *   <div className="relative min-h-screen bg-[#0a0807]">
 *     <AtelierBg variant="default" />
 *     <main className="relative z-10">...</main>
 *   </div>
 *
 * Reduced-motion: todas as animações ambient param, camadas estáticas.
 * ═══════════════════════════════════════════════════════════════════ */

type AtelierVariant = 'default' | 'dense' | 'subtle' | 'hero' | 'legal'

interface AtelierBgProps {
  variant?: AtelierVariant
  className?: string
  /** Força desligar drift das hairlines (ex: performance crítica) */
  staticMode?: boolean
  /** Sobrescreve cor do glow primário */
  glowTint?: string
}

const VARIANT_CONFIG: Record<
  AtelierVariant,
  {
    gridOpacity: number
    gridSize: number
    glowIntensity: number
    hairlineCount: number
    noiseOpacity: number
    vignetteIntensity: number
    showSecondaryGlow: boolean
  }
> = {
  default: {
    gridOpacity: 0.035,
    gridSize: 32,
    glowIntensity: 0.22,
    hairlineCount: 3,
    noiseOpacity: 0.028,
    vignetteIntensity: 0.55,
    showSecondaryGlow: true,
  },
  dense: {
    gridOpacity: 0.05,
    gridSize: 24,
    glowIntensity: 0.16,
    hairlineCount: 5,
    noiseOpacity: 0.04,
    vignetteIntensity: 0.48,
    showSecondaryGlow: true,
  },
  subtle: {
    gridOpacity: 0.02,
    gridSize: 40,
    glowIntensity: 0.1,
    hairlineCount: 0,
    noiseOpacity: 0.015,
    vignetteIntensity: 0.3,
    showSecondaryGlow: false,
  },
  hero: {
    gridOpacity: 0.04,
    gridSize: 36,
    glowIntensity: 0.32,
    hairlineCount: 6,
    noiseOpacity: 0.04,
    vignetteIntensity: 0.65,
    showSecondaryGlow: true,
  },
  legal: {
    gridOpacity: 0.018,
    gridSize: 48,
    glowIntensity: 0.08,
    hairlineCount: 2,
    noiseOpacity: 0.02,
    vignetteIntensity: 0.4,
    showSecondaryGlow: false,
  },
}

export function AtelierBg({
  variant = 'default',
  className,
  staticMode = false,
  glowTint = '#bfa68e',
}: AtelierBgProps) {
  const prefersReduced = useReducedMotion()
  const config = VARIANT_CONFIG[variant]
  const disableMotion = staticMode || prefersReduced

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className,
      )}
    >
      {/* 1. Base radial noir — gradiente sutil pra dar profundidade */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 20%, #0f0c0a 0%, #0a0807 45%, #050403 100%)',
        }}
      />

      {/* 2. Dot grid fino com mask radial — some nas bordas */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${glowTint}${Math.round(config.gridOpacity * 255)
            .toString(16)
            .padStart(2, '0')} 1px, transparent 1px)`,
          backgroundSize: `${config.gridSize}px ${config.gridSize}px`,
          maskImage:
            'radial-gradient(ellipse 80% 70% at 50% 45%, black 30%, transparent 85%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 70% at 50% 45%, black 30%, transparent 85%)',
        }}
      />

      {/* 3. Glow champagne primário — top-right, drift lento */}
      <motion.div
        className="absolute"
        style={{
          top: '-20%',
          right: '-15%',
          width: '70vw',
          height: '70vw',
          maxWidth: '1100px',
          maxHeight: '1100px',
          background: `radial-gradient(circle, ${glowTint}${Math.round(
            config.glowIntensity * 255,
          )
            .toString(16)
            .padStart(2, '0')} 0%, transparent 60%)`,
          filter: 'blur(80px)',
        }}
        animate={
          disableMotion
            ? undefined
            : {
                x: [0, 30, -10, 0],
                y: [0, -20, 15, 0],
                scale: [1, 1.08, 0.96, 1],
              }
        }
        transition={{
          duration: 22,
          ease: EASE_DRIFT,
          repeat: Infinity,
          repeatType: 'loop',
        }}
      />

      {/* 4. Glow champagne secundário — bottom-left, contraponto */}
      {config.showSecondaryGlow && (
        <motion.div
          className="absolute"
          style={{
            bottom: '-18%',
            left: '-12%',
            width: '55vw',
            height: '55vw',
            maxWidth: '900px',
            maxHeight: '900px',
            background: `radial-gradient(circle, ${glowTint}${Math.round(
              config.glowIntensity * 0.7 * 255,
            )
              .toString(16)
              .padStart(2, '0')} 0%, transparent 65%)`,
            filter: 'blur(100px)',
          }}
          animate={
            disableMotion
              ? undefined
              : {
                  x: [0, -20, 25, 0],
                  y: [0, 18, -12, 0],
                  scale: [1, 0.94, 1.06, 1],
                }
          }
          transition={{
            duration: 28,
            ease: EASE_DRIFT,
            repeat: Infinity,
            repeatType: 'loop',
            delay: 4,
          }}
        />
      )}

      {/* 5. Gold hairlines verticais — linhas finas drifting no fundo */}
      {config.hairlineCount > 0 && (
        <div className="absolute inset-0">
          {Array.from({ length: config.hairlineCount }).map((_, i) => {
            const leftPercent = (100 / (config.hairlineCount + 1)) * (i + 1)
            const delay = i * 1.8
            const duration = 14 + i * 2.4
            return (
              <motion.div
                key={`hairline-${i}`}
                className="absolute top-0 h-full w-px"
                style={{
                  left: `${leftPercent}%`,
                  background: `linear-gradient(to bottom, transparent 0%, ${glowTint}14 25%, ${glowTint}22 50%, ${glowTint}14 75%, transparent 100%)`,
                  transformOrigin: 'top',
                }}
                animate={
                  disableMotion
                    ? { opacity: 0.6 }
                    : {
                        opacity: [0.25, 0.75, 0.35, 0.25],
                        scaleY: [0.85, 1, 0.9, 0.85],
                        x: [0, i % 2 === 0 ? 8 : -8, 0],
                      }
                }
                transition={{
                  duration,
                  ease: EASE_DRIFT,
                  repeat: Infinity,
                  repeatType: 'loop',
                  delay,
                }}
              />
            )
          })}
        </div>
      )}

      {/* 6. Grain noise — SVG fractal inline, pra quebrar banding */}
      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{
          opacity: config.noiseOpacity,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.45 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* 7. Vignette circular — escurece bordas, foco central */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 85% 80% at 50% 50%, transparent 40%, rgba(0,0,0,${config.vignetteIntensity}) 100%)`,
        }}
      />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
 * AtelierBgStatic — versão sem framer-motion (server-component friendly)
 * ──────────────────────────────────────────────────────────────────────
 * Para uso em layouts ou pages que NÃO são client components, ou quando
 * performance é crítica (ex: /termos com texto longo em LCP).
 * Sem drift, sem RAF, só CSS puro.
 * ═══════════════════════════════════════════════════════════════════ */

export function AtelierBgStatic({
  variant = 'subtle',
  className,
  glowTint = '#bfa68e',
}: Omit<AtelierBgProps, 'staticMode'>) {
  const config = VARIANT_CONFIG[variant]

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className,
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 20%, #0f0c0a 0%, #0a0807 45%, #050403 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${glowTint}${Math.round(config.gridOpacity * 255)
            .toString(16)
            .padStart(2, '0')} 1px, transparent 1px)`,
          backgroundSize: `${config.gridSize}px ${config.gridSize}px`,
          maskImage:
            'radial-gradient(ellipse 80% 70% at 50% 45%, black 30%, transparent 85%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 70% at 50% 45%, black 30%, transparent 85%)',
        }}
      />
      <div
        className="absolute"
        style={{
          top: '-20%',
          right: '-15%',
          width: '70vw',
          height: '70vw',
          maxWidth: '1100px',
          maxHeight: '1100px',
          background: `radial-gradient(circle, ${glowTint}${Math.round(config.glowIntensity * 255)
            .toString(16)
            .padStart(2, '0')} 0%, transparent 60%)`,
          filter: 'blur(80px)',
        }}
      />
      {config.showSecondaryGlow && (
        <div
          className="absolute"
          style={{
            bottom: '-18%',
            left: '-12%',
            width: '55vw',
            height: '55vw',
            maxWidth: '900px',
            maxHeight: '900px',
            background: `radial-gradient(circle, ${glowTint}${Math.round(config.glowIntensity * 0.7 * 255)
              .toString(16)
              .padStart(2, '0')} 0%, transparent 65%)`,
            filter: 'blur(100px)',
          }}
        />
      )}
      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{
          opacity: config.noiseOpacity,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.45 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 85% 80% at 50% 50%, transparent 40%, rgba(0,0,0,${config.vignetteIntensity}) 100%)`,
        }}
      />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
 * AtelierDivider — divisor editorial horizontal com glint champagne
 * ──────────────────────────────────────────────────────────────────────
 * Replace pros <div className="h-px w-full bg-gradient-to-r ..."> que
 * aparecem repetidos em todas as pages. Animável via whileInView.
 * ═══════════════════════════════════════════════════════════════════ */

export function AtelierDivider({
  className,
  animate = true,
}: {
  className?: string
  animate?: boolean
}) {
  const prefersReduced = useReducedMotion()

  if (animate && !prefersReduced) {
    return (
      <motion.div
        className={cn('relative my-14 h-px w-full', className)}
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#bfa68e]/25 to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#bfa68e] shadow-[0_0_8px_rgba(191,166,142,0.8)]" />
      </motion.div>
    )
  }

  return (
    <div className={cn('relative my-14 h-px w-full', className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#bfa68e]/25 to-transparent" />
      <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#bfa68e]" />
    </div>
  )
}
