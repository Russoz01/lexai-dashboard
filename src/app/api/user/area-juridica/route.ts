import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isLegalAreaSlug } from '@/lib/agents/taxonomy'

export const dynamic = 'force-dynamic'

/**
 * GET /api/user/area-juridica
 * Retorna { slug: LegalAreaSlug | null } da area juridica padrao do advogado.
 * Usado pelo AreaSelector pra hidratar o estado inicial.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    }

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('area_juridica_padrao')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    return NextResponse.json({
      slug: usuario?.area_juridica_padrao ?? null,
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[api/user/area-juridica] GET error:', e)
    return NextResponse.json({ slug: null, error: 'internal' }, { status: 500 })
  }
}

/**
 * PATCH /api/user/area-juridica
 * Body: { slug: LegalAreaSlug | null }
 * Atualiza a area juridica padrao. Passa null pra desativar.
 */
export async function PATCH(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const slug = body?.slug ?? null

    // Valida: null (limpar) ou slug canonico
    if (slug !== null && !isLegalAreaSlug(slug)) {
      return NextResponse.json({ error: 'Area juridica invalida.' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ area_juridica_padrao: slug })
      .eq('auth_user_id', user.id)

    if (updateError) {
      // eslint-disable-next-line no-console
      console.error('[api/user/area-juridica] update error:', updateError.message)
      return NextResponse.json({ error: 'Erro ao salvar preferencia.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, slug })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[api/user/area-juridica] PATCH error:', e)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
