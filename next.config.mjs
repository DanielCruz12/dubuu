/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    const backend = process.env.BACKEND_URL;
    if (!backend) return [];
    const base = backend.replace(/\/$/, "");
    return [
      // Socket.IO: el cliente pide /backend/socket.io/ (con barra final). Sin reglas
      // explícitas, /backend/:path* puede no matchear por el trailing slash.
      { source: "/backend/socket.io", destination: `${base}/socket.io` },
      { source: "/backend/socket.io/", destination: `${base}/socket.io/` },
      { source: "/backend/socket.io/:path*", destination: `${base}/socket.io/:path*` },
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
