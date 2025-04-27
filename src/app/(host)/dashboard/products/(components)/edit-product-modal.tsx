"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import type { ITourProduct, ITourProductDates } from "@/types/product";

// Esquema de validación con Zod
const tourFormSchema = z.object({
  price: z
    .number()
    .min(0.01, { message: "El precio debe ser mayor a 0" })
    .max(10000, { message: "El precio no puede exceder 10,000" }),
  departure_point: z
    .string()
    .min(3, { message: "El punto de salida debe tener al menos 3 caracteres" })
    .max(100, {
      message: "El punto de salida no puede exceder 100 caracteres",
    }),
  max_people: z
    .number()
    .int()
    .min(1, { message: "Debe haber al menos 1 persona" })
    .max(1000, { message: "No puede exceder 1000 personas" }),
  is_active: z.boolean().default(true),
  selected_date_id: z.string().optional(),
});

// Tipo para los valores del formulario
type TourFormValues = z.infer<typeof tourFormSchema>;

// Props para el componente
interface EditProductModalProps {
  tour: ITourProduct & { selectedDateId?: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedTour: Partial<ITourProduct>) => void;
  selectedDateId?: string;
}

export function EditProductModal({
  tour,
  open,
  onOpenChange,
  onSave,
  selectedDateId,
}: EditProductModalProps) {
  const [isPending, setIsPending] = useState(false);
  const [localSelectedDateId, setLocalSelectedDateId] = useState(
    selectedDateId || tour.selectedDateId || ""
  );

  // Encontrar la fecha seleccionada
  const getSelectedDate = (): ITourProductDates | null => {
    if (!tour.tour.tour_dates || tour.tour.tour_dates.length === 0) return null;

    if (localSelectedDateId) {
      return (
        tour.tour.tour_dates.find((date) => date.id === localSelectedDateId) ||
        tour.tour.tour_dates[0]
      );
    }

    return tour.tour.tour_dates[0]; // Primera fecha por defecto
  };

  const selectedDate = getSelectedDate();

  // Configurar el formulario con React Hook Form y Zod
  const form = useForm<TourFormValues>({
    resolver: zodResolver(tourFormSchema),
    defaultValues: {
      price:
        typeof tour.price === "string"
          ? Number.parseFloat(tour.price)
          : tour.price,
      departure_point: tour.tour.departure_point || "",
      max_people: selectedDate?.max_people || 0,
      is_active: tour.is_active || false,
      selected_date_id:
        localSelectedDateId ||
        (tour.tour.tour_dates && tour.tour.tour_dates.length > 0
          ? tour.tour.tour_dates[0].id
          : ""),
    },
  });

  // Actualizar la fecha seleccionada local cuando cambia la prop
  useEffect(() => {
    if (selectedDateId) {
      setLocalSelectedDateId(selectedDateId);

      // Actualizar los valores del formulario cuando cambia la fecha seleccionada
      const newSelectedDate = tour.tour.tour_dates.find(
        (date) => date.id === selectedDateId
      );
      if (newSelectedDate) {
        form.setValue("max_people", newSelectedDate.max_people);
      }
    }
  }, [selectedDateId, form, tour.tour.tour_dates]);

  // Manejar el cambio de fecha
  const handleDateChange = (dateId: string) => {
    setLocalSelectedDateId(dateId);

    // Actualizar los valores del formulario cuando cambia la fecha seleccionada
    const newSelectedDate = tour.tour.tour_dates.find(
      (date) => date.id === dateId
    );
    if (newSelectedDate) {
      form.setValue("max_people", newSelectedDate.max_people);
    }
  };

  // Manejar el envío del formulario
  const onSubmit = async (data: TourFormValues) => {
    setIsPending(true);
    try {
      // Crear una copia profunda del tour para actualizarlo
      const updatedTour: Partial<ITourProduct> = {
        ...tour,
        price: data.price,
        is_active: data.is_active,
        tour: {
          ...tour.tour,
          departure_point: data.departure_point,
          // Actualizar la fecha específica en el array de fechas
          tour_dates: tour.tour.tour_dates.map((date) => {
            if (date.id === localSelectedDateId) {
              return {
                ...date,
                max_people: data.max_people,
                // Mantener el valor original de people_booked
                people_booked: date.people_booked,
              };
            }
            return date;
          }),
        },
      };

      onSave(updatedTour);
    } catch (error) {
      console.error("Error al guardar el tour:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-w-[95%] md:max-w-[85%] lg:max-w-[75%] xl:max-w-[55%] p-0 overflow-hidden rounded-xl border-none shadow-xl">
        <div className="bg-gradient-to-r dark:from-black dark:to-primary/5 border-none px-4 md:px-0">
          <DialogHeader>
            <DialogTitle className="text-center pt-6">Editar Tour</DialogTitle>
            <DialogDescription className="pt-1 pb-2 text-center">
              Actualiza los detalles del tour &quot;{tour.name}&quot;
            </DialogDescription>
          </DialogHeader>

          <div className=" gap-3 py-3 mx-auto max-w-3xl">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Resto de campos en diseño responsivo */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Selector de fecha */}
                  {tour.tour.tour_dates && tour.tour.tour_dates.length > 0 && (
                    <FormField
                      control={form.control}
                      name="selected_date_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha del Tour</FormLabel>
                          <Select
                            value={localSelectedDateId}
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleDateChange(value);
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar fecha" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {tour.tour.tour_dates.map((date) => (
                                <SelectItem key={date.id} value={date.id}>
                                  {format(
                                    new Date(date.date),
                                    "dd/MM/yyyy HH:mm"
                                  )}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Selecciona la fecha para editar sus detalles
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="departure_point"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Punto de Salida</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej. Hotel Barceló, San Salvador"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Campos de precio y máximo de personas en 2 columnas siempre */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number.parseFloat(e.target.value))
                            }
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription>Precio por persona</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_people"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Máximo de Personas</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="10"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                Number.parseInt(e.target.value, 10)
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          {selectedDate ? `Para la fecha seleccionada` : ""}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Activo</FormLabel>
                        <FormDescription>
                          Este tour estará visible y disponible para reservas
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <DialogFooter className="gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isPending}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
