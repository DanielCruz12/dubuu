"use client";

import { useState } from "react";
import type React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n-context";

export default function FinalCta() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.warning(t("landing.finalCta.newsletterInvalid"));
      return;
    }
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      toast.success(t("landing.finalCta.newsletterSuccess"));
      setEmail("");
    } catch {
      toast.error(t("landing.finalCta.newsletterError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-zinc-950 py-24 md:py-32 px-4">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-coast-600/20 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[400px] translate-x-1/4 translate-y-1/4 rounded-full bg-white/5 blur-[100px]"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto max-w-2xl text-center"
      >
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white text-balance">
          {t("landing.finalCta.title")}
        </h2>
        <p className="mt-4 text-base md:text-lg text-zinc-400 text-balance">
          {t("landing.finalCta.subtitle")}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-white text-zinc-950 hover:bg-zinc-200 px-8"
          >
            <Link href="/home">{t("landing.finalCta.primaryCta")}</Link>
          </Button>
          <Link
            href="/contact"
            className="text-sm font-medium text-zinc-300 underline underline-offset-4 hover:text-white"
          >
            {t("landing.finalCta.secondaryCta")}
          </Link>
        </div>

        <div className="mx-auto mt-16 max-w-md border-t border-white/10 pt-10">
          <p className="text-sm font-semibold text-white">
            {t("landing.finalCta.newsletterTitle")}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {t("landing.finalCta.newsletterSubtitle")}
          </p>
          <form
            onSubmit={handleSubmit}
            className="mt-4 flex flex-col sm:flex-row gap-3"
          >
            <Input
              type="email"
              required
              autoComplete="off"
              placeholder={t("landing.finalCta.newsletterPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label={t("landing.finalCta.newsletterTitle")}
              className="min-w-0 flex-auto rounded-full border-white/15 bg-white/[0.04] text-white placeholder:text-zinc-500 focus-visible:ring-white/30"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-white text-zinc-950 hover:bg-zinc-200"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
              {t("landing.finalCta.newsletterCta")}
            </Button>
          </form>
        </div>
      </motion.div>
    </section>
  );
}
