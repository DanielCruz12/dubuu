/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    const backendUrl =
      process.env.BACKEND_URL || "http://localhost:3002";
    return [
      {
        source: "/backend/:path*",
        destination: `${backendUrl.replace(/\/$/, "")}/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d191xw0kn1fj0p.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
      },
    ],
  },
};

export default nextConfig;
