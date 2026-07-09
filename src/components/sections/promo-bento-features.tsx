// src/components/sections/promo-bento-features.tsx
// Sección de features — bento grid de mini-pantallas (pagos seguros, ticket de
// reserva, próximas reservas, chart de ingresos, anfitrión, CTA).
// Mismo estilo monocromo de la serie promo. Compacto: 2 filas en desktop.
// Uso: <PromoBentoFeatures /> en cualquier página.

"use client";

import { motion } from "framer-motion";
import {
  Bell,
  Check,
  CreditCard,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { instrumentSerif, cormorantGaramond as cormorant } from "@/lib/fonts";
import { useLanguage } from "@/lib/i18n-context";
import DotGridBackground from "@/components/sections/dot-grid-background";

const WEEK_BARS = [40, 65, 30, 80, 55, 95, 45];
const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

function Tile({
  className = "",
  children,
  delay = 0,
}: {
  className?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay }}
      className={`rounded-2xl border border-white/10 bg-[#1c1c1f] p-4 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function PromoBentoFeatures() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-[#0e0e10] px-6 py-20 sm:px-10 md:py-28">
      <DotGridBackground />

      <div className="relative mx-auto max-w-6xl">
        {/* encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center md:mb-14"
        >
          <p
            className={`${cormorant.className} font-label text-lg tracking-[3px] text-white/60`}
          >
            {t("landing.bentoFeatures.eyebrow")}
          </p>
          <h2
            className={`${instrumentSerif.className} font-display mx-auto mt-3 max-w-2xl text-balance text-4xl text-zinc-50 sm:text-5xl lg:text-[38px]`}
          >
            {t("landing.bentoFeatures.titlePrefix")}{" "}
            <em className="italic text-zinc-400">
              {t("landing.bentoFeatures.titleEmphasis")}
            </em>{" "}
            {t("landing.bentoFeatures.titleSuffix")}
          </h2>
        </motion.div>

        {/* bento grid */}
        <div className="grid grid-flow-dense grid-cols-2 auto-rows-[76px] gap-3.5 sm:grid-cols-6 lg:grid-cols-12">
          {/* pagos seguros */}
          <Tile className="col-span-2 row-span-2 flex flex-col justify-between sm:col-span-2 lg:col-span-3">
            <div className="text-[10px] tracking-wide text-white/55">
              PAGOS SEGUROS
            </div>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <ShieldCheck className="h-8 w-8 text-zinc-100" />
            </div>
            <div className="text-[11px] font-bold text-white">
              Cifrado end-to-end
            </div>
          </Tile>

          {/* próximas reservas */}
          <Tile
            className="col-span-1 row-span-2 flex flex-col gap-2 sm:col-span-2 lg:col-span-3"
            delay={0.05}
          >
            <div className="mb-0.5 text-[10px] tracking-wide text-white/55">
              PRÓXIMAS
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1.5">
              <span className="text-[11px] text-white">Cabaña El Faro</span>
              <span className="text-[9px] text-zinc-400">2 noches</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1.5">
              <span className="text-[11px] text-white">Tour kayak</span>
              <span className="text-[9px] text-zinc-400">4 pers.</span>
            </div>
          </Tile>

          {/* toggles */}
          <Tile
            className="col-span-1 row-span-2 grid grid-cols-2 gap-2 sm:col-span-1 lg:col-span-2"
            delay={0.1}
          >
            <div className="flex items-center justify-center rounded-lg bg-white/5">
              <Bell className="h-3.5 w-3.5 text-zinc-300" />
            </div>
            <div className="flex items-center justify-center rounded-lg bg-zinc-100">
              <Check className="h-3.5 w-3.5 text-[#0c0c0d]" />
            </div>
            <div className="flex items-center justify-center rounded-lg bg-white/5">
              <CreditCard className="h-3.5 w-3.5 text-zinc-300" />
            </div>
            <div className="flex items-center justify-center rounded-lg bg-white/5">
              <MapPin className="h-3.5 w-3.5 text-zinc-300" />
            </div>
          </Tile>

          {/* ticket de reserva */}
          <Tile
            className="col-span-2 row-span-2 bg-[#141416] px-5 py-4.5 sm:col-span-3 lg:col-span-4"
            delay={0.05}
          >
            <div className="flex items-center justify-between">
              <div className="text-[11px] text-white/50">
                CONFIRMACIÓN DE RESERVA
              </div>
              <div className="h-[7px] w-[7px] rounded-full bg-zinc-400" />
            </div>
            <div className="mt-3.5 flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-white sm:text-2xl">
                  Cabaña
                </div>
                <div className="text-[10px] text-zinc-500">Vista Mar</div>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-600" />
              <div className="text-right">
                <div className="text-xl font-bold text-white sm:text-2xl">
                  Playa
                </div>
                <div className="text-[10px] text-zinc-500">El Tunco</div>
              </div>
            </div>
            <div className="mt-4 flex justify-between border-t border-dashed border-white/15 pt-3.5">
              <div>
                <div className="text-[9px] text-zinc-500">CHECK-IN</div>
                <div className="text-[13px] font-bold text-white">14:00</div>
              </div>
              <div>
                <div className="text-[9px] text-zinc-500">NOCHES</div>
                <div className="text-[13px] font-bold text-white">2</div>
              </div>
              <div>
                <div className="text-[9px] text-zinc-500">RESERVA</div>
                <div className="text-[13px] font-bold text-white">#0092</div>
              </div>
            </div>
          </Tile>

          {/* chart ingresos */}
          <Tile
            className="col-span-1 row-span-2 sm:col-span-2 lg:col-span-4"
            delay={0.05}
          >
            <div className="text-[11px] text-white/60">
              Ingresos por semana
            </div>
            <div className="mt-2.5 flex h-11 items-end gap-1">
              {WEEK_BARS.map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${
                    h === Math.max(...WEEK_BARS) ? "bg-zinc-100" : "bg-zinc-700"
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="mt-1.5 flex justify-between text-[8px] text-zinc-600">
              {WEEKDAYS.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
          </Tile>

          {/* CTA */}
          <Tile
            className="col-span-2 row-span-2 flex flex-col justify-between !border-transparent !bg-zinc-100 sm:col-span-2 lg:col-span-3"
            delay={0.1}
          >
            <div className="text-[11px] font-bold text-zinc-600">
              TU RESERVA
            </div>
            <div className="text-[15px] font-bold text-[#0c0c0d]">
              Confirmar ahora
            </div>
            <div className="ml-auto flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#0c0c0d]">
              <ArrowUpRight className="h-3.5 w-3.5 text-white" />
            </div>
          </Tile>

          {/* anfitrión */}
          <Tile
            className="col-span-2 row-span-2 flex items-center gap-3.5 sm:col-span-4 lg:col-span-5"
            delay={0.15}
          >
            <div className="h-11 w-11 shrink-0 rounded-full bg-zinc-700" />
            <div>
              <div className="text-[10px] text-white/50">TU ANFITRIÓN</div>
              <div className="mt-0.5 text-[15px] font-bold text-white">
                Conoce a Luis M.
              </div>
            </div>
          </Tile>
        </div>
      </div>
    </section>
  );
}

export default PromoBentoFeatures;
