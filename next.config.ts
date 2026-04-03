import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Static export for hosting on any platform (optional - remove if using SSR)
  // output: 'export',
  // distDir: 'dist',
  
  // Image optimization (required for static export or Vercel)
  images: {
    unoptimized: true,
  },
  
  // Enable Turbopack in development only
  ...(process.env.NODE_ENV === 'development' && {
    turbopack: {
      root: __dirname,
    },
  }),
};

export default nextConfig;
