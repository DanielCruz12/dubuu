import { z } from "zod";

// Esquema de validación para información básica
export const basicInfoSchema = z.object({
  name: z
    .string()
    .min(5, { message: "El nombre debe tener al menos 5 caracteres" }),
  description: z
    .string()
    .min(20, { message: "La descripción debe tener al menos 20 caracteres" }),
  departure_point: z
    .string()
    .min(3, { message: "El punto de partida es requerido" }),
  address: z.string().min(3, { message: "La dirección es requerida" }),
  country: z.string().min(2, { message: "El país es requerido" }),
  region: z.string().optional(),
  max_people: z.coerce
    .number()
    .int()
    .positive({ message: "El número máximo de personas debe ser mayor a 0" }),
  duration: z.coerce
    .number()
    .int()
    .positive({ message: "La duración debe ser mayor a 0" }),
});

// Esquema de validación para ubicación
export const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().min(3, { message: "La dirección es requerida" }),
});

// Esquema de validación para detalles
export const detailsSchema = z.object({
  highlight: z
    .string()
    .min(10, {
      message: "Los aspectos destacados deben tener al menos 10 caracteres",
    }),
  included: z
    .string()
    .min(10, { message: "Lo incluido debe tener al menos 10 caracteres" }),
  itinerary: z
    .array(z.string())
    .min(1, { message: "Debe incluir al menos un punto en el itinerario" }),
  available_dates: z
    .array(z.date())
    .min(1, { message: "Debe seleccionar al menos una fecha disponible" }),
  difficulty: z.enum(["easy", "medium", "hard", "extreme"], {
    message: "Debe seleccionar un nivel de dificultad",
  }),
  expenses: z.array(z.string()).optional(),
  packing_list: z.array(z.string()).optional(),
});

// Esquema de validación para categorización (sin amenities)
export const categorizationSchema = z.object({
  product_type_id: z
    .string()
    .min(1, { message: "Debe seleccionar un tipo de producto" }),
  product_category_id: z
    .string()
    .min(1, { message: "Debe seleccionar una categoría" }),
  target_product_audience_id: z
    .string()
    .min(1, { message: "Debe seleccionar una audiencia objetivo" }),
  amenities: z
    .array(z.string())
    .min(1, { message: "Debe seleccionar al menos una comodidad" }),
});

// Esquema de validación para multimedia
export const multimediaSchema = z.object({
  price: z.coerce
    .number()
    .positive({ message: "El precio debe ser mayor a 0" }),
});

// Tipos para los formularios
export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;
export type LocationFormValues = z.infer<typeof locationSchema>;
export type DetailsFormValues = z.infer<typeof detailsSchema>;
export type CategorizationFormValues = z.infer<typeof categorizationSchema>;
export type MultimediaFormValues = z.infer<typeof multimediaSchema>;

// Tipo para la ubicación seleccionada en el mapa
export interface Location {
  lat: number;
  lng: number;
  address: string;
}

// Tipo para los archivos multimedia
export interface TourFiles {
  bannerFile: File | null;
  imageFiles: File[];
  videoFiles: File[];
  fileAttachments: File[];
}

// Tipo para los datos completos del tour
export interface TourData {
  basicInfo: BasicInfoFormValues;
  location: LocationFormValues;
  details: DetailsFormValues;
  categorization: CategorizationFormValues;
  multimedia: MultimediaFormValues;
  files: TourFiles;
}

// Tipo para el payload final del API
export interface TourAPIPayload {
  name: string;
  description: string;
  price: number;
  departure_point: string;
  address: string;
  country: string;
  region?: string;
  available_dates: string[];
  amenities: string[];
  itinerary: string[];
  highlight: string;
  included: string;
  expenses: string[];
  difficulty: "easy" | "medium" | "hard" | "extreme";
  packing_list: string[];
  max_people: number;
  lat: string;
  long: string;
  duration: number;
  images: File[];
  banner: File | null;
  videos?: File[];
  attachments?: File[];
  product_category_id: string;
  product_type_id: string;
  target_product_audience_id: string;
  user_id: string;
}
