/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    const backendUrl = (process.env.BACKEND_URL || "http://localhost:3002").replace(
      /\/$/,
      "",
    );

    // TODO(seguridad): esta CSP va en modo Report-Only (no bloquea nada todavía).
    // Antes de pasarla a "Content-Security-Policy" (bloqueante), navegar el sitio
    // completo (login/registro con Clerk, búsqueda con reCAPTCHA, checkout con
    // Wompi, mapa) revisando la consola del navegador por violaciones reportadas,
    // y ajustar los dominios de esta lista según lo que aparezca.
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://www.gstatic.com https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com",
      `connect-src 'self' ${backendUrl} https://*.clerk.accounts.dev https://*.clerk.com https://www.google-analytics.com https://*.google-analytics.com https://*.vercel-insights.com https://vitals.vercel-insights.com https://*.googleapis.com wss://*.clerk.accounts.dev`,
      "frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com",
      "form-action 'self' https://checkout.wompi.co https://wompi.sv",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy-Report-Only", value: csp },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=(self)",
          },
        ],
      },
    ];
  },

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
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d1rr0bsyl382u.cloudfront.net",
      },
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
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
};

export default nextConfig;
