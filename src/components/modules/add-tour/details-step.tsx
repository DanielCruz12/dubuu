"use client";

import { useMemo, useState, useEffect, useRef, type RefObject } from "react";
import type React from "react";
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
import { CalendarIcon, X, Plus, Clock, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { type DetailsFormValues, getDetailsSchema } from "./types";
import {
  focusFirstStepField,
  normalizeTourDifficultyForForm,
  scrollToFirstError,
} from "./utils";
import {
  filterSafeText,
  findBlockedChar,
  handleFilteredKeyDown,
  handleFilteredPaste,
  textBlockedMessage,
  fieldBorderClass,
  VALIDATION_LIMITS,
} from "./validation";
import { FormErrorSummary } from "./form-error-summary";
import { TourDifficultyBadge } from "@/components/difficulty-badge";
import { useLanguage } from "@/lib/i18n-context";

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
  /** Ref del form que usa el padre para disparar requestSubmit() en Continuar. */
  formRef?: RefObject<HTMLFormElement>;
}

function SortableItineraryItem({
  id,
  index,
  item,
  onRemove,
  moveAriaLabel,
  deleteSrOnly,
}: {
  id: number;
  index: number;
  item: string;
  onRemove: () => void;
  moveAriaLabel: string;
  deleteSrOnly: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between p-2 border rounded-md border-gray-200 dark:border-gray-800",
        isDragging && "opacity-60 shadow-md z-10 bg-background"
      )}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="touch-none p-1 rounded cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground hover:bg-muted/50"
          aria-label={moveAriaLabel}
        >
          <GripVertical className="h-4 w-4 shrink-0" />
        </button>
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs shrink-0">
          {index + 1}
        </span>
        <span className="text-sm truncate">{item}</span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="h-8 w-8 p-0 shrink-0 text-destructive hover:bg-transparent hover:text-destructive active:text-destructive/90"
      >
        <span className="sr-only">{deleteSrOnly}</span>
        <X className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  );
}

