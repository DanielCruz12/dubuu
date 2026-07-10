import type { Metadata } from "next";
import Script from "next/script";
import UpTop from "@/components/up-top";
import LandingHero from "@/components/sections/landing-hero";
import FeaturedExperiences from "@/components/sections/featured-experiences";
import QuoteHighlightSection from "@/components/sections/quote-highlight-section";
import PromoBentoFeatures from "@/components/sections/promo-bento-features";
import PromoCard from "@/components/sections/promo-card";
import ResponsiveScaleBox from "@/components/sections/responsive-scale-box";
import HowItWorksSection from "@/components/sections/how-it-works-section";
import PromoSplit from "@/components/sections/promo-split";
import TrustSection from "@/components/sections/trust-section";
import FaqSection from "@/components/sections/faq-section";
import SiteFooter from "@/components/sections/site-footer";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://www.dubuu.com",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TravelAgency",
      "@id": "https://www.dubuu.com/#localbusiness",
      name: "Dubuu",
      image: "https://www.dubuu.com/og-image.jpg",
      url: "https://www.dubuu.com",
      telephone: "+503 6456-2432",
      priceRange: "$$$",
      address: {
        "@type": "PostalAddress",
        addressCountry: "SV",
        addressRegion: "La Libertad",
        addressLocality: "El Salvador",
      },
      areaServed: {
        "@type": "Country",
        name: "El Salvador",
      },
      sameAs: [
        "https://www.instagram.com/dubuu_sv/",
        "https://www.facebook.com/share/1FreatcUm9/",
        "https://x.com/Dubuu_sv",
      ],
    },
    {
      "@type": "TouristTrip",
      name: "Experiencias de viaje de lujo en El Salvador",
      description:
        "Tours privados, alquiler de vehículos premium y propiedades exclusivas diseñados a la medida para viajeros que buscan vivir El Salvador y Centroamérica sin límites.",
      provider: {
        "@id": "https://www.dubuu.com/#localbusiness",
      },
      touristType: "Viajeros internacionales de lujo",
      itinerary: {
        "@type": "ItemList",
        itemListElement: [
          { "@type": "TouristAttraction", name: "Playas de surf del Pacífico" },
          { "@type": "TouristAttraction", name: "Ruta de volcanes" },
          { "@type": "TouristAttraction", name: "Lagos y naturaleza" },
        ],
      },
    },
  ],
};

export default function LandingPage() {
  return (
    <div className="w-full overflow-x-hidden bg-zinc-950">
      <UpTop />
      <Script
        id="landing-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <LandingHero />
      <FeaturedExperiences />
      <QuoteHighlightSection />
      <PromoBentoFeatures />
      <HowItWorksSection />
      <div className="bg-zinc-950 px-0 pb-20 sm:px-10 md:pb-28">
        <ResponsiveScaleBox
          width={1024}
          height={576}
          className="w-full rounded-2xl"
        >
          <PromoCard />
        </ResponsiveScaleBox>
      </div>
      <PromoSplit />
      <TrustSection />
      <FaqSection />
      <SiteFooter />
    </div>
  );
}
