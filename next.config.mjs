/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [], // Add domains for external images if needed
  },
  // Ensures we can use the latest React features
  experimental: {
    // Enable App Router features
    serverActions: true,
  },
};

export default nextConfig;
