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

import { RentalBasicStep } from "./basic-step";
import { RentalVehicleStep } from "./vehicle-step";
import { RentalDeliveryStep } from "./delivery-step";
import { CategorizationStep } from "../add-tour/categorization-step";
import { MultimediaStep } from "../add-tour/multimedia-step";
import type {
  RentalBasicFormValues,
  RentalVehicleFormValues,
  RentalDeliveryFormValues,
  RentalData,
  RentalAvailabilitySnapshot,
} from "./types";
import type { CategorizationFormValues, MultimediaFormValues, TourFiles } from "../add-tour/types";

import {
  useCreateProductMutation,
  useGetProductQuery,
  useUpdateProductMutation,
} from "@/redux/slices/product/product-slice";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n-context";
import { isProductType } from "@/utils";
import type { IRentalProduct } from "@/types/rental";

function toDateInputValue(isoOrDate: string | undefined): string {
  if (!isoOrDate) return "";
  const d = isoOrDate.includes("T") ? isoOrDate.split("T")[0] : isoOrDate.slice(0, 10);
  return d ?? "";
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  const parsed =
    typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function defaultAvailabilityRange(): RentalAvailabilitySnapshot {
  const from = new Date();
  const until = new Date();
  until.setFullYear(until.getFullYear() + 1);
  return {
    available_from: from.toISOString().slice(0, 10),
    available_until: until.toISOString().slice(0, 10),
  };
}

/** Maps legacy API condition values to Drizzle `rentals.condition` enum. */
function normalizeRentalConditionForForm(c: string): "new" | "used" | "refurbished" {
  if (c === "new" || c === "used" || c === "refurbished") return c;
  return "used";
}

function mapRentalProductToForm(p: IRentalProduct): {
  basic: RentalBasicFormValues;
  vehicle: RentalVehicleFormValues;
  delivery: RentalDeliveryFormValues;
  availabilitySnapshot: RentalAvailabilitySnapshot;
  categorization: CategorizationFormValues;
  multimedia: MultimediaFormValues;
} {
  const r = p.rental;
  const priceDay = toFiniteNumber(r?.price_per_day ?? p.price, 1);

  return {
    basic: {
      name: p.name,
      description: p.description,
      country: p.country,
    },
    vehicle: {
      brand: r.brand,
      model: r.model,
      year: r.year,
      condition: normalizeRentalConditionForForm(String(r.condition)),
      fuel_type: r.fuel_type,
      color: r.color,
      engine: r.engine,
      transmission: r.transmission,
      seating_capacity: r.seating_capacity,
    },
    delivery: {
      offers_delivery: r.offers_delivery,
      max_delivery_distance_km: r.max_delivery_distance_km,
      fee_per_km: String(r.fee_per_km ?? "0"),
    },
    availabilitySnapshot: {
      available_from: toDateInputValue(r.available_from),
      available_until: toDateInputValue(r.available_until),
    },
    categorization: {
      product_type_id: p.product_type?.id ?? "",
      product_category_id: p.product_category?.id ?? "",
      target_product_audience_id: p.target_audience?.id ?? "",
      amenities: (p.amenities ?? []).map((a) => a.id),
    },
    multimedia: {
      price: priceDay,
    },
  };
}

function createRentalFormData(formData: RentalData, userId: string): FormData {
  const data = new FormData();
  const { basic, vehicle, delivery, categorization, multimedia, files } = formData;

  const avail =
    formData.availabilitySnapshot?.available_from && formData.availabilitySnapshot?.available_until
      ? formData.availabilitySnapshot
      : defaultAvailabilityRange();

  data.append("name", basic.name);
  data.append("description", basic.description);
  data.append("address", "");
  data.append("country", basic.country);

  data.append("price", multimedia.price.toString());
  data.append("price_per_day", multimedia.price.toString());

  data.append("product_type_id", categorization.product_type_id);
  data.append("product_category_id", categorization.product_category_id);
  data.append("target_product_audience_id", categorization.target_product_audience_id);
  data.append("amenities", JSON.stringify(categorization.amenities));

  data.append("brand", vehicle.brand);
  data.append("model", vehicle.model);
  data.append("year", vehicle.year.toString());
  data.append("condition", vehicle.condition);
  data.append("transmission", vehicle.transmission);
  data.append("seating_capacity", vehicle.seating_capacity.toString());
  data.append("fuel_type", vehicle.fuel_type);
  data.append("color", vehicle.color);
  data.append("engine", vehicle.engine);

  data.append("pickup_location", "");
  data.append("offers_delivery", String(delivery.offers_delivery));
  data.append("max_delivery_distance_km", delivery.max_delivery_distance_km.toString());
  data.append("fee_per_km", delivery.fee_per_km);
  data.append("available_from", avail.available_from);
  data.append("available_until", avail.available_until);
  data.append("is_available", "true");
  data.append("is_live", "true");
  data.append("is_active", "true");

  data.append("user_id", userId);

  if (files.bannerFile) {
    data.append("banner", files.bannerFile);
  }
  files.imageFiles.forEach((file) => data.append("images", file));
  files.videoFiles.forEach((file) => data.append("videos", file));
  files.fileAttachments.forEach((file) => data.append("files", file));

  return data;
}

export interface RentalFormProps {
  editProductId?: string;
  /** Product type id for the rental flow (create only). */
  productTypeId?: string;
}

export function RentalForm({ editProductId, productTypeId }: RentalFormProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const { user, isSignedIn } = useUser();
  const userId = user?.id || "";
  const router = useRouter();
  const { t } = useLanguage();

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const {
    data: existingProduct,
    isLoading: isLoadingEditProduct,
    isError: isEditProductError,
  } = useGetProductQuery(editProductId as string, {
    skip: !editProductId,
  });

  const [editHydrated, setEditHydrated] = useState(false);
  const [editLoadError, setEditLoadError] = useState(false);

  const [basic, setBasic] = useState<RentalBasicFormValues | null>(null);
  const [vehicle, setVehicle] = useState<RentalVehicleFormValues | null>(null);
  const [delivery, setDelivery] = useState<RentalDeliveryFormValues | null>(null);
  const [availabilitySnapshot, setAvailabilitySnapshot] = useState<RentalAvailabilitySnapshot | null>(
    null,
  );
  const [categorization, setCategorization] = useState<CategorizationFormValues | null>(null);
  const [multimedia, setMultimedia] = useState<MultimediaFormValues | null>(null);

  const resolvedTypeId = useMemo(() => {
    if (editProductId && existingProduct && isProductType(existingProduct, "rental")) {
      return existingProduct.product_type?.id ?? "";
    }
    return productTypeId ?? "";
  }, [editProductId, existingProduct, productTypeId]);

  useEffect(() => {
    setEditHydrated(false);
    setEditLoadError(false);
  }, [editProductId]);

  useEffect(() => {
    if (!editProductId || !existingProduct || editHydrated) return;
    if (!isProductType(existingProduct, "rental")) {
      toast.error(t("dashboard.addProduct.loadError"));
      setEditLoadError(true);
      setEditHydrated(true);
      return;
    }
    const mapped = mapRentalProductToForm(existingProduct);
    setBasic(mapped.basic);
    setVehicle(mapped.vehicle);
    setDelivery(mapped.delivery);
    setAvailabilitySnapshot(mapped.availabilitySnapshot);
    setCategorization(mapped.categorization);
    setMultimedia(mapped.multimedia);
    setStep(1);
    setEditHydrated(true);
  }, [editProductId, existingProduct, editHydrated, t]);

  useEffect(() => {
    if (!editProductId || !isEditProductError) return;
    toast.error(t("dashboard.addProduct.loadError"));
    setEditLoadError(true);
    setEditHydrated(true);
  }, [editProductId, isEditProductError, t]);

  const existingRental = useMemo(() => {
    if (!editProductId || !existingProduct || !isProductType(existingProduct, "rental")) {
      return null;
    }
    return existingProduct;
  }, [editProductId, existingProduct]);

  const handleMultimediaSubmit = async (data: MultimediaFormValues, uploadedFiles: TourFiles) => {
    setMultimedia(data);
    const formPayload: RentalData = {
      basic: basic!,
      vehicle: vehicle!,
      delivery: delivery!,
      availabilitySnapshot,
      categorization: categorization!,
      multimedia: data,
      files: uploadedFiles,
    };

    try {
      const apiFormData = createRentalFormData(formPayload, userId);
      if (editProductId) {
        await updateProduct({ id: editProductId, data: apiFormData }).unwrap();
        toast.success(t("dashboard.addRental.toast.updateSuccess"), {
          description: t("dashboard.addRental.toast.updateSuccessDescription"),
        });
      } else {
        await createProduct(apiFormData).unwrap();
        toast.success(t("dashboard.addRental.toast.success"), {
          description: t("dashboard.addRental.toast.successDescription"),
        });
      }
      router.push("/dashboard/products");
    } catch (error) {
      console.error(error);
      toast.error(
        editProductId ? t("dashboard.addRental.toast.updateError") : t("dashboard.addRental.toast.error"),
        {
          description: editProductId
            ? t("dashboard.addRental.toast.updateErrorDescription")
            : t("dashboard.addRental.toast.errorDescription"),
        },
      );
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleContinue = () => {
    const formEl = document.querySelector("form");
    if (formEl) {
      formEl.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }
  };

  const isSaving = isCreating || isUpdating;

  if (!editProductId && !productTypeId) {
    return (
      <div className="text-center text-destructive py-12 text-sm">
        {t("dashboard.addProductType.missingType")}
      </div>
    );
  }

  if (editProductId && editLoadError) {
    return (
      <div className="text-center text-destructive py-16 text-sm">{t("dashboard.addProduct.loadError")}</div>
    );
  }

  if (editProductId && !editHydrated) {
    if (isLoadingEditProduct) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">{t("dashboard.addProduct.loadingEditRental")}</p>
        </div>
      );
    }
    if (isEditProductError || !existingProduct) {
      return (
        <div className="text-center text-destructive py-16 text-sm">{t("dashboard.addProduct.loadError")}</div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">{t("dashboard.addProduct.loadingEditRental")}</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">{t("dashboard.addTour.auth.title")}</h2>
        <p className="text-sm text-muted-foreground mb-4">{t("dashboard.addTour.auth.description")}</p>
        <SignInButton>
          <Button>{t("dashboard.addTour.auth.signIn")}</Button>
        </SignInButton>
      </div>
    );
  }

  const stepTitleKey =
    step === 1
      ? "dashboard.addRental.steps.basic.title"
      : step === 2
        ? "dashboard.addRental.steps.vehicle.title"
        : step === 3
          ? "dashboard.addRental.steps.delivery.title"
          : step === 4
            ? "dashboard.addTour.steps.categorization.title"
            : "dashboard.addTour.steps.multimedia.title";

  const stepDescKey =
    step === 1
      ? "dashboard.addRental.steps.basic.description"
      : step === 2
        ? "dashboard.addRental.steps.vehicle.description"
        : step === 3
          ? "dashboard.addRental.steps.delivery.description"
          : step === 4
            ? "dashboard.addTour.steps.categorization.description"
            : "dashboard.addTour.steps.multimedia.description";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card>
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
                        step > index + 1 ? "bg-black dark:bg-white" : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t("dashboard.addRental.progress")
                .replace("{{step}}", String(step))
                .replace("{{total}}", String(totalSteps))}
            </div>
          </div>
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium">{t(stepTitleKey)}</CardTitle>
          <CardDescription>{t(stepDescKey)}</CardDescription>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="r1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <RentalBasicStep
                  key={editProductId ? `rb-${editHydrated}` : "rb-new"}
                  onSubmit={(d) => {
                    setBasic(d);
                    setStep(2);
                  }}
                  defaultValues={basic || undefined}
                />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="r2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <RentalVehicleStep
                  key={editProductId ? `rv-${editHydrated}` : "rv-new"}
                  onSubmit={(d) => {
                    setVehicle(d);
                    setStep(3);
                  }}
                  defaultValues={vehicle || undefined}
                />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="r3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <RentalDeliveryStep
                  key={editProductId ? `rd-${editHydrated}` : "rd-new"}
                  onSubmit={(d) => {
                    setDelivery(d);
                    setStep(4);
                  }}
                  defaultValues={delivery || undefined}
                />
              </motion.div>
            )}
            {step === 4 && (
              <motion.div key="r4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CategorizationStep
                  key={editProductId ? `rc-${editHydrated}` : "rc-new"}
                  onSubmit={(d) => {
                    setCategorization(d);
                    setStep(5);
                  }}
                  defaultValues={categorization || undefined}
                  fixedProductTypeId={resolvedTypeId || undefined}
                />
              </motion.div>
            )}
            {step === 5 && (
              <motion.div key="r5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <MultimediaStep
                  key={editProductId ? `rm-${editHydrated}` : "rm-new"}
                  onSubmit={handleMultimediaSubmit}
                  defaultValues={multimedia || undefined}
                  isEditMode={Boolean(editProductId && editHydrated)}
                  priceLabelOverride={t("dashboard.addRental.multimedia.pricePerDay")}
                  existingMedia={
                    existingRental
                      ? {
                          bannerUrl: existingRental.banner,
                          imageUrls: existingRental.images ?? [],
                          videoUrls: existingRental.videos ?? [],
                          fileUrls: existingRental.files ?? [],
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
              <Button type="button" variant="outline" onClick={handleBack} disabled={isSaving}>
                <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="sm:inline">{t("dashboard.addTour.buttons.back")}</span>
              </Button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <Button
                className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                onClick={handleContinue}
                disabled={isSaving}
              >
                <span className="flex items-center">
                  <span className="sm:inline">{t("dashboard.addTour.buttons.continue")}</span>
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
                    {editProductId ? t("dashboard.addTour.buttons.saving") : t("dashboard.addTour.buttons.creating")}
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
