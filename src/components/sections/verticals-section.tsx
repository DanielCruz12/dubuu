"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Car, Compass, Home as HomeIcon, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";

export default function VerticalsSection() {
  const { t } = useLanguage();

  const verticals = [
    {
      key: "tours",
      number: "01",
      href: "/home?type=tours",
      image: "/homepage/banner1.webp",
      alt: t("landing.verticalsSection.tours.alt"),
      icon: Compass,
      title: t("landing.verticalsSection.tours.title"),
      description: t("landing.verticalsSection.tours.description"),
      active: true,
    },
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
    <section className="py-20 md:py-28 px-4 md:px-20 bg-zinc-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mb-12"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
          {t("landing.verticalsSection.eyebrow")}
        </p>
        <h2 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight text-white text-balance">
          {t("landing.verticalsSection.title")}
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {verticals.map((vertical, i) => {
          const Icon = vertical.icon;
          const content = (
            <>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                <Image
                  src={vertical.image}
                  alt={vertical.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 90vw, 30vw"
                  className={`object-cover transition-transform duration-700 ${
                    vertical.active ? "group-hover:scale-110" : "grayscale-[40%]"
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
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/[0.08] backdrop-blur">
                      <Icon className="h-4 w-4 text-white" aria-hidden="true" />
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      {vertical.title}
                    </h3>
                  </div>
                  {vertical.active && (
                    <ArrowRight className="h-5 w-5 text-white transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                  )}
                </div>
              </div>
              <p className="mt-4 text-sm text-zinc-400">
                {vertical.description}
              </p>
            </>
          );

          return (
            <motion.div
              key={vertical.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
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
    </section>
  );
}
