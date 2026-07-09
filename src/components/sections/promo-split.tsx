// src/components/sections/promo-split.tsx
// Diseño 2d — sección split monocromo: mensaje + métricas a la izquierda,
// teléfono con reservas a la derecha. Responsive (stack en móvil).
// Uso: <PromoSplit /> en cualquier página. Requiere Tailwind.

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { instrumentSerif, cormorantGaramond as cormorant } from "@/lib/fonts";
import { useLanguage } from "@/lib/i18n-context";
import DotGridBackground from "@/components/sections/dot-grid-background";

const STATS = [
  { value: "128", label: "Reservas activas", highlight: false },
  { value: "$18.4k", label: "Ingresos totales", highlight: false },
  { value: "+12%", label: "vs mes pasado", highlight: true },
] as const;

const BOOKINGS = [
  {
    title: "Cabaña Vista Mar",
    detail: "María G. · 2 noches · $240",
    status: "Confirmada",
    pending: false,
    featured: true,
  },
  {
    title: "Tour en kayak",
    detail: "Carlos R. · 4 personas · $96",
    status: "Pendiente",
    pending: true,
    featured: false,
  },
  {
    title: "Día de playa",
    detail: "Ana L. · 6 personas · $180",
    status: "Confirmada",
    pending: false,
    featured: false,
  },
  {
    title: "Cabaña El Faro",
    detail: "Luis M. · 3 noches · $360",
    status: "Confirmada",
    pending: false,
    featured: false,
  },
] as const;

export function PromoSplit() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0e0e10] from-50% to-[#1c1c1f]">
      <DotGridBackground />
      {/* glow inferior derecho */}
      <div
        className="pointer-events-none absolute -bottom-36 -right-36 h-[520px] w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.1), transparent 65%)",
        }}
      />
      {/* línea divisoria vertical (solo desktop) */}
      <div
        className="pointer-events-none absolute -top-16 right-[280px] hidden h-[calc(100%+8rem)] w-px lg:block"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(255,255,255,0.14), transparent)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto flex max-w-6xl flex-col gap-14 px-6 py-16 sm:px-10 lg:flex-row lg:gap-0 lg:py-0"
      >
        {/* columna izquierda */}
        <div className="relative flex-1 lg:py-[84px] lg:pr-12">
          <div
            className={`${cormorant.className} font-label text-2xl font-light tracking-[2px] text-zinc-100`}
          >
            {t("landing.forHosts.eyebrow")}
          </div>
          <h2
            className={`${instrumentSerif.className} font-display mt-6 max-w-[480px] text-4xl leading-[1.05] text-zinc-50 sm:text-5xl lg:text-[58px]`}
          >
            {t("landing.forHosts.titlePrefix")}{" "}
            <em className="italic text-zinc-400">
              {t("landing.forHosts.titleEmphasis")}
            </em>
          </h2>
          <p className="mt-4 max-w-[400px] text-[15px] leading-relaxed text-white/55">
            {t("landing.forHosts.subtitle")}
          </p>

          <div className="mt-10 flex flex-wrap items-stretch gap-x-9 gap-y-6">
            {STATS.map((stat, i) => (
              <div key={stat.label} className="flex items-stretch gap-9">
                {i > 0 && <div className="w-px bg-white/10" />}
                <div>
                  <div
                    className={`text-[28px] font-bold sm:text-[32px] ${
                      stat.highlight ? "text-zinc-200" : "text-white"
                    }`}
                  >
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs text-white/50">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/investment"
            className="mt-10 inline-block rounded-full bg-zinc-100 px-7 py-3 text-sm font-bold text-[#0c0c0d] transition-colors hover:bg-white"
          >
            {t("landing.forHosts.cta")}
          </Link>
        </div>

        {/* columna derecha: teléfono */}
        <div className="relative flex justify-center lg:w-[400px] lg:justify-start">
          <div className="w-[300px] rotate-2 rounded-[48px] bg-[#26262a] p-[9px] shadow-[0_40px_80px_rgba(0,0,0,0.75),0_0_0_2px_rgba(255,255,255,0.14)] lg:absolute lg:left-11 lg:top-16 lg:h-[580px] lg:rotate-[4deg]">
            <div className="relative h-full overflow-hidden rounded-[40px] bg-[#0e0e10] pb-8 lg:pb-0">
              {/* notch */}
              <div className="absolute left-1/2 top-[11px] h-6 w-[90px] -translate-x-1/2 rounded-[13px] bg-black" />
              <div className="px-[22px] pt-[58px]">
                <div
                  className={`${instrumentSerif.className} text-[28px] text-zinc-50`}
                >
                  Reservas
                </div>
                <div className="mt-1 text-[11px] text-white/50">
                  Hoy · 8 de julio
                </div>
                <div className="mt-5 flex flex-col gap-2.5">
                  {BOOKINGS.map((b) => (
                    <div
                      key={b.title}
                      className={
                        b.featured
                          ? "rounded-2xl border border-white/[0.22] bg-white/[0.12] p-3.5"
                          : "rounded-2xl border border-white/10 bg-white/5 p-3.5"
                      }
                    >
                      <div className="flex justify-between gap-2">
                        <div className="text-[13px] font-bold text-white">
                          {b.title}
                        </div>
                        <div
                          className={`text-[11px] ${
                            b.pending ? "text-zinc-500" : "text-zinc-200"
                          }`}
                        >
                          {b.status}
                        </div>
                      </div>
                      <div className="mt-1.5 text-[11px] text-white/55">
                        {b.detail}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default PromoSplit;
