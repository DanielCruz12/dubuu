"use client"

import type React from "react"

import Image from "next/image"
import { useState } from "react"
import Lightbox from "yet-another-react-lightbox"
import { useLanguage } from "@/lib/i18n-context"
import Captions from "yet-another-react-lightbox/plugins/captions"
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import Download from "yet-another-react-lightbox/plugins/download"
import Share from "yet-another-react-lightbox/plugins/share"

import { Button } from "../ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function ImageCollage({
  images,
  banner,
  cacheKey,
}: {
  images: string[]
  banner: string
  /** Cambia cuando el contenido cambia (p.ej. product.updated_at) para bustear caché. */
  cacheKey?: string
}) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const withCacheKey = (src: string, key?: string) => {
    const trimmed = (src ?? "").trim()
    if (!trimmed) return trimmed
    if (!key?.trim()) return trimmed
    // Solo para URLs remotas: así evitamos ensuciar rutas locales.
    if (!/^https?:\/\//i.test(trimmed)) return trimmed
    const v = encodeURIComponent(key)
    return trimmed.includes("?") ? `${trimmed}&v=${v}` : `${trimmed}?v=${v}`
  }

  // Create a new array with the banner as the first image, followed by the rest (deduped)
  const allImages = (() => {
    const candidates = [banner, ...(images || [])].filter(
      (src): src is string => typeof src === "string" && src.trim().length > 0,
    )
    const seen = new Set<string>()
    return candidates.filter((src) => {
      if (seen.has(src)) return false
      seen.add(src)
      return true
    })
  })()

  // Format all images for the lightbox
  const formattedImages = allImages.map((src, index) => ({
    src: withCacheKey(src, cacheKey),
    alt: `${t("home.imageCollage.image")} ${index + 1}`,
  }))

  // Maximum number of images to show in the grid before "see more" button
  const MAX_VISIBLE_IMAGES = 5
  const hasMoreImages = allImages.length > MAX_VISIBLE_IMAGES

  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  return (
    <section className="w-full">
      {/* Mobile view - Carousel */}
      <div className="md:hidden">
        <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden">
          {allImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-300 cursor-pointer ${
                index === currentImageIndex ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              onClick={() => {
                setCurrentIndex(currentImageIndex)
                setOpen(true)
              }}
            >
              <Image
                src={withCacheKey(image, cacheKey) || "/logo.svg"}
                alt={`${t("home.imageCollage.image")} ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw"
              />
            </div>
          ))}

          {allImages.length > 1 && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 dark:bg-black z-10 w-8 h-8 sm:w-10 sm:h-10"
                onClick={prevImage}
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 dark:bg-black z-10 w-8 h-8 sm:w-10 sm:h-10"
                onClick={nextImage}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {allImages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentImageIndex(index)
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Desktop view - Airbnb style grid */}
      <div className="hidden md:grid grid-cols-4 gap-2 h-[450px]">
        {/* Banner image - large, spans 2 columns and 2 rows */}
        <div
          className="col-span-2 row-span-2 relative rounded-l-lg overflow-hidden cursor-pointer"
          onClick={() => {
            setCurrentIndex(0)
            setOpen(true)
          }}
        >
          <Image
            src={withCacheKey(banner, cacheKey) || "/logo.svg"}
            alt={t("home.imageCollage.bannerAlt")}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* First row of small images */}
        {allImages.slice(1, 3).map((image, index) => (
          <div
            key={index}
            className={`relative overflow-hidden cursor-pointer ${index === 1 ? "rounded-tr-lg" : ""}`}
            onClick={() => {
              setCurrentIndex(index + 1)
              setOpen(true)
            }}
          >
            <Image
              src={withCacheKey(image, cacheKey) || "/logo.svg"}
              alt={`${t("home.imageCollage.image")} ${index + 2}`}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="25vw"
            />
          </div>
        ))}

        {/* Second row of small images */}
        {allImages.slice(3, 5).map((image, index) => (
          <div
            key={index}
            className={`relative overflow-hidden cursor-pointer ${index === 1 ? "rounded-br-lg" : ""}`}
            onClick={() => {
              setCurrentIndex(index + 3)
              setOpen(true)
            }}
          >
            <Image
              src={withCacheKey(image, cacheKey) || "/logo.svg"}
              alt={`${t("home.imageCollage.image")} ${index + 4}`}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="25vw"
            />

            {/* Show "See more" overlay on the last visible image */}
            {index === 1 && hasMoreImages && (
              <div
                className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(0)
                  setOpen(true)
                }}
              >
                <button className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-opacity-90">
                  {t("home.imageCollage.showAllPhotos")} ({allImages.length})
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox for full-screen gallery */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={formattedImages}
        index={currentIndex}
        plugins={[Fullscreen, Download, Captions, Zoom, Share]}
      />
    </section>
  )
}
