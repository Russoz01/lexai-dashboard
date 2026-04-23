import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SERVICES } from '../../data'
import { ServicePageClient } from '../../components'

/* ══════════════════════════════════════════════════════════════
   Service Detail Page — /oc-advogados/servicos/[slug]
   Server component:
   - generateStaticParams for SSG of the 4 service slugs
   - generateMetadata for per-slug SEO (unique title + description)
   Actual UI is rendered by <ServicePageClient /> (client component
   co-located in ../../components.tsx).
   ══════════════════════════════════════════════════════════════ */

type PageProps = {
  params: { slug: string }
}

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const service = SERVICES.find((s) => s.slug === params.slug)
  if (!service) {
    return {
      title: 'Serviço não encontrado — OC Advogados',
    }
  }
  const title = `${service.name} — OC Advogados | Advocacia Previdenciária`
  const description = service.description
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      siteName: 'OC Advogados',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default function ServiceDetailPage({ params }: PageProps) {
  const service = SERVICES.find((s) => s.slug === params.slug)
  if (!service) notFound()
  return <ServicePageClient service={service} />
}
