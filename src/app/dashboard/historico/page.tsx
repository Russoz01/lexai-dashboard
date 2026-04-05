'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { MessageSquare, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'

interface HistoricoItem {
  id: string
  agente: string
  mensagem_usuario: string
  resposta_agente: string | null
  tokens_usados: number | null
  created_at: string
}

const AGENTE_CORES: Record<string, string> = {
  resumidor:    'bg-blue-500/20 text-blue-400',
  prazos:       'bg-amber-500/20 text-amber-400',
  redator:      'bg-purple-500/20 text-purple-400',
  pesquisador:  'bg-emerald-500/20 text-emerald-400',
  financeiro:   'bg-green-500/20 text-green-400',
  rotina:       'bg-slate-500/20 text-slate-400',
  orquestrador: 'bg-brand-500/20 text-brand-400',
}

export default function HistoricoPage() {
  const supabase = createClient()
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expandido, setExpandido] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('historico')
      .select('*')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    setHistorico(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { carregar() }, [carregar])

  function formatarData(dt: string) {
    return new Date(dt).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-4 h-4 text-emerald-500" />
          <span className="text-emerald-400 text-sm font-medium">Registro de Atividades</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Histórico</h1>
        <p className="text-slate-400 mt-1">Todas as interações com os agentes de IA</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
        </div>
      ) : historico.length === 0 ? (
        <div className="card border-dashed border-slate-600/50 flex flex-col items-center justify-center py-16">
          <MessageSquare className="w-10 h-10 text-slate-600 mb-3" />
          <p className="text-slate-500">Nenhuma interação registrada ainda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {historico.map(item => (
            <div key={item.id} className="card">
              <button
                onClick={() => setExpandido(expandido === item.id ? null : item.id)}
                className="w-full flex items-start gap-3 text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={clsx('badge text-xs', AGENTE_CORES[item.agente] ?? 'bg-slate-500/20 text-slate-400')}>
                      {item.agente}
                    </span>
                    <span className="text-slate-500 text-xs">{formatarData(item.created_at)}</span>
                    {item.tokens_usados && (
                      <span className="text-slate-600 text-xs">{item.tokens_usados} tokens</span>
                    )}
                  </div>
                  <p className="text-slate-300 text-sm truncate">{item.mensagem_usuario}</p>
                </div>
                {expandido === item.id
                  ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                }
              </button>

              {expandido === item.id && item.resposta_agente && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide font-semibold">Resposta do agente</p>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {item.resposta_agente}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
