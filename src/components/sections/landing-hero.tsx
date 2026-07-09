"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
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
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(id);
  }, []);

  // Efectos ligados al scroll: la imagen hace zoom, el overlay oscurece y el
  // titular se desvanece hacia arriba a medida que el usuario avanza por el hero.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.4, 1]);
  const headingY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const headingOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen w-full flex-col bg-zinc-950"
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div style={{ scale: bgScale }} className="absolute inset-0">
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
                  className="object-cover opacity-60"
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/70 to-zinc-950"
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:py-28">
        <motion.div
          style={{ y: headingY, opacity: headingOpacity }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-normal leading-[1.05] tracking-tight text-white text-balance">
            {t("landing.hero.titlePrefix")}
            <em className="italic text-zinc-400">
              {t("landing.hero.titleEmphasis")}
            </em>
            {t("landing.hero.titleSuffix")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg sm:text-xl text-zinc-400 text-balance">
            {t("landing.hero.subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-14 w-full"
        >
          <LandingSearchWidget />
        </motion.div>
      </div>
    </section>
  );
}
