"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ScanLine, Sparkles } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useLanguage } from "@/lib/i18n-context";
import { cn } from "@/lib/utils";

interface AiMediaCarouselProps {
  bannerUrl: string | null;
  preview: string | null;
  gallery: { view: string; url: string }[];
  bannerAiGenerated?: boolean;
}

/**
 * Carrusel de portada + galería IA: la portada es el primer slide y las vistas
 * generadas (frontal, lateral, etc.) le siguen. Embla aporta swipe/drag y
 * navegación por teclado; nosotros añadimos dots y flechas sobre la imagen.
 */
export function AiMediaCarousel({
  bannerUrl,
  preview,
  gallery,
  bannerAiGenerated,
}: AiMediaCarouselProps) {
  const { t } = useLanguage();
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);

  const cover = bannerUrl ?? preview;
  const slides = [
    { key: "banner", url: cover, view: "" },
    ...gallery.map((g) => ({ key: g.view, url: g.url, view: g.view })),
  ];

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  const showControls = slides.length > 1;

  return (
    <div className="relative">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent className="ml-0">
          {slides.map((slide) => (
            <CarouselItem key={slide.key} className="pl-0">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
                {slide.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={slide.url}
                    alt={
                      slide.key === "banner"
                        ? t("dashboard.aiCreate.coverAlt")
                        : t(`dashboard.aiCreate.views.${slide.view}`)
                    }
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-black" />
                )}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                {/* esquinas HUD */}
                <span className="pointer-events-none absolute top-3 left-3 h-6 w-6 border-t-2 border-l-2 border-coast-300/80 rounded-tl" />
                <span className="pointer-events-none absolute top-3 right-3 h-6 w-6 border-t-2 border-r-2 border-coast-300/80 rounded-tr" />
                <span className="pointer-events-none absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-coast-300/80 rounded-bl" />
                <span className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-coast-300/80 rounded-br" />

                {/* etiqueta del slide */}
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-coast-500/90 text-white px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase shadow-[0_0_18px_rgba(51,150,255,0.5)]">
                  {slide.key === "banner" ? (
                    bannerAiGenerated ? (
                      <>
                        <Sparkles className="h-3 w-3" /> {t("dashboard.aiCreate.coverBadgeEnhanced")}
                      </>
                    ) : (
                      <>
                        <ScanLine className="h-3 w-3" /> {t("dashboard.aiCreate.coverBadge")}
                      </>
                    )
                  ) : (
                    t(`dashboard.aiCreate.views.${slide.view}`)
                  )}
                </span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {showControls && (
        <>
          <button
            type="button"
            onClick={() => api?.scrollPrev()}
            disabled={!api?.canScrollPrev()}
            aria-label="Anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => api?.scrollNext()}
            disabled={!api?.canScrollNext()}
            aria-label="Siguiente"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {showControls && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => api?.scrollTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === current ? "w-5 bg-coast-300" : "w-1.5 bg-white/30 hover:bg-white/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
