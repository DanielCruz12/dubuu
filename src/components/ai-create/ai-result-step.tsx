"use client";

import { useMemo, type ReactNode } from "react";
import {
  AlertCircle,
  Armchair,
  Check,
  Cog,
  Download,
  Droplets,
  Pencil,
  Sparkles,
  ScanLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type AiConfidenceLevel,
  type AiFieldKey,
  type AiLocale,
  type AiResultFormValues,
  type AiVehicleSuggestion,
  isMissing,
  suggestionToPublishValues,
} from "./ai-types";
import { AiMediaFrame } from "./ai-media-frame";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n-context";

interface AiResultStepProps {
  preview: string | null;
  bannerUrl?: string | null;
  socialUrl?: string | null;
  gallery?: { view: string; url: string }[];
  bannerAiGenerated?: boolean;
  suggestion: AiVehicleSuggestion;
  confidence: Record<AiFieldKey, AiConfidenceLevel | number>;
  onPublish: (values: AiResultFormValues) => void;
  onEditBeforePublish: () => void;
  publishing?: boolean;
  error?: string | null;
}

/** Valor con estilo "por confirmar" cuando la IA no lo dedujo. */
function V({
  missing,
  className,
  children,
}: {
  missing: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={cn(missing ? "text-coast-300" : className)}>{children}</span>
  );
}

/** Tarjeta minimalista del borrador: mismo lenguaje que la card pública (TourCard). */
function AiDraftCard({
  values,
  suggestion,
}: {
  values: AiResultFormValues;
  suggestion: AiVehicleSuggestion;
}) {
  const { t } = useLanguage();
  const pending = t("dashboard.aiCreate.pendingValue");
  const missingBrand = isMissing(suggestion.brand);
  const missingModel = isMissing(suggestion.model);
  const missingYear = suggestion.year == null;
  const missingTrans = !suggestion.transmission;
  const missingFuel = !suggestion.fuel_type;
  const missingSeats = suggestion.seating_capacity == null;

  const missingColor = !suggestion.color;
  const missingEngine = isMissing(suggestion.engine);
  const missingCondition = !suggestion.condition;


  const pill = (guessed: boolean) =>
    cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
      guessed
        ? "border-coast-400/40 bg-coast-500/10 text-coast-200"
        : "border-white/10 bg-white/[0.04] text-zinc-300",
    );
  const pillIcon = (guessed: boolean) =>
    cn("h-3.5 w-3.5", guessed ? "text-coast-300" : "text-zinc-500");

  return (
    <div className="ai-panel p-4 sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
        <V missing={missingBrand}>{missingBrand ? pending : (suggestion.brand as string)}</V>
        {" · "}
        <V missing={missingModel}>{missingModel ? pending : (suggestion.model as string)}</V>
        {" · "}
        <V missing={missingYear}>{missingYear ? pending : values.year}</V>
      </p>
      <p className="mt-1 text-lg font-semibold leading-tight text-white">{values.name}</p>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <span className={pill(missingSeats)}>
          <Armchair className={pillIcon(missingSeats)} aria-hidden />
          {values.seating_capacity} {t("dashboard.aiCreate.seats")}
        </span>
        <span className={pill(missingTrans)}>
          <Cog className={pillIcon(missingTrans)} aria-hidden />
          {t(`dashboard.aiCreate.transmissions.${values.transmission}`)}
        </span>
        <span className={pill(missingFuel)}>
          <Droplets className={pillIcon(missingFuel)} aria-hidden />
          {t(`dashboard.aiCreate.fuels.${values.fuel_type}`)}
        </span>
      </div>

      <p className="mt-2.5 text-sm leading-relaxed text-zinc-400 line-clamp-2">
        {values.description}
      </p>

      <p className="text-xs pt-3 text-zinc-400">
        {t("dashboard.aiCreate.fields.year")}{" "}
        <V missing={missingYear} className="text-zinc-200">
          {missingYear ? pending : suggestion.year}
        </V>
        {" · "}
        {t("dashboard.aiCreate.fields.color")}{" "}
        <V missing={missingColor} className="text-zinc-200">
          {suggestion.color ? t(`dashboard.aiCreate.colors.${suggestion.color}`) : pending}
        </V>
        {" · "}
        {t("dashboard.aiCreate.fields.engine")}{" "}
        <V missing={missingEngine} className="text-zinc-200">
          {isMissing(suggestion.engine) ? pending : (suggestion.engine as string)}
        </V>
        {" · "}
        {t("dashboard.aiCreate.fields.condition")}{" "}
        <V missing={missingCondition} className="text-zinc-200">
          {suggestion.condition ? t(`dashboard.aiCreate.conditions.${suggestion.condition}`) : pending}
        </V>
      </p>
    </div>
  );
}

