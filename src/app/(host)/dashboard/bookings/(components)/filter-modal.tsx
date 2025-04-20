/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockTourDates, mockTours } from "@/utils/mock-data";

interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    minTotal: number;
    maxTotal: number;
    statuses: string[];
    paymentMethods: string[];
    selectedTour: string;
    selectedDate: string;
  };
  priceRange: {
    min: number;
    max: number;
  };
  onApplyFilters: (filters: any) => void;
  onResetFilters: () => void;
}

export function FilterModal({
  open,
  onOpenChange,
  filters,
  priceRange,
  onApplyFilters,
  onResetFilters,
}: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [availableDates, setAvailableDates] = useState<any[]>([]);
  const [sliderValue, setSliderValue] = useState<number[]>([
    filters.minTotal || priceRange.min,
    filters.maxTotal || priceRange.max,
  ]);

  // Update slider when price range changes
  useEffect(() => {
    setSliderValue([
      localFilters.minTotal !== undefined
        ? localFilters.minTotal
        : priceRange.min,
      localFilters.maxTotal !== undefined
        ? localFilters.maxTotal
        : priceRange.max,
    ]);
  }, [priceRange, localFilters.minTotal, localFilters.maxTotal]);

  // Update available dates when tour changes
  useEffect(() => {
    if (localFilters.selectedTour && localFilters.selectedTour !== "all") {
      const dates = mockTourDates.filter(
        (date) => date.product_id === localFilters.selectedTour
      );
      setAvailableDates(dates);

      // Reset selected date if it doesn't belong to the current tour
      const dateExists = dates.some(
        (date) => date.id === localFilters.selectedDate
      );
      if (!dateExists) {
        setLocalFilters((prev) => ({ ...prev, selectedDate: "" }));
      }
    } else {
      setAvailableDates([]);
      setLocalFilters((prev) => ({ ...prev, selectedDate: "" }));
    }
  }, [localFilters.selectedDate, localFilters.selectedTour]);

  // Update min/max total when price range changes
  useEffect(() => {
    setLocalFilters((prev) => ({
      ...prev,
      minTotal: sliderValue[0],
      maxTotal: sliderValue[1],
    }));
  }, [sliderValue]);

  const handleStatusChange = (status: string) => {
    setLocalFilters((prev) => {
      const statuses = prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status];
      return { ...prev, statuses };
    });
  };

  const handlePaymentMethodChange = (method: string) => {
    setLocalFilters((prev) => {
      const paymentMethods = prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter((m) => m !== method)
        : [...prev.paymentMethods, method];
      return { ...prev, paymentMethods };
    });
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    const resetFilters = {
      minTotal: priceRange.min,
      maxTotal: priceRange.max,
      statuses: [],
      paymentMethods: [],
      selectedTour: "",
      selectedDate: "",
    };
    setLocalFilters(resetFilters);
    setSliderValue([priceRange.min, priceRange.max]);
    onResetFilters();
    onOpenChange(false);
  };

  // Calculate step size based on price range
  const calculateStep = () => {
    const range = priceRange.max - priceRange.min;
    if (range <= 50) return 1;
    if (range <= 200) return 5;
    if (range <= 1000) return 10;
    return 50;
  };

  const step = calculateStep();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filtros Avanzados</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Rango de Precio Total</h3>
              <div className="text-sm text-muted-foreground">
                ${sliderValue[0]} - ${sliderValue[1]}
              </div>
            </div>
            <Slider
              value={sliderValue}
              onValueChange={setSliderValue}
              min={priceRange.min}
              max={priceRange.max}
              step={step}
              className="my-4"
            />
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-medium">Tour</h3>
            <Select
              value={localFilters.selectedTour}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, selectedTour: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los tours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tours</SelectItem>
                {mockTours.map((tour) => (
                  <SelectItem key={tour.id} value={tour.id}>
                    {tour.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-medium">Fecha</h3>
            <Select
              value={localFilters.selectedDate}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, selectedDate: value })
              }
              disabled={
                !localFilters.selectedTour || localFilters.selectedTour === ""
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar fecha" />
              </SelectTrigger>
              <SelectContent>
                {availableDates.length > 0 ? (
                  availableDates.map((date) => (
                    <SelectItem key={date.id} value={date.id}>
                      {new Date(date.date).toLocaleDateString()}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-dates" disabled>
                    {localFilters.selectedTour
                      ? "No hay fechas disponibles"
                      : "Seleccione un tour primero"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-medium">Estado</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-completed"
                  checked={localFilters.statuses.includes("completed")}
                  onCheckedChange={() => handleStatusChange("completed")}
                />
                <Label htmlFor="status-completed">Completado</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-pending"
                  checked={localFilters.statuses.includes("pending")}
                  onCheckedChange={() => handleStatusChange("pending")}
                />
                <Label htmlFor="status-pending">Pendiente</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status-cancelled"
                  checked={localFilters.statuses.includes("cancelled")}
                  onCheckedChange={() => handleStatusChange("cancelled")}
                />
                <Label htmlFor="status-cancelled">Cancelado</Label>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-medium">Método de Pago</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="payment-credit"
                  checked={localFilters.paymentMethods.includes("credit")}
                  onCheckedChange={() => handlePaymentMethodChange("credit")}
                />
                <Label htmlFor="payment-credit">Tarjeta de Crédito</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="payment-debit"
                  checked={localFilters.paymentMethods.includes("debit")}
                  onCheckedChange={() => handlePaymentMethodChange("debit")}
                />
                <Label htmlFor="payment-debit">Tarjeta de Débito</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="payment-paypal"
                  checked={localFilters.paymentMethods.includes("paypal")}
                  onCheckedChange={() => handlePaymentMethodChange("paypal")}
                />
                <Label htmlFor="payment-paypal">PayPal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="payment-cash"
                  checked={localFilters.paymentMethods.includes("cash")}
                  onCheckedChange={() => handlePaymentMethodChange("cash")}
                />
                <Label htmlFor="payment-cash">Efectivo</Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Limpiar Filtros
          </Button>
          <Button onClick={handleApply}>Aplicar Filtros</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
