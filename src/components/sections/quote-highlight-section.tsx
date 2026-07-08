"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";

export default function QuoteHighlightSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-24 md:py-32 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-4xl text-center"
      >
        <Quote
          className="mx-auto h-10 w-10 fill-black text-black md:h-12 md:w-12"
          aria-hidden="true"
        />
        <blockquote className="mt-8 text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-black text-balance">
          {t("landing.quoteHighlight.text")}
        </blockquote>
        <div className="mt-10 flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://i.pravatar.cc/200?img=13"
            alt={t("landing.quoteHighlight.name")}
            width={56}
            height={56}
            loading="lazy"
            className="h-14 w-14 rounded-full object-cover grayscale"
          />
          <p className="text-sm font-medium text-zinc-600">
            {t("landing.quoteHighlight.name")}
          </p>
        </div>
      </motion.div>
    </section>
  );
}
