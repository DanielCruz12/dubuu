"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Car, Compass, Home as HomeIcon, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";
import DotGridBackground from "@/components/sections/dot-grid-background";

export default function VerticalsSection() {
  const { t } = useLanguage();

  const tours = {
    href: "/home?type=tours",
    image: "/homepage/banner1.webp",
    collageImage: "/homepage/7.webp",
    alt: t("landing.verticalsSection.tours.alt"),
    icon: Compass,
    title: t("landing.verticalsSection.tours.title"),
    description: t("landing.verticalsSection.tours.description"),
  };

  const smallCards = [
    {
      key: "rental",
      number: "02",
      href: "/home?type=rental",
      image: "/homepage/banner3.webp",
      alt: t("landing.verticalsSection.rental.alt"),
      icon: Car,
      title: t("landing.verticalsSection.rental.title"),
      description: t("landing.verticalsSection.rental.description"),
      active: true,
    },
    {
      key: "properties",
      number: "03",
      href: "/contact",
      image: "/homepage/6.webp",
      alt: t("landing.verticalsSection.properties.alt"),
      icon: HomeIcon,
      title: t("landing.verticalsSection.properties.title"),
      description: t("landing.verticalsSection.properties.description"),
      active: false,
    },
  ];

  return (
    <section className="relative py-20 md:py-28 px-4 md:px-20 bg-zinc-950">
      <DotGridBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative max-w-2xl mb-12"
      >
        <p className="font-label text-lg tracking-[2px] text-zinc-400">
          {t("landing.verticalsSection.eyebrow")}
        </p>
        <h2 className="mt-3 font-display text-3xl md:text-5xl font-normal tracking-tight text-white text-balance">
          {t("landing.verticalsSection.titlePrefix")}
          <em className="italic text-zinc-500">
            {t("landing.verticalsSection.titleEmphasis")}
          </em>
          {t("landing.verticalsSection.titleSuffix")}
        </h2>
      </motion.div>

      <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Tarjeta grande: Tours */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <Link href={tours.href} className="group block">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl sm:aspect-[16/11] md:aspect-auto md:h-[560px]">
              <Image
                src={tours.image}
                alt={tours.alt}
                fill
                loading="lazy"
                sizes="(max-width: 768px) 90vw, 45vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <span className="absolute left-5 top-5 font-mono text-xs font-semibold text-white/50">
                01
              </span>

              {/* collage: foto secundaria superpuesta */}
              <div className="absolute right-5 top-5 hidden h-24 w-24 rotate-3 overflow-hidden rounded-xl border-2 border-white/20 shadow-2xl sm:block md:h-28 md:w-28">
                <Image
                  src={tours.collageImage}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="120px"
                  className="object-cover"
                />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/[0.08] backdrop-blur">
                    <tours.icon className="h-5 w-5 text-white" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-2xl font-normal text-white md:text-3xl">
                    {tours.title}
                  </h3>
                  <ArrowRight
                    className="ml-auto h-5 w-5 text-white transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-3 max-w-sm text-sm text-zinc-300">
                  {tours.description}
                </p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Columna de tarjetas pequeñas: Vehículos y Propiedades */}
        <div className="grid grid-cols-1 gap-6">
          {smallCards.map((vertical, i) => {
            const Icon = vertical.icon;
            const content = (
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
                <Image
                  src={vertical.image}
                  alt={vertical.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 90vw, 45vw"
                  className={`object-cover transition-transform duration-700 ${
                    vertical.active
                      ? "group-hover:scale-110"
                      : "grayscale-[40%]"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute left-4 top-4 font-mono text-xs font-semibold text-white/50">
                  {vertical.number}
                </span>
                {!vertical.active && (
                  <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-950">
                    {t("landing.verticalsSection.comingSoon")}
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/[0.08] backdrop-blur">
                      <Icon className="h-4 w-4 text-white" aria-hidden="true" />
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      {vertical.title}
                    </h3>
                    {vertical.active && (
                      <ArrowRight
                        className="ml-auto h-4 w-4 text-white transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">
                    {vertical.description}
                  </p>
                </div>
              </div>
            );

            return (
              <motion.div
                key={vertical.key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              >
                {vertical.active ? (
                  <Link href={vertical.href} className="group block">
                    {content}
                  </Link>
                ) : (
                  <div className="group block">{content}</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
