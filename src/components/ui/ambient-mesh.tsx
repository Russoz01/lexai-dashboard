/* ════════════════════════════════════════════════════════════════════
 * AmbientMesh (v9.5 · 2026-04-29)
 * ────────────────────────────────────────────────────────────────────
 * Background animado pra qualquer secao escura. Tres blobs gradient
 * champagne flutuam lento (~22-28s ciclos) gerando movimento ambiente
 * que o olho registra mas nao distrai. Opcional: dust particles (pontos
 * dourados subindo).
 *
 * Tudo CSS (keyframes em globals.css `lex-mesh-drift-*` + `lex-dust-rise`).
 * Zero JS de animation = zero overhead, GPU-accelerated, mobile-friendly.
 * Reduce-motion respeitado via prefers-reduced-motion no globals.css.
 *
 * Uso:
 *   <section className="relative isolate overflow-hidden">
 *     <AmbientMesh dust />
 *     ... conteudo ...
 *   </section>
 * ═══════════════════════════════════════════════════════════════════ */

interface AmbientMeshProps {
  /** Renderiza tambem os pontos dourados subindo (default: false) */
  dust?: boolean
  /** Quantidade de dust particles (default: 12) */
  dustCount?: number
  /** Intensidade global do mesh (0-1, default: 1) */
  intensity?: number
  /** className extra pro container raiz */
  className?: string
}

export function AmbientMesh({ dust = false, dustCount = 12, intensity = 1, className = '' }: AmbientMeshProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-20 overflow-hidden ${className}`}
      style={{ opacity: intensity }}
    >
      {/* 3 blobs gradient flutuando em paths diferentes */}
      <div className="lex-mesh-blob lex-mesh-blob-1" />
      <div className="lex-mesh-blob lex-mesh-blob-2" />
      <div className="lex-mesh-blob lex-mesh-blob-3" />

      {/* Dust particles opcionais — pontos dourados subindo */}
      {dust && (
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: dustCount }).map((_, i) => {
            // Posicoes pseudo-random determinaveis (sem hidration mismatch)
            const left = ((i * 37) % 100)
            const dx = (((i * 53) % 20) - 10)
            const dur = 12 + ((i * 13) % 18)
            const delay = -((i * 7) % 18)
            const size = 1 + (i % 3)
            return (
              <span
                key={i}
                className="lex-dust"
                style={{
                  left: `${left}%`,
                  bottom: '-5%',
                  width: `${size}px`,
                  height: `${size}px`,
                  ['--dx' as string]: `${dx}vw`,
                  ['--dur' as string]: `${dur}s`,
                  animationDelay: `${delay}s`,
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
