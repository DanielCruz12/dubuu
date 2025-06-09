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

// Datos de fallback actualizados
const FALLBACK_PRODUCT_TYPES = [
  {
    id: "9b1c117f-1317-48d3-bd89-c5c35d760544",
    name: "tours",
    description: "Tours y excursiones guiadas",
  },
];

const FALLBACK_PRODUCT_CATEGORIES = [
  {
    id: "447c58d7-9398-45e8-828f-92a1abb31472",
    name: "Aventura",
    description:
      "Opciones ágiles y económicas para recorrer ciudades o destinos turísticos.",
    product_type: {
      id: "9b1c117f-1317-48d3-bd89-c5c35d760544",
      name: "tours",
    },
  },
  {
    id: "981c1cb3-12e7-4729-88cc-8a212195fd65",
    name: "Gastronómico",
    description:
      "Recorridos que incluyen degustaciones, visitas a mercados, bodegas o clases de cocina.",
    product_type: {
      id: "9b1c117f-1317-48d3-bd89-c5c35d760544",
      name: "tours",
    },
  },
  {
    id: "cac6e50a-b5e1-48c1-b69d-307a1bda6582",
    name: "Naturaleza",
    description:
      "Exploración de parques, reservas, playas, montañas o selvas con enfoque ecológico.",
    product_type: {
      id: "9b1c117f-1317-48d3-bd89-c5c35d760544",
      name: "tours",
    },
  },
  {
    id: "ecf366d4-f3a5-4c0a-a30a-f8531e11f1e4",
    name: "Relajación",
    description:
      "Experiencias enfocadas en el descanso, spas, termales o yoga en la naturaleza.",
    product_type: {
      id: "9b1c117f-1317-48d3-bd89-c5c35d760544",
      name: "tours",
    },
  },
];

const FALLBACK_PRODUCT_AMENITIES = [
  {
    id: "41a7c86a-c63d-4cd0-8d57-ac606b6000e8",
    name: "Guía turístico",
    description: "Servicio de guía profesional durante el recorrido",
    category_id: "447c58d7-9398-45e8-828f-92a1abb31472",
  },
  {
    id: "b2a7c86a-c63d-4cd0-8d57-ac606b6000e9",
    name: "Transporte incluido",
    description: "Servicio de transporte durante la actividad",
    category_id: "447c58d7-9398-45e8-828f-92a1abb31472",
  },
  {
    id: "c3a7c86a-c63d-4cd0-8d57-ac606b6000ea",
    name: "Comidas incluidas",
    description: "Servicio de alimentación durante la actividad",
    category_id: "981c1cb3-12e7-4729-88cc-8a212195fd65",
  },
  {
    id: "d4a7c86a-c63d-4cd0-8d57-ac606b6000eb",
    name: "Equipo especializado",
    description: "Equipamiento necesario para la actividad",
    category_id: "cac6e50a-b5e1-48c1-b69d-307a1bda6582",
  },
  {
    id: "e5a7c86a-c63d-4cd0-8d57-ac606b6000ec",
    name: "Seguro de viaje",
    description: "Cobertura de seguro durante la actividad",
    category_id: "ecf366d4-f3a5-4c0a-a30a-f8531e11f1e4",
  },
];

const FALLBACK_PRODUCT_AUDIENCES = [
  {
    id: "23995798-bd50-467d-ad2a-f2eaa780f1e9",
    name: "Familias",
    description: "Actividades orientadas a grupos familiares con niños",
  },
  {
    id: "33995798-bd50-467d-ad2a-f2eaa780f1ea",
    name: "Parejas",
    description: "Experiencias románticas o para dos personas",
  },
  {
    id: "43995798-bd50-467d-ad2a-f2eaa780f1eb",
    name: "Aventureros",
    description: "Actividades para personas que buscan adrenalina",
  },
  {
    id: "53995798-bd50-467d-ad2a-f2eaa780f1ec",
    name: "Adultos mayores",
    description: "Experiencias adaptadas para personas de la tercera edad",
  },
];

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

  // Consultas RTK Query con fallback a datos locales
  const { data: productTypesApi = [], isLoading: isLoadingTypes } =
    useGetProductTypesQuery();

  const { data: productCategoriesApi = [], isLoading: isLoadingCategories } =
    useGetProductCategoriesQuery();

  const { data: productAmenitiesApi = [], isLoading: isLoadingAmenities } =
    useGetProductAmenitiesQuery();

  const { data: productAudiencesApi = [], isLoading: isLoadingAudiences } =
    useGetProductAudiencesQuery();

  // Usar datos de fallback si las APIs no devuelven datos
  const productTypes =
    productTypesApi.length > 0 ? productTypesApi : FALLBACK_PRODUCT_TYPES;
  const productCategories =
    productCategoriesApi.length > 0
      ? productCategoriesApi
      : FALLBACK_PRODUCT_CATEGORIES;
  const productAmenities =
    productAmenitiesApi.length > 0
      ? productAmenitiesApi
      : FALLBACK_PRODUCT_AMENITIES;
  const productAudiences =
    productAudiencesApi.length > 0
      ? productAudiencesApi
      : FALLBACK_PRODUCT_AUDIENCES;

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

  // Filtrar amenities por categoría seleccionada usando category_id
  const filteredAmenities = selectedCategoryId
    ? productAmenities.filter(
        (amenity) => amenity.category_id === selectedCategoryId
      )
    : [];

  const amenityOptions: ComboboxOption[] = filteredAmenities.map((amenity) => ({
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
                    placeholder={
                      selectedCategoryId
                        ? "Selecciona las comodidades"
                        : "Primero selecciona una categoría"
                    }
                    emptyMessage="No se encontraron comodidades para esta categoría"
                    className="w-full"
                    disabled={!selectedCategoryId}
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
