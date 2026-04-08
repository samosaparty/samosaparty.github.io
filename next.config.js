/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/samosaparty.github.io",
  assetPrefix: "/samosaparty.github.io",
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig