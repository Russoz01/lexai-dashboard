import { VanixHeroStage } from '@/components/ui/vanix-hero-stage'

// Force dynamic — bypass CDN cache durante iteração
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function VanixHeroDemoPage() {
  return (
    <main>
      <VanixHeroStage />
      {/* Bloco fake pra dar scroll height e demonstrar parallax */}
      <section style={{
        minHeight: '60vh',
        background: '#0a0807',
        color: 'rgba(255,255,255,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
      }}>
        scroll para ver o parallax
      </section>
    </main>
  )
}
