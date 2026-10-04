import { z } from "zod";
import type { TourDateStatus } from "@/types/product";
import { sanitizeText, VALIDATION_LIMITS } from "./validation";

export type TFunction = (key: string) => string;

/** Sanitiza (anti-inyección) y recorta el texto antes de validar longitudes. */
function cleanText(t: TFunction) {
  console.log(t);
  return z
    .string()
    .trim()
    .transform(sanitizeText);
}

function maxCharsMessage(t: TFunction, max: number): string {
  return t("dashboard.addTour.validation.maxChars").replace(
    "{{max}}",
    String(max),
  );
}

function maxValueMessage(t: TFunction, max: number): string {
  return t("dashboard.addTour.validation.maxValue").replace(
    "{{max}}",
    String(max),
  );
}

/** Añade la regla de máx. 2 decimales a un esquema numérico (precios). */
function withMaxDecimals(schema: z.ZodNumber, t: TFunction) {
  return schema.refine((v) => Math.round(v * 100) / 100 === v, {
    message: t("dashboard.addTour.validation.maxDecimals"),
  });
}

export function getBasicInfoSchema(t: TFunction) {
  return z.object({
    name: cleanText(t).pipe(
      z
        .string()
        .min(5, { message: t("dashboard.addTour.basicInfo.validation.nameMin") })
        .max(VALIDATION_LIMITS.NAME_MAX, {
          message: maxCharsMessage(t, VALIDATION_LIMITS.NAME_MAX),
        }),
    ),
    description: cleanText(t).pipe(
      z
        .string()
        .min(20, {
          message: t("dashboard.addTour.basicInfo.validation.descriptionMin"),
        })
        .max(VALIDATION_LIMITS.DESCRIPTION_MAX, {
          message: maxCharsMessage(t, VALIDATION_LIMITS.DESCRIPTION_MAX),
        }),
    ),
    departure_point: cleanText(t).pipe(
      z
        .string()
        .min(3, {
          message: t("dashboard.addTour.basicInfo.validation.departure_pointMin"),
        })
        .max(VALIDATION_LIMITS.DEPARTURE_POINT_MAX, {
          message: maxCharsMessage(t, VALIDATION_LIMITS.DEPARTURE_POINT_MAX),
        }),
    ),
    address: cleanText(t).pipe(
      z
        .string()
        .min(3, { message: t("dashboard.addTour.basicInfo.validation.addressMin") })
        .max(VALIDATION_LIMITS.ADDRESS_MAX, {
          message: maxCharsMessage(t, VALIDATION_LIMITS.ADDRESS_MAX),
        }),
    ),
    country: z
      .string()
      .min(2, { message: t("dashboard.addTour.basicInfo.validation.countryMin") }),
    region: z.string().optional(),
    max_people: z.coerce
      .number()
      .int({ message: t("dashboard.addTour.validation.integer") })
      .positive({
        message: t("dashboard.addTour.basicInfo.validation.max_peoplePositive"),
      })
      .max(VALIDATION_LIMITS.MAX_PEOPLE_MAX, {
        message: maxValueMessage(t, VALIDATION_LIMITS.MAX_PEOPLE_MAX),
      }),
    duration: z.coerce
      .number()
      .int({ message: t("dashboard.addTour.validation.integer") })
      .positive({
        message: t("dashboard.addTour.basicInfo.validation.durationPositive"),
      })
      .max(VALIDATION_LIMITS.DURATION_MAX, {
        message: maxValueMessage(t, VALIDATION_LIMITS.DURATION_MAX),
      }),
  });
}

export function getLocationSchema(t: TFunction) {
  return z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: cleanText(t).pipe(
      z
        .string()
        .min(3, { message: t("dashboard.addTour.location.validation.addressMin") })
        .max(VALIDATION_LIMITS.ADDRESS_MAX, {
          message: maxCharsMessage(t, VALIDATION_LIMITS.ADDRESS_MAX),
        }),
    ),
  });
}

export function getDetailsSchema(t: TFunction) {
  const listItem = cleanText(t).pipe(
    z
      .string()
      .min(1, {
        message: t("dashboard.addTour.validation.itemMin").replace(
          "{{min}}",
          "1",
        ),
      })
      .max(VALIDATION_LIMITS.LIST_ITEM_MAX, {
        message: maxCharsMessage(t, VALIDATION_LIMITS.LIST_ITEM_MAX),
      }),
  );

  return z.object({
    highlight: cleanText(t).pipe(
      z
        .string()
        .min(10, {
          message: t("dashboard.addTour.details.validation.highlightMin"),
        })
        .max(VALIDATION_LIMITS.HIGHLIGHT_MAX, {
          message: maxCharsMessage(t, VALIDATION_LIMITS.HIGHLIGHT_MAX),
        }),
    ),
    included: cleanText(t).pipe(
      z
        .string()
        .min(10, {
          message: t("dashboard.addTour.details.validation.includedMin"),
        })
        .max(VALIDATION_LIMITS.INCLUDED_MAX, {
          message: maxCharsMessage(t, VALIDATION_LIMITS.INCLUDED_MAX),
        }),
    ),
    itinerary: z
      .array(
        cleanText(t).pipe(
          z
            .string()
            .min(2, {
              message: t("dashboard.addTour.validation.itemMin").replace(
                "{{min}}",
                "2",
              ),
            })
            .max(VALIDATION_LIMITS.ITINERARY_ITEM_MAX, {
              message: maxCharsMessage(t, VALIDATION_LIMITS.ITINERARY_ITEM_MAX),
            }),
        ),
      )
      .min(1, {
        message: t("dashboard.addTour.details.validation.itineraryMin"),
      }),
    available_dates: z
      .array(z.date())
      .min(1, {
        message: t("dashboard.addTour.details.validation.available_datesMin"),
      })
      .superRefine((dates, ctx) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dates.forEach((date, index) => {
          if (Number.isNaN(date.getTime()) || date < today) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t("dashboard.addTour.validation.pastDates"),
              path: [index],
            });
          }
        });
      }),
    difficulty: z.enum(["easy", "medium", "hard", "extreme"], {
      message: t("dashboard.addTour.details.validation.difficultyRequired"),
    }),
    expenses: z.array(listItem).optional(),
    packing_list: z.array(listItem).optional(),
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
    price: withMaxDecimals(
      z.coerce
        .number()
        .positive({
          message: t("dashboard.addTour.multimedia.validation.pricePositive"),
        })
        .max(VALIDATION_LIMITS.PRICE_MAX, {
          message: maxValueMessage(t, VALIDATION_LIMITS.PRICE_MAX),
        }),
      t,
    ),
    accepts_children: z.boolean().default(false),
    children_price: withMaxDecimals(
      z.coerce
        .number()
        .min(0, {
          message: t("dashboard.addTour.multimedia.validation.pricePositive"),
        })
        .max(VALIDATION_LIMITS.PRICE_MAX, {
          message: maxValueMessage(t, VALIDATION_LIMITS.PRICE_MAX),
        }),
      t,
    )
      .nullable()
      .default(null),
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

// Fila de fecha/precio/cupo de un tour (en edición trae el id del backend)
export interface TourDateMetaRow {
  id: string;
  date: string;
  price: number;
  children_price?: number | null;
  max_people: number;
  status: TourDateStatus;
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
  accepts_children?: boolean;
  children_price?: number | null;
  images: File[];
  banner: File | null;
  videos?: File[];
  attachments?: File[];
  product_category_id: string;
  product_type_id: string;
  target_product_audience_id: string;
  user_id: string;
}
