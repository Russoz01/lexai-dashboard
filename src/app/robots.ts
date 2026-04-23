import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/empresas', '/roi', '/sobre', '/login', '/privacidade', '/termos'],
        disallow: ['/dashboard/', '/api/', '/auth/', '/share/'],
      },
    ],
    sitemap: 'https://pralvex.com.br/sitemap.xml',
  }
}
