"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n-context";

export default function FinalCta() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden py-24 md:py-32 px-4">
      <div className="absolute inset-0">
        <Image
          src="/homepage/1.webp"
          alt="Grupo de viajeros celebrando un atardecer en El Salvador"
          fill
          loading="lazy"
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-coast-900/80" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto max-w-2xl text-center text-white"
      >
        <h2 className="font-serif text-3xl md:text-5xl font-semibold tracking-tight text-balance">
          {t("landing.finalCta.title")}
        </h2>
        <p className="mt-4 text-base md:text-lg text-white/85 text-balance">
          {t("landing.finalCta.subtitle")}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-sand-400 text-coast-900 hover:bg-sand-300 px-8"
          >
            <Link href="/home">{t("landing.finalCta.primaryCta")}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full border-white/60 bg-transparent text-white hover:bg-white/10 hover:text-white px-8"
          >
            <Link href="/contact">{t("landing.finalCta.secondaryCta")}</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
