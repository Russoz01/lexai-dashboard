'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { resolveUsuarioId } from '@/lib/usuario'
import { useTheme } from '@/context/ThemeContext'

type Tab = 'perfil' | 'preferencias' | 'integracoes' | 'contato'

const INTEGRACOES = [
  {
    id: 'gcalendar', label: 'Google Calendar', icon: 'bi-calendar-event',
    desc: 'Sincronize prazos e compromissos com seu Google Calendar automaticamente.',
    color: '#4285F4', bg: '#eff6ff',
  },
  {
    id: 'whatsapp', label: 'WhatsApp', icon: 'bi-whatsapp',
    desc: 'Receba alertas de prazos e lembretes diretamente no WhatsApp.',
    color: '#25D366', bg: '#f0fdf4',
  },
  {
    id: 'gdrive', label: 'Google Drive', icon: 'bi-cloud',
    desc: 'Salve documentos analisados automaticamente no seu Drive.',
    color: '#0F9D58', bg: '#f0fdf4',
  },
  {
    id: 'email', label: 'Notificações por E-mail', icon: 'bi-envelope-fill',
    desc: 'Receba resumos semanais e alertas de prazos por e-mail.',
    color: '#4f46e5', bg: '#eef2ff',
  },
  {
    id: 'notion', label: 'Notion', icon: 'bi-journal-bookmark',
    desc: 'Exporte resumos e pesquisas diretamente para páginas do Notion.',
    color: '#000', bg: '#f8f8f8',
  },
  {
    id: 'telegram', label: 'Telegram', icon: 'bi-telegram',
    desc: 'Receba notificações e interaja com o agente via Telegram.',
    color: '#0088cc', bg: '#eff8ff',
  },
]

function maskTel(v: string) {
  v = v.replace(/\D/g, '').slice(0, 11)
  if (v.length <= 10) return v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  return v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
}

