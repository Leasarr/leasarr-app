import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://leasarr.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/about', '/waitlist', '/privacy'],
        disallow: ['/dashboard', '/portal', '/auth', '/api'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
