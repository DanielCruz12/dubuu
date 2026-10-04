import { z } from "zod";
import type {
  CategorizationFormValues,
  MultimediaFormValues,
  TourFiles,
} from "../add-tour/types";
import {
  sanitizeText,
  VALIDATION_LIMITS,
  PLATE_REGEX,
  VIN_REGEX,
} from "../add-tour/validation";

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

export function getRentalBasicSchema(t: TFunction) {
  return z.object({
    name: cleanText(t).pipe(
      z
        .string()
        .min(5, { message: t("dashboard.addRental.basic.validation.nameMin") })
        .max(VALIDATION_LIMITS.NAME_MAX, {
          message: maxCharsMessage(t, VALIDATION_LIMITS.NAME_MAX),
        }),
    ),
    description: cleanText(t).pipe(
      z
        .string()
        .min(20, { message: t("dashboard.addRental.basic.validation.descriptionMin") })
        .max(VALIDATION_LIMITS.DESCRIPTION_MAX, {
          message: maxCharsMessage(t, VALIDATION_LIMITS.DESCRIPTION_MAX),
        }),
    ),
  });
}

export function getRentalVehicleSchema(t: TFunction) {
  return z
    .object({
      brand: cleanText(t).pipe(
        z
          .string()
          .min(1, { message: t("dashboard.addRental.vehicle.validation.brandMin") })
          .max(VALIDATION_LIMITS.BRAND_MODEL_MAX, {
            message: maxCharsMessage(t, VALIDATION_LIMITS.BRAND_MODEL_MAX),
          }),
      ),
      model: cleanText(t).pipe(
        z
          .string()
          .min(1, { message: t("dashboard.addRental.vehicle.validation.modelMin") })
          .max(VALIDATION_LIMITS.BRAND_MODEL_MAX, {
            message: maxCharsMessage(t, VALIDATION_LIMITS.BRAND_MODEL_MAX),
          }),
      ),
      year: z.coerce
        .number()
        .int({ message: t("dashboard.addTour.validation.integer") })
        .min(VALIDATION_LIMITS.YEAR_MIN, {
          message: t("dashboard.addTour.validation.minValue").replace(
            "{{min}}",
            String(VALIDATION_LIMITS.YEAR_MIN),
          ),
        })
        .max(new Date().getFullYear() + 1, {
          message: maxValueMessage(t, new Date().getFullYear() + 1),
        }),
      condition: z.enum(["new", "used", "refurbished"]),
      fuel_type: z.enum(["gasoline", "diesel", "electric", "hybrid"]),
      color: z.string().min(1, { message: t("dashboard.addRental.vehicle.validation.colorMin") }),
      engine: cleanText(t).pipe(
        z
          .string()
          .min(1, { message: t("dashboard.addRental.vehicle.validation.engineMin") })
          .max(VALIDATION_LIMITS.ENGINE_MAX, {
            message: maxCharsMessage(t, VALIDATION_LIMITS.ENGINE_MAX),
          }),
      ),
      transmission: z.enum(["automatic", "manual"]),
      seating_capacity: z.coerce
        .number()
        .int({ message: t("dashboard.addTour.validation.integer") })
        .min(1, {
          message: t("dashboard.addTour.validation.minValue").replace(
            "{{min}}",
            "1",
          ),
        })
        .max(VALIDATION_LIMITS.SEATING_MAX, {
          message: maxValueMessage(t, VALIDATION_LIMITS.SEATING_MAX),
        }),
      plate: z
        .string()
        .trim()
        .optional()
        .default("")
        .pipe(
          z
            .string()
            .max(VALIDATION_LIMITS.PLATE_MAX, {
              message: maxCharsMessage(t, VALIDATION_LIMITS.PLATE_MAX),
            })
            .regex(PLATE_REGEX, {
              message: t("dashboard.addTour.validation.invalidChars"),
            }),
        ),
      vin: z
        .string()
        .trim()
        .optional()
        .default("")
        .pipe(
          z
            .string()
            .max(VALIDATION_LIMITS.VIN_MAX, {
              message: maxCharsMessage(t, VALIDATION_LIMITS.VIN_MAX),
            })
            .regex(VIN_REGEX, {
              message: t("dashboard.addTour.validation.invalidChars"),
            }),
        ),
      has_gps: z.boolean().default(false),
      has_deposit: z.boolean().default(false),
      deposit_amount: z.string().trim().optional().default("0.00"),
    })
    .superRefine((data, ctx) => {
      if (data.has_deposit) {
        const raw = String(data.deposit_amount ?? "");
        if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("dashboard.addRental.vehicle.validation.depositInvalid"),
            path: ["deposit_amount"],
          });
        } else if (Number(raw) > VALIDATION_LIMITS.DEPOSIT_MAX) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: maxValueMessage(t, VALIDATION_LIMITS.DEPOSIT_MAX),
            path: ["deposit_amount"],
          });
        }
      }
    });
}

