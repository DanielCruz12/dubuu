"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { type BasicInfoFormValues, basicInfoSchema } from "./types";
import { scrollToFirstError } from "./utils";
import { countries } from "@/utils/data";

interface BasicInfoStepProps {
  onSubmit: (data: BasicInfoFormValues) => void;
  defaultValues?: Partial<BasicInfoFormValues>;
}

export function BasicInfoStep({ onSubmit, defaultValues }: BasicInfoStepProps) {
  const form = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      departure_point: defaultValues?.departure_point || "",
      address: defaultValues?.address || "",
      country: defaultValues?.country || "",
      max_people: defaultValues?.max_people || undefined,
      duration: defaultValues?.duration || undefined,
    },
  });

  const handleSubmit = form.handleSubmit(
    (data) => {
      onSubmit(data);
    },
    (errors) => {
      // Hacer scroll al primer error
      scrollToFirstError(errors);
    }
  );

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Nombre del tour</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ej. Exploración Volcán de Santa Ana"
                    className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Describe el tour de manera detallada"
                    className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white min-h-[100px]"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="departure_point"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Punto de partida</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ej. Multiplaza, San Salvador"
                    className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="max_people"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Máximo de personas</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="Ej. 10"
                    className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Dirección del destino</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ej. Volcán de Santa Ana, Cerro Verde"
                    className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>País</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white">
                      <SelectValue placeholder="Seleccione un país" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries
                      .sort((a, b) => a.orden - b.orden)
                      .map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.nombre}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duración (días)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="Ej. 1"
                    className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
