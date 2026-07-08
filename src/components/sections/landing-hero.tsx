"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n-context";
import LandingSearchWidget from "@/components/sections/landing-search-widget";

const HERO_SLIDES = [
  {
    src: "/homepage/4.webp",
    alt: "Costa volcánica del Pacífico salvadoreño al atardecer, con olas de surf y playa de arena negra",
  },
  {
    src: "/homepage/banner2.webp",
    alt: "Vista aérea de la costa de El Salvador al atardecer con oleaje para surfear",
  },
  {
    src: "/homepage/7.webp",
    alt: "Viajera contemplando las montañas y volcanes verdes de El Salvador",
  },
];

const SLIDE_DURATION_MS = 6500;

export default function LandingHero() {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative flex min-h-[100svh] w-full flex-col">
      {/* Fondo: el crossfade y el zoom viven en su propio contenedor con
          overflow-hidden para no recortar el buscador flotante ni el texto. */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence mode="sync">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 1.08 }}
              transition={{
                duration: (SLIDE_DURATION_MS / 1000) * 1.4,
                ease: "linear",
              }}
              className="absolute inset-0"
            >
              <Image
                src={HERO_SLIDES[activeIndex].src}
                alt={HERO_SLIDES[activeIndex].alt}
                fill
                priority={activeIndex === 0}
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-coast-900/75 via-coast-900/30 to-coast-900/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-28 pt-32 text-center text-white sm:pb-24">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-sand-300"
        >
          El Salvador · Centroamérica
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="max-w-3xl"
        >
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-tight text-balance">
            Vive El Salvador.
          </h1>
          <p className="mt-2 font-serif italic text-lg sm:text-2xl md:text-3xl text-sand-200 text-balance">
            Feel the destination.
          </p>
          <p className="mt-6 text-base sm:text-lg text-white/85 max-w-xl mx-auto text-balance">
            {t("landing.hero.subtitle")}
          </p>
        </motion.div>
      </div>

      <div className="relative z-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mx-auto w-full max-w-3xl translate-y-1/2"
        >
          <LandingSearchWidget />
        </motion.div>
      </div>

      <div
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-white/70 sm:flex motion-safe:animate-bounce"
        aria-hidden="true"
      >
        <span className="text-[10px] uppercase tracking-[0.2em]">
          {t("landing.hero.scroll")}
        </span>
      </div>
    </section>
  );
}
