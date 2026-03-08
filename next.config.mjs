/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // trailingSlash no afecta los rewrites: la barra final del destination
  // se pone explícitamente en la URL de destino para Socket.io (issue #23147).
  // Dejamos trailingSlash en false para no cambiar el comportamiento de las rutas de páginas.

  async rewrites() {
    const base = (process.env.BACKEND_URL || "http://localhost:3002").replace(
      /\/$/,
      ""
    );
    return [
      // Socket.io bajo /backend: el cliente usa path "/backend/socket.io". La barra final
      // en destination es crítica para el handshake WebSocket (issue #23147).
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
