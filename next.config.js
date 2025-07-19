/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Force all pages to be dynamic
  trailingSlash: false,
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Disable static generation
  experimental: {
    appDir: true,
  },
}

export default nextConfig 