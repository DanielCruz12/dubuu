/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    const base = (process.env.BACKEND_URL || "http://localhost:3002").replace(
      /\/$/,
      "",
    );
    return [
      {
        source: "/backend/socket.io",
        destination: `${base}/socket.io/`,
      },
      {
        source: "/backend/socket.io/:path*",
        destination: `${base}/socket.io/:path*/`,
      },
      {
        source: "/socket.io/:path*",
        destination: `${base}/socket.io/:path*/`,
      },
      {
        source: "/backend/:path*",
        destination: `${base}/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d1rr0bsyl382u.cloudfront.net",
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
