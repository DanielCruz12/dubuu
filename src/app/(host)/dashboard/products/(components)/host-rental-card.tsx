"use client";

import Image from "next/image";
import { Armchair, Cog, Droplets, Pencil, Star, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { IRentalProduct } from "@/types/rental";
import { formatUsd, USD_SYMBOL } from "@/utils/currency";
import { useLanguage } from "@/lib/i18n-context";
import Link from "next/link";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useDeleteProductMutation } from "@/redux/slices/product/product-slice";

interface HostRentalCardProps {
  product: IRentalProduct;
  onDeleted?: () => void;
}

export function HostRentalCard({ product, onDeleted }: HostRentalCardProps) {
  const { t } = useLanguage();
  const convert = formatUsd;
  const symbol = USD_SYMBOL;
  const rent = product.rental;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  if (!rent) return null;

  const fuelLbl = t(`home.rentalSpecs.fuel.${rent.fuel_type}`);
  const transLbl = t(`home.rentalSpecs.transmissionKind.${rent.transmission}`);
  const vehicleTitle = `${rent.brand} ${rent.model}`.trim();
  const price = rent.price_per_day
    ? Number.parseFloat(String(rent.price_per_day))
    : Number(product.price);
  const formattedRating = Number(product.average_rating).toFixed(1);

  const imageSrc = product.banner || "/logo.svg";

  const handleDelete = async () => {
    try {
      await deleteProduct(product.id).unwrap();
      setShowDeleteDialog(false);
      toast.success(t("dashboard.products.actions.deleteSuccess"));
      onDeleted?.();
    } catch {
      toast.error(t("dashboard.products.actions.deleteError"));
    }
  };

  return (
    <>
      <Card className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-md transition-all duration-200 hover:shadow-lg">
        <div className="flex flex-col md:flex-row md:items-stretch">
          <div className="relative aspect-[16/10] md:aspect-auto md:w-[min(42%,280px)] md:min-h-[200px] md:shrink-0 overflow-hidden bg-muted/30">
            <Link href={`/home/rental/${product.id}`} className="block h-full">
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                sizes="280px"
                className="object-cover"
              />
            </Link>
            {product.product_category && (
              <Badge className="absolute top-2 left-2 bg-black/65 text-white z-10 text-xs">
                {product.product_category.name}
              </Badge>
            )}
          </div>

          <div className="flex flex-1 flex-col justify-between gap-3 p-4 md:p-5 min-w-0 border-t md:border-t-0 md:border-l border-border/60">
            <div className="space-y-2.5 min-w-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {product.product_category?.name}
                </p>
                <h3 className="text-lg font-bold leading-tight line-clamp-1">
                  {vehicleTitle}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {rent.year} · {product.name}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/45 px-2.5 py-1 text-xs font-medium">
                  <Armchair className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  {rent.seating_capacity} {t("home.rental.cardSeats")}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/45 px-2.5 py-1 text-xs font-medium">
                  <Cog className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  {transLbl}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/45 px-2.5 py-1 text-xs font-medium">
                  <Droplets className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  {fuelLbl}
                </span>
                {rent.condition && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/45 px-2.5 py-1 text-xs font-medium capitalize">
                    {rent.condition === "new"
                      ? t("dashboard.addRental.steps.vehicle.conditionNew")
                      : rent.condition === "refurbished"
                        ? t("dashboard.addRental.steps.vehicle.conditionRefurbished")
                        : t("dashboard.addRental.steps.vehicle.conditionUsed")}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  {t("dashboard.products.rentalTable.plate")}: {rent.plate || "—"}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  {formattedRating}
                </span>
                <Badge variant={product.is_approved ? "default" : "destructive"} className="text-[10px]">
                  {product.is_approved
                    ? t("dashboard.products.table.approved")
                    : t("dashboard.products.table.pending")}
                </Badge>
              </div>
            </div>

            <div className="flex items-end justify-between gap-3 border-t border-border/60 pt-3">
              <div>
                <p className="text-xs text-muted-foreground">{t("home.rentalBooking.pricePerDay")}</p>
                <p className="text-xl font-bold tabular-nums">
                  {symbol}{convert(price)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {t("home.tourCard.perDay")}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/products/add?edit=${encodeURIComponent(product.id)}`}>
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    {t("dashboard.products.actions.edit")}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.products.actions.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.products.actions.deleteConfirmDescription").replace("{{name}}", product.name)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("dashboard.products.actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t("dashboard.products.actions.deleting") : t("dashboard.products.actions.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
