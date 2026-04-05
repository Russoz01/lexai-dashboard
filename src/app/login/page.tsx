'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LexLogoIcon({ size = 56 }: { size?: number }) {
  const sc = size / 36
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      background: 'linear-gradient(135deg, #1A1816, #2E2A27, #3A3532)',
      borderRadius: Math.round(size * 0.28),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 24px rgba(245,166,35,0.35)',
    }}>
      <svg viewBox="0 0 28 24" fill="none" width={Math.round(22 * sc)} height={Math.round(19 * sc)}>
        <path d="M3 3 L3 21 L11 21" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13 3 L25 21" stroke="white" strokeWidth="2.4" strokeLinecap="round"/>
        <path d="M25 3 L13 21" stroke="white" strokeWidth="2.4" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function Spinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ animation: 'lx-spin 0.8s linear infinite', flexShrink: 0 }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  )
}

const FEATURES = [
  { icon: 'bi-file-earmark-text', title: 'Resumidor Jurídico', desc: 'Analise contratos e petições com IA' },
  { icon: 'bi-pencil-square', title: 'Redator de Peças', desc: 'Gere petições, recursos e pareceres' },
  { icon: 'bi-journal-bookmark', title: 'Pesquisador', desc: 'Jurisprudência do STF, STJ e tribunais' },
  { icon: 'bi-calendar-check', title: 'Controle de Prazos', desc: 'Alertas automáticos de deadlines' },
]

const STATS = [
  { value: '2.500+', label: 'Documentos analisados' },
  { value: '8', label: 'Agentes IA ativos' },
  { value: '99.7%', label: 'Disponibilidade' },
]

export default function LoginPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [oauthLoading, setOauthLoading] = useState<'google' | null>(null)
  const [email, setEmail]       = useState('')
  const [senha, setSenha]       = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function signInGoogle() {
    setOauthLoading('google')
    setErro('')
    try {
      const redirectTo = window.location.origin + '/auth/callback'
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })
      if (error) {
        console.error('Erro OAuth:', error.message)
        setErro('Erro ao iniciar login com Google: ' + error.message)
        setOauthLoading(null)
      }
    } catch (err) {
      console.error('Erro geral OAuth:', err)
      setErro('Erro inesperado ao conectar com Google.')
      setOauthLoading(null)
    }
  }

  async function signInEmail(e: React.FormEvent) {
    e.preventDefault()
    setEmailLoading(true)
    setErro('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro('Email ou senha incorretos.')
      setEmailLoading(false)
      return
    }
    router.push('/dashboard')
  }

  const anyLoading = oauthLoading !== null || emailLoading

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', 'Segoe UI', sans-serif; background: #1A1816; }
        @keyframes lx-spin { to { transform: rotate(360deg); } }
        @keyframes lx-fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes lx-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }

        .lx-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #1A1816 0%, #252220 50%, #1A1816 100%);
          display: grid; grid-template-columns: 1fr 1fr;
          position: relative; overflow: hidden;
        }

        .lx-form-side {
          display: flex; align-items: center; justify-content: center;
          padding: 40px; position: relative; z-index: 1;
        }

        .lx-showcase-side {
          display: flex; flex-direction: column; justify-content: center;
          padding: 60px 48px;
          background: linear-gradient(135deg, rgba(245,166,35,0.08) 0%, rgba(15,25,35,0.95) 100%);
          border-left: 1px solid rgba(255,255,255,0.05);
          position: relative; z-index: 1;
        }

        .lx-card {
          background: rgba(37,34,32,0.92);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px; padding: 44px 40px;
          width: 100%; max-width: 420;
          box-shadow: 0 32px 64px rgba(0,0,0,0.55);
          animation: lx-fadeIn 0.6s ease both;
        }

        .lx-oauth-btn {
          width: 100%; height: 52px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center; gap: 12px;
          color: #fff; font-size: 15px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.15s ease;
        }
        .lx-oauth-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.22);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.35);
        }
        .lx-oauth-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .lx-input {
          width: 100%; height: 48px; padding: 0 44px 0 44px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 12px;
          color: #fff; font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
        }
        .lx-input::placeholder { color: rgba(255,255,255,0.28); }
        .lx-input:focus {
          border-color: rgba(245,166,35,0.55);
          box-shadow: 0 0 0 3px rgba(245,166,35,0.08);
        }

        .lx-submit {
          width: 100%; height: 48px;
          background: linear-gradient(135deg, #F5A623, #FBBD5E);
          color: #1A1816;
          border: none; border-radius: 12px;
          font-size: 15px; font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.15s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .lx-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #FBBD5E, #e0c97a);
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(245,166,35,0.35);
        }
        .lx-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .lx-divider {
          display: flex; align-items: center; gap: 12px;
          color: rgba(255,255,255,0.2); font-size: 12px;
          margin: 20px 0;
        }
        .lx-divider::before, .lx-divider::after {
          content: ''; flex: 1; height: 1px;
          background: rgba(255,255,255,0.08);
        }

        .lx-eye {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.35); padding: 4px; line-height: 1;
          transition: color 0.15s;
        }
        .lx-eye:hover { color: rgba(255,255,255,0.7); }

        .lx-glass {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 20px;
          transition: all 0.2s ease;
        }
        .lx-glass:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(245,166,35,0.20);
          transform: translateY(-2px);
        }

        .lx-feature {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 0;
          animation: lx-fadeIn 0.6s ease both;
        }
        .lx-feature-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: rgba(245,166,35,0.12);
          display: flex; align-items: center; justify-content: center;
          color: #F5A623; font-size: 16px; flex-shrink: 0;
        }

        @media (max-width: 900px) {
          .lx-page { grid-template-columns: 1fr; }
          .lx-showcase-side { display: none; }
        }
      ` }} />

      <div className="lx-page">
        {/* Glow decorativo */}
        <div style={{
          position: 'absolute', top: '10%', left: '25%',
          width: 600, height: 600, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 65%)',
        }} />

        {/* ══ LEFT — Login Form ══ */}
        <div className="lx-form-side">
          <div className="lx-card">
            {/* Logo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
              <LexLogoIcon size={64} />
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 28, fontWeight: 700, color: '#fff',
                letterSpacing: '-0.5px', marginTop: 14, marginBottom: 5,
              }}>LexAI</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', textAlign: 'center' }}>
                Inteligência Artificial para o Direito
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <div style={{
                padding: '11px 14px', borderRadius: 10, marginBottom: 20,
                background: 'rgba(192,57,43,0.14)', border: '1px solid rgba(192,57,43,0.28)',
                color: '#e07070', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <i className="bi bi-exclamation-circle" />
                {erro}
              </div>
            )}

            {/* Google OAuth */}
            <button className="lx-oauth-btn" onClick={signInGoogle} disabled={anyLoading}>
              {oauthLoading === 'google' ? <Spinner /> : <GoogleIcon />}
              Continuar com Google
            </button>

            <div className="lx-divider">ou entre com email</div>

            {/* Form */}
            <form onSubmit={signInEmail} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-envelope" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: 15, pointerEvents: 'none' }} />
                <input className="lx-input" type="email" placeholder="seu@email.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  required autoComplete="email" />
              </div>

              <div style={{ position: 'relative' }}>
                <i className="bi bi-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: 15, pointerEvents: 'none' }} />
                <input className="lx-input" type={showSenha ? 'text' : 'password'} placeholder="Senha"
                  value={senha} onChange={e => setSenha(e.target.value)}
                  required autoComplete="current-password" />
                <button type="button" className="lx-eye" onClick={() => setShowSenha(v => !v)}
                  tabIndex={-1} aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}>
                  <i className={`bi ${showSenha ? 'bi-eye-slash' : 'bi-eye'}`} style={{ fontSize: 16 }} />
                </button>
              </div>

              <button type="submit" className="lx-submit" disabled={anyLoading}>
                {emailLoading ? <Spinner /> : 'Entrar'}
              </button>
            </form>

            <div style={{
              marginTop: 28, paddingTop: 20,
              borderTop: '1px solid rgba(255,255,255,0.06)',
              textAlign: 'center',
              fontSize: 12, color: 'rgba(255,255,255,0.22)', lineHeight: 1.6,
            }}>
              Ao continuar, você concorda com os{' '}
              <a href="#" style={{ color: 'rgba(245,166,35,0.65)', textDecoration: 'none' }}>Termos de Uso</a>
              {' '}e a{' '}
              <a href="#" style={{ color: 'rgba(245,166,35,0.65)', textDecoration: 'none' }}>Política de Privacidade</a>
            </div>
          </div>
        </div>

        {/* ══ RIGHT — Showcase Panel ══ */}
        <div className="lx-showcase-side">
          {/* Title */}
          <div style={{ marginBottom: 36, animation: 'lx-fadeIn 0.6s ease 0.1s both' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#F5A623', marginBottom: 10 }}>
              Plataforma Jurídica com IA
            </div>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 32, fontWeight: 700, color: '#fff',
              lineHeight: 1.2, letterSpacing: '-0.5px', marginBottom: 12,
            }}>
              Seu escritório digital<br />inteligente
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, maxWidth: 380 }}>
              Automatize a análise de documentos, pesquise jurisprudência e gere peças processuais com inteligência artificial de última geração.
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32, animation: 'lx-fadeIn 0.6s ease 0.2s both' }}>
            {STATS.map((s, i) => (
              <div key={i} className="lx-glass" style={{ textAlign: 'center', padding: '18px 12px' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#F5A623', letterSpacing: '-0.5px' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div style={{ marginBottom: 32 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="lx-feature" style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
                <div className="lx-feature-icon">
                  <i className={`bi ${f.icon}`} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.40)', marginTop: 2 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div style={{
            padding: '20px 24px', borderRadius: 16,
            background: 'rgba(255,255,255,0.03)',
            borderLeft: '3px solid rgba(245,166,35,0.4)',
            animation: 'lx-fadeIn 0.6s ease 0.6s both',
          }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 12 }}>
              &ldquo;O LexAI transformou a forma como analiso documentos. O que levava horas agora leva minutos, com uma precisão impressionante.&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #F5A623, #C4841A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff',
              }}>DR</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Dr. Rafael Mendes</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Advogado Cível — OAB/SP</div>
              </div>
            </div>
          </div>

          {/* Powered by */}
          <div style={{
            marginTop: 28, display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 11, color: 'rgba(255,255,255,0.25)',
          }}>
            <i className="bi bi-cpu" style={{ fontSize: 13 }} />
            Powered by Claude — Anthropic
          </div>
        </div>
      </div>
    </>
  )
}
