import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/empresas', '/roi', '/sobre', '/login', '/privacidade', '/termos'],
        disallow: ['/dashboard/', '/api/', '/auth/', '/share/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
