'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/* ── Ícones ─────────────────────────────────────────────────── */
function LexLogoIcon({ size = 56 }: { size?: number }) {
  const sc = size / 36
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      borderRadius: Math.round(size * 0.28),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 24px rgba(201,168,76,0.35)',
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

/* ── Componente principal ───────────────────────────────────── */
export default function LoginPage() {
  const router   = useRouter()
  const supabase = createClient()

  // OAuth
  const [oauthLoading, setOauthLoading] = useState<'google' | null>(null)

  // Email / senha
  const [email,       setEmail]       = useState('')
  const [senha,       setSenha]       = useState('')
  const [showSenha,   setShowSenha]   = useState(false)
  const [emailLoading,setEmailLoading]= useState(false)

  // Erro compartilhado
  const [erro, setErro] = useState('')

  const redirectTo =
    (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000') + '/auth/callback'

  /* Google OAuth — sem mudanças */
  async function signInGoogle() {
    setOauthLoading('google')
    setErro('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (error) { setErro('Erro ao iniciar login com Google.'); setOauthLoading(null) }
  }

  /* Email + senha */
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
        body { font-family: 'DM Sans', 'Segoe UI', sans-serif; background: #0b1220; }
        @keyframes lx-spin { to { transform: rotate(360deg); } }

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
          width: 100%; height: 48px; padding: 0 44px 0 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 12px;
          color: #fff; font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
        }
        .lx-input::placeholder { color: rgba(255,255,255,0.28); }
        .lx-input:focus {
          border-color: rgba(201,168,76,0.55);
          box-shadow: 0 0 0 3px rgba(201,168,76,0.08);
        }

        .lx-submit {
          width: 100%; height: 48px;
          background: #c9a84c; color: #0f1923;
          border: none; border-radius: 12px;
          font-size: 15px; font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.15s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .lx-submit:hover:not(:disabled) {
          background: #d4b86a;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(201,168,76,0.30);
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
      ` }} />

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0b1220 0%, #0f1923 50%, #0d1a2e 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow decorativo */}
        <div style={{
          position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 700, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 65%)',
        }} />

        {/* Card */}
        <div style={{
          background: 'rgba(22,29,46,0.92)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 24, padding: '44px 40px',
          width: '100%', maxWidth: 420,
          boxShadow: '0 32px 64px rgba(0,0,0,0.55)',
          position: 'relative', zIndex: 1,
        }}>

          {/* Logo */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:32 }}>
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
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0-1A6 6 0 1 0 8 2a6 6 0 0 0 0 12zm-.5-4h1V5h-1v5zm0 2h1v-1.5h-1V12z"/>
              </svg>
              {erro}
            </div>
          )}

          {/* ── Google OAuth ─────────────────────────────────── */}
          <button className="lx-oauth-btn" onClick={signInGoogle} disabled={anyLoading}>
            {oauthLoading === 'google' ? <Spinner /> : <GoogleIcon />}
            Continuar com Google
          </button>

          {/* ── Divisor ──────────────────────────────────────── */}
          <div className="lx-divider">ou entre com email</div>

          {/* ── Formulário email / senha ─────────────────────── */}
          <form onSubmit={signInEmail} style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {/* Email */}
            <div style={{ position:'relative' }}>
              <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.8"
                viewBox="0 0 24 24" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                className="lx-input"
                style={{ paddingLeft: 44 }}
                type="email" placeholder="seu@email.com"
                value={email} onChange={e => setEmail(e.target.value)}
                required autoComplete="email"
              />
            </div>

            {/* Senha */}
            <div style={{ position:'relative' }}>
              <svg width="16" height="16" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.8"
                viewBox="0 0 24 24" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                className="lx-input"
                style={{ paddingLeft: 44 }}
                type={showSenha ? 'text' : 'password'}
                placeholder="Senha"
                value={senha} onChange={e => setSenha(e.target.value)}
                required autoComplete="current-password"
              />
              <button type="button" className="lx-eye" onClick={() => setShowSenha(v => !v)}
                tabIndex={-1} aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}>
                {showSenha ? (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            <button type="submit" className="lx-submit" disabled={anyLoading}>
              {emailLoading ? <Spinner /> : 'Entrar'}
            </button>
          </form>

          {/* Rodapé */}
          <div style={{
            marginTop: 28, paddingTop: 20,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            textAlign: 'center',
            fontSize: 12, color: 'rgba(255,255,255,0.22)', lineHeight: 1.6,
          }}>
            Ao continuar, você concorda com os{' '}
            <a href="#" style={{ color:'rgba(201,168,76,0.65)', textDecoration:'none' }}>Termos de Uso</a>
            {' '}e a{' '}
            <a href="#" style={{ color:'rgba(201,168,76,0.65)', textDecoration:'none' }}>Política de Privacidade</a>
          </div>
        </div>
      </div>
    </>
  )
}
