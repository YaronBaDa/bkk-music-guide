/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "dist",
  basePath: "/bkk-music-guide",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
