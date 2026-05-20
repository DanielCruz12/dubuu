"use client";

import { useMemo, useState, useEffect, useRef } from "react";
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
import { useLanguage } from "@/lib/i18n-context";

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
}

export function CategorizationStep({
  onSubmit,
  defaultValues,
  fixedProductTypeId,
}: CategorizationStepProps) {
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
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

  // Mostrar todos los amenities (sin filtrarlos por categoría)
  const amenityOptions: ComboboxOption[] = productAmenities.map((amenity) => ({
    value: amenity.id,
    label: amenity.name,
  }));

  const audienceOptions: ComboboxOption[] = productAudiences.map(
    (audience) => ({
      value: audience.id,
      label: audience.name,
    }),
  );

  const form = useForm<CategorizationFormValues>({
    resolver: zodResolver(categorizationSchema),
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
      scrollToFirstError(errors);
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
      <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="target_product_audience_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addTour.categorization.targetAudience")}</FormLabel>
                <FormControl>
                  <SingleCombobox
                    options={audienceOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t("dashboard.addTour.categorization.targetAudiencePlaceholder")}
                    emptyMessage={t("dashboard.addTour.categorization.targetAudienceEmpty")}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
          {!fixedProductTypeId ? (
            <FormField
              control={form.control}
              name="product_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dashboard.addTour.categorization.productType")}</FormLabel>
                  <FormControl>
                    <SingleCombobox
                      options={productTypeOptions}
                      value={field.value}
                      onChange={handleProductTypeChange}
                      placeholder={t("dashboard.addTour.categorization.productTypePlaceholder")}
                      emptyMessage={t("dashboard.addTour.categorization.productTypeEmpty")}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />
          ) : null}

          <FormField
            control={form.control}
            name="product_category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addTour.categorization.productCategory")}</FormLabel>
                <FormControl>
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
                    className="w-full"
                    disabled={!selectedProductTypeId}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amenities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addTour.categorization.amenities")}</FormLabel>
                <FormControl>
                  <MultiCombobox
                    options={amenityOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t("dashboard.addTour.categorization.amenitiesPlaceholder")}
                    emptyMessage={t("dashboard.addTour.categorization.amenitiesEmpty")}
                    className="w-full"
                  />
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
