"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Download from "yet-another-react-lightbox/plugins/download";
import Autoplay from "embla-carousel-autoplay";
import Share from "yet-another-react-lightbox/plugins/share";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function ImageCollage({
  images,
  banner,
}: {
  images: string[];
  banner: string;
}) {
  const plugin = useRef(Autoplay({ delay: 1500, stopOnInteraction: true }));

  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Create a new array with the banner as the first image, followed by the rest
  const allImages = [banner, ...(images || [])];

  // Format all images for the lightbox
  const formattedImages = allImages.map((src, index) => ({
    src,
    alt: `Imagen ${index + 1}`,
  }));

  // Maximum number of images to show in the grid before "see more" button
  const MAX_VISIBLE_IMAGES = 5;
  const hasMoreImages = allImages.length > MAX_VISIBLE_IMAGES;

  return (
    <section className="w-full">
      {/* Mobile view - Carousel */}
      <div className="md:hidden">
        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {allImages.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Imagen ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={index < 2}
                    onClick={() => {
                      setCurrentIndex(index);
                      setOpen(true);
                    }}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute z-10 -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
            {allImages.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full ${
                  index === currentIndex
                    ? "bg-primary"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </div>

      {/* Desktop view - Airbnb style grid */}
      <div className="hidden md:grid grid-cols-4 gap-2 h-[450px]">
        {/* Banner image - large, spans 2 columns and 2 rows */}
        <div
          className="col-span-2 row-span-2 relative rounded-l-lg overflow-hidden cursor-pointer"
          onClick={() => {
            setCurrentIndex(0);
            setOpen(true);
          }}
        >
          <Image
            src={banner || "/placeholder.svg"}
            alt="Banner image"
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
              setCurrentIndex(index + 1);
              setOpen(true);
            }}
          >
            <Image
              src={image || "/placeholder.svg"}
              alt={`Imagen ${index + 2}`}
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
              setCurrentIndex(index + 3);
              setOpen(true);
            }}
          >
            <Image
              src={image || "/placeholder.svg"}
              alt={`Imagen ${index + 4}`}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="25vw"
            />

            {/* Show "See more" overlay on the last visible image */}
            {index === 1 && hasMoreImages && (
              <div
                className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(0);
                  setOpen(true);
                }}
              >
                <button className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-opacity-90">
                  Mostrar todas las fotos ({images.length})
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
  );
}
