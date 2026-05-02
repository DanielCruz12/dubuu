import { z } from "zod";
import type {
  CategorizationFormValues,
  MultimediaFormValues,
  TourFiles,
} from "../add-tour/types";

export type TFunction = (key: string) => string;

const CAR_TYPES = [
  "sedan",
  "suv",
  "hatchback",
  "coupe",
  "convertible",
  "truck",
  "van",
  "motorcycle",
] as const;

export function getRentalBasicSchema(t: TFunction) {
  return z.object({
    name: z.string().min(5, { message: t("dashboard.addRental.basic.validation.nameMin") }),
    description: z
      .string()
      .min(20, { message: t("dashboard.addRental.basic.validation.descriptionMin") }),
    address: z.string().min(3, { message: t("dashboard.addRental.basic.validation.addressMin") }),
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
    condition: z.enum(["new", "used", "excellent", "good", "fair"]),
    mileage: z.coerce.number().int().min(0),
    transmission: z.enum(["automatic", "manual"]),
    seating_capacity: z.coerce.number().int().min(1).max(50),
    type_car: z.enum(CAR_TYPES),
    fuel_type: z.enum(["gasoline", "diesel", "electric", "hybrid"]),
    color: z.string().min(1, { message: t("dashboard.addRental.vehicle.validation.colorMin") }),
    doors: z.coerce.number().int().min(2).max(10),
    engine: z.string().min(1, { message: t("dashboard.addRental.vehicle.validation.engineMin") }),
  });
}

export function getRentalTermsSchema(t: TFunction) {
  return z
    .object({
      pickup_location: z
        .string()
        .min(3, { message: t("dashboard.addRental.terms.validation.pickupMin") }),
      offers_delivery: z.boolean(),
      max_delivery_distance_km: z.coerce.number().min(0),
      base_delivery_fee: z.string().min(1),
      fee_per_km: z.string().min(1),
      available_from: z.string().min(1),
      available_until: z.string().min(1),
      is_available: z.boolean(),
      is_live: z.boolean(),
      is_active: z.boolean(),
    })
    .superRefine((data, ctx) => {
      if (data.offers_delivery && data.max_delivery_distance_km <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("dashboard.addRental.terms.validation.deliveryDistancePositive"),
          path: ["max_delivery_distance_km"],
        });
      }
      if (
        data.offers_delivery &&
        (!data.base_delivery_fee.trim() || !data.fee_per_km.trim())
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("dashboard.addRental.terms.validation.deliveryFeesRequired"),
          path: ["base_delivery_fee"],
        });
      }
      if (new Date(data.available_until) < new Date(data.available_from)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("dashboard.addRental.terms.validation.dateRange"),
          path: ["available_until"],
        });
      }
    });
}

export type RentalBasicFormValues = z.infer<ReturnType<typeof getRentalBasicSchema>>;
export type RentalVehicleFormValues = z.infer<ReturnType<typeof getRentalVehicleSchema>>;
export type RentalTermsFormValues = z.infer<ReturnType<typeof getRentalTermsSchema>>;

export type RentalData = {
  basic: RentalBasicFormValues;
  vehicle: RentalVehicleFormValues;
  terms: RentalTermsFormValues;
  categorization: CategorizationFormValues;
  multimedia: MultimediaFormValues;
  files: TourFiles;
};
