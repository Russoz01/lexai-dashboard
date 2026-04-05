/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || ''].filter(Boolean),
    },
  },
}

module.exports = nextConfig
