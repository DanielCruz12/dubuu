"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { type LocationFormValues, locationSchema, type Location } from "./types"
import { scrollToFirstError } from "./utils"
import LocationPicker from "@/components/location-picker"

interface LocationStepProps {
  onSubmit: (data: LocationFormValues) => void
  defaultValues?: Partial<LocationFormValues>
}

export function LocationStep({ onSubmit, defaultValues }: LocationStepProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    defaultValues?.lat && defaultValues?.lng && defaultValues?.address
      ? {
          lat: defaultValues.lat,
          lng: defaultValues.lng,
          address: defaultValues.address,
        }
      : null,
  )

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      lat: defaultValues?.lat || 0,
      lng: defaultValues?.lng || 0,
      address: defaultValues?.address || "",
    },
  })

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    form.setValue("lat", location.lat)
    form.setValue("lng", location.lng)
    form.setValue("address", location.address)

    // Disparar validación para que el botón "Siguiente" funcione correctamente
    form.trigger(["lat", "lng", "address"])
  }

  const handleSubmit = form.handleSubmit(
    (data) => {
      onSubmit(data)
    },
    (errors) => {
      // Hacer scroll al primer error
      scrollToFirstError(errors)
    },
  )

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormLabel>Dirección</FormLabel>
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
                <FormLabel>Latitud</FormLabel>
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
                <FormLabel>Longitud</FormLabel>
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
  )
}
