import { z } from "zod";
import type {
  CategorizationFormValues,
  MultimediaFormValues,
  TourFiles,
} from "../add-tour/types";

export type TFunction = (key: string) => string;

export function getRentalBasicSchema(t: TFunction) {
  return z.object({
    name: z.string().min(5, { message: t("dashboard.addRental.basic.validation.nameMin") }),
    description: z
      .string()
      .min(20, { message: t("dashboard.addRental.basic.validation.descriptionMin") }),
  });
}

export function getRentalVehicleSchema(t: TFunction) {
  return z.object({
    brand: z.string().min(1, { message: t("dashboard.addRental.vehicle.validation.brandMin") }),
    model: z.string().min(1, { message: t("dashboard.addRental.vehicle.validation.modelMin") }),
    year: z.coerce
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear() + 1),
    condition: z.enum(["new", "used", "refurbished"]),
    fuel_type: z.enum(["gasoline", "diesel", "electric", "hybrid"]),
    color: z.string().min(1, { message: t("dashboard.addRental.vehicle.validation.colorMin") }),
    engine: z.string().min(1, { message: t("dashboard.addRental.vehicle.validation.engineMin") }),
    transmission: z.enum(["automatic", "manual"]),
    seating_capacity: z.coerce.number().int().min(1).max(50),
  });
}

export function getRentalDeliverySchema(t: TFunction) {
  const areaSchema = z.object({
    center: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    radius_km: z.coerce.number().min(1),
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
      fee_per_km: z.string(),

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
