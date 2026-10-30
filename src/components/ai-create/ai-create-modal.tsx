"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AiChoiceCards } from "./ai-choice-cards";
import { AiUploadStep } from "./ai-upload-step";
import { AiGeneratingStep } from "./ai-generating-step";
import { AiResultStep } from "./ai-result-step";
import { AiSuccessStep } from "./ai-success-step";
import { setAiPrefill } from "./ai-prefill";
import type { AiAnalyzeResponse, AiEnhanceResponse, AiResultFormValues } from "./ai-types";
import { useAnalyzeVehicleMutation, useEnhanceVehicleImageMutation, usePublishVehicleMutation, useGetAiLimitStatusQuery } from "@/redux/slices/ai-product/ai-product-slice";
import { useGetProductTypesQuery } from "@/redux/slices/product/product-types";
import { productTypeNameToFormKind } from "@/utils";
import { X, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";
import { productsApiSlice } from "@/redux/slices/product/product-slice";
import { useAppDispatch } from "@/redux/store";

type View = "choice" | "upload" | "generating" | "result" | "success";

interface AiCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** kind actual de la tabla (tours/rental) para decidir manual */
  tableKind?: "tours" | "rental";
  productTypeIdForAdd?: string;
}

export function AiCreateModal({ open, onOpenChange, tableKind, productTypeIdForAdd }: AiCreateModalProps) {
  const router = useRouter();
  const { user } = useUser();
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const [view, setView] = useState<View>("choice");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzeResult, setAnalyzeResult] = useState<AiAnalyzeResponse | null>(null);
  const [enhanceResult, setEnhanceResult] = useState<AiEnhanceResponse | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [createdProductId, setCreatedProductId] = useState<string | undefined>(undefined);
  const [createdProductName, setCreatedProductName] = useState<string | undefined>(undefined);

  const [analyzeVehicle, { isLoading: isAnalyzing }] = useAnalyzeVehicleMutation();
  const [enhanceVehicleImage, { isLoading: isEnhancing }] = useEnhanceVehicleImageMutation();
  const [publishVehicle, { isLoading: isPublishing }] = usePublishVehicleMutation();
  const { data: limitStatus } = useGetAiLimitStatusQuery(undefined, { skip: !open });
  const { data: productTypes = [] } = useGetProductTypesQuery();

  const rentalTypeId = useMemo(() => {
    if (productTypeIdForAdd) return productTypeIdForAdd;
    const pt = productTypes.find((p) => productTypeNameToFormKind(p.name) === "rental");
    return pt?.id;
  }, [productTypes, productTypeIdForAdd]);

  const toursTypeId = useMemo(() => {
    const pt = productTypes.find((p) => productTypeNameToFormKind(p.name) === "tours");
    return pt?.id;
  }, [productTypes]);

  // reset when opened
  useEffect(() => {
    if (open) {
      setView("choice");
      setFile(null);
      setPreview(null);
      setAnalyzeResult(null);
      setEnhanceResult(null);
      setAnalyzeError(null);
      setPublishError(null);
      setCreatedProductId(undefined);
    }
  }, [open]);

  // file preview
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleManual = useCallback(() => {
    onOpenChange(false);
    if (tableKind === "tours" && toursTypeId) {
      router.push(`/dashboard/products/add?type=${encodeURIComponent(toursTypeId)}`);
    } else if (rentalTypeId) {
      router.push(`/dashboard/products/add?type=${encodeURIComponent(rentalTypeId)}`);
    } else {
      router.push(`/dashboard/products/add?type=${encodeURIComponent(productTypeIdForAdd ?? "")}`);
    }
  }, [onOpenChange, router, tableKind, rentalTypeId, toursTypeId, productTypeIdForAdd]);

  const mapAnalyzeError = useCallback((err: unknown): string => {
    const data = (err as { data?: { code?: string; message?: string; error?: string } })?.data;
    const code = data?.code ?? (err as { status?: number })?.status;
    const msg = data?.message ?? data?.error;
    if (code === "AI_LIMIT_REACHED" || (typeof code === "number" && code === 429 && String(msg).includes("AI_LIMIT"))) {
      return t("dashboard.aiCreate.errors.limitWithSupport");
    }
    if (data?.code === "NOT_VEHICLE") return t("dashboard.aiCreate.errors.notVehicle");
    if (data?.code === "BLURRY_IMAGE") return t("dashboard.aiCreate.errors.blurry");
    if (data?.code === "TIMEOUT") return t("dashboard.aiCreate.errors.timeout");
    if (msg) return msg;
    const status = (err as { status?: number })?.status;
    if (status === 429) return t("dashboard.aiCreate.errors.limit");
    if (status === 413) return t("dashboard.aiCreate.errors.tooHeavy");
    if (status === 400) return t("dashboard.aiCreate.errors.badFormat");
    return t("dashboard.aiCreate.errors.generic");
  }, [t]);

  const handleGenerate = useCallback(async () => {
    if (!file || !user?.id) {
      if (!user?.id) {
        toast.error(t("dashboard.aiCreate.toasts.loginRequired"));
        return;
      }
      return;
    }
    setAnalyzeError(null);
    setPublishError(null);
    setEnhanceResult(null);
    setView("generating");
    try {
      // compress-like: send as FormData (backend will handle upload)
      const fd = new FormData();
      fd.append("image", file);
      fd.append("file", file);
      // some backends expect 'image' field
      const res = await analyzeVehicle(fd).unwrap();
      setAnalyzeResult(res);
      // Fotos mejoradas para portada + redes (con fallback, nunca bloquea)
      try {
        const efd = new FormData();
        efd.append("image", file);
        efd.append("file", file);
        const enh = await enhanceVehicleImage(efd).unwrap();
        setEnhanceResult(enh);
      } catch {
        setEnhanceResult(null);
      }
      setView("result");
    } catch (err: unknown) {
      // fallback to mock for local dev when backend not yet mounted (404)
      const status = (err as { status?: number })?.status;
      const isNotFound = status === 404 || String(err).includes("404");
      if (isNotFound) {
        // mock demo so UI can be verified without backend
        await new Promise((r) => setTimeout(r, 900));
        const mock: AiAnalyzeResponse = {
          data: {
            brand: "Toyota",
            model: "Corolla",
            year: 2020,
            color: "white",
            transmission: "automatic",
            fuel_type: "gasoline",
            seating_capacity: 5,
            condition: "used",
            engine: "1.8L",
            name: "Toyota Corolla 2020 — cómodo y eficiente",
            description:
              "Sedán confiable y económico, ideal para ciudad y carretera. Interior cómodo, bajo consumo y mantenimiento sencillo. Perfecto para viajes cortos y escapadas de fin de semana en El Salvador.",
            price_per_day: 38,
            price_min: 32,
            price_max: 45,
          },
          confidence: {
            brand: "high",
            model: "high",
            year: "medium",
            color: "high",
            transmission: "low",
            fuel_type: "medium",
            seating_capacity: "medium",
            engine: "low",
            condition: "medium",
            name: "high",
            description: "high",
            price_per_day: "medium",
          },
          imageUrl: preview ?? "",
        };
        setAnalyzeResult(mock);
        setView("result");
        toast.info(t("dashboard.aiCreate.toasts.demoAnalyze"));
        return;
      }
      setAnalyzeError(mapAnalyzeError(err));
      setView("upload");
    }
  }, [file, user?.id, analyzeVehicle, enhanceVehicleImage, mapAnalyzeError, preview, t]);

  const handlePublish = useCallback(
    async (values: AiResultFormValues) => {
      setPublishError(null);
      if (!user?.id) {
        toast.error(t("dashboard.aiCreate.toasts.invalidSession"));
        return;
      }
      // need rental type id
      if (!rentalTypeId) {
        setPublishError(t("dashboard.aiCreate.errors.noRentalType"));
        return;
      }
      // build FormData similar to rental flow but with AI fields
      // if we have file, attach as banner; backend can use uploaded imageUrl otherwise we re-upload
      const fd = new FormData();
      fd.append("name", values.name);
      fd.append("description", values.description);
      fd.append("brand", values.brand);
      fd.append("model", values.model);
      fd.append("year", String(values.year));
      fd.append("color", values.color);
      fd.append("transmission", values.transmission);
      fd.append("fuel_type", values.fuel_type);
      fd.append("seating_capacity", String(values.seating_capacity));
      fd.append("engine", values.engine);
      fd.append("condition", values.condition);
      fd.append("price_per_day", String(values.price_per_day));
      fd.append("price", String(values.price_per_day));
      fd.append("product_type_id", rentalTypeId);
      // defaults for required fields not deduced by IA
      fd.append("country", "SV");
      fd.append("address", "");
      fd.append("pickup_location", "");
      fd.append("offers_delivery", "true");
      fd.append("max_delivery_distance_km", "50");
      fd.append("fee_per_km", "0");
      fd.append("delivery_mode", "coverage");
      fd.append("specific_areas", JSON.stringify([]));
      fd.append("coverage_all_country", JSON.stringify(true));
      fd.append("coverage_departments", JSON.stringify([]));
      // availability defaults (one year)
      const from = new Date().toISOString().slice(0, 10);
      const until = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10);
      fd.append("available_from", from);
      fd.append("available_until", until);
      fd.append("is_available", "true");
      fd.append("is_live", "true");
      fd.append("is_active", "false"); // will be overridden to false anyway per spec
      // categorization optional: try to set empty; backend may default
      fd.append("product_category_id", "");
      fd.append("target_product_audience_id", "");
      fd.append("amenities", JSON.stringify([]));
      fd.append("user_id", user.id);
      // image: portada mejorada por IA (nunca la original si hay banner),
      // si no hay, la foto subida y por último la URL del análisis
      const galleryUrls = (enhanceResult?.gallery ?? []).map((g) => g.url).filter(Boolean);
      if (enhanceResult?.bannerUrl) {
        fd.append("imageUrl", enhanceResult.bannerUrl);
        if (galleryUrls.length > 0) {
          fd.append("imageUrls", JSON.stringify([enhanceResult.bannerUrl, ...galleryUrls]));
        }
      } else if (file) {
        fd.append("banner", file);
        fd.append("images", file);
      } else if (analyzeResult?.imageUrl) {
        fd.append("imageUrl", analyzeResult.imageUrl);
        if (analyzeResult.imageKey) fd.append("imageKey", analyzeResult.imageKey);
      }
      // tell backend this is AI-created (for is_approved=false handling)
      fd.append("created_with_ai", "true");
      if (analyzeResult?.confidence) fd.append("ai_confidence", JSON.stringify(analyzeResult.confidence));

      try {
        const created = await publishVehicle(fd).unwrap();
        // Refresca la lista de productos del dashboard sin recargar la página
        dispatch(
          productsApiSlice.util.invalidateTags([
            { type: "Products" as const, id: "LIST" },
            { type: "Products" as const, id: "USER_PRODUCTS" },
          ]),
        );
        setCreatedProductId(created.id);
        setCreatedProductName(created.name ?? values.name);
        setView("success");
        toast.success(t("dashboard.aiCreate.toasts.draftCreated"));
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status;
        if (status === 404) {
          // mock success when backend publish not mounted
          await new Promise((r) => setTimeout(r, 600));
          setCreatedProductId("mock-id");
          setCreatedProductName(values.name);
          setView("success");
          toast.success(t("dashboard.aiCreate.toasts.demoPublish"));
          return;
        }
        const data = (err as { data?: { message?: string; code?: string } })?.data;
        if (data?.code === "AI_LIMIT_REACHED") {
          setPublishError(t("dashboard.aiCreate.errors.limit"));
        } else {
          setPublishError(data?.message ?? t("dashboard.aiCreate.errors.publishFailed"));
        }
      }
    },
    [user?.id, rentalTypeId, file, analyzeResult, enhanceResult, publishVehicle, t, dispatch],
  );

  const handleEditBeforePublish = useCallback(() => {
    if (!user?.id || !rentalTypeId || !analyzeResult) return;
    // Prefill con la sugerencia cruda (los nulos quedan vacíos en el formulario)
    setAiPrefill(user.id, rentalTypeId, {
      suggestion: analyzeResult.data,
      imageUrl: enhanceResult?.bannerUrl ?? analyzeResult.imageUrl ?? preview ?? "",
      imagePreview: preview ?? undefined,
    });
    onOpenChange(false);
    router.push(`/dashboard/products/add?type=${encodeURIComponent(rentalTypeId)}&ai=1`);
    toast.info(t("dashboard.aiCreate.toasts.prefillLoaded"));
  }, [user?.id, rentalTypeId, analyzeResult, enhanceResult, preview, onOpenChange, router, t]);

  const canUseAi = useMemo(() => {
    if (!limitStatus) return true; // if no status, allow but handle error on attempt
    return limitStatus.canCreate;
  }, [limitStatus]);

  const aiDisabledReason = useMemo(() => {
    if (!limitStatus) return undefined;
    if (!limitStatus.canCreate)
      return t("dashboard.aiCreate.limitUsed")
        .replace("{{used}}", String(limitStatus.used))
        .replace("{{limit}}", String(limitStatus.limit));
    return undefined;
  }, [limitStatus, t]);

  // view header
  const title =
    view === "choice"
      ? t("dashboard.aiCreate.choiceTitle")
      : view === "upload"
        ? t("dashboard.aiCreate.aiCardTitle")
        : view === "generating"
          ? t("dashboard.aiCreate.generating")
          : view === "result"
            ? t("dashboard.aiCreate.resultTitle")
            : view === "success"
              ? t("dashboard.aiCreate.doneTitle")
              : t("dashboard.aiCreate.aiCardTitle");
  const description =
    view === "choice"
      ? t("dashboard.aiCreate.choiceDescription")
      : view === "upload"
        ? t("dashboard.aiCreate.uploadViewDescription")
        : view === "generating"
          ? t("dashboard.aiCreate.generatingViewDescription")
          : view === "result"
            ? t("dashboard.aiCreate.resultViewDescription")
            : view === "success"
              ? t("dashboard.aiCreate.successViewDescription")
              : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[720px] w-[95vw] max-h-[90vh] overflow-hidden p-0 gap-0 bg-black border-white/10 text-white [&>button]:hidden"
        aria-describedby={description ? "ai-create-desc" : undefined}
      >
        {/* header */}
        <DialogHeader className="relative px-6 pt-6 pb-4 border-b border-white/10 bg-transparent text-left">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-coast-300/60 to-transparent" />
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {view !== "upload" && (
                <div className="mb-1.5 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-coast-300">
                  <Sparkles className="h-3 w-3" />
                  Dubuu · {t("dashboard.aiCreate.aiPrefix")}
                </div>
              )}
              <DialogTitle className="text-xl font-semibold tracking-tight text-white">{title}</DialogTitle>
              {description && (
                <DialogDescription id="ai-create-desc" className="text-sm text-zinc-400 mt-1">
                  {description}
                </DialogDescription>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 shrink-0 text-zinc-400 hover:text-white hover:bg-zinc-800" aria-label={t("dashboard.aiCreate.close")}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="relative overflow-y-auto max-h-[calc(90vh-88px)] px-6 py-6 bg-transparent">
          {view === "choice" && (
            <AiChoiceCards
              onAi={() => setView("upload")}
              onManual={handleManual}
              aiDisabled={!canUseAi}
              aiDisabledReason={aiDisabledReason}
              manualKindLabel={
                tableKind === "tours"
                  ? t("dashboard.aiCreate.manualKindTours")
                  : t("dashboard.aiCreate.manualKindRental")
              }
            />
          )}

          {view === "upload" && (
            <AiUploadStep
              file={file}
              preview={preview}
              onFileChange={setFile}
              onGenerate={handleGenerate}
              generating={isAnalyzing || isEnhancing}
              error={analyzeError}
            />
          )}

          {view === "generating" && <AiGeneratingStep preview={preview} />}

          {view === "result" && analyzeResult && (
            <AiResultStep
              preview={preview}
              bannerUrl={enhanceResult?.bannerUrl ?? null}
              socialUrl={enhanceResult?.socialUrl ?? null}
              gallery={enhanceResult?.gallery ?? []}
              bannerAiGenerated={enhanceResult?.aiGenerated ?? false}
              suggestion={analyzeResult.data}
              confidence={analyzeResult.confidence as never}
              onPublish={handlePublish}
              onEditBeforePublish={handleEditBeforePublish}
              publishing={isPublishing}
              error={publishError}
            />
          )}

          {view === "success" && <AiSuccessStep productId={createdProductId} productName={createdProductName} onClose={handleClose} />}
        </div>

        <div className="relative border-t border-white/10 bg-black/20 px-6 py-3 backdrop-blur">
          <p className="text-[11px] text-zinc-500">
            {limitStatus
              ? t("dashboard.aiCreate.footerUsage")
                  .replace("{{used}}", String(limitStatus.used))
                  .replace("{{limit}}", String(limitStatus.limit))
              : t("dashboard.aiCreate.footerBase")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
