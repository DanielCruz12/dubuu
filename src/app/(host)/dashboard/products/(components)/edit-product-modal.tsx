"use client";

import { useState, useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import type {
  ITourProduct,
  ITourProductDates,
  PatchTourProductBody,
  TourDateStatus,
} from "@/types/product";
import { useLanguage } from "@/lib/i18n-context";

export type EditTourModalPatch = Omit<PatchTourProductBody, "user_id">;

function buildTourEditSchema(
  tourDates: ITourProductDates[],
  t: (key: string) => string,
) {
  const base = {
    departure_point: z
      .string()
      .min(3, { message: t("dashboard.products.editModal.validation.departureMin") })
      .max(100, {
        message: t("dashboard.products.editModal.validation.departureMax"),
      }),
  };

  if (tourDates.length === 0) {
    return z.object(base);
  }

  return z
    .object({
      ...base,
      price: z.coerce
        .number()
        .min(0.01, { message: t("dashboard.products.editModal.validation.priceMin") })
        .max(10000, { message: t("dashboard.products.editModal.validation.priceMax") }),
      max_people: z.coerce
        .number()
        .int()
        .min(1, { message: t("dashboard.products.editModal.validation.maxPeopleMin") })
        .max(1000, { message: t("dashboard.products.editModal.validation.maxPeopleMax") }),
      status: z.enum(["active", "cancelled", "completed"]),
      selected_date_id: z.string().min(1),
      scope: z.enum(["single", "all"]),
    })
    .superRefine((val, ctx) => {
      const minBooked =
        val.scope === "all"
          ? Math.max(0, ...tourDates.map((d) => d.people_booked))
          : tourDates.find((d) => d.id === val.selected_date_id)?.people_booked ?? 0;
      if (val.max_people < minBooked) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("dashboard.products.editModal.validation.maxPeopleBelowBooked"),
          path: ["max_people"],
        });
      }
    });
}

type TourFormValues = z.infer<ReturnType<typeof buildTourEditSchema>>;

interface EditProductModalProps {
  tour: ITourProduct & { selectedDateId?: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patch: EditTourModalPatch) => Promise<void>;
  selectedDateId?: string;
}

