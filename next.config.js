/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Port dari env Railway
  serverRuntimeConfig: {
    port: process.env.PORT || 3000,
  },
};

module.exports = nextConfig;
