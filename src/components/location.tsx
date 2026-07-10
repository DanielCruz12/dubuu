"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import { IProduct } from "@/types/product";
import { isProductType } from "@/utils";
import { useLanguage } from "@/lib/i18n-context";

interface LocationMapProps {
  title?: string;
  latitude: number;
  longitude: number;
  zoom?: number;
  product: IProduct;
}

export default function LocationMap({
  title,
  product,
  latitude,
  longitude,
  zoom = 14,
}: LocationMapProps) {
  const { t } = useLanguage();
  const isTour = isProductType(product, "tours");
  const tourData = isTour ? product.tour : null;
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapTitle = title ?? t("home.landing.productDetail.departurePoint");

  const GOOGLE_API = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  // Construir la URL del mapa de Google
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_API}&q=${latitude},${longitude}&zoom=${zoom}`;
  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="w-full min-w-0 mx-auto rounded-2xl overflow-hidden"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground pt-3">
        {t("home.location.howToGetThere")}
      </p>
      <h2 className="text-base md:text-lg font-semibold pb-3">{mapTitle}</h2>

      <div className="relative w-full min-h-[220px] h-[min(42vh,22rem)] sm:min-h-[260px] sm:h-[min(44vh,24rem)] md:min-h-[360px] md:h-[min(48vh,28rem)] lg:min-h-[400px] lg:h-[30rem]">
        {/* Iframe para el mapa de Google */}
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setMapLoaded(true)}
          className={`w-full h-full ${mapLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        />

        {/* Fallback mientras carga el mapa */}
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse">{t("home.location.loadingMap")}</div>
          </div>
        )}

        {/* Controles del mapa */}
        <div className="absolute right-4 top-4 flex flex-col gap-2">
          <button className="rounded-full w-8 h-8 flex items-center justify-center shadow-md">
            <span className="text-xl">+</span>
          </button>
          <button className="rounded-full w-8 h-8 flex items-center justify-center shadow-md">
            <span className="text-xl">−</span>
          </button>
        </div>

        <button className="absolute right-4 bottom-4 rounded-full w-8 h-8 flex items-center justify-center shadow-md">
          <span className="text-xl">⊕</span>
        </button>
      </div>

      <div className="p-4 flex items-start gap-3">
        <div className="mt-1">
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm">{tourData?.departure_point}</p>
        </div>
      </div>

      <div className="px-4 pb-4">
        <a
          href={googleMapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted/50 transition-colors"
        >
          <Navigation className="h-3.5 w-3.5" aria-hidden />
          {t("home.location.openInGoogleMaps")}
        </a>
      </div>
    </motion.div>
  );
}
