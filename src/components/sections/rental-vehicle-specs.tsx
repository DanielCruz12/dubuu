"use client";

import type { LucideIcon } from "lucide-react";
import type { IRentalProduct } from "@/types/rental";
import { Armchair, Car, Cog, Droplets, Palette } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";
import { cn } from "@/lib/utils";

function SpecChip({
  icon: Icon,
  children,
  className,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1.5 text-xs font-medium text-foreground/95",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
      {children}
    </span>
  );
}

export default function RentalVehicleSpecs({
  product,
  className,
}: {
  product: IRentalProduct;
  className?: string;
}) {
  const { t } = useLanguage();
  const r = product.rental;

  const fuel = t(`home.rentalSpecs.fuel.${r.fuel_type}`);
  const transmission = t(`home.rentalSpecs.transmissionKind.${r.transmission}`);
  const condition = t(`home.rentalSpecs.vehicleCondition.${r.condition}`);
  const colorKey = `home.rentalSpecs.colors.${r.color}`;
  const color = t(colorKey);
  const displayColor = color === colorKey ? r.color : color;

  const titleVehicle = `${r.brand} ${r.model}`.trim();

  return (
    <section className={cn("min-w-0", className)}>
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="border-b border-border/60 bg-muted/25 px-4 py-4 sm:px-6">
          <div className="min-w-0 space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {titleVehicle}
            </h2>
            <p className="text-sm text-muted-foreground">
              {r.year} · {condition} · {product.product_category?.name ?? ""}
            </p>
          </div>
        </div>

        <div className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <SpecChip icon={Armchair}>
              {r.seating_capacity} {t("home.rental.cardSeats")}
            </SpecChip>
            <SpecChip icon={Cog}>{transmission}</SpecChip>
            <SpecChip icon={Droplets}>{fuel}</SpecChip>
            <SpecChip icon={Palette}>{displayColor}</SpecChip>
            <SpecChip icon={Car}>{r.engine}</SpecChip>
          </div>
        </div>
      </div>
    </section>
  );
}
