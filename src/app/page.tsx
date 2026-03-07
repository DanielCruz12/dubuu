"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { tours } from "@/utils/data";
import UpTop from "@/components/up-top";
import Link from "next/link";
import { Star } from "lucide-react";
import { formatUsd, USD_SYMBOL } from "@/utils/currency";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useLanguage } from "@/lib/i18n-context";

const HERO_SLIDE_KEYS = ["slide1", "slide2", "slide3", "slide4", "slide5"] as const;
const HERO_SLIDE_IMAGES = ["/homepage/banner1.png", "/homepage/banner2.png", "/homepage/banner3.png", "/homepage/banner4.png", "/homepage/banner5.png"];

export default function Home() {
  const convert = formatUsd;
  const symbol = USD_SYMBOL;
  const { t } = useLanguage();

  const containerRef = useRef(null);
  const aboutRef = useRef(null);
  const plugin = Autoplay({ delay: 5000, stopOnInteraction: true });

  const { scrollYProgress: aboutScrollProgress } = useScroll({
    target: aboutRef,
    offset: ["start end", "end start"],
  });

  const aboutOpacity = useTransform(aboutScrollProgress, [0.1, 0.3], [0, 1]);
  const aboutX = useTransform(aboutScrollProgress, [0.1, 0.3], [-50, 0]);

  return (
    <div ref={containerRef} className="w-full overflow-x-hidden">
      <UpTop />

      {/* Hero: carrusel de banners — en desktop más bajo; overlay oscuro para legibilidad */}
      <section className="relative h-screen w-full overflow-hidden">
        <Carousel
          opts={{ loop: true }}
          plugins={[plugin]}
          className="h-full w-full"
        >
          <CarouselContent className="ml-0 h-full">
            {HERO_SLIDE_KEYS.map((slideKey, i) => (
              <CarouselItem
                key={slideKey}
                className="relative h-full min-h-screen md:min-h-0 pl-0 basis-full"
              >
                <div className="relative h-full w-full min-h-screen md:min-h-0">
                  <div className="absolute inset-0 h-full w-full">
                    <Image
                      src={encodeURI(HERO_SLIDE_IMAGES[i])}
                      alt=""
                      width={1000}
                      height={1000}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/35 md:bg-black/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/25" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/50" />
                  </div>
                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <div className="px-4 md:px-6 text-center text-white max-w-4xl mx-auto">
                      <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight leading-none mb-4 md:mb-6">
                        {t(`home.landing.${slideKey}.title`)}
                      </h1>
                      <p className="text-lg md:text-xl font-light tracking-wide mb-6 max-w-xl mx-auto">
                        {t(`home.landing.${slideKey}.subtitle`)}
                      </p>
                      <Link
                        href="/home"
                        className={
                          buttonVariants({ variant: "secondary" }) +
                          " px-8 py-2 rounded"
                        }
                      >
                        {t(`home.landing.${slideKey}.cta`)}
                      </Link>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 md:left-6 h-10 w-10 rounded-full border-white/30 bg-black/30 text-white hover:bg-black/50 hover:text-white" />
          <CarouselNext className="right-4 md:right-6 h-10 w-10 rounded-full border-white/30 bg-black/30 text-white hover:bg-black/50 hover:text-white" />
        </Carousel>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className="py-24 md:py-32" id="about">
        <div className="md:px-20 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div style={{ opacity: aboutOpacity, x: aboutX }}>
              <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-8">
                {t("home.landing.about.titlePrefix")}
                <span className="font-bold">{t("home.landing.about.titleBold")}</span>
                {t("home.landing.about.titleSuffix")}
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {t("home.landing.about.paragraph1")}
              </p>
              <p className="text-gray-600 mb-10 leading-relaxed">
                {t("home.landing.about.paragraph2")}
              </p>
              <div className="inline-block">
                <Link
                  href={"/home"}
                  className={
                    buttonVariants({ variant: "default" }) +
                    " px-8 py-2 rounded"
                  }
                >
                  {t("home.landing.about.cta")}
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="aspect-[3/3] relative overflow-hidden rounded-2xl">
                <Image
                  src="/tour1.jpg"
                  alt={t("home.landing.about.imageAlt")}
                  fill
                  className="object-cover"
                />
                {/* Gradiente sutil para mejorar el contraste */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20"></div>
              </div>
              <motion.div
                className="absolute -bottom-8 -left-8 bg-white p-6 max-w-sm rounded-2xl shadow-xl border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-amber-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  {t("home.landing.about.testimonial")}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tours Section */}
      <section className="py-24 md:py-32 ">
        <div className="md:px-20 px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
              {t("home.landing.tours.titlePrefix")}
              <span className="font-bold">{t("home.landing.tours.titleBold")}</span>
              {t("home.landing.tours.titleSuffix")}
            </h2>
            <p className="text-gray-400 text-lg">
              {t("home.landing.tours.subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tours.map((tour, index) => (
              <motion.div
                key={index}
                className="relative group overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="relative h-[400px] w-full overflow-hidden rounded-xl">
                  <Image
                    src={tour.image || "/logo.svg"}
                    alt={tour.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Gradiente base desde abajo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  {/* Gradiente adicional en hover para efecto más dramático */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  {/* Gradiente radial sutil desde el centro */}
                  <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/30"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="text-sm font-light mb-2 text-gray-300">
                    {tour.duration}
                  </div>
                  <h3 className="text-2xl font-light mb-2 text-white">
                    {tour.title.toUpperCase()}
                  </h3>
                  <p className="text-gray-200 mb-4 opacity-90">
                    {tour.description}
                  </p>
                  <p className="font-bold text-white">
                    {symbol}
                    {convert(tour.price)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <div className="inline-block">
              <Link
                href={"/home"}
                className={
                  buttonVariants({ variant: "default" }) + " px-8 py-2 rounded"
                }
              >
                {t("home.landing.tours.cta")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
