'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

const DIAS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

const CORES_DISCIPLINA = [
  '#2d6a4f','#4f46e5','#e67e22','#c0392b','#0284c7','#7c3aed','#0f766e',
]

interface Compromisso {
  id: string; titulo: string; horario: string; local: string; disciplina: string; dia: number; cor: string
}

interface PlanoFuturo {
  id: string; data: string; titulo: string; descricao: string; cor: string
}

const EMPTY_LIST: Compromisso[] = []

const LS_COMPROMISSOS = 'lexai-rotina'
const LS_PLANOS = 'lexai-planos-futuros'
const LS_MIGRATED = 'lexai-rotina-migrated'

function formatDataISO(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dia}`
}

const EMPTY_COMP = { titulo:'', horario:'', local:'', disciplina:'', dia:1, cor:CORES_DISCIPLINA[0] }
const EMPTY_PLANO = { titulo:'', descricao:'', cor:CORES_DISCIPLINA[0] }

export default function RotinaPage() {
  const [compromissos, setCompromissos] = useState<Compromisso[]>(EMPTY_LIST)
  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState(EMPTY_COMP)
  const [hoje]              = useState(new Date())

  // Planejamento mensal
  const [planosFuturos, setPlanosFuturos] = useState<PlanoFuturo[]>([])
  const [mesVisivel, setMesVisivel]       = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1))
  const [dataSelecionada, setDataSelecionada] = useState<string | null>(null)
  const [planoForm, setPlanoForm]         = useState(EMPTY_PLANO)

  // Sincronização com Supabase
  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  const [sincronizando, setSincronizando] = useState(true)

  // Google Calendar connect state (stub)
  const [googleConnecting, setGoogleConnecting] = useState(false)
  const [gcalToast, setGcalToast] = useState<{ tipo: 'ok' | 'err' | 'info'; texto: string } | null>(null)

  // Carrega tudo no mount: resolve usuarios.id, migra localStorage se necessário, popula state
  useEffect(() => {
    let cancelled = false

    async function load() {
      const supabase = createClient()
      try {
        const { data: { user } } = await supabase.auth.getUser()

        // Sem auth → fallback para localStorage (graceful degradation)
        if (!user) {
          if (cancelled) return
          try {
            const saved = localStorage.getItem(LS_COMPROMISSOS)
            if (saved) setCompromissos(JSON.parse(saved))
          } catch (e) { console.error('[rotina] parse compromissos LS:', e) }
          try {
            const savedPlanos = localStorage.getItem(LS_PLANOS)
            if (savedPlanos) setPlanosFuturos(JSON.parse(savedPlanos))
          } catch (e) { console.error('[rotina] parse planos LS:', e) }
          setSincronizando(false)
          return
        }

        // Com auth → resolve usuarios.id
        const { data: usuario, error: usuarioErr } = await supabase
          .from('usuarios')
          .select('id')
          .eq('auth_user_id', user.id)
          .maybeSingle()

        if (usuarioErr) {
          console.error('[rotina] resolve usuarios.id:', usuarioErr)
          if (!cancelled) setSincronizando(false)
          return
        }
        if (!usuario) {
          // auth user existe mas usuarios row não — degrada para LS
          if (!cancelled) setSincronizando(false)
          return
        }

        if (cancelled) return
        setUsuarioId(usuario.id)

        // Migração one-shot: se existe LS e ainda não migrou, sobe pro Supabase e limpa
        const migrated = localStorage.getItem(LS_MIGRATED)
        if (!migrated) {
          try {
            const savedComps = localStorage.getItem(LS_COMPROMISSOS)
            if (savedComps) {
              const parsed: Compromisso[] = JSON.parse(savedComps)
              if (Array.isArray(parsed) && parsed.length > 0) {
                const rows = parsed.map(c => ({
                  usuario_id: usuario.id,
                  titulo: c.titulo,
                  horario: c.horario,
                  local: c.local,
                  disciplina: c.disciplina,
                  dia: c.dia,
                  cor: c.cor,
                }))
                const { error: insErr } = await supabase.from('rotina_compromissos').insert(rows)
                if (insErr) console.error('[rotina] migração compromissos:', insErr)
              }
            }
          } catch (e) { console.error('[rotina] migração compromissos parse:', e) }

          try {
            const savedPlanos = localStorage.getItem(LS_PLANOS)
            if (savedPlanos) {
              const parsed: PlanoFuturo[] = JSON.parse(savedPlanos)
              if (Array.isArray(parsed) && parsed.length > 0) {
                const rows = parsed.map(p => ({
                  usuario_id: usuario.id,
                  data: p.data,
                  titulo: p.titulo,
                  descricao: p.descricao,
                  cor: p.cor,
                  concluido: false,
                }))
                const { error: insErr } = await supabase.from('rotina_planos_futuros').insert(rows)
                if (insErr) console.error('[rotina] migração planos:', insErr)
              }
            }
          } catch (e) { console.error('[rotina] migração planos parse:', e) }

          try {
            localStorage.removeItem(LS_COMPROMISSOS)
            localStorage.removeItem(LS_PLANOS)
            localStorage.setItem(LS_MIGRATED, '1')
          } catch (e) { console.error('[rotina] limpa LS:', e) }
        }

        // Carrega do Supabase (RLS já filtra por usuario)
        const [compResp, planResp] = await Promise.all([
          supabase.from('rotina_compromissos').select('id, titulo, horario, local, disciplina, dia, cor'),
          supabase.from('rotina_planos_futuros').select('id, data, titulo, descricao, cor'),
        ])

        if (cancelled) return

        if (compResp.error) {
          console.error('[rotina] load compromissos:', compResp.error)
        } else if (compResp.data) {
          setCompromissos(compResp.data.map(r => ({
            id: String(r.id),
            titulo: r.titulo ?? '',
            horario: r.horario ?? '',
            local: r.local ?? '',
            disciplina: r.disciplina ?? '',
            dia: Number(r.dia ?? 0),
            cor: r.cor ?? CORES_DISCIPLINA[0],
          })))
        }

        if (planResp.error) {
          console.error('[rotina] load planos:', planResp.error)
        } else if (planResp.data) {
          setPlanosFuturos(planResp.data.map(r => ({
            id: String(r.id),
            data: r.data ?? '',
            titulo: r.titulo ?? '',
            descricao: r.descricao ?? '',
            cor: r.cor ?? CORES_DISCIPLINA[0],
          })))
        }
      } catch (e) {
        console.error('[rotina] load fatal:', e)
      } finally {
        if (!cancelled) setSincronizando(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  // Read ?google=... query param from OAuth callback and show a toast
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const status = params.get('google')
    if (!status) return
    if (status === 'connected') {
      setGcalToast({ tipo: 'ok', texto: 'Google Calendar conectado com sucesso.' })
    } else if (status === 'not_configured') {
      setGcalToast({ tipo: 'info', texto: 'Google Calendar nao configurado pelo admin.' })
    } else {
      setGcalToast({ tipo: 'err', texto: 'Falha ao conectar Google Calendar. Tente novamente.' })
    }
    // Clear the query param without reloading
    try {
      params.delete('google')
      const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '')
      window.history.replaceState({}, '', newUrl)
    } catch { /* noop */ }
    const timer = setTimeout(() => setGcalToast(null), 5000)
    return () => clearTimeout(timer)
  }, [])

  const conectarGoogleCalendar = useCallback(async () => {
    setGoogleConnecting(true)
    setGcalToast(null)
    try {
      const res = await fetch('/api/google/auth', { method: 'GET' })
      const data = await res.json().catch(() => ({}))
      if (res.status === 503) {
        setGcalToast({ tipo: 'info', texto: data?.error || 'Google Calendar nao configurado pelo admin.' })
        return
      }
      if (!res.ok || !data?.url) {
        setGcalToast({ tipo: 'err', texto: data?.error || 'Nao foi possivel iniciar a autenticacao.' })
        return
      }
      window.location.href = data.url
    } catch (e) {
      setGcalToast({ tipo: 'err', texto: e instanceof Error ? e.message : 'Erro desconhecido' })
    } finally {
      setGoogleConnecting(false)
    }
  }, [])

  // Persistência em LS quando não autenticado (fallback)
  useEffect(() => {
    if (sincronizando || usuarioId) return
    try { localStorage.setItem(LS_COMPROMISSOS, JSON.stringify(compromissos)) } catch (e) {
      console.error('[rotina] save compromissos LS:', e)
    }
  }, [compromissos, sincronizando, usuarioId])

  useEffect(() => {
    if (sincronizando || usuarioId) return
    try { localStorage.setItem(LS_PLANOS, JSON.stringify(planosFuturos)) } catch (e) {
      console.error('[rotina] save planos LS:', e)
    }
  }, [planosFuturos, sincronizando, usuarioId])

  const inicioSemana = new Date(hoje)
  inicioSemana.setDate(hoje.getDate() - hoje.getDay())

  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicioSemana)
    d.setDate(inicioSemana.getDate() + i)
    return d
  })

  const diaHoje = hoje.getDay()

  const salvar = useCallback(async () => {
    if (!form.titulo || !form.horario) return
    const localId = Date.now().toString()
    const otimista: Compromisso = { ...form, id: localId }

    if (!usuarioId) {
      setCompromissos(prev => [...prev, otimista])
      setModal(false); setForm(EMPTY_COMP)
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('rotina_compromissos')
        .insert({
          usuario_id: usuarioId,
          titulo: form.titulo,
          horario: form.horario,
          local: form.local,
          disciplina: form.disciplina,
          dia: form.dia,
          cor: form.cor,
        })
        .select('id, titulo, horario, local, disciplina, dia, cor')
        .single()

      if (error || !data) {
        console.error('[rotina] insert compromisso:', error)
        return
      }

      setCompromissos(prev => [...prev, {
        id: String(data.id),
        titulo: data.titulo ?? '',
        horario: data.horario ?? '',
        local: data.local ?? '',
        disciplina: data.disciplina ?? '',
        dia: Number(data.dia ?? 0),
        cor: data.cor ?? CORES_DISCIPLINA[0],
      }])
      setModal(false); setForm(EMPTY_COMP)
    } catch (e) {
      console.error('[rotina] insert compromisso fatal:', e)
    }
  }, [form, usuarioId])

  const remover = useCallback(async (id: string) => {
    if (!usuarioId) {
      setCompromissos(prev => prev.filter(c => c.id !== id))
      return
    }
    try {
      const supabase = createClient()
      const { error } = await supabase.from('rotina_compromissos').delete().eq('id', id)
      if (error) {
        console.error('[rotina] delete compromisso:', error)
        return
      }
      setCompromissos(prev => prev.filter(c => c.id !== id))
    } catch (e) {
      console.error('[rotina] delete compromisso fatal:', e)
    }
  }, [usuarioId])

  const compHoje = compromissos.filter(c => c.dia === diaHoje).sort((a,b) => a.horario.localeCompare(b.horario))

  // Grade do calendário mensal (42 células = 6 semanas)
  const primeiroDiaMes = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth(), 1)
  const diaSemanaInicio = primeiroDiaMes.getDay()
  const diasGrade = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(primeiroDiaMes)
    d.setDate(1 - diaSemanaInicio + i)
    return d
  })
  const hojeISO = formatDataISO(hoje)
  const mesAtualNum = mesVisivel.getMonth()

  function irMesAnterior() {
    setMesVisivel(new Date(mesVisivel.getFullYear(), mesVisivel.getMonth() - 1, 1))
    setDataSelecionada(null)
  }
  function irMesSeguinte() {
    setMesVisivel(new Date(mesVisivel.getFullYear(), mesVisivel.getMonth() + 1, 1))
    setDataSelecionada(null)
  }
  function irHoje() {
    setMesVisivel(new Date(hoje.getFullYear(), hoje.getMonth(), 1))
    setDataSelecionada(null)
  }

  function clicarData(d: Date) {
    const iso = formatDataISO(d)
    // só permite datas a partir de hoje
    if (iso < hojeISO) return
    setDataSelecionada(iso === dataSelecionada ? null : iso)
    setPlanoForm(EMPTY_PLANO)
  }

  const salvarPlano = useCallback(async () => {
    if (!dataSelecionada || !planoForm.titulo) return

    if (!usuarioId) {
      setPlanosFuturos(prev => [...prev, {
        id: Date.now().toString(),
        data: dataSelecionada,
        titulo: planoForm.titulo,
        descricao: planoForm.descricao,
        cor: planoForm.cor,
      }])
      setPlanoForm(EMPTY_PLANO)
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('rotina_planos_futuros')
        .insert({
          usuario_id: usuarioId,
          data: dataSelecionada,
          titulo: planoForm.titulo,
          descricao: planoForm.descricao,
          cor: planoForm.cor,
          concluido: false,
        })
        .select('id, data, titulo, descricao, cor')
        .single()

      if (error || !data) {
        console.error('[rotina] insert plano:', error)
        return
      }

      setPlanosFuturos(prev => [...prev, {
        id: String(data.id),
        data: data.data ?? '',
        titulo: data.titulo ?? '',
        descricao: data.descricao ?? '',
        cor: data.cor ?? CORES_DISCIPLINA[0],
      }])
      setPlanoForm(EMPTY_PLANO)
    } catch (e) {
      console.error('[rotina] insert plano fatal:', e)
    }
  }, [dataSelecionada, planoForm, usuarioId])

  const removerPlano = useCallback(async (id: string) => {
    if (!usuarioId) {
      setPlanosFuturos(prev => prev.filter(p => p.id !== id))
      return
    }
    try {
      const supabase = createClient()
      const { error } = await supabase.from('rotina_planos_futuros').delete().eq('id', id)
      if (error) {
        console.error('[rotina] delete plano:', error)
        return
      }
      setPlanosFuturos(prev => prev.filter(p => p.id !== id))
    } catch (e) {
      console.error('[rotina] delete plano fatal:', e)
    }
  }, [usuarioId])

  const planosDataSelecionada = dataSelecionada
    ? planosFuturos.filter(p => p.data === dataSelecionada)
    : []

  return (
    <div className="page-content" style={{ maxWidth: '100%' }}>
      {/* Banner */}
      <div className="agent-banner">
        <i className="bi bi-stars" />
        Organize seus compromissos da semana e planejamentos futuros. Tudo salvo automaticamente.
      </div>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="page-title">Rotina</h1>
          <p className="page-subtitle">Organize sua agenda semanal de aulas, estágios e compromissos</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          {sincronizando && (
            <span style={{ fontSize:12, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:6 }}>
              <i className="bi bi-arrow-repeat" style={{ animation:'spin 1s linear infinite', display:'inline-block' }} />
              Sincronizando...
            </span>
          )}
          <button className="btn-ghost" onClick={conectarGoogleCalendar} disabled={googleConnecting} type="button">
            <i className="bi bi-google" /> {googleConnecting ? 'Conectando...' : 'Conectar Google Calendar'}
          </button>
          <button className="btn-primary" onClick={() => setModal(true)}>
            <i className="bi bi-plus-lg" /> Novo Compromisso
          </button>
        </div>
      </div>

      {gcalToast && (
        <div style={{
          padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:16,
          background: gcalToast.tipo === 'ok' ? '#e8f5ee' : gcalToast.tipo === 'info' ? 'var(--accent-light)' : 'var(--danger-light)',
          color: gcalToast.tipo === 'ok' ? '#2d6a4f' : gcalToast.tipo === 'info' ? 'var(--text-secondary)' : 'var(--danger)',
          display:'flex', alignItems:'center', gap:8,
        }}>
          <i className={`bi ${gcalToast.tipo === 'ok' ? 'bi-check-circle-fill' : gcalToast.tipo === 'info' ? 'bi-info-circle' : 'bi-exclamation-triangle-fill'}`} />
          {gcalToast.texto}
        </div>
      )}

      {/* Cabeçalho da semana */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ fontSize:14, fontWeight:600, color:'var(--text-secondary)' }}>
          {MESES[inicioSemana.getMonth()]} {inicioSemana.getFullYear()}
        </div>
        <div style={{ fontSize:13, color:'var(--text-muted)' }}>Semana atual</div>
      </div>

      {/* Grade semanal */}
      <div className="rotina-week-grid" style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:8, marginBottom:28 }}>
        {dias.map((d, i) => {
          const isHoje = i === diaHoje
          const comps  = compromissos.filter(c => c.dia === i)
          return (
            <div key={i} style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {/* Dia header */}
              <div style={{ textAlign:'center', paddingBottom:8, borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{DIAS[i]}</div>
                <div style={{
                  width:30, height:30, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                  margin:'0 auto', fontSize:14, fontWeight:700,
                  background: isHoje ? 'var(--accent)' : 'transparent',
                  color: isHoje ? '#fff' : 'var(--text-primary)',
                }}>
                  {d.getDate()}
                </div>
              </div>
              {/* Compromissos do dia */}
              <div style={{ display:'flex', flexDirection:'column', gap:4, minHeight:60 }}>
                {comps.map(c => (
                  <div key={c.id} style={{
                    padding:'6px 8px', borderRadius:6, fontSize:11, lineHeight:1.3,
                    borderLeft:`3px solid ${c.cor}`,
                    background: `${c.cor}18`,
                    cursor:'default',
                  }}
                    title={`${c.horario} — ${c.local}`}>
                    <div style={{ fontWeight:600, color:'var(--text-primary)', marginBottom:2 }}>{c.titulo}</div>
                    <div style={{ color:'var(--text-muted)' }}>{c.horario}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Agenda de hoje */}
      <div className="section-card" style={{ padding:'18px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <i className="bi bi-calendar-day" style={{ color:'var(--accent)', fontSize:16 }} />
          <span style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>
            Hoje — {DIAS[diaHoje]}, {hoje.getDate()} de {MESES[hoje.getMonth()]}
          </span>
        </div>
        {compHoje.length === 0 ? (
          <div style={{ textAlign:'center', padding:'30px 0', color:'var(--text-muted)', fontSize:13 }}>
            <i className="bi bi-sun" style={{ fontSize:24, display:'block', marginBottom:8, opacity:0.4 }} />
            Nenhum compromisso hoje
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {compHoje.map(c => (
              <div key={c.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 14px', borderRadius:10, background:'var(--hover)', borderLeft:`3px solid ${c.cor}` }}>
                <div style={{ textAlign:'center', minWidth:60 }}>
                  <div style={{ fontSize:13, fontWeight:700, color: c.cor, fontVariantNumeric:'tabular-nums' }}>{c.horario.split('–')[0]}</div>
                  <div style={{ fontSize:10, color:'var(--text-muted)' }}>{c.horario.split('–')[1] ?? ''}</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)', marginBottom:2 }}>{c.titulo}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:8 }}>
                    <span><i className="bi bi-geo-alt" style={{ marginRight:3 }}/>{c.local}</span>
                    <span style={{ padding:'1px 7px', borderRadius:20, background:`${c.cor}20`, color:c.cor, fontSize:11, fontWeight:600 }}>{c.disciplina}</span>
                  </div>
                </div>
                <button onClick={() => remover(c.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:14, padding:'4px 6px', borderRadius:6 }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color='var(--danger)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color='var(--text-muted)'}>
                  <i className="bi bi-trash3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Planejamento Mensal */}
      <div className="section-card" style={{ padding:'18px 20px', marginTop:32 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <i className="bi bi-calendar3" style={{ color:'var(--accent)', fontSize:16 }} />
          <span style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>
            Planejamento Mensal
          </span>
        </div>

        {/* Header com navegação */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, gap:8 }}>
          <button onClick={irMesAnterior} style={{
            background:'none', border:'1px solid var(--border)', cursor:'pointer',
            color:'var(--text-secondary)', width:32, height:32, borderRadius:8,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background='var(--hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background='transparent'}
            aria-label="Mês anterior">
            <i className="bi bi-chevron-left" />
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, justifyContent:'center' }}>
            <span style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>
              {MESES[mesVisivel.getMonth()]} {mesVisivel.getFullYear()}
            </span>
            <button onClick={irHoje} style={{
              fontSize:11, padding:'4px 10px', borderRadius:6,
              border:'1px solid var(--border)', background:'transparent',
              color:'var(--text-secondary)', cursor:'pointer', fontWeight:600,
            }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background='var(--hover)'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background='transparent'}>
              Hoje
            </button>
          </div>

          <button onClick={irMesSeguinte} style={{
            background:'none', border:'1px solid var(--border)', cursor:'pointer',
            color:'var(--text-secondary)', width:32, height:32, borderRadius:8,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background='var(--hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background='transparent'}
            aria-label="Próximo mês">
            <i className="bi bi-chevron-right" />
          </button>
        </div>

        {/* Cabeçalho dos dias da semana */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:6 }}>
          {DIAS.map(d => (
            <div key={d} style={{
              textAlign:'center', fontSize:10, fontWeight:700, color:'var(--text-muted)',
              textTransform:'uppercase', padding:'6px 0',
            }}>{d}</div>
          ))}
        </div>

        {/* Grade do calendário */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
          {diasGrade.map((d, i) => {
            const iso = formatDataISO(d)
            const ehMesAtual = d.getMonth() === mesAtualNum
            const ehHoje = iso === hojeISO
            const ehPassado = iso < hojeISO
            const ehSelecionada = iso === dataSelecionada
            const planosDoDia = planosFuturos.filter(p => p.data === iso)
            return (
              <button
                key={i}
                onClick={() => clicarData(d)}
                disabled={ehPassado}
                style={{
                  aspectRatio:'1 / 1',
                  minHeight:44,
                  border: ehSelecionada
                    ? '2px solid var(--accent)'
                    : '1px solid var(--border)',
                  borderRadius:8,
                  background: ehHoje
                    ? 'var(--accent)'
                    : ehSelecionada
                      ? 'var(--hover)'
                      : 'transparent',
                  color: ehHoje
                    ? '#fff'
                    : ehMesAtual
                      ? 'var(--text-primary)'
                      : 'var(--text-muted)',
                  opacity: ehPassado && !ehHoje ? 0.35 : ehMesAtual ? 1 : 0.5,
                  cursor: ehPassado ? 'not-allowed' : 'pointer',
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  fontSize:13, fontWeight: ehHoje ? 700 : 500,
                  position:'relative', padding:4,
                  transition:'background 0.15s',
                }}
                onMouseEnter={e => {
                  if (!ehPassado && !ehHoje && !ehSelecionada) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--hover)'
                  }
                }}
                onMouseLeave={e => {
                  if (!ehPassado && !ehHoje && !ehSelecionada) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                  }
                }}
              >
                <span>{d.getDate()}</span>
                {planosDoDia.length > 0 && (
                  <div style={{ display:'flex', gap:2, marginTop:2, position:'absolute', bottom:4 }}>
                    {planosDoDia.slice(0, 3).map(p => (
                      <span key={p.id} style={{
                        width:5, height:5, borderRadius:'50%', background:p.cor,
                      }} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Expansão inline: detalhe / adicionar plano para data selecionada */}
        {dataSelecionada && (
          <div style={{
            marginTop:16, padding:'14px 16px', borderRadius:10,
            background:'var(--hover)', border:'1px solid var(--border)',
          }}>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', marginBottom:12 }}>
              <i className="bi bi-calendar-event" style={{ marginRight:6, color:'var(--accent)' }} />
              {(() => {
                const [y, m, d] = dataSelecionada.split('-').map(Number)
                const dt = new Date(y, m - 1, d)
                return `${DIAS[dt.getDay()]}, ${dt.getDate()} de ${MESES[dt.getMonth()]} ${dt.getFullYear()}`
              })()}
            </div>

            {/* Planos existentes da data */}
            {planosDataSelecionada.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:12 }}>
                {planosDataSelecionada.map(p => (
                  <div key={p.id} style={{
                    display:'flex', alignItems:'center', gap:10,
                    padding:'10px 12px', borderRadius:8,
                    background:'var(--bg, transparent)',
                    border:'1px solid var(--border)',
                    borderLeft:`3px solid ${p.cor}`,
                  }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:13, color:'var(--text-primary)', marginBottom:2 }}>{p.titulo}</div>
                      {p.descricao && (
                        <div style={{ fontSize:12, color:'var(--text-muted)' }}>{p.descricao}</div>
                      )}
                    </div>
                    <button onClick={() => removerPlano(p.id)} style={{
                      background:'none', border:'none', cursor:'pointer',
                      color:'var(--text-muted)', fontSize:13, padding:'4px 6px', borderRadius:6,
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color='var(--danger)'}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color='var(--text-muted)'}
                      aria-label="Remover plano">
                      <i className="bi bi-x-lg" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Form inline para novo plano */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase' }}>
                Novo plano
              </div>
              <input
                type="text"
                value={planoForm.titulo}
                onChange={e => setPlanoForm(f => ({ ...f, titulo:e.target.value }))}
                placeholder="Título do plano"
                className="form-input"
              />
              <input
                type="text"
                value={planoForm.descricao}
                onChange={e => setPlanoForm(f => ({ ...f, descricao:e.target.value }))}
                placeholder="Descrição (opcional)"
                className="form-input"
              />
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, marginRight:4 }}>Cor:</span>
                {CORES_DISCIPLINA.map(cor => (
                  <button key={cor} type="button" onClick={() => setPlanoForm(f => ({ ...f, cor }))} style={{
                    width:22, height:22, borderRadius:'50%', background:cor, border:'none', cursor:'pointer',
                    outline: planoForm.cor === cor ? `2px solid ${cor}` : '2px solid transparent',
                    outlineOffset:2,
                  }} aria-label={`Cor ${cor}`} />
                ))}
              </div>
              <div style={{ display:'flex', gap:8, marginTop:4 }}>
                <button type="button" className="btn-ghost" style={{ flex:1 }}
                  onClick={() => { setDataSelecionada(null); setPlanoForm(EMPTY_PLANO) }}>
                  Fechar
                </button>
                <button type="button" className="btn-primary"
                  disabled={!planoForm.titulo}
                  onClick={salvarPlano}
                  style={{ flex:1, justifyContent:'center' }}>
                  <i className="bi bi-plus-lg" /> Adicionar plano
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Novo Compromisso</span>
              <button className="modal-close" onClick={() => setModal(false)}><i className="bi bi-x" /></button>
            </div>
            <div className="modal-body">
              <div>
                <label className="form-label">Título *</label>
                <input type="text" value={form.titulo} onChange={e => setForm(f => ({...f, titulo:e.target.value}))}
                  placeholder="Ex: Direito Civil — Contratos" className="form-input" />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label className="form-label">Horário *</label>
                  <input type="text" value={form.horario} onChange={e => setForm(f => ({...f, horario:e.target.value}))}
                    placeholder="08:00–10:00" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Dia da Semana</label>
                  <select value={form.dia} onChange={e => setForm(f => ({...f, dia:Number(e.target.value)}))} className="form-input">
                    {DIAS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label className="form-label">Local</label>
                  <input type="text" value={form.local} onChange={e => setForm(f => ({...f, local:e.target.value}))}
                    placeholder="Sala 205" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Disciplina / Tipo</label>
                  <input type="text" value={form.disciplina} onChange={e => setForm(f => ({...f, disciplina:e.target.value}))}
                    placeholder="Civil, Penal, Estágio..." className="form-input" />
                </div>
              </div>
              <div>
                <label className="form-label">Cor</label>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {CORES_DISCIPLINA.map(cor => (
                    <button key={cor} onClick={() => setForm(f => ({...f, cor}))} style={{
                      width:28, height:28, borderRadius:'50%', background:cor, border:'none', cursor:'pointer',
                      outline: form.cor === cor ? `3px solid ${cor}` : '3px solid transparent',
                      outlineOffset:2,
                    }} />
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" style={{ flex:1 }} onClick={() => setModal(false)}>Cancelar</button>
                <button type="button" disabled={!form.titulo || !form.horario} onClick={salvar}
                  className="btn-primary" style={{ flex:1, justifyContent:'center' }}>
                  <i className="bi bi-check2" /> Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
