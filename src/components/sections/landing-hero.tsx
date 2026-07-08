"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, animate } from "framer-motion";
import { useLanguage } from "@/lib/i18n-context";
import { Button } from "@/components/ui/button";
import LandingSearchWidget from "@/components/sections/landing-search-widget";

const HEADER_OFFSET_PX = 80;

function smoothScrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const targetY =
    el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET_PX;
  animate(window.scrollY, targetY, {
    duration: 1.1,
    ease: [0.22, 1, 0.36, 1],
    onUpdate: (value) => window.scrollTo(0, value),
  });
}

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
    <section className="relative w-full bg-zinc-950">
      <div className="absolute inset-0 h-[85vh] min-h-[560px] overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/70 to-zinc-950" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 pb-16 pt-40 text-center sm:pt-48">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight text-white text-balance">
            {t("landing.hero.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg sm:text-xl text-zinc-400 text-balance">
            {t("landing.hero.subtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-8 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Button
            asChild
            size="lg"
            className="rounded-full bg-white px-8 text-zinc-950 hover:bg-zinc-200"
          >
            <Link href="/home">{t("landing.hero.primaryCta")}</Link>
          </Button>
          <a
            href="#testimonios"
            onClick={(e) => {
              e.preventDefault();
              smoothScrollToId("testimonios");
            }}
            className="text-sm font-medium text-zinc-300 underline underline-offset-4 hover:text-white cursor-pointer"
          >
            {t("landing.hero.secondaryCta")}
          </a>
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
