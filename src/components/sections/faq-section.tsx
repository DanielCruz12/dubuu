"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/lib/i18n-context";
import DotGridBackground from "@/components/sections/dot-grid-background";

const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9"];

export default function FaqSection() {
  const { t } = useLanguage();

  return (
    <section className="relative py-20 md:py-28 px-4 md:px-20 bg-zinc-950">
      <DotGridBackground />
      <div className="relative mx-auto grid max-w-5xl grid-cols-1 gap-10 md:grid-cols-[minmax(0,1fr)_2fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-label text-lg tracking-[2px] text-zinc-400">
            {t("landing.faq.eyebrow")}
          </p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-normal tracking-tight text-white text-balance">
            {t("landing.faq.titlePrefix")}
            <em className="italic text-zinc-500">
              {t("landing.faq.titleEmphasis")}
            </em>
            {t("landing.faq.titleSuffix")}
          </h2>
          <p className="mt-4 text-sm text-zinc-400 leading-relaxed">
            {t("landing.faq.fallback")}
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-block text-sm font-semibold text-white underline underline-offset-4 hover:text-zinc-300"
          >
            {t("landing.faq.writeToUs")}
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {FAQ_KEYS.map((key) => (
              <AccordionItem key={key} value={key} className="border-white/10">
                <AccordionTrigger className="text-white hover:no-underline [&>svg]:text-zinc-400">
                  {t(`landing.faq.${key}.question`)}
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400 leading-relaxed">
                  {t(`landing.faq.${key}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
