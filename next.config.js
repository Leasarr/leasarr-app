/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Keep the router cache fresh for 30s on dynamic routes (default: 0 = always stale).
    // Prevents Next.js from re-fetching the RSC payload on every tab focus.
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

module.exports = nextConfig
