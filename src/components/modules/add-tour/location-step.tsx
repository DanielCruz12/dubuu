"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { type LocationFormValues, getLocationSchema, type Location } from "./types";
import { scrollToFirstError } from "./utils";
import LocationPicker from "@/components/location-picker";
import { useLanguage } from "@/lib/i18n-context";

interface LocationStepProps {
  onSubmit: (data: LocationFormValues) => void;
  defaultValues?: Partial<LocationFormValues>;
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  const parsed =
    typeof value === "number"
      ? value
      : Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function LocationStep({ onSubmit, defaultValues }: LocationStepProps) {
  const { t } = useLanguage();
  const locationSchema = useMemo(() => getLocationSchema(t), [t]);
  const initialLat = toFiniteNumber(defaultValues?.lat, 0);
  const initialLng = toFiniteNumber(defaultValues?.lng, 0);
  const hasValidInitialLocation =
    Number.isFinite(initialLat) &&
    Number.isFinite(initialLng) &&
    Boolean(defaultValues?.address);

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    hasValidInitialLocation
      ? {
          lat: initialLat,
          lng: initialLng,
          address: defaultValues?.address ?? "",
        }
      : null,
  );

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      lat: initialLat,
      lng: initialLng,
      address: defaultValues?.address || "",
    },
  });

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    form.setValue("lat", location.lat);
    form.setValue("lng", location.lng);
    form.setValue("address", location.address);
    form.trigger(["lat", "lng", "address"]);
  };

  const handleSubmit = form.handleSubmit(
    (data) => {
      onSubmit(data);
    },
    (errors) => {
      scrollToFirstError(errors);
    },
  );

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormLabel>{t("dashboard.addTour.location.address")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lat"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormLabel>{t("dashboard.addTour.location.lat")}</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="any" />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lng"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormLabel>{t("dashboard.addTour.location.lng")}</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="any" />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <LocationPicker onLocationSelect={handleLocationSelect} initialLocation={selectedLocation || undefined} />
        </div>
      </form>
    </Form>
  );
}
