import { Resend } from 'resend'

const RESEND_KEY = process.env.RESEND_API_KEY
const FROM = process.env.RESEND_FROM_EMAIL || 'LexAI <onboarding@resend.dev>'

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
    console.warn('[email] RESEND_API_KEY not set — would have sent:', { to, subject })
    return { ok: false, reason: 'not-configured' }
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html })
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown'
    // eslint-disable-next-line no-console
    console.error('[email] send failed:', msg)
    return { ok: false, reason: msg }
  }
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
      <title>LexAI</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f6f8;">
        <tr>
          <td align="center" style="padding:40px 16px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.06);">
              <tr>
                <td style="padding:32px 32px 24px;border-bottom:1px solid #e5e7eb;">
                  <div style="font-size:24px;font-weight:800;color:#132025;letter-spacing:-0.5px;">LexAI</div>
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
                  <div>Voce esta recebendo este email porque criou uma conta na LexAI.</div>
                  <div style="margin-top:8px;">A LexAI e ferramenta de apoio. Decisoes juridicas devem ser revisadas por profissional habilitado OAB.</div>
                  <div style="margin-top:8px;">2026 LexAI &middot; LGPD Compliant</div>
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
  return baseTemplate(`
    <h1 style="font-size:22px;font-weight:800;color:#132025;margin:0 0 16px;letter-spacing:-0.3px;">Bem-vindo a LexAI, ${nome}!</h1>
    <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 20px;">Seu trial gratuito de <strong>7 dias</strong> esta ativo. Voce tem acesso a todos os 12 agentes IA, sem cobranca e sem precisar cadastrar cartao.</p>
    <div style="background:#f5efe6;border-left:4px solid #bfa68e;padding:14px 18px;border-radius:8px;margin:20px 0;">
      <div style="font-size:13px;font-weight:700;color:#44372b;margin-bottom:6px;">Comece pelo Resumidor</div>
      <div style="font-size:13px;color:#475569;line-height:1.5;">E o agente mais usado. Cole qualquer documento juridico e veja a magia acontecer em 45 segundos.</div>
    </div>
    <a href="https://lexai.com.br/dashboard/resumidor" style="display:inline-block;background:#bfa68e;color:#132025;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;margin-top:8px;">Acessar Dashboard</a>
    <p style="font-size:13px;color:#94a3b8;line-height:1.6;margin:24px 0 0;">Duvidas? Responda este email ou escreva para contato@vanixcorp.com.</p>
  `)
}

export function trialEndingEmailHtml(nome: string, daysLeft: number): string {
  return baseTemplate(`
    <h1 style="font-size:22px;font-weight:800;color:#132025;margin:0 0 16px;">${nome}, seu trial termina em ${daysLeft} dia${daysLeft === 1 ? '' : 's'}</h1>
    <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 20px;">Esperamos que voce esteja aproveitando os agentes da LexAI. Para continuar usando todos os 12 agentes, escolha um plano antes do trial expirar.</p>
    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:14px 18px;border-radius:8px;margin:20px 0;">
      <div style="font-size:13px;font-weight:700;color:#92400e;margin-bottom:6px;">Oferta de lancamento</div>
      <div style="font-size:13px;color:#78350f;line-height:1.5;">Plano anual com 16% de desconto. Garanta o preco fixo por 12 meses.</div>
    </div>
    <a href="https://lexai.com.br/dashboard/planos" style="display:inline-block;background:#132025;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;">Ver planos</a>
    <p style="font-size:13px;color:#94a3b8;line-height:1.6;margin:24px 0 0;">Sem cobranca automatica. Voce so paga se escolher um plano.</p>
  `)
}

export function paymentReceivedEmailHtml(nome: string, plano: string, valor: string): string {
  return baseTemplate(`
    <h1 style="font-size:22px;font-weight:800;color:#132025;margin:0 0 16px;">Pagamento confirmado, ${nome}!</h1>
    <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 20px;">Sua assinatura do plano <strong>${plano}</strong> esta ativa. Voce ja tem acesso completo a todos os agentes incluidos no plano.</p>
    <div style="background:#ecfdf5;border-left:4px solid #10b981;padding:14px 18px;border-radius:8px;margin:20px 0;">
      <div style="font-size:13px;font-weight:700;color:#065f46;margin-bottom:6px;">Detalhes do pagamento</div>
      <div style="font-size:13px;color:#047857;line-height:1.6;">Plano: ${plano}<br>Valor: ${valor}<br>Cobranca: mensal recorrente</div>
    </div>
    <a href="https://lexai.com.br/dashboard" style="display:inline-block;background:#bfa68e;color:#132025;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;">Ir para o Dashboard</a>
    <p style="font-size:13px;color:#94a3b8;line-height:1.6;margin:24px 0 0;">Gerencie sua assinatura, cancele ou baixe faturas em <strong>Configuracoes &gt; Pagamento</strong>.</p>
  `)
}