export function DetailsStep({
  onSubmit,
  defaultValues,
  formRef: externalFormRef,
}: DetailsStepProps) {
  const { t } = useLanguage();
  const internalFormRef = useRef<HTMLFormElement>(null);
  const formRef = externalFormRef ?? internalFormRef;
  const detailsSchema = useMemo(() => getDetailsSchema(t), [t]);

  const [itineraryItems, setItineraryItems] = useState<string[]>(
    defaultValues?.itinerary || []
  );
  const [newItineraryItem, setNewItineraryItem] = useState("");
  const [datesWithTimes, setDatesWithTimes] = useState<DateWithTime[]>(() => {
    const dates = defaultValues?.available_dates;
    if (!dates?.length) return [];
    return dates.map((date) => {
      const timeString = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
      return {
        date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        time: timeString,
      };
    });
  });
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
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      highlight: defaultValues?.highlight || "",
      included: defaultValues?.included || "",
      itinerary: defaultValues?.itinerary || [],
      available_dates: defaultValues?.available_dates || [],
      difficulty:
        defaultValues?.difficulty != null && `${defaultValues.difficulty}`.trim() !== ""
          ? normalizeTourDifficultyForForm(defaultValues.difficulty)
          : "easy",
      expenses: defaultValues?.expenses || [],
      packing_list: defaultValues?.packing_list || [],
    },
  });

  // Mensajes puntuales cuando se bloquea un carácter en los inputs de listas.
  const [itineraryBlockedMsg, setItineraryBlockedMsg] = useState<string | null>(
    null,
  );
  const [expenseBlockedMsg, setExpenseBlockedMsg] = useState<string | null>(
    null,
  );
  const [packingBlockedMsg, setPackingBlockedMsg] = useState<string | null>(
    null,
  );

  const reportListBlocked =
    (setMsg: (msg: string | null) => void) => (char: string) => {
      setMsg(textBlockedMessage(t, char));
    };

  /** Filtra el input de una lista y mantiene el mensaje de carácter bloqueado. */
  const handleListItemChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setValue: (v: string) => void,
    setMsg: (msg: string | null) => void,
  ) => {
    const raw = e.target.value;
    const cleaned = filterSafeText(raw);
    if (cleaned !== raw) {
      e.target.value = cleaned;
      setMsg(textBlockedMessage(t, findBlockedChar(raw, cleaned)));
    } else {
      setMsg(null);
    }
    setValue(cleaned);
  };

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

  const reorderItineraryItems = (oldIndex: number, newIndex: number) => {
    const reordered = arrayMove(itineraryItems, oldIndex, newIndex);
    setItineraryItems(reordered);
    form.setValue("itinerary", reordered);
  };

  const itinerarySensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

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
      scrollToFirstError(errors, formRef.current);
    }
  );

  useEffect(() => {
    focusFirstStepField(formRef.current, { delayMs: 100 });
  }, [formRef, defaultValues?.highlight, defaultValues?.included]);

  return (
    <Form {...form}>
      <form ref={formRef} className="space-y-4" onSubmit={handleSubmit} noValidate>
        <FormErrorSummary />
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="highlight"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addTour.details.highlight")}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    maxLength={VALIDATION_LIMITS.HIGHLIGHT_MAX}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const cleaned = filterSafeText(raw);
                      if (cleaned !== raw) {
                        e.target.value = cleaned;
                        form.setError(
                          "highlight",
                          {
                            type: "manual",
                            message: textBlockedMessage(
                              t,
                              findBlockedChar(raw, cleaned),
                            ),
                          },
                          { shouldFocus: false },
                        );
                      }
                      field.onChange(cleaned);
                    }}
                    onKeyDown={(e) =>
                      handleFilteredKeyDown(e, filterSafeText, (char) =>
                        form.setError(
                          "highlight",
                          {
                            type: "manual",
                            message: textBlockedMessage(t, char),
                          },
                          { shouldFocus: false },
                        ),
                      )
                    }
                    onPaste={(e) =>
                      handleFilteredPaste(e, filterSafeText, (v) => field.onChange(v), (char) =>
                        form.setError(
                          "highlight",
                          {
                            type: "manual",
                            message: textBlockedMessage(t, char),
                          },
                          { shouldFocus: false },
                        ),
                      )
                    }
                    placeholder={t("dashboard.addTour.details.highlightPlaceholder")}
                    className={cn(
                      "focus:ring-0 min-h-[80px] border-gray-200 dark:border-gray-800",
                      fieldState.error &&
                        "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500",
                    )}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="included"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addTour.details.included")}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    maxLength={VALIDATION_LIMITS.INCLUDED_MAX}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const cleaned = filterSafeText(raw);
                      if (cleaned !== raw) {
                        e.target.value = cleaned;
                        form.setError(
                          "included",
                          {
                            type: "manual",
                            message: textBlockedMessage(
                              t,
                              findBlockedChar(raw, cleaned),
                            ),
                          },
                          { shouldFocus: false },
                        );
                      }
                      field.onChange(cleaned);
                    }}
                    onKeyDown={(e) =>
                      handleFilteredKeyDown(e, filterSafeText, (char) =>
                        form.setError(
                          "included",
                          {
                            type: "manual",
                            message: textBlockedMessage(t, char),
                          },
                          { shouldFocus: false },
                        ),
                      )
                    }
                    onPaste={(e) =>
                      handleFilteredPaste(e, filterSafeText, (v) => field.onChange(v), (char) =>
                        form.setError(
                          "included",
                          {
                            type: "manual",
                            message: textBlockedMessage(t, char),
                          },
                          { shouldFocus: false },
                        ),
                      )
                    }
                    placeholder={t("dashboard.addTour.details.includedPlaceholder")}
                    className={cn(
                      "focus:ring-0 min-h-[80px] border-gray-200 dark:border-gray-800",
                      fieldState.error &&
                        "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500",
                    )}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("dashboard.addTour.details.difficulty")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      data-error-field={field.name}
                      className={cn(
                        "focus:ring-0",
                        fieldBorderClass(fieldState.error),
                      )}
                    >
                      <SelectValue placeholder={t("dashboard.addTour.details.difficultyPlaceholder")}>
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
                <FormLabel>{t("dashboard.addTour.details.itinerary")}</FormLabel>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={newItineraryItem}
                      maxLength={VALIDATION_LIMITS.ITINERARY_ITEM_MAX}
                      aria-invalid={Boolean(form.formState.errors.itinerary)}
                      aria-describedby={
                        form.formState.errors.itinerary
                          ? "itinerary-error"
                          : undefined
                      }
                      onChange={(e) =>
                        handleListItemChange(
                          e,
                          setNewItineraryItem,
                          setItineraryBlockedMsg,
                        )
                      }
                      placeholder={t("dashboard.addTour.details.itineraryItemPlaceholder")}
                      className={cn(
                        "focus:ring-0",
                        fieldBorderClass(Boolean(form.formState.errors.itinerary)),
                      )}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addItineraryItem();
                          return;
                        }
                        handleFilteredKeyDown(
                          e,
                          filterSafeText,
                          reportListBlocked(setItineraryBlockedMsg),
                        );
                      }}
                      onPaste={(e) =>
                        handleFilteredPaste(
                          e,
                          filterSafeText,
                          (v) => {
                            setNewItineraryItem(v);
                            setItineraryBlockedMsg(null);
                          },
                          reportListBlocked(setItineraryBlockedMsg),
                        )
                      }
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
                  {itineraryBlockedMsg && !form.formState.errors.itinerary && (
                    <p className="text-xs text-red-500">{itineraryBlockedMsg}</p>
                  )}
                  <DndContext
                    sensors={itinerarySensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event: DragEndEvent) => {
                      const { active, over } = event;
                      if (over != null && active.id !== over.id) {
                        const oldIndex = Number(active.id);
                        const newIndex = Number(over.id);
                        if (
                          !Number.isNaN(oldIndex) &&
                          !Number.isNaN(newIndex) &&
                          oldIndex >= 0 &&
                          newIndex >= 0 &&
                          oldIndex < itineraryItems.length &&
                          newIndex < itineraryItems.length
                        ) {
                          reorderItineraryItems(oldIndex, newIndex);
                        }
                      }
                    }}
                  >
                    <SortableContext
                      items={itineraryItems.map((_, i) => i)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {itineraryItems.map((item, index) => (
                          <SortableItineraryItem
                            key={index}
                            id={index}
                            index={index}
                            item={item}
                            onRemove={() => removeItineraryItem(index)}
                            moveAriaLabel={t("dashboard.addTour.details.moveItineraryItem")}
                            deleteSrOnly={t("dashboard.addTour.details.delete")}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  {form.formState.errors.itinerary && (
                    <p id="itinerary-error" className="text-xs text-red-500">
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
                <FormLabel>{t("dashboard.addTour.details.expenses")}</FormLabel>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={newExpenseItem}
                      maxLength={VALIDATION_LIMITS.LIST_ITEM_MAX}
                      onChange={(e) =>
                        handleListItemChange(
                          e,
                          setNewExpenseItem,
                          setExpenseBlockedMsg,
                        )
                      }
                      placeholder={t("dashboard.addTour.details.expensesPlaceholder")}
                      className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addExpenseItem();
                          return;
                        }
                        handleFilteredKeyDown(
                          e,
                          filterSafeText,
                          reportListBlocked(setExpenseBlockedMsg),
                        );
                      }}
                      onPaste={(e) =>
                        handleFilteredPaste(
                          e,
                          filterSafeText,
                          (v) => {
                            setNewExpenseItem(v);
                            setExpenseBlockedMsg(null);
                          },
                          reportListBlocked(setExpenseBlockedMsg),
                        )
                      }
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
                  {expenseBlockedMsg && (
                    <p className="text-xs text-red-500">{expenseBlockedMsg}</p>
                  )}
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
                          className="h-8 w-8 p-0 text-destructive hover:bg-transparent hover:text-destructive"
                        >
                          <span className="sr-only">{t("dashboard.addTour.details.delete")}</span>
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
                <FormLabel>{t("dashboard.addTour.details.packing_list")}</FormLabel>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={newPackingItem}
                      maxLength={VALIDATION_LIMITS.LIST_ITEM_MAX}
                      onChange={(e) =>
                        handleListItemChange(
                          e,
                          setNewPackingItem,
                          setPackingBlockedMsg,
                        )
                      }
                      placeholder={t("dashboard.addTour.details.packing_listPlaceholder")}
                      className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addPackingItem();
                          return;
                        }
                        handleFilteredKeyDown(
                          e,
                          filterSafeText,
                          reportListBlocked(setPackingBlockedMsg),
                        );
                      }}
                      onPaste={(e) =>
                        handleFilteredPaste(
                          e,
                          filterSafeText,
                          (v) => {
                            setNewPackingItem(v);
                            setPackingBlockedMsg(null);
                          },
                          reportListBlocked(setPackingBlockedMsg),
                        )
                      }
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
                  {packingBlockedMsg && (
                    <p className="text-xs text-red-500">{packingBlockedMsg}</p>
                  )}
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
                          className="h-8 w-8 p-0 text-destructive hover:bg-transparent hover:text-destructive"
                        >
                          <span className="sr-only">{t("dashboard.addTour.details.delete")}</span>
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
                <FormLabel>{t("dashboard.addTour.details.available_dates")}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        data-error-field="available_dates"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          fieldBorderClass(
                            Boolean(form.formState.errors.available_dates),
                          ),
                          !datesWithTimes.length && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {datesWithTimes.length > 0 ? (
                          <span>
                            {datesWithTimes.length === 1
                              ? t("dashboard.addTour.details.datesSelected").replace("{{count}}", "1")
                              : t("dashboard.addTour.details.datesSelected_other").replace("{{count}}", String(datesWithTimes.length))}
                          </span>
                        ) : (
                          <span>{t("dashboard.addTour.details.selectDates")}</span>
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
                      {t("dashboard.addTour.details.schedulePerDate")}
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
                          className="h-8 w-8 p-0 text-destructive hover:bg-transparent hover:text-destructive"
                        >
                          <span className="sr-only">{t("dashboard.addTour.details.delete")}</span>
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
