import { Inter } from "next/font/google";
import GlobalProviders from "../components/providers/global-providers";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

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
    "tours El Salvador",
    "viajes de lujo Centroamérica",
    "experiencias únicas El Salvador",
    "alquiler vehículos El Salvador",
    "propiedades exclusivas Centroamérica",
    "turismo de lujo",
    "experiencias personalizadas",
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
        url: "https://www.dubuu.com/tour.jpg",
        width: 1200,
        height: 630,
        alt: "Dubuu - Experiencias de Viaje Únicas en El Salvador y Centroamérica",
      },
    ],
  },
  /*   twitter: {
    card: "summary_large_image",
    title:
      "Dubuu - Experiencias de Viaje Únicas en El Salvador y Centroamérica",
    description:
      "Diseñamos experiencias únicas de viaje en El Salvador y Centroamérica. Tours de lujo, alquiler de vehículos y propiedades exclusivas.",
    images: ["https://www.dubuu.com/tour.jpg"],
    creator: "@dubuu",
    site: "@dubuu",
  }, */
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
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "hsl(262, 4%, 45%)",
        },
        layout: {
          socialButtonsPlacement: "bottom",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta charSet="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          {/*  <meta
          name="google-site-verification"
          content="q_nKN4hBrKNgHd0IqIr4to0C-Cxn_L7gtijzxRKmBME"
        /> */}
          <link rel="icon" href="/tour.jpg" type="image/png" />
          <meta
            name="description"
            content="Diseñamos experiencias únicas de viaje en El Salvador y Centroamérica. Tours de lujo, alquiler de vehículos premium y propiedades exclusivas para viajeros exigentes."
          />
          <title>
            Dubuu - Experiencias de Viaje Únicas en El Salvador y Centroamérica
          </title>
          <meta
            name="keywords"
            content="Diseñamos experiencias únicas de viaje en El Salvador y Centroamérica. Tours de lujo, alquiler de vehículos premium y propiedades exclusivas para viajeros exigentes."
          />
          <meta name="author" content="Dubuu team" />
          <link rel="canonical" href="https://www.dubuu.com" />

          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://www.dubuu.com" />
          <meta
            property="og:title"
            content="Dubuu - Experiencias de Viaje Únicas en El Salvador y Centroamérica"
          />
          <meta
            property="og:description"
            content="Diseñamos experiencias únicas de viaje en El Salvador y Centroamérica. Tours de lujo, alquiler de vehículos premium y propiedades exclusivas para viajeros exigentes."
          />
          <meta property="og:image" content="https://www.dubuu.com/tour.jpg" />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@Daniel_CruzD" />
          <meta name="twitter:creator" content="@Daniel_CruzD" />
          <meta
            name="twitter:title"
            content="Dubuu - Experiencias de Viaje Únicas en El Salvador y Centroamérica"
          />
          <meta
            name="twitter:description"
            content="Diseñamos experiencias únicas de viaje en El Salvador y Centroamérica. Tours de lujo, alquiler de vehículos premium y propiedades exclusivas para viajeros exigentes."
          />
          <meta name="twitter:image" content="https://www.dubuu.com/tour.jpg" />

          <Script
            id="metadata"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: `
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "dubuu",
              "url": "https://www.dubuu.com",
              "logo": "https://www.dubuu.com/tour.jpg",
              "description": "Diseñamos experiencias únicas de viaje en El Salvador y Centroamérica. Tours de lujo, alquiler de vehículos premium y propiedades exclusivas para viajeros exigentes.",
              "location": {
                "@type": "El Salvador"
              },
               "founder": {
                "@type": "Person",
                "name": "Josué Daniel Cruz Dubón"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+(503) 77886116",
                "contactType": "Customer Service",
                "areaServed": "El Salvador",
                "availableLanguage": "Spanish"
              },
            }
          `,
            }}
          />
          <Script
            id="google-tag-manager"
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-QXFD8S7VK0"
          ></Script>
          <Script id="google-analytics">
            {`
              window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-QXFD8S7VK0'); 
            `}
          </Script>
        </head>
        <body className={`${inter.className} flex min-h-screen flex-col`}>
          <GlobalProviders>{children}</GlobalProviders>
        </body>
      </html>
    </ClerkProvider>
  );
}
