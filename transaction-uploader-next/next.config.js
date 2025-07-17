/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5002/api/:path*", // ✅ backend API (HTTP)
      },
    ];
  },
};

module.exports = nextConfig;
