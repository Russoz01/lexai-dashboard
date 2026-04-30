/* ════════════════════════════════════════════════════════════════════
 * Site URL — fonte única de verdade
 * ────────────────────────────────────────────────────────────────────
 * Antes: 27+ hardcodes de https://pralvex.com.br espalhados em
 * canonicals, JSON-LD, sitemap, OG, emails, etc. Trocar de domínio
 * exigia find/replace no projeto inteiro e qualquer lugar esquecido
 * quebrava SEO ou link de email.
 *
 * Agora: importa SITE_URL daqui. Em prod o Vercel injeta
 * NEXT_PUBLIC_SITE_URL; em dev/preview cai no fallback.
 *
 * IMPORTANTE: setar `NEXT_PUBLIC_SITE_URL=https://<dominio-real>` no
 * Vercel (Production + Preview) antes do primeiro deploy de venda.
 * Sem isso o site funciona, mas SEO/sitemap/OG apontam pro fallback.
 * ═══════════════════════════════════════════════════════════════════ */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://pralvex.com.br'

/**
 * Helper pra montar URLs absolutas evitando barras duplicadas.
 *   absoluteUrl('/login')           => 'https://pralvex.com.br/login'
 *   absoluteUrl('/share/abc')       => 'https://pralvex.com.br/share/abc'
 */
export function absoluteUrl(path: string = '/'): string {
  const base = SITE_URL.replace(/\/$/, '')
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${base}${suffix}`
}
