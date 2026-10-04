"use client";

import { useMemo, useState, useEffect, useRef, type RefObject } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  SingleCombobox,
  MultiCombobox,
  type ComboboxOption,
} from "@/components/ui/combobox";

import { type CategorizationFormValues, getCategorizationSchema } from "./types";
import { focusFirstStepField, scrollToFirstError } from "./utils";
import { FormErrorSummary } from "./form-error-summary";
import { useLanguage } from "@/lib/i18n-context";
import { cn } from "@/lib/utils";

// Importar los hooks de RTK Query con las nuevas rutas
import { useGetProductTypesQuery } from "@/redux/slices/product/product-types";
import { useGetProductCategoriesQuery } from "@/redux/slices/product/product-category";
import { useGetProductAmenitiesQuery } from "@/redux/slices/product/product-amenity";
import { useGetProductAudiencesQuery } from "@/redux/slices/product/product-audience";

interface CategorizationStepProps {
  onSubmit: (data: CategorizationFormValues) => void;
  defaultValues?: Partial<CategorizationFormValues>;
  /** When set, the product type field is hidden and this id is always submitted. */
  fixedProductTypeId?: string;
  /** Ref del form que usa el padre para disparar requestSubmit() en Continuar. */
  formRef?: RefObject<HTMLFormElement>;
}

