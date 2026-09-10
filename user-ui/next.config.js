// @ts-check

const apiGatewayUrl = (
  process.env.API_GATEWAY_URL ||
  "http://localhost:8080"
).replace(/\/+$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          `${apiGatewayUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;