/** Especificaciones + precio, mostrados debajo de la foto de portada. */
function AiSpecsPrice({
  values,
}: {
  values: AiResultFormValues;
  suggestion: AiVehicleSuggestion;
}) {
  const { t } = useLanguage();

  return (
    <div className="ai-panel ">

      <div className=" flex items-baseline gap-1.5 border-t border-white/10 pt-2">
        <span className="text-2xl font-semibold tabular-nums ">
          ${Number(values.price_per_day).toFixed(2)}
        </span>
        <span className="text-xs text-zinc-500">{t("dashboard.aiCreate.perDay")}</span>
      </div>
    </div>
  );
}

export function AiResultStep({
  preview,
  bannerUrl,
  socialUrl,
  gallery = [],
  bannerAiGenerated,
  suggestion,
  onPublish,
  onEditBeforePublish,
  publishing,
  error,
}: AiResultStepProps) {
  const { t, language } = useLanguage();
  const locale: AiLocale = language === "en" ? "en" : "es";
  const ready = useMemo(() => suggestionToPublishValues(suggestion, locale), [suggestion, locale]);
  const values = ready.values;
  const cover = bannerUrl ?? preview;

  return (
    <div className="space-y-5">
      <div className="grid items-start gap-5 lg:grid-cols-2">
        {/* columna izquierda: imágenes */}
        <div className="space-y-4">

          {/* portada */}
          <AiMediaFrame>
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt={t("dashboard.aiCreate.coverAlt")} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-black" />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#040a12]/85 via-transparent to-transparent" />

            {/* esquinas HUD */}
            <span className="pointer-events-none absolute top-3 left-3 h-6 w-6 border-t-2 border-l-2 border-coast-300/80 rounded-tl" />
            <span className="pointer-events-none absolute top-3 right-3 h-6 w-6 border-t-2 border-r-2 border-coast-300/80 rounded-tr" />
            <span className="pointer-events-none absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-coast-300/80 rounded-bl" />
            <span className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-coast-300/80 rounded-br" />

            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-coast-500/90 text-white px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase shadow-[0_0_18px_rgba(63,143,187,0.5)]">
              {bannerAiGenerated ? (
                <>
                  <Sparkles className="h-3 w-3" /> {t("dashboard.aiCreate.coverBadgeEnhanced")}
                </>
              ) : (
                <>
                  <ScanLine className="h-3 w-3" /> {t("dashboard.aiCreate.coverBadge")}
                </>
              )}
            </span>
          </AiMediaFrame>

          {/* especificaciones + precio debajo de la foto */}
          <AiSpecsPrice values={values} suggestion={suggestion} />

          {/* versión redes */}
          {socialUrl && (
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={socialUrl}
                alt={t("dashboard.aiCreate.socialAlt")}
                className="h-16 w-[52px] rounded-lg object-cover border border-white/10"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white">{t("dashboard.aiCreate.socialTitle")}</p>
                <p className="text-[11px] text-zinc-500">{t("dashboard.aiCreate.socialSubtitle")}</p>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
              >
                <a href={socialUrl} download target="_blank" rel="noreferrer">
                  <Download className="h-3.5 w-3.5 mr-1" />
                  {t("dashboard.aiCreate.download")}
                </a>
              </Button>
            </div>
          )}

          {/* ── Galería IA ── */}
          {gallery.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                {t("dashboard.aiCreate.galleryTitle")}
              </p>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {gallery.map((g) => (
                  <figure
                    key={g.view}
                    className="w-28 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-zinc-950"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={g.url}
                      alt={t(`dashboard.aiCreate.views.${g.view}`)}
                      className="h-20 w-full object-cover"
                    />
                    <figcaption className="px-1.5 py-1 text-center text-[10px] text-zinc-400">
                      {t(`dashboard.aiCreate.views.${g.view}`)}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* columna derecha: info generada por IA */}
        <div className="space-y-4">
          {/* tarjeta del borrador */}
          <AiDraftCard values={values} suggestion={suggestion} />
        </div>
      </div>



      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="sticky bottom-0 z-10 -mx-6 bg-gradient-to-t from-black via-black/90 to-transparent px-6 pb-2 pt-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            onClick={() => onPublish(values)}
            disabled={publishing}
            className="flex-1 h-11 font-semibold bg-secondary text-white hover:text-black"
          >
            {publishing ? (
              t("dashboard.aiCreate.publishing")
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4" />
                {t("dashboard.aiCreate.publishButton")}
              </span>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onEditBeforePublish}
            disabled={publishing}
            className="flex-1 h-11 border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
          >
            <Pencil className="h-4 w-4 mr-1.5" />
            {t("dashboard.aiCreate.editBeforePublishButton")}
          </Button>
        </div>
        <p className="mt-2 text-xs text-zinc-500 text-center">{t("dashboard.aiCreate.draftHiddenNote")}</p>
      </div>
    </div>
  );
}
