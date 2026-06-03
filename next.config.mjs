/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  webpack: (config, { dev }) => {
    // Avoid EBUSY cache rename errors on Windows (antivirus / multiple dev processes).
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
};

export default nextConfig;
