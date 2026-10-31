"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n-context";
import { AiMediaFrame } from "./ai-media-frame";

interface AiGeneratingStepProps {
  preview: string | null;
}

export function AiGeneratingStep({ preview }: AiGeneratingStepProps) {
  const [idx, setIdx] = useState(0);
  const { t } = useLanguage();
  const messages = useMemo(
    () => [
      t("dashboard.aiCreate.generatingMessages.analyze"),
      t("dashboard.aiCreate.generatingMessages.detect"),
      t("dashboard.aiCreate.generatingMessages.draft"),
      t("dashboard.aiCreate.generatingMessages.price"),
      t("dashboard.aiCreate.generatingMessages.cover"),
    ],
    [t],
  );

  useEffect(() => {
    const id = setInterval(
      () => setIdx((i) => (i + 1) % messages.length),
      1600,
    );
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div className="space-y-5">
      <div>


      </div>

      <AiMediaFrame>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={t("dashboard.aiCreate.generatingImgAlt")}
            className="absolute inset-0 h-full w-full object-cover opacity-90"
          />
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}

        {/* overlay degradado */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#040a12]/90 via-transparent to-[#040a12]/30" />
        {/* rejilla técnica */}
        <div className="pointer-events-none absolute inset-0 ai-grid ai-grid-move opacity-40" aria-hidden />
        {/* shimmer */}
        <div className="pointer-events-none absolute inset-0 ai-shimmer motion-reduce:hidden" aria-hidden />
        {/* orbe */}
        <div className="pointer-events-none absolute h-44 w-44 ai-orb motion-reduce:hidden" aria-hidden />
        {/* línea de escaneo */}
        <div className="pointer-events-none ai-scan motion-reduce:hidden" aria-hidden />

        {/* esquinas HUD */}
        <span className="pointer-events-none absolute top-3 left-3 h-6 w-6 border-t-2 border-l-2 border-coast-300/90 rounded-tl" />
        <span className="pointer-events-none absolute top-3 right-3 h-6 w-6 border-t-2 border-r-2 border-coast-300/90 rounded-tr" />
        <span className="pointer-events-none absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-coast-300/90 rounded-bl" />
        <span className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-coast-300/90 rounded-br" />

        {/* etiqueta de estado */}
        <div className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-md bg-black/50 backdrop-blur border border-coast-400/30 px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-coast-300 ai-blip" aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-widest text-coast-100">
            processing
          </span>
        </div>
      </AiMediaFrame>

      {/* lectura de progreso */}
      <div className="rounded-xl border border-white/10 bg-black/40 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-coast-300 opacity-75 animate-ping motion-reduce:hidden" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-coast-300" />
          </span>
          <p key={idx} className="flex-1 text-sm font-medium text-zinc-100 animate-in fade-in">
            {messages[idx]}
            <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 bg-coast-200 animate-pulse motion-reduce:hidden" />
          </p>
          <span className="font-mono text-[10px] text-zinc-500">
            {String(idx + 1).padStart(2, "0")}/{messages.length}
          </span>
        </div>

        {/* barra de progreso */}
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-coast-400 to-coast-200 ai-progress motion-reduce:hidden" />
        </div>
      </div>

      {/* puntos de pasos */}
      <div className="flex items-center justify-center gap-2">
        {messages.map((_, i) => (
          <span
            key={i}
            className={
              "h-1.5 rounded-full transition-all duration-500 " +
              (i === idx
                ? "w-6 bg-coast-300 shadow-[0_0_10px_rgba(117,184,255,0.8)]"
                : i < idx
                  ? "w-1.5 bg-coast-500"
                  : "w-1.5 bg-white/15")
            }
          />
        ))}
      </div>
    </div>
  );
}
