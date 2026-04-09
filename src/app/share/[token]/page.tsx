import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Private shared content — never index
export const metadata: Metadata = {
  title: 'Documento compartilhado — LexAI',
  description: 'Analise juridica compartilhada via LexAI.',
  robots: { index: false, follow: false, nocache: true },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Conteudo = any

interface SharedDoc {
  id: string
  token: string
  titulo: string
  conteudo: Conteudo
  tipo: string | null
  views: number | null
  expires_at: string
  created_at: string
}

/**
 * Public, unauthenticated Supabase client used for reading shared_documents.
 * RLS is expected to allow anonymous SELECT by token on this table.
 */
function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function fetchSharedDoc(token: string): Promise<SharedDoc | null> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('shared_documents')
      .select('id, token, titulo, conteudo, tipo, views, expires_at, created_at')
      .eq('token', token)
      .maybeSingle()

    if (error || !data) return null
    return data as SharedDoc
  } catch {
    return null
  }
}

/** Best-effort view counter. Never throws. */
async function incrementViews(id: string, current: number) {
  try {
    const supabase = createPublicClient()
    await supabase
      .from('shared_documents')
      .update({ views: (current || 0) + 1 })
      .eq('id', id)
  } catch {
    // silent
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function NotFoundView() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5EFE6',
      color: '#132025',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        background: '#FFFFFF',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: '16px',
        padding: '40px 32px',
        textAlign: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(239,68,68,0.08)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          color: '#EF4444',
          fontSize: '28px',
        }}>
          <i className="bi bi-link-45deg" />
        </div>
        <h1 style={{
          fontSize: '22px',
          fontWeight: 700,
          marginBottom: '10px',
          color: '#132025',
        }}>
          Link expirado ou nao encontrado
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#475569',
          lineHeight: 1.6,
          marginBottom: '24px',
        }}>
          Este documento compartilhado nao esta mais disponivel. Pode ter expirado ou o link esta incorreto.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 22px',
            background: '#bfa68e',
            color: '#FFFFFF',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.15s ease',
          }}
        >
          <i className="bi bi-arrow-left" /> Voltar para a LexAI
        </Link>
      </div>
    </div>
  )
}

