"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon, X, Plus, Clock } from "lucide-react";

import { type DetailsFormValues, detailsSchema } from "./types";
import { scrollToFirstError } from "./utils";
import { TourDifficultyBadge } from "@/components/difficulty-badge";

interface DateWithTime {
  date: Date;
  time: string;
}

interface TimeOption {
  label: string;
  value: string;
}

interface DetailsStepProps {
  onSubmit: (data: DetailsFormValues) => void;
  defaultValues?: Partial<DetailsFormValues>;
}

export function DetailsStep({ onSubmit, defaultValues }: DetailsStepProps) {
  const [itineraryItems, setItineraryItems] = useState<string[]>(
    defaultValues?.itinerary || []
  );
  const [newItineraryItem, setNewItineraryItem] = useState("");
  const [datesWithTimes, setDatesWithTimes] = useState<DateWithTime[]>(
    defaultValues?.available_dates?.map((date) => ({ date, time: "09:00" })) ||
      []
  );
  const [expenseItems, setExpenseItems] = useState<string[]>(
    defaultValues?.expenses || []
  );
  const [newExpenseItem, setNewExpenseItem] = useState("");
  const [packingItems, setPackingItems] = useState<string[]>(
    defaultValues?.packing_list || []
  );
  const [newPackingItem, setNewPackingItem] = useState("");

  const form = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      highlight: defaultValues?.highlight || "",
      included: defaultValues?.included || "",
      itinerary: defaultValues?.itinerary || [],
      available_dates: defaultValues?.available_dates || [],
      difficulty: defaultValues?.difficulty || undefined,
      expenses: defaultValues?.expenses || [],
      packing_list: defaultValues?.packing_list || [],
    },
  });

  const addItineraryItem = () => {
    if (newItineraryItem.trim()) {
      const updatedItems = [...itineraryItems, newItineraryItem.trim()];
      setItineraryItems(updatedItems);
      form.setValue("itinerary", updatedItems);
      setNewItineraryItem("");
    }
  };

  const removeItineraryItem = (index: number) => {
    const updatedItems = itineraryItems.filter((_, i) => i !== index);
    setItineraryItems(updatedItems);
    form.setValue("itinerary", updatedItems);
  };

  const addExpenseItem = () => {
    if (newExpenseItem.trim()) {
      const updatedItems = [...expenseItems, newExpenseItem.trim()];
      setExpenseItems(updatedItems);
      form.setValue("expenses", updatedItems);
      setNewExpenseItem("");
    }
  };

  const removeExpenseItem = (index: number) => {
    const updatedItems = expenseItems.filter((_, i) => i !== index);
    setExpenseItems(updatedItems);
    form.setValue("expenses", updatedItems);
  };

  const addPackingItem = () => {
    if (newPackingItem.trim()) {
      const updatedItems = [...packingItems, newPackingItem.trim()];
      setPackingItems(updatedItems);
      form.setValue("packing_list", updatedItems);
      setNewPackingItem("");
    }
  };

  const removePackingItem = (index: number) => {
    const updatedItems = packingItems.filter((_, i) => i !== index);
    setPackingItems(updatedItems);
    form.setValue("packing_list", updatedItems);
  };

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (dates) {
      // Crear nuevas fechas con horas, manteniendo las horas existentes si la fecha ya existía
      const newDatesWithTimes = dates.map((date) => {
        const existing = datesWithTimes.find(
          (dwt) => dwt.date.toDateString() === date.toDateString()
        );
        return existing || { date, time: "09:00" };
      });

      setDatesWithTimes(newDatesWithTimes);

      // Actualizar las fechas en el formulario con las horas correctas
      const datesWithCorrectTimes = newDatesWithTimes.map(({ date, time }) => {
        const [hours, minutes] = time.split(":").map(Number);
        const newDate = new Date(date);
        newDate.setHours(hours, minutes, 0, 0);
        return newDate;
      });

      form.setValue("available_dates", datesWithCorrectTimes);
    }
  };

  const updateTime = (index: number, time: string) => {
    const updated = [...datesWithTimes];
    updated[index].time = time;
    setDatesWithTimes(updated);

    // Actualizar también la fecha en el formulario con la nueva hora
    const updatedDates = [...form.getValues("available_dates")];
    const [hours, minutes] = time.split(":").map(Number);
    const dateToUpdate = new Date(updatedDates[index]);
    dateToUpdate.setHours(hours, minutes, 0, 0);
    updatedDates[index] = dateToUpdate;

    form.setValue("available_dates", updatedDates);
  };

  const removeDateWithTime = (index: number) => {
    const updated = datesWithTimes.filter((_, i) => i !== index);
    setDatesWithTimes(updated);

    // Actualizar las fechas en el formulario
    const updatedDates = updated.map(({ date, time }) => {
      const [hours, minutes] = time.split(":").map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);
      return newDate;
    });

    form.setValue("available_dates", updatedDates);
  };

  // Generar opciones de hora (cada 30 minutos, 24 horas, formato 12h)
  const timeOptions: TimeOption[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      // Convertir a formato 12 horas
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? "AM" : "PM";
      const timeString = `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
      const valueString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

      timeOptions.push({
        label: timeString,
        value: valueString,
      });
    }
  }

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
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="highlight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aspectos destacados</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Ej. Ascenso al volcán, vistas espectaculares y aguas termales."
                    className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white min-h-[80px]"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="included"
            render={({ field }) => (
              <FormItem>
                <FormLabel>¿Qué incluye?</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Ej. Guía especializado, transporte, entradas y almuerzo tipo picnic."
                    className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white min-h-[80px]"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nivel de dificultad</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white">
                      <SelectValue placeholder="Seleccione el nivel de dificultad">
                        {field.value ? (
                          <TourDifficultyBadge
                            difficulty={field.value}
                            className="scale-90"
                          />
                        ) : null}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="easy">
                      <TourDifficultyBadge
                        difficulty="easy"
                        className="scale-90"
                      />
                    </SelectItem>
                    <SelectItem value="medium">
                      <TourDifficultyBadge
                        difficulty="medium"
                        className="scale-90"
                      />
                    </SelectItem>
                    <SelectItem value="hard">
                      <TourDifficultyBadge
                        difficulty="hard"
                        className="scale-90"
                      />
                    </SelectItem>
                    <SelectItem value="extreme">
                      <TourDifficultyBadge
                        difficulty="extreme"
                        className="scale-90"
                      />
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="itinerary"
            render={() => (
              <FormItem>
                <FormLabel>Itinerario</FormLabel>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={newItineraryItem}
                      onChange={(e) => setNewItineraryItem(e.target.value)}
                      placeholder="Agregar punto de itinerario"
                      className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addItineraryItem();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={addItineraryItem}
                      variant="outline"
                      className="border-gray-200 dark:border-gray-800"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {itineraryItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded-md border-gray-200 dark:border-gray-800"
                      >
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-xs mr-2">
                            {index + 1}
                          </span>
                          <span className="text-sm">{item}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItineraryItem(index)}
                          className="h-8 w-8 p-0"
                        >
                          <span className="sr-only">Eliminar</span>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {form.formState.errors.itinerary && (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.itinerary.message}
                    </p>
                  )}
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expenses"
            render={() => (
              <FormItem>
                <FormLabel>Gastos no incluidos (opcional)</FormLabel>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={newExpenseItem}
                      onChange={(e) => setNewExpenseItem(e.target.value)}
                      placeholder="Ej. Bebidas adicionales, souvenirs"
                      className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addExpenseItem();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={addExpenseItem}
                      variant="outline"
                      className="border-gray-200 dark:border-gray-800"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {expenseItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded-md border-gray-200 dark:border-gray-800"
                      >
                        <span className="text-sm">{item}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExpenseItem(index)}
                          className="h-8 w-8 p-0"
                        >
                          <span className="sr-only">Eliminar</span>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="packing_list"
            render={() => (
              <FormItem>
                <FormLabel>Lista de empaque (opcional)</FormLabel>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={newPackingItem}
                      onChange={(e) => setNewPackingItem(e.target.value)}
                      placeholder="Ej. Ropa cómoda, protector solar, agua"
                      className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addPackingItem();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={addPackingItem}
                      variant="outline"
                      className="border-gray-200 dark:border-gray-800"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {packingItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded-md border-gray-200 dark:border-gray-800"
                      >
                        <span className="text-sm">{item}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePackingItem(index)}
                          className="h-8 w-8 p-0"
                        >
                          <span className="sr-only">Eliminar</span>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="available_dates"
            render={() => (
              <FormItem>
                <FormLabel>Fechas y horarios disponibles</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-gray-200 dark:border-gray-800",
                          !datesWithTimes.length && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {datesWithTimes.length > 0 ? (
                          <span>
                            {datesWithTimes.length} fecha
                            {datesWithTimes.length > 1 ? "s" : ""} seleccionada
                            {datesWithTimes.length > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span>Seleccionar fechas</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="multiple"
                      selected={datesWithTimes.map((dwt) => dwt.date)}
                      onSelect={handleDateSelect}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>

                {datesWithTimes.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Horarios para cada fecha:
                    </div>
                    {datesWithTimes.map((dateTime, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">
                            {format(dateTime.date, "dd/MM/yyyy")}
                          </span>
                          <Clock className="h-4 w-4 text-gray-500 ml-2" />
                          <Select
                            value={dateTime.time}
                            onValueChange={(time) => updateTime(i, time)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDateWithTime(i)}
                          className="h-8 w-8 p-0"
                        >
                          <span className="sr-only">Eliminar</span>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
