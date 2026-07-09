// src/components/sections/promo-card.tsx
// Diseño 2b — card promocional 1024×576, gris claro editorial + navegador oscuro.
// Uso: <PromoCard /> en cualquier página. Requiere Tailwind (ya configurado en tu repo).

"use client";

import { instrumentSerif, cormorantGaramond as cormorant } from "@/lib/fonts";
import { useLanguage } from "@/lib/i18n-context";

const CHART_POINTS =
  "0,70 45,60 90,74 135,46 180,56 225,38 270,50 315,30 360,42 405,22 450,34 520,14";

export function PromoCard() {
  const { t } = useLanguage();

  const navItems = [
    { key: "profile", label: t("landing.promoCard.navProfile") },
    { key: "panel", label: t("landing.promoCard.navPanel") },
    { key: "bookings", label: t("landing.promoCard.navBookings") },
    { key: "products", label: t("landing.promoCard.navProducts") },
    { key: "payments", label: t("landing.promoCard.navPayments") },
  ];

  const stats = [
    {
      key: "active",
      label: t("landing.promoCard.statActiveLabel"),
      value: "128",
      note: t("landing.promoCard.statActiveNote"),
    },
    {
      key: "income",
      label: t("landing.promoCard.statIncomeLabel"),
      value: "$18,420",
      note: t("landing.promoCard.statIncomeNote"),
    },
    {
      key: "clients",
      label: t("landing.promoCard.statClientsLabel"),
      value: "342",
      note: t("landing.promoCard.statClientsNote"),
    },
  ];

  return (
    <div className="relative h-[576px] w-[1024px] overflow-hidden bg-[#e8e8ea]">
      {/* textura de puntos */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.12) 1.5px, transparent 1.5px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* headline */}
      <div className="relative pt-[52px] text-center">
        <h2
          className={`${instrumentSerif.className} text-[54px] font-normal text-[#111113]`}
        >
          {t("landing.promoCard.headlinePrefix")}{" "}
          <em className="italic text-zinc-500">
            {t("landing.promoCard.headlineEmphasis")}
          </em>
        </h2>
        <p className="mt-2.5 text-[15px] text-black/50">
          {t("landing.promoCard.subtitle")}
        </p>
      </div>

      {/* ventana de navegador */}
      <div className="absolute left-[132px] top-[236px] h-[420px] w-[760px] overflow-hidden rounded-[14px] border border-black/30 bg-[#111113] shadow-[0_40px_80px_rgba(0,0,0,0.35)]">
        {/* barra de navegador */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-[#1a1a1d] px-4 py-3">
          <span className="h-[11px] w-[11px] rounded-full bg-zinc-700" />
          <span className="h-[11px] w-[11px] rounded-full bg-zinc-600" />
          <span className="h-[11px] w-[11px] rounded-full bg-zinc-500" />
          <span className="mx-auto rounded-lg bg-white/[0.07] px-10 py-1 text-[11px] text-white/60">
            dubuu.com/dashboard
          </span>
          <span className="w-[33px]" />
        </div>

        <div className="flex">
          {/* sidebar */}
          <nav className="flex w-[170px] flex-col gap-1 border-r border-white/[0.07] px-3.5 py-[18px]">
            <div
              className={`${cormorant.className} mb-3 text-[20px] font-light tracking-[1px] text-zinc-100`}
            >
              Dubuu
            </div>
            {navItems.map((item) => (
              <span
                key={item.key}
                className={
                  item.key === "panel"
                    ? "rounded-lg bg-white/10 px-2.5 py-2 text-xs text-white"
                    : "px-2.5 py-2 text-xs text-white/60"
                }
              >
                {item.label}
              </span>
            ))}
          </nav>

          {/* contenido */}
          <div className="flex-1 px-6 py-5">
            <div className="text-lg font-bold text-zinc-100">
              {t("landing.promoCard.navPanel")}
            </div>
            <div className="mt-0.5 text-[11px] text-white/50">
              {t("landing.promoCard.panelWelcome")}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {stats.map((stat) => (
                <div
                  key={stat.key}
                  className="rounded-[10px] border border-white/[0.08] bg-[#1c1c1f] p-3"
                >
                  <div className="text-[10px] text-white/60">{stat.label}</div>
                  <div className="mt-1 text-xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="mt-0.5 text-[9px] text-zinc-400">
                    {stat.note}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-[10px] border border-white/[0.08] bg-[#18181b] p-3.5">
              <div className="text-xs font-bold text-zinc-100">
                {t("landing.promoCard.activityTitle")}
              </div>
              <svg
                width="100%"
                height="90"
                viewBox="0 0 520 90"
                preserveAspectRatio="none"
                className="mt-2.5"
              >
                <polyline
                  points={CHART_POINTS}
                  fill="none"
                  stroke="#e4e4e7"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PromoCard;
