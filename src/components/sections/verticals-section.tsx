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
    <section className="py-20 md:py-28 px-4 md:px-20 bg-coast-900 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mb-12"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sand-300">
          {t("landing.verticalsSection.eyebrow")}
        </p>
        <h2 className="mt-3 font-serif text-3xl md:text-5xl font-semibold tracking-tight text-balance">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                {!vertical.active && (
                  <span className="absolute right-3 top-3 rounded-full bg-sand-400 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-coast-900">
                    {t("landing.verticalsSection.comingSoon")}
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-sand-300" aria-hidden="true" />
                    <h3 className="font-serif text-xl font-semibold">
                      {vertical.title}
                    </h3>
                  </div>
                  {vertical.active && (
                    <ArrowRight className="h-5 w-5 text-white transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                  )}
                </div>
              </div>
              <p className="mt-4 text-sm text-white/70">
                {vertical.description}
              </p>
              {!vertical.active && (
                <Link
                  href={vertical.href}
                  className="mt-2 inline-block text-sm font-medium text-sand-300 underline underline-offset-4 hover:text-sand-200"
                >
                  {t("landing.verticalsSection.notifyMe")}
                </Link>
              )}
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
