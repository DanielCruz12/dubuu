import type React from "react";
import { Inter, Fraunces } from "next/font/google";
import GlobalProviders from "../components/providers/global-providers";
import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dubuu.com"),
  title: {
    template: "%s | Dubuu - Experiencias de Viaje Únicas",
    default:
      "Dubuu - Experiencias de Viaje Únicas en El Salvador y Centroamérica",
  },
  description:
    "Diseñamos experiencias únicas de viaje en El Salvador y Centroamérica. Tours de lujo personalizados, alquiler de vehículos premium y propiedades exclusivas para los viajeros más exigentes.",
  keywords: [
    "tours El Salvador",
    "viajes de lujo Centroamérica",
    "experiencias únicas El Salvador",
    "alquiler vehículos El Salvador",
    "propiedades exclusivas Centroamérica",
    "turismo de lujo",
    "experiencias personalizadas",
    "tours personalizados",
    "alojamiento premium",
    "viajes exclusivos",
    "destinos Centroamérica",
    "alternativa Booking",
    "alternativa Airbnb",
  ],
  authors: [{ name: "Dubuu" }],
  creator: "Dubuu",
  publisher: "Dubuu",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://www.dubuu.com",
    languages: {
      "es-SV": "https://www.dubuu.com",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_SV",
    url: "https://www.dubuu.com",
    siteName: "Dubuu",
    title:
      "Dubuu - Experiencias de Viaje Únicas en El Salvador y Centroamérica",
    description:
      "Diseñamos experiencias únicas de viaje en El Salvador y Centroamérica. Tours de lujo, alquiler de vehículos premium y propiedades exclusivas para viajeros exigentes.",
    images: [
      {
        url: "https://www.dubuu.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Dubuu - Experiencias de Viaje Únicas en El Salvador y Centroamérica",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Dubuu - Experiencias de Viaje Únicas en El Salvador y Centroamérica",
    description:
      "Diseñamos experiencias únicas de viaje en El Salvador y Centroamérica. Tours de lujo, alquiler de vehículos y propiedades exclusivas.",
    images: ["https://www.dubuu.com/og-image.jpg"],
    creator: "@Dubuu_sv",
    site: "@Dubuu_sv",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "travel",
  applicationName: "Dubuu",
  other: {
    "fb:app_id": process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "1536881601422455",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
        <head>
          <meta charSet="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <link rel="icon" href="https://www.dubuu.com/icon.svg" />
          {process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ? (
            <meta property="fb:app_id" content={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID} />
          ) : null}

          <Script
            id="metadata"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: `
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Dubuu",
              "url": "https://www.dubuu.com",
              "logo": "https://www.dubuu.com/logo.png",
              "description": "Diseñamos experiencias únicas de viaje en El Salvador y Centroamérica. Tours de lujo, alquiler de vehículos premium y propiedades exclusivas para viajeros exigentes.",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "El Salvador"
              },
              "founder": {
                "@type": "Person",
                "name": "Josué Daniel Cruz Dubón"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+503 6456-2432",
                "contactType": "Customer Service",
                "areaServed": "El Salvador",
                "availableLanguage": "Spanish"
              }
            }
          `,
            }}
          />

          <Script
            id="google-tag-manager"
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-QXFD8S7VK0"
          />
          <Script id="google-analytics">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-QXFD8S7VK0'); 
            `}
          </Script>
        </head>
        <body
          className={`${inter.variable} ${fraunces.variable} ${inter.className} flex min-h-screen flex-col`}
        >
          <SpeedInsights />
          <Analytics />
          <GlobalProviders>
            {children}
            <Toaster richColors style={{ zIndex: 12000 }} />
          </GlobalProviders>
        </body>
    </html>
  );
}
