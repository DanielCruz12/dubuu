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
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tour } from "../(columns)/columns";

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
  tour: Tour;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedTour: Partial<Tour>) => void;
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
    selectedDateId || ""
  );

  // Encontrar la fecha seleccionada
  const getSelectedDate = () => {
    if (!tour.dates || tour.dates.length === 0) return null;

    if (localSelectedDateId) {
      return (
        tour.dates.find((date) => date.id === localSelectedDateId) ||
        tour.dates[0]
      );
    }

    return tour.dates[0]; // Primera fecha por defecto
  };

  const selectedDate = getSelectedDate();

  // Configurar el formulario con React Hook Form y Zod
  const form = useForm<TourFormValues>({
    resolver: zodResolver(tourFormSchema),
    defaultValues: {
      price: tour.price,
      departure_point: tour.departure_point || "",
      is_active: tour.is_active || false,
      selected_date_id:
        localSelectedDateId ||
        (tour.dates && tour.dates.length > 0 ? tour.dates[0].id : ""),
    },
  });

  // Actualizar la fecha seleccionada local cuando cambia la prop
  useEffect(() => {
    if (selectedDateId) {
      setLocalSelectedDateId(selectedDateId);
    }
  }, [selectedDateId]);

  // Manejar el cambio de fecha
  const handleDateChange = (dateId: string) => {
    setLocalSelectedDateId(dateId);
  };

  // Manejar el envío del formulario
  const onSubmit = async (data: TourFormValues) => {
    setIsPending(true);
    try {
      // Aquí podrías hacer una llamada a la API para actualizar el tour
      onSave({
        ...tour,
        price: data.price,
        departure_point: data.departure_point,
        is_active: data.is_active,
        // También podrías incluir la fecha seleccionada si es necesario
        current_date: selectedDate?.date,
      });
    } catch (error) {
      console.error("Error al guardar el tour:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Tour</DialogTitle>
          <DialogDescription>
            Actualiza los detalles del tour &quot;{tour.name}&quot;
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    />
                  </FormControl>
                  <FormDescription>Precio del tour en USD</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  <FormDescription>
                    Ubicación donde inicia el tour
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selector de fecha */}
            {tour.dates && tour.dates.length > 0 && (
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
                        field.onChange(Number.parseInt(e.target.value, 10))
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Capacidad máxima del tour{" "}
                    {selectedDate ? `para la fecha ${selectedDate.date}` : ""}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <DialogFooter>
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
      </DialogContent>
    </Dialog>
  );
}