export function CategorizationStep({
  onSubmit,
  defaultValues,
  fixedProductTypeId,
  formRef: externalFormRef,
}: CategorizationStepProps) {
  const { t } = useLanguage();
  const internalFormRef = useRef<HTMLFormElement>(null);
  const formRef = externalFormRef ?? internalFormRef;
  const categorizationSchema = useMemo(() => getCategorizationSchema(t), [t]);

  const [selectedProductTypeId, setSelectedProductTypeId] = useState<string>(
    fixedProductTypeId || defaultValues?.product_type_id || "",
  );

  const { data: productTypes = [], isLoading: isLoadingTypes } =
    useGetProductTypesQuery();

  const { data: productCategories = [], isLoading: isLoadingCategories } =
    useGetProductCategoriesQuery();

  const { data: productAmenities = [], isLoading: isLoadingAmenities } =
    useGetProductAmenitiesQuery();

  const { data: productAudiences = [], isLoading: isLoadingAudiences } =
    useGetProductAudiencesQuery();

  // Opciones para los selectores
  const productTypeOptions: ComboboxOption[] = productTypes.map((type) => ({
    value: type.id,
    label: type.name,
  }));

  // Filtrar categorías por tipo de producto seleccionado
  const filteredCategories = selectedProductTypeId
    ? productCategories.filter(
        (category) => category.product_type.id === selectedProductTypeId,
      )
    : [];

  const categoryOptions: ComboboxOption[] = filteredCategories.map(
    (category) => ({
      value: category.id,
      label: category.name,
    }),
  );

  // Filtrar amenities por tipo de producto (via category_id -> product_type.id)
  const amenityOptions: ComboboxOption[] = useMemo(() => {
    if (!selectedProductTypeId) return [];

    const categoryIdsForType = new Set(
      productCategories
        .filter((cat) => cat.product_type.id === selectedProductTypeId)
        .map((cat) => cat.id),
    );

    return productAmenities
      .filter((amenity) => {
        const catId =
          typeof amenity.category_id === "object"
            ? amenity.category_id.id
            : amenity.category_id;
        return catId ? categoryIdsForType.has(catId) : false;
      })
      .map((amenity) => ({
        value: amenity.id,
        label: amenity.name,
      }));
  }, [selectedProductTypeId, productAmenities, productCategories]);

  const audienceOptions: ComboboxOption[] = productAudiences.map(
    (audience) => ({
      value: audience.id,
      label: audience.name,
    }),
  );

  const form = useForm<CategorizationFormValues>({
    resolver: zodResolver(categorizationSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      product_type_id: fixedProductTypeId || defaultValues?.product_type_id || "",
      product_category_id: defaultValues?.product_category_id || "",
      target_product_audience_id:
        defaultValues?.target_product_audience_id || "",
      amenities: defaultValues?.amenities || [],
    },
  });

  // Manejar cambio de tipo de producto
  const handleProductTypeChange = (value: string) => {
    setSelectedProductTypeId(value);
    form.setValue("product_type_id", value);

    // Limpiar categoría y amenities cuando cambia el tipo de producto
    form.setValue("product_category_id", "");
    form.setValue("amenities", []);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al cambiar fixedProductTypeId; setValue es estable en RHF
  useEffect(() => {
    if (!fixedProductTypeId) return;
    setSelectedProductTypeId(fixedProductTypeId);
    form.setValue("product_type_id", fixedProductTypeId);
  }, [fixedProductTypeId, form]);

  // Manejar cambio de categoría
  const handleCategoryChange = (value: string) => {
    form.setValue("product_category_id", value);

    // Limpiar amenities cuando cambia la categoría
    form.setValue("amenities", []);
  };

  const handleSubmit = form.handleSubmit(
    (data) => {
      onSubmit(data);
    },
    (errors) => {
      // Hacer scroll al primer error
      scrollToFirstError(errors, formRef.current);
    },
  );

  useEffect(() => {
    if (
      isLoadingTypes ||
      isLoadingCategories ||
      isLoadingAmenities ||
      isLoadingAudiences
    ) {
      return;
    }
    focusFirstStepField(formRef.current, { delayMs: 100 });
  }, [
    formRef,
    isLoadingTypes,
    isLoadingCategories,
    isLoadingAmenities,
    isLoadingAudiences,
    defaultValues?.product_type_id,
    defaultValues?.target_product_audience_id,
  ]);

  if (
    isLoadingTypes ||
    isLoadingCategories ||
    isLoadingAmenities ||
    isLoadingAudiences
  ) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="mt-2 text-sm text-gray-500">{t("dashboard.addTour.categorization.loading")}</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form ref={formRef} className="space-y-6" onSubmit={handleSubmit} noValidate>
        <FormErrorSummary />
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="target_product_audience_id"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addTour.categorization.targetAudience")}</FormLabel>
                <FormControl>
                  <span data-error-field={field.name} className="block">
                    <SingleCombobox
                      options={audienceOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t("dashboard.addTour.categorization.targetAudiencePlaceholder")}
                      emptyMessage={t("dashboard.addTour.categorization.targetAudienceEmpty")}
                      className={cn(
                        "w-full",
                        fieldState.error &&
                          "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500",
                      )}
                    />
                  </span>
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
          {!fixedProductTypeId ? (
            <FormField
              control={form.control}
              name="product_type_id"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("dashboard.addTour.categorization.productType")}</FormLabel>
                  <FormControl>
                    <span data-error-field={field.name} className="block">
                      <SingleCombobox
                        options={productTypeOptions}
                        value={field.value}
                        onChange={handleProductTypeChange}
                        placeholder={t("dashboard.addTour.categorization.productTypePlaceholder")}
                        emptyMessage={t("dashboard.addTour.categorization.productTypeEmpty")}
                        className={cn(
                          "w-full",
                          fieldState.error &&
                            "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500",
                        )}
                      />
                    </span>
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />
          ) : null}

          <FormField
            control={form.control}
            name="product_category_id"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addTour.categorization.productCategory")}</FormLabel>
                <FormControl>
                  <span data-error-field={field.name} className="block">
                    <SingleCombobox
                      options={categoryOptions}
                      value={field.value}
                      onChange={handleCategoryChange}
                      placeholder={
                        selectedProductTypeId
                          ? t("dashboard.addTour.categorization.productCategoryPlaceholder")
                          : t("dashboard.addTour.categorization.selectCategoryFirst")
                      }
                      emptyMessage={t("dashboard.addTour.categorization.productCategoryEmpty")}
                      className={cn(
                        "w-full",
                        fieldState.error &&
                          "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500",
                      )}
                      disabled={!selectedProductTypeId}
                    />
                  </span>
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amenities"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addTour.categorization.amenities")}</FormLabel>
                <FormControl>
                  <span data-error-field={field.name} className="block">
                    <MultiCombobox
                      options={amenityOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t("dashboard.addTour.categorization.amenitiesPlaceholder")}
                      emptyMessage={t("dashboard.addTour.categorization.amenitiesEmpty")}
                      className={cn(
                        "w-full",
                        fieldState.error &&
                          "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500",
                      )}
                    />
                  </span>
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
