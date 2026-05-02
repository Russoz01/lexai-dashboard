import { ImageResponse } from 'next/og'

/* Pralvex App Icon — 512x512 PNG pra upload em Google OAuth consent screen,
 * Apple App Store, favicon HD, etc. Acessivel em /pralvex-app-icon
 *
 * Uso:
 *   1. Abre https://lexai-ffinal.vercel.app/pralvex-app-icon
 *   2. Botao direito > Salvar imagem como > pralvex.png
 *   3. Upload em Google Cloud Console > Tela de consentimento OAuth > Logo
 */

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1410 0%, #0a0807 100%)',
          borderRadius: 110,
          border: '3px solid rgba(191,166,142,0.45)',
          boxShadow: 'inset 0 4px 0 rgba(230,212,189,0.16)',
          position: 'relative',
        }}
      >
        {/* corner glints */}
        <div
          style={{
            position: 'absolute',
            top: 36,
            left: 36,
            width: 32,
            height: 32,
            borderTop: '2px solid rgba(191,166,142,0.65)',
            borderLeft: '2px solid rgba(191,166,142,0.65)',
            borderTopLeftRadius: 30,
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 36,
            right: 36,
            width: 32,
            height: 32,
            borderBottom: '2px solid rgba(191,166,142,0.65)',
            borderRight: '2px solid rgba(191,166,142,0.65)',
            borderBottomRightRadius: 30,
            display: 'flex',
          }}
        />

        {/* PX letters */}
        <div
          style={{
            display: 'flex',
            fontFamily: 'monospace',
            fontSize: 220,
            fontWeight: 800,
            letterSpacing: 22,
            color: '#e6d4bd',
            paddingLeft: 22,
            textShadow: '0 0 60px rgba(191,166,142,0.5)',
          }}
        >
          PX
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
    },
  )
}
