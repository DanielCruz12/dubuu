/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    const base = (process.env.BACKEND_URL || "http://localhost:3002").replace(
      /\/$/,
      ""
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
      // Alternativa si el cliente usara path "/socket.io" (sin /backend)
      {
        source: "/socket.io/:path*",
        destination: `${base}/socket.io/:path*/`,
      },
      {
        source: "/api/:path*",
        destination: `${base}/api/:path*`,
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
