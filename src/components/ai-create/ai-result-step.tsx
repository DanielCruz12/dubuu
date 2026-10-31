"use client";

import { useMemo, type ReactNode } from "react";
import {
  AlertCircle,
  Armchair,
  Check,
  Cog,
  Droplets,
  Pencil,
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
import { AiMediaCarousel } from "./ai-media-carousel";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n-context";

interface AiResultStepProps {
  preview: string | null;
  bannerUrl?: string | null;
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

/** Tarjeta del borrador (mismo lenguaje que la card pública). */
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
      {/* encabezado: marca · modelo · año (izq) + precio (der) */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          <V missing={missingBrand}>{missingBrand ? pending : (suggestion.brand as string)}</V>
          {" · "}
          <V missing={missingModel}>{missingModel ? pending : (suggestion.model as string)}</V>
          {suggestion.year != null && (
            <>
              {" · "}
              <span className="text-zinc-300">{suggestion.year}</span>
            </>
          )}
        </p>
        <div className="shrink-0 text-right">
          <span className="text-lg font-semibold tabular-nums text-primary">
            ${Number(values.price_per_day).toFixed(2)}
          </span>
          <span className="ml-1 text-xs text-zinc-500">{t("dashboard.aiCreate.perDay")}</span>
        </div>
      </div>

      <p className="mt-2 text-lg font-semibold leading-tight text-white">{values.name}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
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

      <p className="mt-3 text-sm leading-relaxed text-zinc-400 line-clamp-2">
        {values.description}
      </p>

      {/* specs debajo de la descripción */}
      <p className="mt-3 border-t border-white/10 pt-3 text-xs text-zinc-400">
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

export function AiResultStep({
  preview,
  bannerUrl,
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

  return (
    <div className="space-y-5">
      <div className="grid items-start gap-5 lg:grid-cols-2">
        {/* columna izquierda: carrusel */}
        <div className="ai-reveal" style={{ animationDelay: "60ms" }}>
          <AiMediaCarousel
            bannerUrl={bannerUrl ?? null}
            preview={preview}
            gallery={gallery}
            bannerAiGenerated={bannerAiGenerated}
          />
        </div>

        {/* columna derecha: info generada por IA */}
        <div className="ai-reveal" style={{ animationDelay: "120ms" }}>
          <AiDraftCard values={values} suggestion={suggestion} />
        </div>
      </div>

      {error && (
        <div className="ai-reveal flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300" style={{ animationDelay: "200ms" }}>
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="ai-reveal sticky bottom-0 z-10 -mx-6 bg-gradient-to-t from-black via-black/90 to-transparent px-6 pb-2 pt-8" style={{ animationDelay: "240ms" }}>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            onClick={() => onPublish(values)}
            disabled={publishing}
            className="flex-1 h-9 rounded-xl bg-coast-500 text-white font-semibold shadow-md transition-all hover:bg-coast-400 active:scale-[0.98] disabled:opacity-50"
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
            className="flex-1 rounded-xl border-white/10 bg-white/[0.03] text-white font-semibold shadow-sm transition-all hover:bg-white/[0.08] active:scale-[0.98] disabled:opacity-50"
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
