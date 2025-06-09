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
import { CalendarIcon, X, Plus } from "lucide-react";

import { type DetailsFormValues, detailsSchema } from "./types";
import { scrollToFirstError } from "./utils";
import { TourDifficultyBadge } from "@/components/difficulty-badge";

interface DetailsStepProps {
  onSubmit: (data: DetailsFormValues) => void;
  defaultValues?: Partial<DetailsFormValues>;
}

export function DetailsStep({ onSubmit, defaultValues }: DetailsStepProps) {
  const [itineraryItems, setItineraryItems] = useState<string[]>(
    defaultValues?.itinerary || []
  );
  const [newItineraryItem, setNewItineraryItem] = useState("");
  const [selectedDates, setSelectedDates] = useState<Date[]>(
    defaultValues?.available_dates || []
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
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white">
                      <SelectValue placeholder="Seleccione el nivel de dificultad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="easy">
                      <TourDifficultyBadge
                        difficulty="fácil"
                        className="scale-90"
                      />
                    </SelectItem>
                    <SelectItem value="medium">
                      <TourDifficultyBadge
                        difficulty="moderado"
                        className="scale-90"
                      />
                    </SelectItem>
                    <SelectItem value="hard">
                      <TourDifficultyBadge
                        difficulty="difícil"
                        className="scale-90"
                      />
                    </SelectItem>
                    <SelectItem value="extreme">
                      <TourDifficultyBadge
                        difficulty="extremo"
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
            render={({}) => (
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
            render={({}) => (
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
            render={({}) => (
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
            render={({}) => (
              <FormItem>
                <FormLabel>Fechas disponibles</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-gray-200 dark:border-gray-800",
                          !selectedDates.length && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDates.length > 0 ? (
                          <span>
                            {selectedDates.length} fecha
                            {selectedDates.length > 1 ? "s" : ""} seleccionada
                            {selectedDates.length > 1 ? "s" : ""}
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
                      selected={selectedDates}
                      onSelect={(dates) => {
                        if (dates) {
                          setSelectedDates(dates);
                          form.setValue("available_dates", dates);
                        }
                      }}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                {selectedDates.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedDates.map((date, i) => (
                      <div
                        key={i}
                        className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-md px-2 py-1 text-xs"
                      >
                        <span>{format(date, "dd/MM/yyyy")}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => {
                            const newDates = selectedDates.filter(
                              (d) => d.getTime() !== date.getTime()
                            );
                            setSelectedDates(newDates);
                            form.setValue("available_dates", newDates);
                          }}
                        >
                          <span className="sr-only">Eliminar</span>
                          <X className="h-3 w-3" />
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
