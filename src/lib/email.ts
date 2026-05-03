import { Resend } from 'resend'
import { SITE_URL } from '@/lib/site-url'
import { safeLog } from '@/lib/safe-log'

const RESEND_KEY = process.env.RESEND_API_KEY
// Fallback usa @pralvex.com.br ao inves do sandbox @resend.dev — mas o
// envio so funciona se o dominio estiver verificado no Resend (vide DNS
// SPF/DKIM/DMARC no Cloudflare). Se RESEND_FROM_EMAIL nao estiver setado,
// emails caem em sendEmail catch e sao logados — nao quebram a request.
const FROM = process.env.RESEND_FROM_EMAIL || 'Pralvex <noreply@pralvex.com.br>'

const resend = RESEND_KEY ? new Resend(RESEND_KEY) : null

interface EmailParams {
  to: string
  subject: string
  html: string
}

/**
 * Send a transactional email via Resend.
 * No-op (logs only) if RESEND_API_KEY is not configured — never throws.
 */
export async function sendEmail({ to, subject, html }: EmailParams): Promise<{ ok: boolean; reason?: string }> {
  if (!resend) {
    // eslint-disable-next-line no-console
    safeLog.warn('[email] RESEND_API_KEY not set — would have sent:', { to, subject })
    return { ok: false, reason: 'not-configured' }
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html })
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown'
    // eslint-disable-next-line no-console
    safeLog.error('[email] send failed:', msg)
    return { ok: false, reason: msg }
  }
}

// ============================================================================
// Helper: HTML escape pra prevenir XSS persistente em templates
// (advogado registra perfil com nome '<script>...</script>',
//  email envia, recipient renderiza HTML => XSS)
// ============================================================================

