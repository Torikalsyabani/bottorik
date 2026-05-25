/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["whatsapp-web.js", "puppeteer"],
  },
  serverRuntimeConfig: {
    port: process.env.PORT || 3000,
  },
};

module.exports = nextConfig;