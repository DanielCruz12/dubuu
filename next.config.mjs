/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/backend/:path*", // Captura cualquier endpoint que venga después
        destination: `${process.env.BACKEND_URL}/:path*`, // Redirige correctamente
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
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
