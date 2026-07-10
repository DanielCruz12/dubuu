// src/components/sections/site-footer.tsx
// Footer estilo alike.page: CTA arriba, wordmark itálico gigante, línea legal
// abajo. Fondo negro puro, línea monocromo de la serie promo.
// Uso: <SiteFooter /> al final del layout/página.

"use client";

import Link from "next/link";
import { instrumentSerif } from "@/lib/fonts";
import { useLanguage } from "@/lib/i18n-context";

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="relative overflow-hidden bg-black pt-14">
      {/* grid de fondo */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative flex justify-center px-6">
        <Link
          href="/home"
          className="rounded-2xl border border-white/20 px-7 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          {t("landing.siteFooter.cta")}
        </Link>
      </div>

      <div className="relative mt-3 flex items-center justify-center overflow-hidden">
        <h2
          className={`${instrumentSerif.className} select-none whitespace-nowrap text-[36vw] italic leading-[0.9] text-zinc-50 sm:text-[23vw] lg:text-[19vw]`}
          style={{ letterSpacing: "-0.03em" }}
        >
          dubuu
        </h2>
      </div>

      <div className="relative mt-2 flex flex-col items-center gap-3 border-t border-white/10 px-6 py-6 text-xs text-white/45 sm:flex-row sm:justify-between sm:px-12">
        <div className="text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} {t("landing.siteFooter.legalName")} ·{" "}
            {t("landing.siteFooter.nit")}. {t("landing.siteFooter.rightsReserved")}
          </p>
          <p className="mt-0.5 text-white/30">{t("landing.siteFooter.tagline")}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-5">
          <Link href="/terms" className="hover:text-white/70">
            {t("landing.siteFooter.terms")}
          </Link>
          <Link href="/privacy" className="hover:text-white/70">
            {t("landing.siteFooter.privacy")}
          </Link>
          <a href="mailto:support@dubuu.com" className="hover:text-white/70">
            support@dubuu.com
          </a>
          <a
            href="https://x.com/Dubuu_sv"
            aria-label="Dubuu en X"
            className="text-white/45 hover:text-white/70"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.9 1.153h3.68l-8.04 9.19L24 22.847h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.65h2.039L6.486 3.24H4.298Z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
