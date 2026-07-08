"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck, Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";

const TESTIMONIALS = [
  { id: 1, seed: "maria-g", country: "🇺🇸 USA" },
  { id: 2, seed: "lukas-w", country: "🇩🇪 Deutschland" },
  { id: 3, seed: "sofia-r", country: "🇲🇽 México" },
];

const PAYMENT_BADGES = [
  { src: "/tarjetas.svg", alt: "Visa y Mastercard" },
  { src: "/Google-Pay-logo.png", alt: "Google Pay" },
  { src: "/btc-logo.svg", alt: "Bitcoin" },
];

export default function TrustSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28 px-4 md:px-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mb-12"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-volcanic-600">
          {t("landing.trust.eyebrow")}
        </p>
        <h2 className="mt-3 font-serif text-3xl md:text-5xl font-semibold tracking-tight text-balance">
          {t("landing.trust.title")}
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-stretch">
        {TESTIMONIALS.map((testimonial, i) => (
          <motion.figure
            key={testimonial.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex h-full flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-sm"
          >
            <div className="flex items-center gap-1 mb-4" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star key={idx} className="h-4 w-4 fill-sand-400 text-sand-400" />
              ))}
            </div>
            <blockquote className="flex-1 text-sm md:text-base text-foreground/90 leading-relaxed mb-6 line-clamp-5">
              &ldquo;{t(`landing.trust.testimonial${testimonial.id}.text`)}&rdquo;
            </blockquote>
            <figcaption className="flex items-center gap-3">
              <Image
                src={`https://avatar.vercel.sh/${testimonial.seed}`}
                alt=""
                width={40}
                height={40}
                unoptimized
                className="h-10 w-10 shrink-0 rounded-full"
              />
              <div className="text-sm min-w-0">
                <p className="font-semibold">
                  {t(`landing.trust.testimonial${testimonial.id}.name`)}
                </p>
                <p className="text-muted-foreground text-xs truncate">
                  {testimonial.country} ·{" "}
                  {t(`landing.trust.testimonial${testimonial.id}.tours`)}
                </p>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2 text-sm font-medium text-volcanic-700">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          {t("landing.trust.securePayment")}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 opacity-80">
          {PAYMENT_BADGES.map((badge) => (
            <Image
              key={badge.alt}
              src={badge.src}
              alt={badge.alt}
              width={56}
              height={32}
              className="h-7 w-auto object-contain"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
