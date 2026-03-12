"use client";

import { useState } from "react";
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

import { type CategorizationFormValues, categorizationSchema } from "./types";
import { scrollToFirstError } from "./utils";

// Importar los hooks de RTK Query con las nuevas rutas
import { useGetProductTypesQuery } from "@/redux/slices/product/product-types";
import { useGetProductCategoriesQuery } from "@/redux/slices/product/product-category";
import { useGetProductAmenitiesQuery } from "@/redux/slices/product/product-amenity";
import { useGetProductAudiencesQuery } from "@/redux/slices/product/product-audience";

interface CategorizationStepProps {
  onSubmit: (data: CategorizationFormValues) => void;
  defaultValues?: Partial<CategorizationFormValues>;
}

export function CategorizationStep({
  onSubmit,
  defaultValues,
}: CategorizationStepProps) {
  // Estados para manejar las dependencias entre selectores
  const [selectedProductTypeId, setSelectedProductTypeId] = useState<string>(
    defaultValues?.product_type_id || ""
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    defaultValues?.product_category_id || ""
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
        (category) => category.product_type.id === selectedProductTypeId
      )
    : [];

  const categoryOptions: ComboboxOption[] = filteredCategories.map(
    (category) => ({
      value: category.id,
      label: category.name,
    })
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
    })
  );

  const form = useForm<CategorizationFormValues>({
    resolver: zodResolver(categorizationSchema),
    defaultValues: {
      product_type_id: defaultValues?.product_type_id || "",
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
    setSelectedCategoryId("");
    form.setValue("product_category_id", "");
    form.setValue("amenities", []);
  };

  // Manejar cambio de categoría
  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(value);
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
    }
  );

  // Mostrar estado de carga
  if (
    isLoadingTypes ||
    isLoadingCategories ||
    isLoadingAmenities ||
    isLoadingAudiences
  ) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="mt-2 text-sm text-gray-500">Cargando datos...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4">
          {/* Audiencia Objetivo */}
          <FormField
            control={form.control}
            name="target_product_audience_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Audiencia Objetivo</FormLabel>
                <FormControl>
                  <SingleCombobox
                    options={audienceOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Selecciona una audiencia objetivo"
                    emptyMessage="No se encontraron audiencias objetivo"
                    className="w-full"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
          {/* Tipo de Producto */}
          <FormField
            control={form.control}
            name="product_type_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Producto</FormLabel>
                <FormControl>
                  <SingleCombobox
                    options={productTypeOptions}
                    value={field.value}
                    onChange={handleProductTypeChange}
                    placeholder="Selecciona un tipo de producto"
                    emptyMessage="No se encontraron tipos de producto"
                    className="w-full"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          {/* Categoría de Producto */}
          <FormField
            control={form.control}
            name="product_category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría de Producto</FormLabel>
                <FormControl>
                  <SingleCombobox
                    options={categoryOptions}
                    value={field.value}
                    onChange={handleCategoryChange}
                    placeholder={
                      selectedProductTypeId
                        ? "Selecciona una categoría"
                        : "Primero selecciona un tipo de producto"
                    }
                    emptyMessage="No se encontraron categorías para este tipo de producto"
                    className="w-full"
                    disabled={!selectedProductTypeId}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          {/* Comodidades (Amenities) */}
          <FormField
            control={form.control}
            name="amenities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comodidades</FormLabel>
                <FormControl>
                  <MultiCombobox
                    options={amenityOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Selecciona las comodidades"
                    emptyMessage="No se encontraron comodidades"
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