export function getRentalDeliverySchema(t: TFunction) {
  const areaSchema = z.object({
    center: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    radius_km: z.coerce
      .number()
      .min(1, {
        message: t("dashboard.addTour.validation.minValue").replace(
          "{{min}}",
          "1",
        ),
      })
      .max(VALIDATION_LIMITS.RADIUS_KM_MAX, {
        message: maxValueMessage(t, VALIDATION_LIMITS.RADIUS_KM_MAX),
      }),
  });

  return z
    .object({
      /** País del producto (migrado desde step 1). */
      country: z.string().min(2, { message: t("dashboard.addRental.basic.validation.countryMin") }),

      /**
       * Opciones de entrega:
       * - "specific_areas": el host define 1+ áreas con un centro y radio.
       * - "coverage": el host define cobertura por país completo o por departamentos/regiones.
       */
      delivery_mode: z.enum(["specific_areas", "coverage"]),

      /** Áreas específicas (1+). */
      specific_areas: z.array(areaSchema).default([]),

      /** Cobertura (por país completo o por departamentos). */
      coverage_all_country: z.boolean().default(true),
      coverage_departments: z.array(z.string()).default([]),

      /** Tarifa por km (opcional, por defecto 0). */
      fee_per_km: z
        .string()
        .transform((v) => v.trim())
        .refine(
          (v) => /^\d+(\.\d{1,2})?$/.test(v),
          t("dashboard.addRental.terms.validation.feePerKmInvalid"),
        )
        .refine(
          (v) => Number(v) <= VALIDATION_LIMITS.FEE_PER_KM_MAX,
          maxValueMessage(t, VALIDATION_LIMITS.FEE_PER_KM_MAX),
        ),

      /**
       * Campo legado que sigue esperando el backend hoy.
       * Lo derivamos del radio máximo (o un fallback cuando es cobertura total).
       */
      max_delivery_distance_km: z.coerce.number().min(0),
    })
    .superRefine((data, ctx) => {
      if (data.delivery_mode === "specific_areas") {
        if (!data.specific_areas?.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("dashboard.addRental.terms.validation.deliveryDistancePositive"),
            path: ["specific_areas"],
          });
        }
        const maxRadius = Math.max(0, ...(data.specific_areas ?? []).map((a) => a.radius_km || 0));
        if (maxRadius <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("dashboard.addRental.terms.validation.deliveryDistancePositive"),
            path: ["specific_areas"],
          });
        }
      }

      if (data.delivery_mode === "coverage" && !data.coverage_all_country) {
        if (!data.coverage_departments?.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("dashboard.addRental.basic.validation.countryMin"),
            path: ["coverage_departments"],
          });
        }
      }
    });
}

export type RentalBasicFormValues = z.infer<ReturnType<typeof getRentalBasicSchema>>;
export type RentalVehicleFormValues = z.infer<ReturnType<typeof getRentalVehicleSchema>>;
export type RentalDeliveryFormValues = z.infer<ReturnType<typeof getRentalDeliverySchema>>;

export type RentalAvailabilitySnapshot = {
  available_from: string;
  available_until: string;
};

export type RentalData = {
  basic: RentalBasicFormValues;
  vehicle: RentalVehicleFormValues;
  delivery: RentalDeliveryFormValues;
  /** Preserved from API when editing; omitted on create (defaults applied at submit). */
  availabilitySnapshot?: RentalAvailabilitySnapshot | null;
  categorization: CategorizationFormValues;
  multimedia: MultimediaFormValues;
  files: TourFiles;
};
