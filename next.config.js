/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Force all pages to be dynamic
  experimental: {
    appDir: true,
  },
  // Disable static generation
  trailingSlash: false,
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
}

export default nextConfig 