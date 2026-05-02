'use client'

import { createClient } from '@/lib/supabase'
import { resolveUsuarioId } from '@/lib/usuario'

export interface PrazoCandidato {
  evento?: string
  prazo?: string
  data?: string
  data_iso?: string | null
  consequencia?: string
  clausula?: string
  base_legal?: string
  prioridade?: 'alta' | 'media' | 'baixa' | string
}

export interface ImportarPrazosResultado {
  importados: number
  ignorados: number
  motivos: string[]
}

/**
 * Imports deadline candidates (extracted by the Resumidor AI) into the
 * public.prazos table for the current authenticated user.
 *
 * Candidates without an absolute ISO date (YYYY-MM-DD) or with past dates
 * are skipped and reported in `motivos`.
 */
export async function importarPrazos(
  candidatos: PrazoCandidato[],
  documentoTitulo: string,
): Promise<ImportarPrazosResultado> {
  const supabase = createClient()
  const usuarioId = await resolveUsuarioId()
  if (!usuarioId) {
    return {
      importados: 0,
      ignorados: candidatos.length,
      motivos: ['Usuario nao autenticado'],
    }
  }

  let importados = 0
  let ignorados = 0
  const motivos: string[] = []

  const hojeStart = new Date(new Date().toDateString())

  for (const c of candidatos) {
    const tituloBase = (c.evento || c.prazo || '').toString().trim()
    const label = tituloBase || 'Prazo sem titulo'

    if (!c.data_iso || !/^\d{4}-\d{2}-\d{2}$/.test(c.data_iso)) {
      ignorados++
      motivos.push(`"${label}" — sem data absoluta`)
      continue
    }

    // Skip past dates
    const dataLimite = new Date(c.data_iso)
    if (isNaN(dataLimite.getTime())) {
      ignorados++
      motivos.push(`"${label}" — data invalida`)
      continue
    }
    if (dataLimite < hojeStart) {
      ignorados++
      motivos.push(`"${label}" — data passada`)
      continue
    }

    const prioridade =
      c.prioridade === 'alta' || c.prioridade === 'media' || c.prioridade === 'baixa'
        ? c.prioridade
        : 'media'

    const descricaoParts = [
      c.consequencia ? `Consequencia: ${c.consequencia}` : null,
      (c.clausula || c.base_legal) ? `Ref: ${c.clausula || c.base_legal}` : null,
      documentoTitulo ? `De: ${documentoTitulo}` : null,
    ].filter(Boolean)

    const { error } = await supabase.from('prazos').insert({
      usuario_id: usuarioId,
      titulo: label.slice(0, 200),
      descricao: descricaoParts.join('\n') || null,
      data_limite: c.data_iso,
      prioridade,
      status: 'pendente',
      alerta_7dias: true,
      alerta_3dias: true,
      alerta_1dia: true,
    })

    if (error) {
      ignorados++
      motivos.push(`"${label}" — ${error.message}`)
    } else {
      importados++
    }
  }

  return { importados, ignorados, motivos }
}
