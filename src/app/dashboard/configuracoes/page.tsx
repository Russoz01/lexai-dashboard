'use client'

import { useState, useEffect, useRef } from 'react'
import {
  User,
  SlidersHorizontal,
  Mail,
  Camera,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Check,
  MapPin,
  Moon,
  ArrowUpCircle,
  Receipt,
  Send,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { resolveUsuarioId } from '@/lib/usuario'
import { AreaSelector } from '@/components/AreaSelector'
import { usePreferences } from '@/hooks/usePreferences'

// Removida aba 'integracoes' por hora — toggles ainda nao tem backend wired
// (Google Calendar/WhatsApp/Drive/Notion/Telegram). Reentra quando handlers
// reais existirem.
type Tab = 'perfil' | 'preferencias' | 'contato'

type IconComp = LucideIcon

function maskTel(v: string) {
  v = v.replace(/\D/g, '').slice(0, 11)
  if (v.length <= 10) return v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  return v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
}

export default function ConfiguracoesPage() {
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const { prefs, loading: prefsLoading, update: updatePrefs } = usePreferences()

  const [tab, setTab]         = useState<Tab>('perfil')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState('')
  const [erro, setErro]       = useState('')

  // Memória cross-agent — contagem + purge
  const [memoryCount, setMemoryCount]   = useState<number | null>(null)
  const [memoryPurging, setMemoryPurging] = useState(false)
  useEffect(() => {
    if (!prefs.usuario_id) return
    let cancelled = false
    ;(async () => {
      const { count } = await supabase
        .from('agent_memory')
        .select('id', { count: 'exact', head: true })
        .eq('usuario_id', prefs.usuario_id)
      if (!cancelled) setMemoryCount(count ?? 0)
    })()
    return () => { cancelled = true }
  }, [prefs.usuario_id, supabase])

  async function handleMemoryPurge() {
    if (!prefs.usuario_id) return
    if (typeof window !== 'undefined' && !window.confirm('Limpar TODA a memória cross-agent? Esta acao e definitiva.')) return
    setMemoryPurging(true)
    try {
      // Audit fix (2026-05-03): rota server-side com audit_log LGPD Art. 18.
      // Antes: DELETE direto via supabase client — funcionava (RLS) mas sem
      // trail. LGPD exige registro de operações de exclusão de dados pessoais.
      const res = await fetch('/api/preferences/purge-memory', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.ok) {
        setErro(data?.error || 'Erro ao limpar memoria')
        setTimeout(() => setErro(''), 3500)
      } else {
        setMemoryCount(0)
        setMsg(`Memoria limpa (${data.deleted ?? 0} entradas).`)
        setTimeout(() => setMsg(''), 2500)
      }
    } finally {
      setMemoryPurging(false)
    }
  }

  // Plan resolvido server-side (antes: localStorage — exploitavel via DevTools)
  // Audit business P0-1 (2026-05-03): Enterprise bumped 1.599 → 2.499 + Solo entry.
  const planoMap: Record<string, { nome: string; preco: number }> = {
    solo: { nome: 'Solo', preco: 599 },
    starter: { nome: 'Escritório', preco: 1399 },
    escritorio: { nome: 'Escritório', preco: 1399 },
    pro: { nome: 'Firma', preco: 1459 },
    firma: { nome: 'Firma', preco: 1459 },
    enterprise: { nome: 'Enterprise', preco: 2499 },
  }
  const [planoId, setPlanoId] = useState<string>('starter')
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/user/plan', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json() as { plan?: string }
        if (!cancelled && data.plan && planoMap[data.plan]) setPlanoId(data.plan)
      } catch { /* silent */ }
    })()
    return () => { cancelled = true }
  }, [])
  const planoAtual = planoMap[planoId] || planoMap.starter

  // Perfil
  const [nome, setNome]       = useState('')
  const [telefone, setTelefone] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [email, setEmail]     = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarLoading, setAvatarLoading] = useState(false)

  // Integrações state removido junto com a aba — sem backend wired ainda.

  // Contato
  const [assunto, setAssunto] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [contatoEnviado, setContatoEnviado] = useState(false)

  // CEP lookup (consulta gratuita via BrasilAPI/ViaCEP)
  // 2026-05-03: rework completo — antes nao distinguia erro local de upstream,
  // permitia submeter "00000-000" (placeholder) como CEP real, e nao limpava
  // mensagem de erro quando user corrigia. Agora: mascara automatica 99999-999,
  // auto-search no 8o digito, mensagens distintas pra cada classe de erro.
  type CepResult = { logradouro: string; bairro: string; cidade: string; uf: string; cep: string }
  const [cepInput, setCepInput]     = useState('')
  const [cepLoading, setCepLoading] = useState(false)
  const [cepResult, setCepResult]   = useState<CepResult | null>(null)
  const [cepError, setCepError]     = useState('')

  /** Aplica mascara 99999-999 enquanto user digita (so digitos sao mantidos). */
  function maskCep(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 8)
    if (digits.length <= 5) return digits
    return `${digits.slice(0, 5)}-${digits.slice(5)}`
  }

  function handleCepInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const masked = maskCep(e.target.value)
    setCepInput(masked)
    // Limpa erro/result anterior assim que user comeca a corrigir
    if (cepError) setCepError('')
    if (cepResult) setCepResult(null)
  }

  async function handleCepLookup() {
    const digits = cepInput.replace(/\D/g, '')
    if (digits.length === 0) return
    if (digits.length < 8) {
      setCepError('CEP precisa ter 8 dígitos.')
      return
    }
    if (digits === '00000000') {
      setCepError('CEP inválido.')
      return
    }
    setCepLoading(true); setCepError(''); setCepResult(null)
    try {
      const { lookupCEP, formatCep } = await import('@/lib/brasil-api')
      const data = await lookupCEP(cepInput)
      if (!data) {
        setCepError('CEP não encontrado.')
        return
      }
      setCepResult({
        logradouro: data.logradouro || '(sem logradouro)',
        bairro: data.bairro || '(sem bairro)',
        cidade: data.cidade,
        uf: data.uf,
        cep: formatCep(data.cep),
      })
    } catch {
      setCepError('Erro ao consultar. Tente em 30s.')
    } finally {
      setCepLoading(false)
    }
  }

  // Auto-search debounced ao completar 8 digitos — UX P1: usuario nao precisa
  // clicar em "Buscar" pro caso comum. Cancelamos o timeout se user continua
  // digitando ou apaga; tambem nao re-disparamos se ja temos resultado.
  useEffect(() => {
    const digits = cepInput.replace(/\D/g, '')
    if (digits.length !== 8) return
    if (digits === '00000000') return
    if (cepResult) return
    const t = setTimeout(() => { handleCepLookup() }, 500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cepInput])

  useEffect(() => {
    // cleanup flag — antes setState rodava após unmount se user navegasse
    // rápido entre tabs. React warning + memory leak.
    let cancelled = false
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled || !data.user) return
      const meta = data.user.user_metadata
      setEmail(data.user.email ?? '')
      setNome(meta?.nome ?? meta?.full_name ?? '')
      setTelefone(meta?.telefone ?? '')
      setEmpresa(meta?.empresa ?? '')
      setAvatarUrl(meta?.avatar_url ?? '')
    })
    return () => { cancelled = true }
  }, [supabase])

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setMsg(''); setErro('')
    const { error } = await supabase.auth.updateUser({ data: { nome, telefone, empresa } })
    if (error) setErro('Erro ao salvar: ' + error.message)
    else setMsg('Perfil atualizado com sucesso!')
    setLoading(false)
  }

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setAvatarLoading(false); return }

    const ext  = file.name.split('.').pop()
    const path = `avatars/${user.id}.${ext}`
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (upErr) { setErro('Erro no upload: ' + upErr.message); setAvatarLoading(false); return }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    const url = urlData.publicUrl
    await supabase.auth.updateUser({ data: { avatar_url: url } })
    setAvatarUrl(url)
    setAvatarLoading(false)
  }

  // toggleIntegracao removida junto com a aba — sem handlers reais wired.

  async function enviarContato(e: React.FormEvent) {
    e.preventDefault()
    if (!assunto || !mensagem) return
    setLoading(true)
    const usuarioId = await resolveUsuarioId()
    if (usuarioId) {
      await supabase.from('historico').insert({
        usuario_id: usuarioId, agente: 'orquestrador',
        mensagem_usuario: `[CONTATO] ${assunto}: ${mensagem}`,
        resposta_agente: 'Mensagem recebida. Nossa equipe entrará em contato em até 24h.',
      })
    }
    setContatoEnviado(true); setAssunto(''); setMensagem(''); setLoading(false)
  }

  const TABS: { id: Tab; label: string; Icon: IconComp }[] = [
    { id: 'perfil',       label: 'Perfil',        Icon: User              },
    { id: 'preferencias', label: 'Preferências',  Icon: SlidersHorizontal },
    { id: 'contato',      label: 'Contato',       Icon: Mail              },
  ]

  const iniciais = nome ? nome.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : email.slice(0,2).toUpperCase()

  return (
    <div className="page-content" style={{ maxWidth: '100%' }}>
      {/* Header editorial — alinhado ao padrao do /dashboard principal */}
      <header style={{ marginBottom: 32, paddingTop: 4 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 9,
          fontFamily: 'var(--font-mono, ui-monospace), monospace',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
          marginBottom: 12,
        }}>
          <span style={{
            display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
            background: 'var(--accent)',
            boxShadow: '0 0 10px rgba(191,166,142,0.55)',
          }} />
          <span>N° 006 · ATELIER · CONFIGURACOES</span>
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 'clamp(28px, 5.5vw, 38px)', fontWeight: 500,
          lineHeight: 1.08, letterSpacing: '-1px',
          color: 'var(--text-primary)', margin: 0,
        }}>
          Seu <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>gabinete</em>.
        </h1>
        <p style={{
          fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
          fontSize: 14, color: 'var(--text-secondary)',
          margin: '10px 0 0', maxWidth: 620, lineHeight: 1.55,
        }}>
          Perfil, vocacao, integracoes e canais. Voce decide como o atelier responde — a gente so afina.
        </p>
        <div aria-hidden style={{
          height: 1, marginTop: 16,
          background: 'linear-gradient(90deg, var(--accent) 0%, rgba(191,166,142,0.16) 26%, transparent 100%)',
          opacity: 0.85,
        }} />
      </header>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => {
          const TabIcon = t.Icon
          return (
            <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => { setTab(t.id); setMsg(''); setErro(''); setContatoEnviado(false) }}>
              <TabIcon size={14} strokeWidth={1.75} aria-hidden style={{ marginRight: 6 }} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ── Perfil ── */}
      {tab === 'perfil' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Avatar */}
          <div className="section-card" style={{ padding:'20px 24px' }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Foto de Perfil</div>
            <div style={{ display:'flex', alignItems:'center', gap:20 }}>
              <div style={{ position:'relative' }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" style={{ width:72, height:72, borderRadius:'50%', objectFit:'cover', border:'3px solid var(--border)' }} />
                ) : (
                  <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#8a6f55 0%,#bfa68e 60%,#e6d4bd 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-playfair), "Playfair Display", Georgia, serif', fontStyle:'italic', fontSize:28, fontWeight:400, color:'var(--bg-base)', border:'3px solid rgba(191,166,142,0.25)', boxShadow:'0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25)' }}>
                    {iniciais}
                  </div>
                )}
                {avatarLoading && (
                  <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'var(--shadow-md)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <RotateCw size={18} strokeWidth={1.75} aria-hidden style={{ color:'#fff' }} />
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', marginBottom:4 }}>
                  {nome || 'Seu nome'}
                </div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:10 }}>{email}</div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatar} />
                <button className="btn-ghost" style={{ fontSize:12, padding:'6px 12px', display:'flex', alignItems:'center', gap:6 }}
                  onClick={() => fileRef.current?.click()}>
                  <Camera size={14} strokeWidth={1.75} aria-hidden /> Alterar foto
                </button>
              </div>
            </div>
          </div>

          {/* Dados */}
          <div className="section-card" style={{ padding:'20px 24px' }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Informações Pessoais</div>
            <form onSubmit={salvarPerfil} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {msg  && <div style={{ padding:'10px 14px', borderRadius:8, background:'var(--accent-light)', color:'var(--accent)', fontSize:13, display:'flex', alignItems:'center', gap:8 }}><CheckCircle2 size={14} strokeWidth={1.75} aria-hidden /> {msg}</div>}
              {erro && <div style={{ padding:'10px 14px', borderRadius:8, background:'var(--danger-light)', color:'var(--danger)', fontSize:13, display:'flex', alignItems:'center', gap:8 }}><AlertCircle size={14} strokeWidth={1.75} aria-hidden /> {erro}</div>}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:14 }}>
                <div>
                  <label className="form-label">Nome completo</label>
                  <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input type="email" value={email} className="form-input" disabled style={{ opacity:0.6, cursor:'not-allowed' }} />
                </div>
                <div>
                  <label className="form-label">Telefone</label>
                  <input type="tel" value={telefone}
                    onChange={e => setTelefone(maskTel(e.target.value))}
                    placeholder="(11) 99999-9999" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Escritório</label>
                  <input type="text" value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Nome da instituição" className="form-input" />
                </div>
              </div>
              <div style={{ paddingTop:8, borderTop:'1px solid var(--border)' }}>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? <><RotateCw size={14} strokeWidth={1.75} aria-hidden /> Salvando...</> : <><Check size={14} strokeWidth={1.75} aria-hidden /> Salvar alterações</>}
                </button>
              </div>
            </form>
          </div>

          {/* ── Consulta de CEP (BrasilAPI/ViaCEP) ── */}
          <div className="section-card" style={{ padding: '18px 22px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={14} strokeWidth={1.75} aria-hidden />Consulta de CEP
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: cepResult ? 12 : 0 }}>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                value={cepInput}
                onChange={handleCepInputChange}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCepLookup() } }}
                placeholder="00000-000"
                maxLength={9}
                className="form-input"
                style={{ flex: 1, maxWidth: 200 }}
              />
              <button type="button" onClick={handleCepLookup} disabled={cepLoading} className="btn-ghost">
                {cepLoading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
            {cepResult && (
              <div style={{ padding: '10px 12px', background: 'var(--hover)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                <strong>{cepResult.logradouro}</strong><br />
                {cepResult.bairro} — {cepResult.cidade}/{cepResult.uf} — CEP {cepResult.cep}
              </div>
            )}
            {cepError && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>{cepError}</div>}
          </div>
        </div>
      )}

      {/* ── Preferências ── */}
      {tab === 'preferencias' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="section-card" style={{ padding:'20px 24px' }}>
            <AreaSelector />
          </div>

          {/* ───────── Tom de voz da IA ───────── */}
          <div className="section-card" style={{ padding:'20px 24px' }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Tom da IA</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:10 }}>
              {([
                { id:'parceiro', label:'Parceiro', sub:'Caloroso, técnico, direto' },
                { id:'profissional', label:'Profissional', sub:'Formal, períodos curtos' },
                { id:'casual', label:'Casual', sub:'Linguagem do dia a dia' },
              ] as const).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  disabled={prefsLoading}
                  onClick={() => updatePrefs({ tom: opt.id })}
                  style={{
                    textAlign:'left',
                    padding:'12px 14px',
                    borderRadius:10,
                    border:'1px solid ' + (prefs.tom === opt.id ? 'var(--accent)' : 'var(--border)'),
                    background: prefs.tom === opt.id ? 'var(--accent-light)' : 'var(--card-bg)',
                    color:'var(--text-primary)',
                    cursor: prefsLoading ? 'wait' : 'pointer',
                    transition:'all 0.18s ease',
                  }}
                >
                  <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{opt.label}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{opt.sub}</div>
                </button>
              ))}
            </div>
            <div style={{ marginTop:10, fontSize:11, color:'var(--text-muted)' }}>
              Aplica-se a TODOS os 21 agentes — Chat, Consultor, Parecerista, etc.
            </div>
          </div>

          {/* ───────── Memória & sugestões inteligentes ───────── */}
          <div className="section-card" style={{ padding:'20px 24px' }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Memória cross-agent</div>

            {/* Toggle smart suggestions */}
            <label style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 14px', borderRadius:10, border:'1px solid var(--border)', background:'var(--card-bg)', cursor:'pointer', marginBottom:10 }}>
              <input
                type="checkbox"
                checked={prefs.smart_suggestions}
                disabled={prefsLoading}
                onChange={(e) => updatePrefs({ smart_suggestions: e.target.checked })}
                style={{ width:18, height:18, accentColor:'var(--accent)' }}
              />
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>Sugestões inteligentes</div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                  O Chat sugere o próximo agente com base no que você acabou de fazer (ex: depois do Resumidor, oferece Risco)
                </div>
              </div>
            </label>

            {/* Toggle memory enabled */}
            <label style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 14px', borderRadius:10, border:'1px solid var(--border)', background:'var(--card-bg)', cursor:'pointer', marginBottom:10 }}>
              <input
                type="checkbox"
                checked={prefs.memory_enabled}
                disabled={prefsLoading}
                onChange={(e) => updatePrefs({ memory_enabled: e.target.checked })}
                style={{ width:18, height:18, accentColor:'var(--accent)' }}
              />
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>Memória ativa</div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                  {memoryCount === null ? 'Carregando…' : `${memoryCount} ${memoryCount === 1 ? 'interação memorizada' : 'interações memorizadas'} · auto-expira em 90 dias`}
                </div>
              </div>
            </label>

            {/* Purge button + LGPD note */}
            <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap', marginTop:6 }}>
              <button
                type="button"
                onClick={handleMemoryPurge}
                disabled={memoryPurging || memoryCount === 0 || memoryCount === null}
                style={{
                  padding:'10px 16px',
                  borderRadius:8,
                  border:'1px solid var(--border)',
                  background:'transparent',
                  color: memoryCount && memoryCount > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize:12,
                  fontWeight:600,
                  cursor: memoryPurging || !memoryCount ? 'not-allowed' : 'pointer',
                  opacity: memoryPurging ? 0.6 : 1,
                  transition:'all 0.18s ease',
                }}
              >
                {memoryPurging ? 'Limpando…' : 'Limpar memória agora'}
              </button>
              <div style={{ fontSize:11, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:6 }}>
                <ShieldCheck size={13} strokeWidth={1.75} aria-hidden />
                LGPD Art. 18 — sua memória é privada, nunca treina modelo público
              </div>
            </div>
          </div>

          <div className="section-card" style={{ padding:'20px 24px' }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Aparência</div>
            <div style={{
              display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:10,
              border:'1px solid var(--border)', background:'var(--accent-light)',
            }}>
              <div style={{
                width:36, height:36, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
                background:'var(--accent)', color:'#fff',
              }}>
                <Moon size={16} strokeWidth={1.75} aria-hidden />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>Interface editorial noir</div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                  Tema fixo · paleta champagne sobre noir calibrada para leitura jurídica prolongada
                </div>
              </div>
              <CheckCircle2 size={18} strokeWidth={1.75} aria-hidden style={{ color:'var(--accent)' }} />
            </div>
          </div>

          {/* ───────── PLANO ATIVO · editorial atelier (v10.12) ─────────
           * Mesma vocabulário do /dashboard/planos e LexPricingGrid:
           * mono champagne label + Playfair italic nome + hairline rule
           * + tabular-nums preço + ações em ghost button.
           * ─────────────────────────────────────────────────────────── */}
          <div
            className="section-card"
            style={{
              padding: 'clamp(20px, 4vw, 28px) clamp(20px, 4vw, 32px)',
              background:
                'radial-gradient(120% 100% at 50% 0%, rgba(191,166,142,0.08), transparent 68%), var(--card-bg)',
              border: '1px solid var(--stone-line)',
              borderRadius: 18,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* serial + capítulo */}
            <div
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 10,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                marginBottom: 14,
              }}
            >
              N° VII · PLANO ATIVO
            </div>

            {/* grid 2-col: identidade + preço */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: 24,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                    fontSize: 'clamp(26px, 5vw, 34px)',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    lineHeight: 1.04,
                    background: 'linear-gradient(180deg, #f5e8d3 0%, #bfa68e 60%, #8a6f55 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {planoAtual.nome}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Renovação automática · cancele 1 clique
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: 'clamp(28px, 5.5vw, 36px)',
                    fontWeight: 300,
                    color: 'var(--text-primary)',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.01em',
                    lineHeight: 1,
                  }}
                >
                  R$ {planoAtual.preco.toLocaleString('pt-BR')}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                  }}
                >
                  Por advogado / mês
                </div>
              </div>
            </div>

            {/* hairline gold */}
            <div
              style={{
                margin: '24px 0 20px',
                height: 1,
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(191,166,142,0.35) 50%, transparent 100%)',
              }}
            />

            {/* ações */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => (window.location.href = '/dashboard/planos')}
                style={{
                  flex: 1,
                  minWidth: 180,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 18px',
                  borderRadius: 999,
                  border: '1px solid var(--stone)',
                  background:
                    'linear-gradient(180deg, rgba(191,166,142,0.12) 0%, rgba(191,166,142,0.04) 100%)',
                  color: 'var(--text-primary)',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.background =
                    'linear-gradient(180deg, rgba(191,166,142,0.22) 0%, rgba(191,166,142,0.08) 100%)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--stone)'
                  e.currentTarget.style.background =
                    'linear-gradient(180deg, rgba(191,166,142,0.12) 0%, rgba(191,166,142,0.04) 100%)'
                }}
              >
                <ArrowUpCircle size={13} strokeWidth={1.75} aria-hidden />
                Gerenciar plano
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/stripe/portal', { method: 'POST' })
                    const data = (await res.json()) as { url?: string }
                    if (data.url) window.location.href = data.url
                    else {
                      setErro('Não foi possível abrir o portal de faturas.')
                      setTimeout(() => setErro(''), 3500)
                    }
                  } catch {
                    setErro('Erro ao abrir portal.')
                    setTimeout(() => setErro(''), 3500)
                  }
                }}
                style={{
                  flex: 1,
                  minWidth: 180,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 18px',
                  borderRadius: 999,
                  border: '1px solid var(--border)',
                  background: 'var(--card-bg)',
                  color: 'var(--text-primary)',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--stone)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
              >
                <Receipt size={13} strokeWidth={1.75} aria-hidden />
                Ver faturas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aba Integrações removida temporariamente — toggles ainda nao tem
          handlers reais wired (Google Calendar/WhatsApp/Drive/Notion/Telegram).
          Reentra quando os adapters existirem. */}

      {/* ── Contato ── */}
      {tab === 'contato' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="section-card" style={{ padding:'20px 24px' }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Canais de Atendimento</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:10 }}>
              {[
                { Icon: Mail,  color:'#4f46e5', bg:'#eef2ff', label:'Email',     value:'contato@pralvex.com.br', href:'mailto:contato@pralvex.com.br' },
              ].map(ch => {
                const ChIcon = ch.Icon
                return (
                  <a key={ch.label} href={ch.href} target="_blank" rel="noopener noreferrer" style={{
                    display:'flex', alignItems:'center', gap:12, padding:'14px', borderRadius:10,
                    border:'1px solid var(--border)', textDecoration:'none', color:'inherit', transition:'all 0.15s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <div style={{ width:38, height:38, borderRadius:10, background:ch.bg, color:ch.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <ChIcon size={18} strokeWidth={1.75} aria-hidden />
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{ch.label}</div>
                      <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:1 }}>{ch.value}</div>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>

          <div className="section-card" style={{ padding:'20px 24px' }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Enviar Mensagem</div>
            {contatoEnviado ? (
              <div style={{ textAlign:'center', padding:'30px 0' }}>
                <CheckCircle2 size={40} strokeWidth={1.75} aria-hidden style={{ color:'var(--accent)', display:'block', margin:'0 auto 12px' }} />
                <div style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)' }}>Mensagem enviada!</div>
                <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>Retornaremos em até 24 horas úteis.</div>
                <button className="btn-ghost" style={{ marginTop:16 }} onClick={() => setContatoEnviado(false)}>Enviar outra mensagem</button>
              </div>
            ) : (
              <form onSubmit={enviarContato} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <label className="form-label">Assunto</label>
                  <select value={assunto} onChange={e => setAssunto(e.target.value)} className="form-input" required>
                    <option value="">Selecione...</option>
                    <option>Dúvida sobre funcionalidade</option>
                    <option>Problema técnico</option>
                    <option>Sugestão de melhoria</option>
                    <option>Cancelamento / Reembolso</option>
                    <option>Parceria comercial</option>
                    <option>Outros</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Mensagem</label>
                  <textarea value={mensagem} onChange={e => setMensagem(e.target.value)}
                    placeholder="Descreva sua dúvida ou problema em detalhes..." className="form-input"
                    style={{ resize:'vertical', minHeight:120 }} required />
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:8, borderTop:'1px solid var(--border)' }}>
                  <div style={{ fontSize:12, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:6 }}>
                    <ShieldCheck size={14} strokeWidth={1.75} aria-hidden style={{ color:'var(--accent)' }} /> Mensagem confidencial e segura
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? <><RotateCw size={14} strokeWidth={1.75} aria-hidden /> Enviando...</> : <><Send size={14} strokeWidth={1.75} aria-hidden /> Enviar</>}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="section-card" style={{ padding:'16px 20px' }}>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:10 }}>Perguntas Frequentes</div>
            {[
              { q:'Como o agente resumidor funciona?', a:'Cole qualquer documento jurídico no campo de texto. A IA analisa com Claude (Anthropic) e retorna um resumo estruturado com pontos principais e riscos.' },
              { q:'Meus documentos ficam armazenados?', a:'Sim, todos os documentos ficam salvos em sua conta no Supabase com criptografia. Somente você tem acesso.' },
              { q:'Como alterar meu plano?', a:'Acesse a aba Preferências e clique em "Fazer upgrade" para ver os planos disponíveis.' },
            ].map((faq, i) => (
              <details key={i} style={{ borderBottom:'1px solid var(--border)' }}>
                <summary style={{ padding:'12px 0', cursor:'pointer', fontSize:13, fontWeight:600, color:'var(--text-primary)', listStyle:'none', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  {faq.q} <ChevronDown size={11} strokeWidth={1.75} aria-hidden style={{ color: 'var(--text-muted)' }} />
                </summary>
                <div style={{ paddingBottom:12, fontSize:13, color:'var(--text-secondary)', lineHeight:1.6 }}>{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