export default async function SharedDocumentPage({
  params,
}: {
  params: { token: string }
}) {
  const token = params.token

  // Basic token sanity check (24 chars, alphanumeric from randomUUID)
  if (!token || typeof token !== 'string' || token.length < 16 || token.length > 64) {
    return <NotFoundView />
  }

  const doc = await fetchSharedDoc(token)
  if (!doc) return <NotFoundView />

  // Check expiration
  const expired = new Date(doc.expires_at).getTime() < Date.now()
  if (expired) return <NotFoundView />

  // Fire and forget view increment
  incrementViews(doc.id, doc.views || 0).catch(() => { /* silent */ })

  const analise = doc.conteudo || {}
  const objeto: string = analise.objeto || analise.resumo || analise.conclusao || ''
  const pontos: unknown[] = analise.pontos_principais || analise.pontos_chave || []
  const riscos: unknown[] = analise.riscos || []
  const prazos: unknown[] = analise.prazos_identificados || analise.prazos || []

  const expiresLabel = formatDate(doc.expires_at)
  const viewsCount = (doc.views || 0) + 1 // include this view

  return (
    <>
      {/* Bootstrap Icons for the share page (standalone, no layout dep) */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.css"
      />

      <div style={{
        minHeight: '100vh',
        background: '#F5EFE6',
        color: '#132025',
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        padding: '48px 24px',
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          {/* Header Card */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.06)',
            borderRadius: '16px',
            padding: '28px 32px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            {/* LexAI brand strip */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '14px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#bfa68e',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#bfa68e',
                display: 'inline-block',
              }} />
              Compartilhado via LexAI
            </div>

            <h1 style={{
              fontSize: '26px',
              fontWeight: 700,
              lineHeight: 1.3,
              marginBottom: '14px',
              color: '#132025',
            }}>
              {doc.titulo}
            </h1>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '14px',
              fontSize: '12px',
              color: '#64748B',
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <i className="bi bi-eye" />
                {viewsCount} {viewsCount === 1 ? 'visualizacao' : 'visualizacoes'}
              </span>
              <span style={{ color: '#CBD5E1' }}>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <i className="bi bi-calendar-event" />
                Disponivel ate {expiresLabel}
              </span>
              {doc.tipo && (
                <>
                  <span style={{ color: '#CBD5E1' }}>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <i className="bi bi-file-earmark-text" />
                    {doc.tipo}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Resumo / objeto */}
          {objeto && (
            <div style={{
              background: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: '16px',
              padding: '28px 32px',
              marginBottom: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#bfa68e',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}>
                <i className="bi bi-text-paragraph" style={{ marginRight: '6px' }} />
                Resumo Executivo
              </div>
              <p style={{
                fontSize: '15px',
                lineHeight: 1.75,
                color: '#1E293B',
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}>
                {String(objeto)}
              </p>
            </div>
          )}

          {/* Pontos principais */}
          {Array.isArray(pontos) && pontos.length > 0 && (
            <div style={{
              background: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: '16px',
              padding: '28px 32px',
              marginBottom: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#bfa68e',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                marginBottom: '14px',
              }}>
                <i className="bi bi-check-circle-fill" style={{ marginRight: '6px' }} />
                Pontos Principais
              </div>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
                {pontos.map((p, i) => (
                  <li key={i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    fontSize: '14px',
                    lineHeight: 1.65,
                    color: '#1E293B',
                  }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#bfa68e',
                      flexShrink: 0,
                      marginTop: '8px',
                    }} />
                    <span>{typeof p === 'string' ? p : JSON.stringify(p)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Riscos */}
          {Array.isArray(riscos) && riscos.length > 0 && (
            <div style={{
              background: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: '16px',
              padding: '28px 32px',
              marginBottom: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#F59E0B',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                marginBottom: '14px',
              }}>
                <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: '6px' }} />
                Riscos e Clausulas Importantes
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                {riscos.map((r, i) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const risco = r as any
                  const isObj = r && typeof r === 'object'
                  const descricao = isObj ? (risco.descricao || JSON.stringify(risco)) : String(r)
                  const gravidade = isObj ? risco.gravidade : null
                  const mitigacao = isObj ? risco.mitigacao : null
                  return (
                    <div key={i} style={{
                      padding: '16px 18px',
                      borderRadius: '10px',
                      background: 'rgba(245,158,11,0.06)',
                      border: '1px solid rgba(245,158,11,0.18)',
                    }}>
                      {gravidade && (
                        <span style={{
                          display: 'inline-block',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: '20px',
                          background: '#F59E0B',
                          color: '#FFFFFF',
                          marginBottom: '8px',
                          letterSpacing: '0.3px',
                        }}>
                          {String(gravidade).toUpperCase()}
                        </span>
                      )}
                      <div style={{
                        fontSize: '14px',
                        lineHeight: 1.6,
                        color: '#1E293B',
                        fontWeight: 500,
                      }}>
                        {descricao}
                      </div>
                      {mitigacao && (
                        <div style={{
                          marginTop: '8px',
                          fontSize: '13px',
                          color: '#64748B',
                          lineHeight: 1.5,
                        }}>
                          <strong>Mitigacao:</strong> {mitigacao}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Prazos */}
          {Array.isArray(prazos) && prazos.length > 0 && (
            <div style={{
              background: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: '16px',
              padding: '28px 32px',
              marginBottom: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#EF4444',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                marginBottom: '14px',
              }}>
                <i className="bi bi-calendar-event-fill" style={{ marginRight: '6px' }} />
                Prazos Identificados
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                {prazos.map((p, i) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const prazo = p as any
                  const isObj = p && typeof p === 'object'
                  const evento = isObj ? (prazo.evento || prazo.prazo || JSON.stringify(prazo)) : String(p)
                  const data = isObj ? prazo.data : null
                  const consequencia = isObj ? prazo.consequencia : null
                  return (
                    <div key={i} style={{
                      padding: '16px 18px',
                      borderRadius: '10px',
                      background: 'rgba(239,68,68,0.06)',
                      border: '1px solid rgba(239,68,68,0.18)',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        flexWrap: 'wrap',
                        marginBottom: data ? '6px' : 0,
                      }}>
                        <div style={{
                          fontSize: '14px',
                          lineHeight: 1.6,
                          color: '#1E293B',
                          fontWeight: 600,
                          flex: 1,
                        }}>
                          {evento}
                        </div>
                        {data && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: '20px',
                            background: '#EF4444',
                            color: '#FFFFFF',
                          }}>
                            {data}
                          </span>
                        )}
                      </div>
                      {consequencia && (
                        <div style={{
                          fontSize: '13px',
                          color: '#64748B',
                          lineHeight: 1.5,
                        }}>
                          <strong>Consequencia:</strong> {consequencia}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Footer CTA */}
          <div style={{
            background: 'linear-gradient(135deg, #bfa68e 0%, #a08970 100%)',
            borderRadius: '16px',
            padding: '32px',
            marginTop: '32px',
            textAlign: 'center',
            color: '#FFFFFF',
            boxShadow: '0 10px 25px rgba(191,166,142,0.28)',
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 700,
              marginBottom: '8px',
              lineHeight: 1.3,
            }}>
              Quer gerar suas proprias analises?
            </div>
            <p style={{
              fontSize: '14px',
              opacity: 0.92,
              marginBottom: '20px',
              lineHeight: 1.6,
            }}>
              Comece gratis na LexAI e analise contratos, peticoes e acordaos em segundos.
            </p>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 26px',
                background: '#FFFFFF',
                color: '#bfa68e',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'transform 0.15s ease',
              }}
            >
              Comece gratis na LexAI
              <i className="bi bi-arrow-right" />
            </Link>
          </div>

          {/* Tiny footer */}
          <div style={{
            textAlign: 'center',
            fontSize: '11px',
            color: '#94A3B8',
            marginTop: '24px',
          }}>
            Este documento foi gerado e compartilhado via LexAI. O conteudo e de responsabilidade do usuario que criou o compartilhamento.
          </div>
        </div>
      </div>
    </>
  )
}
