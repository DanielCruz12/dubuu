"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { BasicInfoStep } from "./basic-info-step";
import { LocationStep } from "./location-step";
import { DetailsStep } from "./details-step";
import { CategorizationStep } from "./categorization-step";
import { MultimediaStep } from "./multimedia-step";
import type {
  BasicInfoFormValues,
  LocationFormValues,
  DetailsFormValues,
  CategorizationFormValues,
  MultimediaFormValues,
  TourFiles,
  TourData,
} from "./types";
import {
  getAddTourDraftForForm,
  setAddTourDraft,
  clearAddTourDraft,
  type AddTourDraftStored,
} from "./utils";

import {
  useCreateProductMutation,
  useGetProductQuery,
  useUpdateProductMutation,
} from "@/redux/slices/product/product-slice";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n-context";
import { isProductType } from "@/utils";
import type { ITourProduct, TourDateStatus } from "@/types/product";

export type TourDateMetaRow = {
  id: string;
  date: string;
  price: number;
  max_people: number;
  status: TourDateStatus;
};

function toFiniteNumber(value: unknown, fallback = 0): number {
  const parsed =
    typeof value === "number"
      ? value
      : Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapTourProductToForm(p: ITourProduct): {
  basicInfo: BasicInfoFormValues;
  location: LocationFormValues;
  details: DetailsFormValues;
  categorization: CategorizationFormValues;
  multimedia: MultimediaFormValues;
  tourDatesMeta: TourDateMetaRow[];
} {
  const tourDates = p.tour?.tour_dates ?? [];
  const dates = tourDates.map((td) => new Date(td.date));
  const maxPeople = tourDates.length
    ? Math.max(...tourDates.map((d) => d.max_people))
    : 10;
  const priceNums = tourDates
    .map((d) => (typeof d.price === "number" ? d.price : Number.NaN))
    .filter((n) => Number.isFinite(n));
  const fallbackPrice =
    priceNums.length > 0
      ? Math.min(...priceNums)
      : typeof p.price === "number"
        ? p.price
        : Number.parseFloat(String(p.price || 0));
  const lat = toFiniteNumber(p.tour?.lat, 0);
  const lng = toFiniteNumber(
    (p.tour as ITourProduct["tour"] & { lng?: unknown; long?: unknown })?.long ??
      (p.tour as ITourProduct["tour"] & { lng?: unknown; long?: unknown })?.lng,
    0,
  );

  return {
    basicInfo: {
      name: p.name,
      description: p.description,
      departure_point: p.tour?.departure_point ?? "",
      address: p.address,
      country: p.country,
      region: undefined,
      max_people: maxPeople,
      duration: p.tour?.duration ?? 1,
    },
    location: {
      lat,
      lng,
      address: p.address,
    },
    details: {
      highlight: p.tour?.highlight ?? "",
      included: p.tour?.included ?? "",
      itinerary: Array.isArray(p.tour?.itinerary) ? p.tour.itinerary : [],
      available_dates: dates,
      difficulty: (p.tour?.difficulty as DetailsFormValues["difficulty"]) ?? "medium",
      expenses: p.tour?.expenses ?? [],
      packing_list: p.tour?.packing_list ?? [],
    },
    categorization: {
      product_type_id: p.product_type?.id ?? "",
      product_category_id: p.product_category?.id ?? "",
      target_product_audience_id: p.target_audience?.id ?? "",
      amenities: (p.amenities ?? []).map((a) => a.id),
    },
    multimedia: {
      price: Number.isFinite(fallbackPrice) ? fallbackPrice : 1,
    },
    tourDatesMeta: tourDates.map((td) => ({
      id: td.id,
      date: td.date,
      price: typeof td.price === "number" ? td.price : fallbackPrice,
      max_people: td.max_people,
      status: (td.status ?? "active") as TourDateStatus,
    })),
  };
}

interface TourFormProps {
  editProductId?: string;
}

export function TourForm({ editProductId }: TourFormProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const { user, isSignedIn } = useUser();
  const userId = user?.id || "";
  const router = useRouter();

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const {
    data: existingProduct,
    isLoading: isLoadingEditProduct,
    isError: isEditProductError,
  } = useGetProductQuery(editProductId as string, {
    skip: !editProductId,
  });

  const [tourDatesMeta, setTourDatesMeta] = useState<TourDateMetaRow[] | null>(
    null,
  );
  const [editHydrated, setEditHydrated] = useState(false);
  const [editLoadError, setEditLoadError] = useState(false);

  // Estados para almacenar los datos del formulario
  const [basicInfo, setBasicInfo] = useState<BasicInfoFormValues | null>(null);
  const [location, setLocation] = useState<LocationFormValues | null>(null);
  const [details, setDetails] = useState<DetailsFormValues | null>(null);
  const [categorization, setCategorization] =
    useState<CategorizationFormValues | null>(null);
  const [multimedia, setMultimedia] = useState<MultimediaFormValues | null>(
    null
  );
  const { t } = useLanguage();

  useEffect(() => {
    setEditHydrated(false);
    setEditLoadError(false);
  }, [editProductId]);

  useEffect(() => {
    if (!editProductId || !existingProduct || editHydrated) return;
    if (!isProductType(existingProduct, "tours")) {
      toast.error(t("dashboard.addProduct.loadError"));
      setEditLoadError(true);
      setEditHydrated(true);
      return;
    }
    const mapped = mapTourProductToForm(existingProduct);
    setBasicInfo(mapped.basicInfo);
    setLocation(mapped.location);
    setDetails(mapped.details);
    setCategorization(mapped.categorization);
    setMultimedia(mapped.multimedia);
    setTourDatesMeta(mapped.tourDatesMeta);
    setStep(1);
    setEditHydrated(true);
  }, [editProductId, existingProduct, editHydrated, t]);

  useEffect(() => {
    if (!editProductId || !isEditProductError) return;
    toast.error(t("dashboard.addProduct.loadError"));
    setEditLoadError(true);
    setEditHydrated(true);
  }, [editProductId, isEditProductError, t]);

  // Restaurar borrador al montar (solo cliente; no en modo edición)
  useEffect(() => {
    if (editProductId) return;
    const draft = getAddTourDraftForForm();
    if (!draft) return;
    setStep(draft.step);
    setBasicInfo(draft.basicInfo);
    setLocation(draft.location);
    setDetails(draft.details);
    setCategorization(draft.categorization);
    setMultimedia(draft.multimedia);
  }, [editProductId]);

  // Persistir borrador cuando hay progreso (los archivos no se guardan)
  useEffect(() => {
    if (editProductId) return;
    const hasProgress = step > 1 || basicInfo != null;
    if (!hasProgress) return;

    const stored: AddTourDraftStored = {
      step,
      basicInfo,
      location,
      details: details
        ? {
            ...details,
            available_dates: details.available_dates.map((d) =>
              d instanceof Date ? d.toISOString() : new Date(d).toISOString()
            ),
          }
        : null,
      categorization,
      multimedia,
    };
    setAddTourDraft(stored);
  }, [step, basicInfo, location, details, categorization, multimedia, editProductId]);

  // Función para crear FormData
  const createFormData = (
    formData: TourData,
    opts?: { tourDatesMeta?: TourDateMetaRow[] | null },
  ): FormData => {
    const data = new FormData();

    // Datos básicos
    data.append("name", formData.basicInfo.name);
    data.append("description", formData.basicInfo.description);
    // Punto de partida: dirección del mapa (coherente con lat/long); fallback al texto del paso 1
    data.append(
      "departure_point",
      formData.location.address || formData.basicInfo.departure_point
    );
    data.append("address", formData.basicInfo.address);
    data.append("country", formData.basicInfo.country);
    data.append("max_people", formData.basicInfo.max_people.toString());
    data.append("duration", formData.basicInfo.duration.toString());

    // Ubicación
    data.append("lat", formData.location.lat.toString());
    data.append("long", formData.location.lng.toString());

    // Detalles
    data.append("highlight", formData.details.highlight);
    data.append("included", formData.details.included);
    data.append("difficulty", formData.details.difficulty);

    // Arrays como JSON strings (creación: ISO strings; edición: filas con id/precio/cupo/estado)
    if (opts?.tourDatesMeta && opts.tourDatesMeta.length > 0) {
      const sortedDetails = [...formData.details.available_dates].sort(
        (a, b) => a.getTime() - b.getTime(),
      );
      const sortedMeta = [...opts.tourDatesMeta].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      const rows = sortedMeta.map((meta, i) => {
        const d = sortedDetails[i];
        return {
          id: meta.id,
          date: (d ?? new Date(meta.date)).toISOString(),
          price: meta.price,
          max_people: meta.max_people,
          status: meta.status,
        };
      });
      data.append("available_dates", JSON.stringify(rows));
    } else {
      data.append(
        "available_dates",
        JSON.stringify(
          formData.details.available_dates.map((date) => date.toISOString()),
        ),
      );
    }
    data.append("itinerary", JSON.stringify(formData.details.itinerary));
    data.append("expenses", JSON.stringify(formData.details.expenses || []));
    data.append(
      "packing_list",
      JSON.stringify(formData.details.packing_list || [])
    );

    // Categorización
    data.append("product_type_id", formData.categorization.product_type_id);
    data.append(
      "product_category_id",
      formData.categorization.product_category_id
    );
    data.append(
      "target_product_audience_id",
      formData.categorization.target_product_audience_id
    );
    data.append("amenities", JSON.stringify(formData.categorization.amenities));

    // Precio
    data.append("price", formData.multimedia.price.toString());

    // Usuario (esto debería venir del contexto de autenticación)
    data.append("user_id", userId);

    // Archivos
    if (formData.files.bannerFile) {
      data.append("banner", formData.files.bannerFile);
    }

    formData.files.imageFiles.forEach((file) => {
      data.append(`images`, file);
    });

    formData.files.videoFiles.forEach((file) => {
      data.append(`videos`, file);
    });

    formData.files.fileAttachments.forEach((file) => {
      data.append(`files`, file);
    });

    return data;
  };

  // Manejadores para cada paso del formulario
  const handleBasicInfoSubmit = (data: BasicInfoFormValues) => {
    setBasicInfo(data);
    setStep(2);
  };

  const handleLocationSubmit = (data: LocationFormValues) => {
    setLocation(data);
    setStep(3);
  };

  const handleDetailsSubmit = (data: DetailsFormValues) => {
    setDetails(data);
    if (tourDatesMeta && tourDatesMeta.length > 0) {
      const sortedDetails = [...data.available_dates].sort(
        (a, b) => a.getTime() - b.getTime(),
      );
      const sortedMeta = [...tourDatesMeta].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      const next: TourDateMetaRow[] = sortedDetails.map((d, i) => {
        const m = sortedMeta[i];
        if (m) {
          return {
            ...m,
            date: d.toISOString(),
          };
        }
        return {
          id: "",
          date: d.toISOString(),
          price: multimedia?.price ?? 0,
          max_people: basicInfo?.max_people ?? 10,
          status: "active",
        };
      });
      setTourDatesMeta(next);
    }
    setStep(4);
  };

  const handleCategorizationSubmit = (data: CategorizationFormValues) => {
    setCategorization(data);
    setStep(5);
  };

  const handleMultimediaSubmit = async (
    data: MultimediaFormValues,
    uploadedFiles: TourFiles
  ) => {
    setMultimedia(data);

    // Combinar todos los datos del formulario
    const formData: TourData = {
      basicInfo: basicInfo!,
      location: location!,
      details: details!,
      categorization: categorization!,
      multimedia: data,
      files: uploadedFiles,
    };

    try {
      const apiFormData = createFormData(formData, {
        tourDatesMeta: tourDatesMeta ?? undefined,
      });

      if (editProductId) {
        await updateProduct({
          id: editProductId,
          data: apiFormData,
        }).unwrap();
        toast.success(t("dashboard.addTour.toast.updateSuccess"), {
          description: t("dashboard.addTour.toast.updateSuccessDescription"),
        });
      } else {
        await createProduct(apiFormData).unwrap();
        clearAddTourDraft();
        toast.success(t("dashboard.addTour.toast.success"), {
          description: t("dashboard.addTour.toast.successDescription"),
        });
      }
      router.push("/dashboard/products");
    } catch (error) {
      console.error("Error al guardar el tour:", error);

      toast.error(
        editProductId
          ? t("dashboard.addTour.toast.updateError")
          : t("dashboard.addTour.toast.error"),
        {
          description: editProductId
            ? t("dashboard.addTour.toast.updateErrorDescription")
            : t("dashboard.addTour.toast.errorDescription"),
        },
      );
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleContinue = () => {
    // Disparar el evento submit del formulario actual
    const form = document.querySelector("form");
    if (form) {
      form.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }
  };

  const existingTour = useMemo(() => {
    if (!editProductId || !existingProduct || !isProductType(existingProduct, "tours")) {
      return null;
    }
    return existingProduct;
  }, [editProductId, existingProduct]);

  const isSaving = isCreating || isUpdating;

  if (editProductId && editLoadError) {
    return (
      <div className="text-center text-destructive py-16 text-sm">
        {t("dashboard.addProduct.loadError")}
      </div>
    );
  }

  if (editProductId && !editHydrated) {
    if (isLoadingEditProduct) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">{t("dashboard.addProduct.loadingEdit")}</p>
        </div>
      );
    }
    if (isEditProductError || !existingProduct) {
      return (
        <div className="text-center text-destructive py-16 text-sm">
          {t("dashboard.addProduct.loadError")}
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">{t("dashboard.addProduct.loadingEdit")}</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">
          {t("dashboard.addTour.auth.title")}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {t("dashboard.addTour.auth.description")}
          <br />
        </p>
        <SignInButton>
          <Button>{t("dashboard.addTour.auth.signIn")}</Button>
        </SignInButton>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        {/* Progress indicator */}
        <div className="px-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <div className="flex items-center">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border ${
                      step >= index + 1
                        ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                        : "bg-transparent text-gray-400 border-gray-300 dark:border-gray-700"
                    }`}
                  >
                    <span className="text-xs sm:text-sm">{index + 1}</span>
                  </div>
                  {index < totalSteps - 1 && (
                    <div
                      className={`h-px w-2 sm:w-4 mx-1 ${
                        step > index + 1
                          ? "bg-black dark:bg-white"
                          : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t("dashboard.addTour.progress")
                .replace("{{step}}", String(step))
                .replace("{{total}}", String(totalSteps))}
            </div>
          </div>
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium">
            {step === 1
              ? t("dashboard.addTour.steps.basicInfo.title")
              : step === 2
                ? t("dashboard.addTour.steps.location.title")
                : step === 3
                  ? t("dashboard.addTour.steps.details.title")
                  : step === 4
                    ? t("dashboard.addTour.steps.categorization.title")
                    : t("dashboard.addTour.steps.multimedia.title")}
          </CardTitle>
          <CardDescription>
            {step === 1
              ? t("dashboard.addTour.steps.basicInfo.description")
              : step === 2
                ? t("dashboard.addTour.steps.location.description")
                : step === 3
                  ? t("dashboard.addTour.steps.details.description")
                  : step === 4
                    ? t("dashboard.addTour.steps.categorization.description")
                    : t("dashboard.addTour.steps.multimedia.description")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <BasicInfoStep
                  key={editProductId ? `b-${editHydrated}` : "b-new"}
                  onSubmit={handleBasicInfoSubmit}
                  defaultValues={basicInfo || undefined}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <LocationStep
                  key={editProductId ? `l-${editHydrated}` : "l-new"}
                  onSubmit={handleLocationSubmit}
                  defaultValues={location || undefined}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <DetailsStep
                  key={editProductId ? `d-${editHydrated}` : "d-new"}
                  onSubmit={handleDetailsSubmit}
                  defaultValues={details || undefined}
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CategorizationStep
                  key={editProductId ? `c-${editHydrated}` : "c-new"}
                  onSubmit={handleCategorizationSubmit}
                  defaultValues={categorization || undefined}
                />
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MultimediaStep
                  key={editProductId ? `m-${editHydrated}` : "m-new"}
                  onSubmit={handleMultimediaSubmit}
                  defaultValues={multimedia || undefined}
                  isEditMode={Boolean(editProductId && editHydrated)}
                  existingMedia={
                    existingTour
                      ? {
                          bannerUrl: existingTour.banner,
                          imageUrls: existingTour.images,
                        }
                      : undefined
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter>
          <div className="flex justify-between w-full">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="border-gray-200 dark:border-gray-800 hover:bg-transparent hover:text-black dark:hover:text-white"
                disabled={isSaving}
              >
                <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="sm:inline">
                  {t("dashboard.addTour.buttons.back")}
                </span>
              </Button>
            ) : (
              <div></div>
            )}

            {step < totalSteps ? (
              <Button
                className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                onClick={handleContinue}
                disabled={isSaving}
              >
                <span className="flex items-center">
                  <span className="sm:inline">
                    {t("dashboard.addTour.buttons.continue")}
                  </span>
                  <ChevronRight className="ml-1 sm:ml-2 h-4 w-4" />
                </span>
              </Button>
            ) : (
              <Button
                className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                onClick={handleContinue}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editProductId
                      ? t("dashboard.addTour.buttons.saving")
                      : t("dashboard.addTour.buttons.creating")}
                  </>
                ) : editProductId ? (
                  t("dashboard.addTour.buttons.save")
                ) : (
                  t("dashboard.addTour.buttons.create")
                )}
              </Button>
            )}
          </div>
        </CardFooter>

        {/* Security badge */}
        <div className="flex justify-center pb-4">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <ShieldCheck className="h-3 w-3 mr-1" />
            {t("dashboard.addTour.security.secureInfo")}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