function datePrice(d: ITourProductDates, fallback: number) {
  return typeof d.price === "number" ? d.price : fallback;
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
    selectedDateId || tour.selectedDateId || "",
  );
  const { t, language } = useLanguage();

  const tourDates = useMemo(
    () => tour.tour?.tour_dates ?? [],
    [tour.tour?.tour_dates],
  );

  const fallbackPrice = useMemo(() => {
    const n = typeof tour.price === "string" ? Number.parseFloat(tour.price) : tour.price;
    return Number.isFinite(n) ? n : 0;
  }, [tour.price]);

  const tourFormSchema = useMemo(
    () => buildTourEditSchema(tourDates, t),
    [tourDates, t],
  );

  const getSelectedDate = (): ITourProductDates | null => {
    if (tourDates.length === 0) return null;
    if (localSelectedDateId) {
      return (
        tourDates.find((date) => date.id === localSelectedDateId) || tourDates[0]
      );
    }
    return tourDates[0];
  };

  const selectedDate = getSelectedDate();

  const form = useForm<TourFormValues>({
    resolver: zodResolver(tourFormSchema),
    defaultValues: getDefaultValues(
      tour,
      tourDates,
      localSelectedDateId,
      selectedDateId,
      fallbackPrice,
    ),
  });

  useEffect(() => {
    if (!open) return;
    const nextId =
      selectedDateId ||
      tour.selectedDateId ||
      tourDates[0]?.id ||
      "";
    setLocalSelectedDateId(nextId);
    form.reset(
      getDefaultValues(
        tour,
        tourDates,
        nextId,
        selectedDateId,
        fallbackPrice,
      ),
    );
  }, [
    open,
    tour,
    tour.id,
    tour.tour?.departure_point,
    tourDates,
    selectedDateId,
    tour.selectedDateId,
    fallbackPrice,
    form,
  ]);

  const handleDateChange = (dateId: string) => {
    setLocalSelectedDateId(dateId);
    const d = tourDates.find((x) => x.id === dateId);
    if (d && tourDates.length > 0) {
      form.setValue("selected_date_id", dateId);
      form.setValue("price", datePrice(d, fallbackPrice));
      form.setValue("max_people", d.max_people);
      form.setValue("status", (d.status ?? "active") as TourDateStatus);
    }
  };

  const onSubmit = async (data: TourFormValues) => {
    setIsPending(true);
    try {
      const patch: EditTourModalPatch = {
        departure_point: data.departure_point,
      };

      if (tourDates.length > 0 && "scope" in data) {
        if (data.scope === "single") {
          patch.selectedDateId = data.selected_date_id;
          patch.price = data.price;
          patch.max_people = data.max_people;
          patch.status = data.status;
        } else {
          patch.update_all_tour_dates = true;
          patch.price = data.price;
          patch.max_people = data.max_people;
          patch.status = data.status;
        }
      }

      await onSave(patch);
    } catch (error) {
      console.error("Error al guardar el tour:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-w-[95%] md:max-w-[90%] lg:max-w-[720px] xl:max-w-[640px] p-0 overflow-hidden rounded-xl border-none shadow-xl max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r dark:from-black dark:to-primary/5 border-none px-4 md:px-6 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center pt-6">
              {t("dashboard.products.editModal.title")}
            </DialogTitle>
            <DialogDescription className="pt-1 pb-2 text-center">
              {t("dashboard.products.editModal.description").replace(
                "{{name}}",
                tour.name,
              )}
            </DialogDescription>
            <p className="text-xs text-muted-foreground text-center px-2 pb-2">
              {t("dashboard.products.editModal.quickEditHint")}
            </p>
          </DialogHeader>

          <div className="gap-3 py-3 mx-auto max-w-3xl pb-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {tourDates.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t("dashboard.products.editModal.datesTableLabel")}
                    </Label>
                    <ScrollArea className="h-[min(220px,40vh)] rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              {t("dashboard.products.editModal.colDate")}
                            </TableHead>
                            <TableHead className="text-right">
                              {t("dashboard.products.editModal.colPrice")}
                            </TableHead>
                            <TableHead className="text-right">
                              {t("dashboard.products.editModal.colMax")}
                            </TableHead>
                            <TableHead className="text-right">
                              {t("dashboard.products.editModal.colBooked")}
                            </TableHead>
                            <TableHead>
                              {t("dashboard.products.editModal.colStatus")}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tourDates.map((row) => (
                            <TableRow
                              key={row.id}
                              className={
                                row.id === localSelectedDateId
                                  ? "bg-muted/50"
                                  : undefined
                              }
                            >
                              <TableCell className="font-medium whitespace-nowrap">
                                {format(
                                  new Date(row.date),
                                  "dd/MM/yyyy HH:mm",
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {datePrice(row, fallbackPrice).toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right">
                                {row.max_people}
                              </TableCell>
                              <TableCell className="text-right">
                                {row.people_booked}
                              </TableCell>
                              <TableCell className="capitalize text-sm">
                                {row.status ?? "active"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {tourDates.length > 0 && (
                    <FormField
                      control={form.control}
                      name="selected_date_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("dashboard.products.editModal.dateLabel")}
                          </FormLabel>
                          <Select
                            value={localSelectedDateId}
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleDateChange(value);
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t(
                                    "dashboard.products.editModal.datePlaceholder",
                                  )}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {tourDates.map((date) => (
                                <SelectItem key={date.id} value={date.id}>
                                  {format(
                                    new Date(date.date),
                                    "dd/MM/yyyy HH:mm",
                                  )}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {t("dashboard.products.editModal.dateHelp")}
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
                      <FormItem
                        className={tourDates.length === 0 ? "md:col-span-2" : ""}
                      >
                        <FormLabel>
                          {t(
                            "dashboard.products.editModal.departurePointLabel",
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t(
                              "dashboard.products.editModal.departurePointPlaceholder",
                            )}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {tourDates.length > 0 && (
                  <>
                    <FormField
                      control={form.control}
                      name="scope"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>
                            {t("dashboard.products.editModal.scopeLabel")}
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex flex-col gap-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="single" id="scope-single" />
                                <Label htmlFor="scope-single" className="font-normal cursor-pointer">
                                  {t("dashboard.products.editModal.scopeSingle")}
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all" id="scope-all" />
                                <Label htmlFor="scope-all" className="font-normal cursor-pointer">
                                  {t("dashboard.products.editModal.scopeAll")}
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormDescription>
                            {t("dashboard.products.editModal.scopeHelp")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("dashboard.products.editModal.priceLabel")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder={t(
                                  "dashboard.products.editModal.pricePlaceholder",
                                )}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    Number.parseFloat(e.target.value),
                                  )
                                }
                                value={field.value}
                              />
                            </FormControl>
                            <FormDescription>
                              {t("dashboard.products.editModal.priceHelp")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="max_people"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("dashboard.products.editModal.maxPeopleLabel")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="10"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    Number.parseInt(e.target.value, 10),
                                  )
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              {selectedDate
                                ? t("dashboard.products.editModal.maxPeopleHelp")
                                : ""}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("dashboard.products.editModal.dateStatusLabel")}
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="active">
                                  {t("dashboard.products.editModal.statusActive")}
                                </SelectItem>
                                <SelectItem value="cancelled">
                                  {t("dashboard.products.editModal.statusCancelled")}
                                </SelectItem>
                                <SelectItem value="completed">
                                  {t("dashboard.products.editModal.statusCompleted")}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                <div className="rounded-md border border-dashed p-3 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {t("dashboard.products.editModal.editMoreHint")}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    asChild
                  >
                    <Link
                      href={`/dashboard/products/add?edit=${encodeURIComponent(tour.id)}&locale=${encodeURIComponent(language)}`}
                      onClick={() => onOpenChange(false)}
                    >
                      {t("dashboard.products.editModal.editMore")}
                    </Link>
                  </Button>
                </div>

                <DialogFooter className="gap-3 sm:justify-end flex-col sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isPending}
                  >
                    {t("dashboard.products.editModal.cancel")}
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending
                      ? t("dashboard.products.editModal.saving")
                      : t("dashboard.products.editModal.save")}
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

function getDefaultValues(
  tour: ITourProduct,
  tourDates: ITourProductDates[],
  localSelectedDateId: string,
  selectedDateIdProp: string | undefined,
  fallbackPrice: number,
) {
  const id =
    localSelectedDateId ||
    selectedDateIdProp ||
    tour.tour?.tour_dates?.[0]?.id ||
    "";
  const sel = tourDates.find((d) => d.id === id) ?? tourDates[0];

  if (tourDates.length === 0) {
    return {
      departure_point: tour.tour?.departure_point || "",
    };
  }

  return {
    departure_point: tour.tour?.departure_point || "",
    price: datePrice(sel, fallbackPrice),
    max_people: sel?.max_people ?? 1,
    status: (sel?.status ?? "active") as TourDateStatus,
    selected_date_id: id,
    scope: "single" as const,
  };
}
