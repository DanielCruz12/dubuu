"use client";

import { useMemo, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { type RentalDeliveryFormValues, getRentalDeliverySchema } from "./types";
import { focusFirstStepField, scrollToFirstError } from "../add-tour/utils";
import { useLanguage } from "@/lib/i18n-context";
import { getCountrySelectOptions } from "@/lib/country-options";
import { MultiCombobox } from "@/components/ui/combobox";
import { countries } from "@/utils/data";
import RadiusLocationPicker from "@/components/radius-location-picker";

interface RentalDeliveryStepProps {
  onSubmit: (data: RentalDeliveryFormValues) => void;
  defaultValues?: Partial<RentalDeliveryFormValues>;
}

export function RentalDeliveryStep({ onSubmit, defaultValues }: RentalDeliveryStepProps) {
  const { t, language } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
  const schema = useMemo(() => getRentalDeliverySchema(t), [t]);

  const countryOptions = useMemo(() => getCountrySelectOptions(language), [language]);

  const form = useForm<RentalDeliveryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      country: defaultValues?.country ?? "SV",
      delivery_mode: defaultValues?.delivery_mode ?? "specific_areas",
      specific_areas:
        defaultValues?.specific_areas && defaultValues.specific_areas.length > 0
          ? defaultValues.specific_areas
          : [
              {
                center: { lat: 13.8447, lng: -89.6306 },
                radius_km: 10,
              },
            ],
      coverage_all_country: defaultValues?.coverage_all_country ?? true,
      coverage_departments: defaultValues?.coverage_departments ?? [],
      fee_per_km: defaultValues?.fee_per_km ?? "0",
      max_delivery_distance_km: defaultValues?.max_delivery_distance_km ?? 0,
    },
  });

  const deliveryMode = form.watch("delivery_mode");
  const selectedCountry = form.watch("country");
  const coverageAllCountry = form.watch("coverage_all_country");

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "specific_areas",
  });

  useEffect(() => {
    focusFirstStepField(formRef.current, { delayMs: 100 });
  }, [defaultValues?.country]);

  const departmentOptions = useMemo(() => {
    if (!selectedCountry) return [];
    const found = countries.find((c) => c.id === selectedCountry);
    const regions = found?.regiones ?? [];
    return regions.map((r) => ({
      value: r.id,
      label: r.nombre,
    }));
  }, [selectedCountry]);

  const handleSubmit = form.handleSubmit(
    (data) => {
      // Derivar compatibilidad con backend (max_delivery_distance_km)
      let derivedMaxKm = 0;
      if (data.delivery_mode === "specific_areas") {
        derivedMaxKm = Math.max(0, ...(data.specific_areas ?? []).map((a) => Number(a.radius_km) || 0));
      } else {
        derivedMaxKm = data.coverage_all_country ? 9999 : 300;
      }
      onSubmit({
        ...data,
        max_delivery_distance_km: derivedMaxKm,
      });
    },
    (errors) => scrollToFirstError(errors),
  );

  return (
    <Form {...form}>
      <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("dashboard.addRental.basic.country")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("dashboard.addRental.basic.countryPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent position="popper" className="max-h-72">
                    {countryOptions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fee_per_km"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t("dashboard.addRental.terms.feePerKm")}</FormLabel>
                <FormControl>
                  <Input {...field} inputMode="decimal" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="delivery_mode"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t("dashboard.addRental.steps.delivery.title")}</FormLabel>
              <FormControl>
                <RadioGroup
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <label className="flex items-start gap-3 rounded-lg border p-4 cursor-pointer">
                    <RadioGroupItem value="specific_areas" className="mt-1" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Entrega en áreas específicas</p>
                      <p className="text-xs text-muted-foreground">
                        Define una o varias áreas con un radio de cobertura.
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 rounded-lg border p-4 cursor-pointer">
                    <RadioGroupItem value="coverage" className="mt-1" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Entregas con cobertura</p>
                      <p className="text-xs text-muted-foreground">
                        Cobertura en todo el país o por departamentos.
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {deliveryMode === "specific_areas" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Áreas de entrega</p>
                <p className="text-xs text-muted-foreground">Haz click en el mapa para mover el centro.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    center: { lat: 13.8447, lng: -89.6306 },
                    radius_km: 10,
                  })
                }
              >
                Agregar área
              </Button>
            </div>

            <div className="space-y-6">
              {fields.map((f, idx) => {
                const radius = Number(form.watch(`specific_areas.${idx}.radius_km` as const) ?? 10);
                const center = form.watch(`specific_areas.${idx}.center` as const) as { lat: number; lng: number } | undefined;
                return (
                  <div key={f.id} className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">Área {idx + 1}</p>
                        <p className="text-xs text-muted-foreground">Radio actual: {radius} km</p>
                      </div>
                      {fields.length > 1 ? (
                        <Button type="button" variant="ghost" onClick={() => remove(idx)}>
                          Quitar
                        </Button>
                      ) : null}
                    </div>

                    <RadiusLocationPicker
                      radiusKm={radius}
                      initialLocation={
                        center
                          ? {
                              lat: center.lat,
                              lng: center.lng,
                              address: "Ubicación seleccionada",
                            }
                          : null
                      }
                      onLocationSelect={(loc) => {
                        const current = form.getValues().specific_areas?.[idx];
                        update(idx, {
                          ...(current ?? {
                            center: { lat: 13.8447, lng: -89.6306 },
                            radius_km: 10,
                          }),
                          center: { lat: loc.lat, lng: loc.lng },
                        });
                      }}
                    />

                    <FormField
                      control={form.control}
                      name={`specific_areas.${idx}.radius_km` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Radio (km)</FormLabel>
                          <FormControl>
                            <div className="space-y-3">
                              <Slider
                                value={[Number(field.value) || 10]}
                                min={1}
                                max={200}
                                step={1}
                                onValueChange={(v) => field.onChange(v[0])}
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>1 km</span>
                                <span>{Number(field.value) || 10} km</span>
                                <span>200 km</span>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                );
              })}
            </div>

            <FormField
              control={form.control}
              name="specific_areas"
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : null}

        {deliveryMode === "coverage" ? (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="coverage_all_country"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Todo el país</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Si lo desactivas, podrás seleccionar departamentos.
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coverage_departments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamentos</FormLabel>
                  <FormControl>
                    <MultiCombobox
                      options={departmentOptions}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      placeholder={
                        selectedCountry
                          ? departmentOptions.length
                            ? "Selecciona departamentos"
                            : "Este país no tiene departamentos configurados"
                          : "Selecciona un país primero"
                      }
                      disabled={coverageAllCountry || !selectedCountry || departmentOptions.length === 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : null}
      </form>
    </Form>
  );
}
