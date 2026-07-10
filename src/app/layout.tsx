import type React from "react";
import { Hanken_Grotesk } from "next/font/google";
import GlobalProviders from "../components/providers/global-providers";
import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import ConditionalAnalytics from "@/components/analytics/conditional-analytics";
import { instrumentSerif, cormorantGaramond } from "@/lib/fonts";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
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
        </head>
        <body
          className={`${hankenGrotesk.variable} ${instrumentSerif.variable} ${cormorantGaramond.variable} ${hankenGrotesk.className} flex min-h-screen flex-col`}
        >
          <SpeedInsights />
          <Analytics />
          <ConditionalAnalytics />
          <GlobalProviders>
            {children}
            <Toaster richColors style={{ zIndex: 12000 }} />
          </GlobalProviders>
        </body>
    </html>
  );
}
