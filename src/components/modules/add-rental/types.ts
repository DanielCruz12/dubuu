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
    country: z.string().min(2, { message: t("dashboard.addRental.basic.validation.countryMin") }),
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
  return z
    .object({
      offers_delivery: z.boolean(),
      max_delivery_distance_km: z.coerce.number().min(0),
      fee_per_km: z.string().min(1),
    })
    .superRefine((data, ctx) => {
      if (data.offers_delivery && data.max_delivery_distance_km <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("dashboard.addRental.terms.validation.deliveryDistancePositive"),
          path: ["max_delivery_distance_km"],
        });
      }
      if (data.offers_delivery && !data.fee_per_km.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("dashboard.addRental.terms.validation.feePerKmRequired"),
          path: ["fee_per_km"],
        });
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
