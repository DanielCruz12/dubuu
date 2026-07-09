"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n-context";
import DotGridBackground from "@/components/sections/dot-grid-background";
import SectionFadeTransition from "@/components/sections/section-fade-transition";

const TESTIMONIALS = [
  { id: 1, photo: "women/44", fade: false },
  { id: 2, photo: "men/32", fade: false },
  { id: 3, photo: "women/65", fade: false },
  { id: 4, photo: "men/46", fade: false },
  { id: 5, photo: "women/68", fade: true },
  { id: 6, photo: "men/51", fade: false },
  { id: 7, photo: "men/12", fade: false },
  { id: 8, photo: "women/21", fade: true },
];

export default function TrustSection() {
  const { t } = useLanguage();

  return (
    <section
      id="testimonios"
      className="relative bg-white py-24 md:py-32 px-4 md:px-12 scroll-mt-20"
    >
      <DotGridBackground dark={false} edgeFade edgeFadeSize={170} />
      <SectionFadeTransition position="top" />
      <SectionFadeTransition position="bottom" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto mb-12 max-w-2xl text-center md:mb-16"
      >
        <p className="font-label text-lg tracking-[2px] text-zinc-500">
          {t("landing.trust.eyebrow")}
        </p>
        <h2 className="mt-3 font-display text-3xl md:text-5xl font-normal tracking-tight text-black text-balance">
          {t("landing.trust.titlePrefix")}
          <em className="italic text-zinc-500">
            {t("landing.trust.titleEmphasis")}
          </em>
          {t("landing.trust.titleSuffix")}
        </h2>
      </motion.div>

      <div className="relative mx-auto max-w-6xl columns-1 gap-5 sm:columns-2 lg:columns-4">
        {TESTIMONIALS.map((testimonial, i) => (
          <motion.figure
            key={testimonial.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
            className="mb-5 break-inside-avoid rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <blockquote
              className={
                testimonial.fade
                  ? "text-[15px] leading-relaxed text-black [mask-image:linear-gradient(to_bottom,black_65%,transparent_100%)]"
                  : "text-[15px] leading-relaxed text-black"
              }
            >
              &ldquo;{t(`landing.trust.testimonial${testimonial.id}.text`)}&rdquo;
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0">
                <Image
                  src={`https://randomuser.me/api/portraits/${testimonial.photo}.jpg`}
                  alt=""
                  fill
                  unoptimized
                  sizes="40px"
                  className="rounded-full object-cover"
                />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-zinc-200 bg-white">
                  <Image src="/icon.svg" alt="" width={9} height={10} />
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-black">
                  {t(`landing.trust.testimonial${testimonial.id}.name`)}
                </p>
                <p className="text-xs text-zinc-400">
                  {t(`landing.trust.testimonial${testimonial.id}.tours`)}
                </p>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
