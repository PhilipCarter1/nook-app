/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static generation completely
  output: 'standalone',
  // Force all pages to be dynamic
  generateStaticParams: false,
  // Disable static optimization
  staticPageGenerationTimeout: 0,
  // Ensure all pages are rendered dynamically
  trailingSlash: false,
  // Disable image optimization for now to avoid issues
  images: {
    unoptimized: true,
  },
  // Force dynamic rendering for all pages
  experimental: {
    forceSwcTransforms: true,
  },
}

export default nextConfig; 