export default function ConfiguracoesPage() {
  const supabase = createClient()
  const { theme, toggleTheme } = useTheme()
  const fileRef = useRef<HTMLInputElement>(null)

  const [tab, setTab]         = useState<Tab>('perfil')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState('')
  const [erro, setErro]       = useState('')

  // Dynamic plan from localStorage
  const planoMap: Record<string, { nome: string; preco: number }> = {
    starter: { nome: 'Starter', preco: 59 },
    pro: { nome: 'Pro', preco: 119 },
    enterprise: { nome: 'Enterprise', preco: 239 },
  }
  const [planoId, setPlanoId] = useState('enterprise')
  useEffect(() => {
    const saved = localStorage.getItem('lexai-plano')
    if (saved && planoMap[saved]) setPlanoId(saved)
  }, [])
  const planoAtual = planoMap[planoId] || planoMap.enterprise

  // Perfil
  const [nome, setNome]       = useState('')
  const [telefone, setTelefone] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [email, setEmail]     = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarLoading, setAvatarLoading] = useState(false)

  // Integrações
  const [ativos, setAtivos]   = useState<Record<string, boolean>>({})

  // Contato
  const [assunto, setAssunto] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [contatoEnviado, setContatoEnviado] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      const meta = data.user.user_metadata
      setEmail(data.user.email ?? '')
      setNome(meta?.nome ?? meta?.full_name ?? '')
      setTelefone(meta?.telefone ?? '')
      setEmpresa(meta?.empresa ?? '')
      setAvatarUrl(meta?.avatar_url ?? '')
      setAtivos(meta?.integracoes ?? {})
    })
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

  async function toggleIntegracao(id: string) {
    const novo = { ...ativos, [id]: !ativos[id] }
    setAtivos(novo)
    await supabase.auth.updateUser({ data: { integracoes: novo } })
  }

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

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'perfil',       label: 'Perfil',        icon: 'bi-person'        },
    { id: 'preferencias', label: 'Preferências',  icon: 'bi-sliders'       },
    { id: 'integracoes',  label: 'Integrações',   icon: 'bi-plug'          },
    { id: 'contato',      label: 'Contato',        icon: 'bi-envelope'      },
  ]

  const iniciais = nome ? nome.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : email.slice(0,2).toUpperCase()

  return (
    <div className="page-content" style={{ maxWidth: '100%' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Configurações</h1>
        <p className="page-subtitle">Gerencie seu perfil, preferências e integrações</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => { setTab(t.id); setMsg(''); setErro(''); setContatoEnviado(false) }}>
            <i className={`bi ${t.icon}`} style={{ marginRight: 6 }} />
            {t.label}
          </button>
        ))}
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
                  <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#2d6a4f,#3d8b6a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:700, color:'#fff', border:'3px solid var(--border)' }}>
                    {iniciais}
                  </div>
                )}
                {avatarLoading && (
                  <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <i className="bi bi-arrow-repeat" style={{ color:'#fff', fontSize:18 }} />
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
                  <i className="bi bi-camera" /> Alterar foto
                </button>
              </div>
            </div>
          </div>

          {/* Dados */}
          <div className="section-card" style={{ padding:'20px 24px' }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Informações Pessoais</div>
            <form onSubmit={salvarPerfil} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {msg  && <div style={{ padding:'10px 14px', borderRadius:8, background:'var(--accent-light)', color:'var(--accent)', fontSize:13, display:'flex', alignItems:'center', gap:8 }}><i className="bi bi-check-circle-fill" /> {msg}</div>}
              {erro && <div style={{ padding:'10px 14px', borderRadius:8, background:'var(--danger-light)', color:'var(--danger)', fontSize:13, display:'flex', alignItems:'center', gap:8 }}><i className="bi bi-exclamation-circle-fill" /> {erro}</div>}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
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
                  <label className="form-label">Escritório / Faculdade</label>
                  <input type="text" value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Nome da instituição" className="form-input" />
                </div>
              </div>
              <div style={{ paddingTop:8, borderTop:'1px solid var(--border)' }}>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? <><i className="bi bi-arrow-repeat" /> Salvando...</> : <><i className="bi bi-check2" /> Salvar alterações</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Preferências ── */}
      {tab === 'preferencias' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="section-card" style={{ padding:'20px 24px' }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Aparência</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { value:'light', label:'Modo Claro',  icon:'bi-sun',  desc:'Interface clara para ambientes bem iluminados' },
                { value:'dark',  label:'Modo Escuro', icon:'bi-moon', desc:'Interface escura para reduzir o cansaço visual' },
              ].map(opt => (
                <div key={opt.value} onClick={() => { if (theme !== opt.value) toggleTheme() }} style={{
                  display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:10, cursor:'pointer',
                  border:`2px solid ${theme === opt.value ? 'var(--accent)' : 'var(--border)'}`,
                  background: theme === opt.value ? 'var(--accent-light)' : 'transparent',
                  transition:'all 0.15s',
                }}>
                  <div style={{ width:36, height:36, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
                    background: theme === opt.value ? 'var(--accent)' : 'var(--hover)',
                    color: theme === opt.value ? '#fff' : 'var(--text-secondary)' }}>
                    <i className={`bi ${opt.icon}`} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>{opt.label}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{opt.desc}</div>
                  </div>
                  {theme === opt.value && <i className="bi bi-check-circle-fill" style={{ color:'var(--accent)', fontSize:18 }} />}
                </div>
              ))}
            </div>
          </div>

          <div className="section-card" style={{ padding:'20px 24px' }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Plano Atual</div>
            <div style={{ background:'linear-gradient(135deg,var(--accent),#3d8b6a)', borderRadius:12, padding:'20px 24px', color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.8px', textTransform:'uppercase', opacity:0.8 }}>Plano ativo</div>
                <div style={{ fontSize:24, fontWeight:700, marginTop:4 }}>{planoAtual.nome}</div>
                <div style={{ fontSize:13, opacity:0.8, marginTop:2 }}>Renovacao automatica</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:28, fontWeight:700, fontVariantNumeric:'tabular-nums' }}>R$ {planoAtual.preco}</div>
                <div style={{ fontSize:12, opacity:0.75 }}>/mês</div>
              </div>
            </div>
            <div style={{ marginTop:14, display:'flex', gap:8 }}>
              <button className="btn-ghost" style={{ flex:1 }} onClick={() => window.location.href='/dashboard/planos'}><i className="bi bi-arrow-up-circle" /> Gerenciar plano</button>
              <button className="btn-ghost" style={{ flex:1 }} onClick={() => window.open('https://billing.stripe.com', '_blank')}><i className="bi bi-receipt" /> Ver faturas</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Integrações ── */}
      {tab === 'integracoes' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="section-card" style={{ padding:'20px 24px' }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Conectar Serviços</div>
            <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:18 }}>Ative integrações para estender as funcionalidades do LexAI com suas ferramentas favoritas.</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {INTEGRACOES.map(intg => (
                <div key={intg.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:10, border:'1px solid var(--border)', transition:'all 0.15s',
                  background: ativos[intg.id] ? 'var(--accent-light)' : 'var(--card-bg)' }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:intg.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:intg.color, flexShrink:0 }}>
                    <i className={`bi ${intg.icon}`} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)', marginBottom:2 }}>{intg.label}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>{intg.desc}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {ativos[intg.id] && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--success)', padding: '2px 8px', borderRadius: 10, background: 'var(--success-light)' }}>
                        Conectado
                      </span>
                    )}
                    {/* Toggle switch */}
                    <button onClick={() => toggleIntegracao(intg.id)} style={{
                      width:44, height:24, borderRadius:12, border:'none', cursor:'pointer', flexShrink:0,
                      background: ativos[intg.id] ? 'var(--accent)' : 'var(--border)',
                      position:'relative', transition:'background 0.2s',
                    }}>
                      <span style={{
                        position:'absolute', top:3, left: ativos[intg.id] ? 23 : 3,
                        width:18, height:18, borderRadius:'50%', background:'#fff',
                        transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)',
                      }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card" style={{ padding:'16px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <i className="bi bi-info-circle" style={{ color:'var(--accent)', fontSize:16 }} />
              <div style={{ fontSize:13, color:'var(--text-secondary)' }}>
                As integrações ainda estão em desenvolvimento. Ao ativar, você será avisado quando estiverem disponíveis.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Contato ── */}
      {tab === 'contato' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="section-card" style={{ padding:'20px 24px' }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Canais de Atendimento</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { icon:'bi-envelope-fill',  color:'#4f46e5', bg:'#eef2ff', label:'Email',     value:'luizfernandoleonardoleonardo@gmail.com', href:'mailto:luizfernandoleonardoleonardo@gmail.com' },
                { icon:'bi-whatsapp',       color:'#25D366', bg:'#f0fdf4', label:'WhatsApp',  value:'(34) 99302-6456',       href:'https://wa.me/5534993026456' },
              ].map(ch => (
                <a key={ch.label} href={ch.href} target="_blank" rel="noopener noreferrer" style={{
                  display:'flex', alignItems:'center', gap:12, padding:'14px', borderRadius:10,
                  border:'1px solid var(--border)', textDecoration:'none', color:'inherit', transition:'all 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div style={{ width:38, height:38, borderRadius:10, background:ch.bg, color:ch.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                    <i className={`bi ${ch.icon}`} />
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{ch.label}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:1 }}>{ch.value}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="section-card" style={{ padding:'20px 24px' }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Enviar Mensagem</div>
            {contatoEnviado ? (
              <div style={{ textAlign:'center', padding:'30px 0' }}>
                <i className="bi bi-check-circle-fill" style={{ fontSize:40, color:'var(--accent)', display:'block', marginBottom:12 }} />
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
                    <i className="bi bi-shield-check" style={{ color:'var(--accent)' }} /> Mensagem confidencial e segura
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? <><i className="bi bi-arrow-repeat" /> Enviando...</> : <><i className="bi bi-send" /> Enviar</>}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="section-card" style={{ padding:'16px 20px' }}>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:10 }}>Perguntas Frequentes</div>
            {[
              { q:'Como o agente resumidor funciona?', a:'Cole qualquer documento jurídico no campo de texto. A IA analisa com Gemini e retorna um resumo estruturado com pontos principais e riscos.' },
              { q:'Meus documentos ficam armazenados?', a:'Sim, todos os documentos ficam salvos em sua conta no Supabase com criptografia. Somente você tem acesso.' },
              { q:'Como alterar meu plano?', a:'Acesse a aba Preferências e clique em "Fazer upgrade" para ver os planos disponíveis.' },
            ].map((faq, i) => (
              <details key={i} style={{ borderBottom:'1px solid var(--border)' }}>
                <summary style={{ padding:'12px 0', cursor:'pointer', fontSize:13, fontWeight:600, color:'var(--text-primary)', listStyle:'none', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  {faq.q} <i className="bi bi-chevron-down" style={{ fontSize:11, color:'var(--text-muted)' }} />
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