function escapeHtml(unsafe: string | null | undefined): string {
  if (unsafe == null) return ''
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// ============================================================================
// Email templates
// ============================================================================

function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pralvex</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f6f8;">
        <tr>
          <td align="center" style="padding:40px 16px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.06);">
              <tr>
                <td style="padding:32px 32px 24px;border-bottom:1px solid #e5e7eb;">
                  <div style="font-size:24px;font-weight:800;color:#132025;letter-spacing:-0.5px;">Pralvex</div>
                  <div style="font-size:13px;color:#64748b;margin-top:4px;">IA para Direito brasileiro</div>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;">
                  ${content}
                </td>
              </tr>
              <tr>
                <td style="padding:24px 32px;border-top:1px solid #e5e7eb;background:#f9fafb;font-size:12px;color:#94a3b8;line-height:1.6;">
                  <div>Voce esta recebendo este email porque criou uma conta na Pralvex.</div>
                  <div style="margin-top:8px;">A Pralvex e ferramenta de apoio. Decisoes juridicas devem ser revisadas por profissional habilitado OAB.</div>
                  <div style="margin-top:8px;">2026 Pralvex &middot; LGPD Compliant</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

export function welcomeEmailHtml(nome: string): string {
  const safeNome = escapeHtml(nome)
  return baseTemplate(`
    <h1 style="font-size:22px;font-weight:800;color:#132025;margin:0 0 16px;letter-spacing:-0.3px;">Bem-vindo a Pralvex, ${safeNome}!</h1>
    <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 20px;">Sua demo de <strong>50 minutos</strong> esta ativa. Voce tem acesso a todos os 27 agentes IA — sem cobranca e sem precisar cadastrar cartao. Aproveite pra testar o que o gabinete entrega antes de assinar.</p>
    <div style="background:#f5efe6;border-left:4px solid #bfa68e;padding:14px 18px;border-radius:8px;margin:20px 0;">
      <div style="font-size:13px;font-weight:700;color:#44372b;margin-bottom:6px;">Comece pelo Resumidor</div>
      <div style="font-size:13px;color:#475569;line-height:1.5;">E o agente mais usado. Cole qualquer documento juridico e veja a magia acontecer em 45 segundos.</div>
    </div>
    <a href="${SITE_URL}/dashboard/resumidor" style="display:inline-block;background:#bfa68e;color:#132025;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;margin-top:8px;">Acessar Dashboard</a>
    <p style="font-size:13px;color:#94a3b8;line-height:1.6;margin:24px 0 0;">Duvidas? Responda este email ou escreva para contato@pralvex.com.br.</p>
  `)
}

export function trialEndingEmailHtml(nome: string, daysLeft: number): string {
  const safeNome = escapeHtml(nome)
  const safeDaysLeft = Number.isFinite(daysLeft) ? Math.floor(daysLeft) : 0
  return baseTemplate(`
    <h1 style="font-size:22px;font-weight:800;color:#132025;margin:0 0 16px;">${safeNome}, seu trial termina em ${safeDaysLeft} dia${safeDaysLeft === 1 ? '' : 's'}</h1>
    <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 20px;">Esperamos que voce esteja aproveitando os agentes da Pralvex. Para continuar usando todos os 27 agentes, escolha um plano antes do trial expirar.</p>
    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:14px 18px;border-radius:8px;margin:20px 0;">
      <div style="font-size:13px;font-weight:700;color:#92400e;margin-bottom:6px;">Oferta de lancamento</div>
      <div style="font-size:13px;color:#78350f;line-height:1.5;">Plano anual com 16% de desconto. Garanta o preco fixo por 12 meses.</div>
    </div>
    <a href="${SITE_URL}/dashboard/planos" style="display:inline-block;background:#132025;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;">Ver planos</a>
    <p style="font-size:13px;color:#94a3b8;line-height:1.6;margin:24px 0 0;">Sem cobranca automatica. Voce so paga se escolher um plano.</p>
  `)
}

export function inviteEmailHtml(
  invitedByName: string,
  equipeNome: string,
  acceptUrl: string,
): string {
  // CRITICO: invitedByName e equipeNome vem de input de usuario (perfil/nome de equipe).
  // Sem escape, atacante registra perfil com '<img src=x onerror=...>' e XSS roda
  // no Gmail/Outlook do convidado. acceptUrl e hex 64 chars (crypto.randomBytes), seguro.
  const safeInvitedBy = escapeHtml(invitedByName)
  const safeEquipe = escapeHtml(equipeNome)
  const safeUrl = escapeHtml(acceptUrl)
  return baseTemplate(`
    <h1 style="font-size:22px;font-weight:800;color:#132025;margin:0 0 16px;">Voce foi convidado para ${safeEquipe}</h1>
    <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 20px;"><strong>${safeInvitedBy}</strong> convidou voce para fazer parte da equipe <strong>${safeEquipe}</strong> na Pralvex &mdash; a IA juridica mais usada por escritorios brasileiros.</p>
    <div style="background:#f5efe6;border-left:4px solid #bfa68e;padding:14px 18px;border-radius:8px;margin:20px 0;">
      <div style="font-size:13px;font-weight:700;color:#44372b;margin-bottom:6px;">Ao aceitar o convite voce tera acesso a</div>
      <div style="font-size:13px;color:#475569;line-height:1.6;">&bull; Todos os agentes contratados no plano da equipe<br>&bull; Historico compartilhado (quando autorizado pelo admin)<br>&bull; Suporte prioritario atraves do admin da equipe</div>
    </div>
    <a href="${safeUrl}" style="display:inline-block;background:#bfa68e;color:#132025;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;">Aceitar convite</a>
    <p style="font-size:13px;color:#94a3b8;line-height:1.6;margin:24px 0 0;">Este convite expira em 7 dias. Se voce nao conhece quem te convidou, pode ignorar este email.</p>
  `)
}

/**
 * Thin wrapper: create + send invite email. Returns send result.
 */
export async function sendInviteEmail(params: {
  to: string
  invitedByName: string
  equipeNome: string
  acceptUrl: string
}) {
  return sendEmail({
    to: params.to,
    subject: `${params.invitedByName} te convidou para ${params.equipeNome} na Pralvex`,
    html: inviteEmailHtml(params.invitedByName, params.equipeNome, params.acceptUrl),
  })
}

// paymentReceivedEmailHtml removido em 2026-05-03 (review elite: 0 callers — Stripe webhook
// confirmation handled by Stripe-native receipt). Re-criar quando custom receipt for necessario.
