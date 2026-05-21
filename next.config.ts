import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // ✅ Client-side Router Cache configuration
    // dynamic: 30 → Keep dynamically-rendered pages (dashboard, etc.) in browser memory 
    //               for 30 seconds. Navigate home → back within 30s = instant, zero server calls.
    // static: 300 → Keep static pages (about, contact) cached for 5 minutes.
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    minimumCacheTTL: 3600, // Cache optimized images for 1 hour — reduces re-fetches of slow Google CDN avatars
    remotePatterns: [
      {
        // Google OAuth profile pictures
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        // Firebase Storage uploaded avatars
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
};

export default nextConfig;

