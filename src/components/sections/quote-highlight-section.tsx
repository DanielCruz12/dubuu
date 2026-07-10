"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";
import DotGridBackground from "@/components/sections/dot-grid-background";
import SectionFadeTransition from "@/components/sections/section-fade-transition";

export default function QuoteHighlightSection() {
  const { t } = useLanguage();

  return (
    <section className="relative bg-white py-24 md:py-32 px-4">
      <DotGridBackground dark={false} edgeFade edgeFadeSize={170} />
      <SectionFadeTransition position="top" />
      <SectionFadeTransition position="bottom" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-10 mx-auto max-w-4xl text-center"
      >
        <Quote
          className="mx-auto h-10 w-10 fill-black text-black md:h-12 md:w-12"
          aria-hidden="true"
        />
        <blockquote className="mt-8 font-display text-4xl sm:text-5xl md:text-6xl font-normal leading-tight tracking-tight text-black text-balance">
          {t("landing.quoteHighlight.text")}
        </blockquote>
        <div className="mt-10 flex flex-col items-center gap-3">
          <a
            href="https://x.com/Daniel_CruzD"
            target="_blank"
            rel="noopener noreferrer"
            className="relative h-14 w-14 overflow-hidden rounded-full"
            aria-label={t("landing.quoteHighlight.name")}
          >
            <Image
              src="/ceo.jpg"
              alt={t("landing.quoteHighlight.name")}
              fill
              loading="lazy"
              sizes="56px"
              className="object-cover grayscale"
              style={{ objectPosition: "50% 38%" }}
            />
          </a>
          <p className="text-sm font-medium text-zinc-600">
            {t("landing.quoteHighlight.name")}
          </p>
        </div>
      </motion.div>
    </section>
  );
}
