import { z } from "zod";

export type TFunction = (key: string) => string;

export function getBasicInfoSchema(t: TFunction) {
  return z.object({
    name: z
      .string()
      .min(5, { message: t("dashboard.addTour.basicInfo.validation.nameMin") }),
    description: z
      .string()
      .min(20, {
        message: t("dashboard.addTour.basicInfo.validation.descriptionMin"),
      }),
    departure_point: z
      .string()
      .min(3, {
        message: t("dashboard.addTour.basicInfo.validation.departure_pointMin"),
      }),
    address: z
      .string()
      .min(3, { message: t("dashboard.addTour.basicInfo.validation.addressMin") }),
    country: z
      .string()
      .min(2, { message: t("dashboard.addTour.basicInfo.validation.countryMin") }),
    region: z.string().optional(),
    max_people: z.coerce.number().int().positive({
      message: t("dashboard.addTour.basicInfo.validation.max_peoplePositive"),
    }),
    duration: z.coerce.number().int().positive({
      message: t("dashboard.addTour.basicInfo.validation.durationPositive"),
    }),
  });
}

export function getLocationSchema(t: TFunction) {
  return z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z
      .string()
      .min(3, { message: t("dashboard.addTour.location.validation.addressMin") }),
  });
}

export function getDetailsSchema(t: TFunction) {
  return z.object({
    highlight: z
      .string()
      .min(10, {
        message: t("dashboard.addTour.details.validation.highlightMin"),
      }),
    included: z
      .string()
      .min(10, {
        message: t("dashboard.addTour.details.validation.includedMin"),
      }),
    itinerary: z
      .array(z.string())
      .min(1, {
        message: t("dashboard.addTour.details.validation.itineraryMin"),
      }),
    available_dates: z
      .array(z.date())
      .min(1, {
        message: t("dashboard.addTour.details.validation.available_datesMin"),
      }),
    difficulty: z.enum(["easy", "medium", "hard", "extreme"], {
      message: t("dashboard.addTour.details.validation.difficultyRequired"),
    }),
    expenses: z.array(z.string()).optional(),
    packing_list: z.array(z.string()).optional(),
  });
}

export function getCategorizationSchema(t: TFunction) {
  return z.object({
    product_type_id: z
      .string()
      .min(1, {
        message: t("dashboard.addTour.categorization.validation.productTypeRequired"),
      }),
    product_category_id: z
      .string()
      .min(1, {
        message: t(
          "dashboard.addTour.categorization.validation.productCategoryRequired"
        ),
      }),
    target_product_audience_id: z
      .string()
      .min(1, {
        message: t(
          "dashboard.addTour.categorization.validation.targetAudienceRequired"
        ),
      }),
    amenities: z
      .array(z.string())
      .min(1, {
        message: t("dashboard.addTour.categorization.validation.amenitiesMin"),
      }),
  });
}

export function getMultimediaSchema(t: TFunction) {
  return z.object({
    price: z.coerce.number().positive({
      message: t("dashboard.addTour.multimedia.validation.pricePositive"),
    }),
  });
}

// Tipos para los formularios (inferidos desde las fábricas)
export type BasicInfoFormValues = z.infer<ReturnType<typeof getBasicInfoSchema>>;
export type LocationFormValues = z.infer<ReturnType<typeof getLocationSchema>>;
export type DetailsFormValues = z.infer<ReturnType<typeof getDetailsSchema>>;
export type CategorizationFormValues = z.infer<
  ReturnType<typeof getCategorizationSchema>
>;
export type MultimediaFormValues = z.infer<
  ReturnType<typeof getMultimediaSchema>
>;

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
