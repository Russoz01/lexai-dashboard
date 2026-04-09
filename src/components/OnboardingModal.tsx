'use client'
import { useState, useEffect } from 'react'

const STEPS = [
  { icon: 'bi-stars', title: 'Bem-vindo ao LexAI', desc: '12 agentes de IA afinados para a advocacia e o estudo do Direito. Vamos te mostrar o essencial em 60 segundos.' },
  { icon: 'bi-text-paragraph', title: 'Resumidor', desc: 'Cole qualquer documento juridico — contrato, peticao, acordao — e receba uma analise estruturada com riscos, clausulas criticas e prazos.' },
  { icon: 'bi-journal-bookmark', title: 'Pesquisador', desc: 'Jurisprudencia do STF, STJ, TRFs e TJs estaduais. Cada resultado com ementa, tribunal e data de julgamento verificados.' },
  { icon: 'bi-pencil-square', title: 'Redator', desc: 'Peticoes iniciais, recursos, contestacoes e notificacoes com fundamentacao doutrinaria e jurisprudencial completa.' },
  { icon: 'bi-mortarboard', title: 'Professor', desc: 'Aulas em 3 niveis de profundidade — basico, intermediario, avancado — com questoes no estilo OAB, concursos e magistratura.' },
  { icon: 'bi-patch-check', title: 'Simulado & Consultor', desc: 'Gere simulados no estilo OAB/CESPE com gabarito comentado, ou solicite pareceres juridicos com argumentos pro e contra.' },
  { icon: 'bi-rocket-takeoff', title: 'Pronto para comecar?', desc: 'Dois dias gratis para explorar tudo. Sem cartao de credito. Comece pelo Chat — o orquestrador roteia para o agente certo.' },
]

export default function OnboardingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0)

  useEffect(() => { if (open) setStep(0) }, [open])
  useEffect(() => {
    if (!open) return
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [open, onClose])

  if (!open) return null

  const s = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 'max(80px, 14vh)', paddingInline: 24, paddingBottom: 24,
      animation: 'fadeIn 0.2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--card-bg)', border: '1px solid var(--border)',
        borderRadius: 20, maxWidth: 520, width: '100%', padding: '40px 36px 32px',
        textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.40)',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--accent-light)', display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center', marginBottom: 20,
        }}>
          <i className={`bi ${s.icon}`} style={{ fontSize: 32, color: 'var(--accent)' }} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.5px' }}>{s.title}</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 28, maxWidth: 420, marginInline: 'auto' }}>{s.desc}</p>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} style={{
              width: i === step ? 24 : 8, height: 8, borderRadius: 4,
              background: i === step ? 'var(--accent)' : 'var(--border)',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s',
            }} aria-label={`Passo ${i+1}`} />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="btn-ghost" style={{ minWidth: 120 }}>
              <i className="bi bi-arrow-left" /> Anterior
            </button>
          )}
          {!isLast ? (
            <button onClick={() => setStep(s => s + 1)} className="btn-primary" style={{ minWidth: 120 }}>
              Proximo <i className="bi bi-arrow-right" />
            </button>
          ) : (
            <button onClick={onClose} className="btn-primary" style={{ minWidth: 160 }}>
              <i className="bi bi-check-lg" /> Comecar a usar
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  )
}
