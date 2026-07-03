/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  basePath: '/bkk-music-guide',
  assetPrefix: '/bkk-music-guide',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig