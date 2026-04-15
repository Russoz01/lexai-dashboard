import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/empresas', '/login', '/privacidade', '/termos'],
        disallow: ['/dashboard/', '/api/', '/auth/', '/share/'],
      },
    ],
    sitemap: 'https://lexai.com.br/sitemap.xml',
  }
}
