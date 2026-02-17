"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
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

  return (
    <div className="w-full mx-auto rounded-lg overflow-hidden ">
      <h2 className="text-base md:text-xl font-semibold py-3">{mapTitle}</h2>

      <div className="relative w-full h-[100px] md:h-[300px]">
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
    </div>
  );
}
