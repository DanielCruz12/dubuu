"use client";

import { motion } from "framer-motion";
import { Search, CalendarCheck, ShieldCheck, PartyPopper } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";

const STEPS = [
  { key: "step1", icon: Search },
  { key: "step2", icon: CalendarCheck },
  { key: "step3", icon: ShieldCheck },
  { key: "step4", icon: PartyPopper },
];

export default function HowItWorksSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28 px-4 md:px-20 bg-zinc-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mb-14"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
          {t("landing.howItWorks.eyebrow")}
        </p>
        <h2 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight text-white text-balance">
          {t("landing.howItWorks.title")}
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-6">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="font-mono text-xs text-white/40">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">
                {t(`landing.howItWorks.${step.key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                {t(`landing.howItWorks.${step.key}.description`)}
              </p>
              {i < STEPS.length - 1 && (
                <div
                  className="absolute right-[-1.25rem] top-[1.375rem] hidden h-px w-6 bg-white/15 md:block"
                  aria-hidden="true"
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
