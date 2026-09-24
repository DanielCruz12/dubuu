"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import moment from "moment";
import "moment/locale/es";
import { toast } from "sonner";
import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Gauge,
  ImageIcon,
  Info,
  ListChecks,
  MapPin,
  Package,
  Pencil,
  Star,
  Trash2,
  Wallet,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminStatusSwitch } from "./admin-status-switch";
import { useDeleteProductMutation } from "@/redux/slices/product/product-slice";
import { isRentalProduct } from "@/utils/product-helpers";
import { formatUsd, USD_SYMBOL } from "@/utils/currency";
import { useLanguage } from "@/lib/i18n-context";
import type { IProduct, ITourProduct } from "@/types/product";
import type { IRentalProduct } from "@/types/rental";

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium break-words min-w-0">
        {value}
      </span>
    </div>
  );
}

function StatusChip({
  ok,
  okLabel,
  noLabel,
}: {
  ok: boolean;
  okLabel: string;
  noLabel: string;
}) {
  return ok ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600">
      <CheckCircle2 className="h-3 w-3" />
      {okLabel}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600">
      <XCircle className="h-3 w-3" />
      {noLabel}
    </span>
  );
}

interface AdminProductDetailsModalProps {
  product: IProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: (productId: string) => void;
}

export function AdminProductDetailsModal({
  product,
  open,
  onOpenChange,
  onDeleted,
}: AdminProductDetailsModalProps) {
  const { t, language } = useLanguage();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const rental = product ? isRentalProduct(product) : false;

  const images = useMemo(() => {
    if (!product) return [];
    return [product.banner, ...(product.images ?? [])].filter(
      (s): s is string => typeof s === "string" && s.trim().length > 0,
    );
  }, [product]);

  // Reinicia la galería al cambiar de producto
  useEffect(() => {
    setImageIndex(0);
  }, [product?.id]);

  if (!product) return null;

  const rating = Number(product.average_rating) || 0;
  const price = rental
    ? Number.parseFloat(
        String((product as IRentalProduct).rental?.price_per_day ?? ""),
      )
    : Number(product.price);
  const displayPrice = Number.isFinite(price) ? price : 0;

  const locale = language === "en" ? "en" : "es";
  const dateFormat = "D MMM YYYY";
  const createdAt = product.created_at
    ? moment(product.created_at).locale(locale).format(dateFormat)
    : "—";
  const updatedAt = product.updated_at
    ? moment(product.updated_at).locale(locale).format(dateFormat)
    : "—";

  const handleDelete = async () => {
    try {
      await deleteProduct(product.id).unwrap();
      setShowDeleteDialog(false);
      toast.success(t("dashboard.adminProducts.delete.success"));
      onDeleted?.(product.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error(t("dashboard.adminProducts.delete.error"));
    }
  };

  const tourDetails = !rental ? renderTourDetails(product as ITourProduct, t) : null;
  const rentalDetails = rental ? renderRentalDetails(product as IRentalProduct, t) : null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] w-full max-w-[95%] flex-col gap-0 overflow-hidden rounded-xl p-0 md:max-w-3xl lg:max-w-4xl">
          <DialogHeader className="border-b px-4 py-4 md:px-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant={rental ? "secondary" : "default"}>
                    {rental
                      ? t("dashboard.adminProducts.typeRental")
                      : t("dashboard.adminProducts.typeTours")}
                  </Badge>
                  <StatusChip
                    ok={Boolean(product.is_approved)}
                    okLabel={t("dashboard.products.table.approved")}
                    noLabel={t("dashboard.products.table.pending")}
                  />
                  <StatusChip
                    ok={Boolean(product.is_active)}
                    okLabel={t("dashboard.products.table.visible")}
                    noLabel={t("dashboard.products.table.hidden")}
                  />
                </div>
                <DialogTitle className="text-left text-xl md:text-2xl">
                  {product.name}
                </DialogTitle>
                <DialogDescription className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="font-semibold text-foreground">
                    {USD_SYMBOL}
                    {formatUsd(displayPrice)}
                    {rental ? ` ${t("dashboard.adminProducts.perDay")}` : ""}
                  </span>
                  {rating > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-sand-400 text-sand-400" />
                      {rating.toFixed(1)} ({product.total_reviews})
                    </span>
                  )}
                  <span>
                    {t("dashboard.adminProducts.modal.created")}: {createdAt}
                  </span>
                  <span>
                    {t("dashboard.adminProducts.modal.updated")}: {updatedAt}
                  </span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-4 px-4 py-4 md:px-6">
              {/* Galería */}
              <div>
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted">
                  {images.length > 0 ? (
                    <Image
                      src={images[Math.min(imageIndex, images.length - 1)]}
                      alt={`${product.name} ${imageIndex + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
                        onClick={() =>
                          setImageIndex((i) =>
                            i === 0 ? images.length - 1 : i - 1,
                          )
                        }
                        aria-label={t("dashboard.adminProducts.modal.galleryPrev")}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
                        onClick={() =>
                          setImageIndex((i) =>
                            i === images.length - 1 ? 0 : i + 1,
                          )
                        }
                        aria-label={t("dashboard.adminProducts.modal.galleryNext")}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    {images.map((src, i) => (
                      <button
                        key={`${src}-${i}`}
                        type="button"
                        onClick={() => setImageIndex(i)}
                        className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                          i === imageIndex
                            ? "border-primary"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={src}
                          alt={`${product.name} ${i + 1}`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Revisión: aprobar y publicar */}
              <Section
                title={t("dashboard.adminProducts.modal.reviewTitle")}
                icon={<CheckCircle2 className="h-4 w-4" />}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {t("dashboard.adminProducts.table.approved")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("dashboard.adminProducts.modal.approvedHint")}
                    </p>
                  </div>
                  <AdminStatusSwitch product={product} field="is_approved" />
                </div>
                <div className="mt-3 flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {t("dashboard.adminProducts.table.published")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("dashboard.adminProducts.modal.publishedHint")}
                    </p>
                  </div>
                  <AdminStatusSwitch product={product} field="is_active" />
                </div>
              </Section>

              {/* Descripción */}
              <Section
                title={t("dashboard.adminProducts.modal.description")}
                icon={<Info className="h-4 w-4" />}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {product.description || "—"}
                </p>
              </Section>

              {/* Ubicación y clasificación */}
              <Section
                title={t("dashboard.adminProducts.modal.location")}
                icon={<MapPin className="h-4 w-4" />}
              >
                <div className="divide-y">
                  <InfoRow
                    label={t("dashboard.adminProducts.modal.address")}
                    value={product.address || "—"}
                  />
                  <InfoRow
                    label={t("dashboard.adminProducts.modal.country")}
                    value={product.country || "—"}
                  />
                  <InfoRow
                    label={t("dashboard.adminProducts.modal.category")}
                    value={product.product_category?.name || "—"}
                  />
                  <InfoRow
                    label={t("dashboard.adminProducts.modal.audience")}
                    value={product.target_audience?.name || "—"}
                  />
                </div>
                {product.amenities && product.amenities.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.amenities.map((a) => (
                      <Badge key={a.id} variant="outline">
                        {a.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </Section>

              {tourDetails}
              {rentalDetails}
            </div>
          </ScrollArea>

          <DialogFooter className="flex-row flex-wrap gap-2 border-t px-4 py-3 md:px-6">
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="mr-auto"
            >
              <Link
                href={`/dashboard/products/add?edit=${encodeURIComponent(product.id)}&locale=${encodeURIComponent(language)}`}
                onClick={() => onOpenChange(false)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                {t("dashboard.adminProducts.modal.editFull")}
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("dashboard.adminProducts.modal.delete")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              {t("dashboard.adminProducts.modal.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dashboard.adminProducts.delete.confirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.adminProducts.delete.confirmDescription").replace(
                "{{name}}",
                product.name,
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("dashboard.adminProducts.delete.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting
                ? t("dashboard.adminProducts.delete.deleting")
                : t("dashboard.adminProducts.delete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function renderTourDetails(tour: ITourProduct, t: (key: string) => string) {
  const d = tour.tour;
  const dates = d?.tour_dates ?? [];
  return (
    <>
      <Section
        title={t("dashboard.adminProducts.modal.tourTitle")}
        icon={<CalendarClock className="h-4 w-4" />}
      >
        <div className="mb-3 divide-y">
          <InfoRow
            label={t("dashboard.adminProducts.tour.departurePoint")}
            value={d?.departure_point || "—"}
          />
          <InfoRow
            label={t("dashboard.adminProducts.tour.duration")}
            value={d?.duration != null ? `${d.duration} ${t("dashboard.adminProducts.tour.days")}` : "—"}
          />
          <InfoRow
            label={t("dashboard.adminProducts.tour.difficulty")}
            value={d?.difficulty || "—"}
          />
          <InfoRow
            label={t("dashboard.adminProducts.tour.acceptsChildren")}
            value={
              d?.accepts_children
                ? t("dashboard.adminProducts.yes")
                : t("dashboard.adminProducts.no")
            }
          />
        </div>

        {dates.length > 0 && (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("dashboard.adminProducts.tour.dateTable.date")}</TableHead>
                  <TableHead>{t("dashboard.adminProducts.tour.dateTable.price")}</TableHead>
                  <TableHead>{t("dashboard.adminProducts.tour.dateTable.spots")}</TableHead>
                  <TableHead>{t("dashboard.adminProducts.tour.dateTable.booked")}</TableHead>
                  <TableHead>{t("dashboard.adminProducts.tour.dateTable.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dates.map((date) => (
                  <TableRow key={date.id}>
                    <TableCell className="whitespace-nowrap">
                      {moment(date.date).format("DD/MM/YYYY HH:mm")}
                    </TableCell>
                    <TableCell>
                      {USD_SYMBOL}
                      {formatUsd(date.price ?? tour.price)}
                    </TableCell>
                    <TableCell>{date.max_people}</TableCell>
                    <TableCell>{date.people_booked}</TableCell>
                    <TableCell>
                      {t(`dashboard.products.table.dateStatus.${date.status ?? "active"}`)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Section>

      {d?.itinerary && d.itinerary.length > 0 && (
        <Section
          title={t("dashboard.adminProducts.tour.itinerary")}
          icon={<ListChecks className="h-4 w-4" />}
        >
          <ul className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
            {d.itinerary.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Section>
      )}

      {d?.highlight && (
        <Section
          title={t("dashboard.adminProducts.tour.highlight")}
          icon={<Star className="h-4 w-4" />}
        >
          <p className="text-sm text-muted-foreground">{d.highlight}</p>
        </Section>
      )}

      {d?.included && (
        <Section
          title={t("dashboard.adminProducts.tour.included")}
          icon={<Package className="h-4 w-4" />}
        >
          <p className="text-sm text-muted-foreground">{d.included}</p>
        </Section>
      )}

      {d?.expenses && d.expenses.length > 0 && (
        <Section
          title={t("dashboard.adminProducts.tour.expenses")}
          icon={<Wallet className="h-4 w-4" />}
        >
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            {d.expenses.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Section>
      )}

      {d?.packing_list && d.packing_list.length > 0 && (
        <Section
          title={t("dashboard.adminProducts.tour.packingList")}
          icon={<Package className="h-4 w-4" />}
        >
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            {d.packing_list.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}

function renderRentalDetails(rental: IRentalProduct, t: (key: string) => string) {
  const r = rental.rental;
  const transmission = r?.transmission
    ? t(`home.rentalSpecs.transmissionKind.${r.transmission}`)
    : "—";
  const condition = r?.condition
    ? t(`home.rentalSpecs.vehicleCondition.${r.condition}`)
    : "—";
  const fuel = r?.fuel_type ? t(`home.rentalSpecs.fuel.${r.fuel_type}`) : "—";
  const deliveryMode = r?.delivery_mode
    ? t(`dashboard.adminProducts.rental.delivery.${r.delivery_mode}`)
    : "—";

  return (
    <Section
      title={t("dashboard.adminProducts.modal.rentalTitle")}
      icon={<Gauge className="h-4 w-4" />}
    >
      <div className="divide-y">
        <InfoRow label={t("home.rentalSpecs.brand")} value={r?.brand || "—"} />
        <InfoRow label={t("home.rentalSpecs.model")} value={r?.model || "—"} />
        <InfoRow label={t("home.rentalSpecs.year")} value={r?.year ?? "—"} />
        <InfoRow label={t("home.rentalSpecs.color")} value={r?.color || "—"} />
        <InfoRow label={t("home.rentalSpecs.condition")} value={condition} />
        <InfoRow label={t("home.rentalSpecs.transmission")} value={transmission} />
        <InfoRow label={t("home.rentalSpecs.fuelType")} value={fuel} />
        <InfoRow
          label={t("home.rentalSpecs.seats")}
          value={r?.seating_capacity ?? "—"}
        />
        <InfoRow
          label={t("dashboard.adminProducts.rental.doors")}
          value={r?.doors ?? "—"}
        />
        <InfoRow
          label={t("dashboard.adminProducts.rental.mileage")}
          value={r?.mileage != null ? `${r.mileage} km` : "—"}
        />
        <InfoRow label={t("home.rentalSpecs.engine")} value={r?.engine || "—"} />
        <InfoRow
          label={t("dashboard.adminProducts.rental.pricePerDay")}
          value={
            <span className="font-semibold">
              {USD_SYMBOL}
              {formatUsd(r?.price_per_day)}
            </span>
          }
        />
        <InfoRow
          label={t("dashboard.adminProducts.rental.availableFrom")}
          value={r?.available_from ? moment(r.available_from).format("DD/MM/YYYY") : "—"}
        />
        <InfoRow
          label={t("dashboard.adminProducts.rental.availableUntil")}
          value={r?.available_until ? moment(r.available_until).format("DD/MM/YYYY") : "—"}
        />
        <InfoRow
          label={t("dashboard.adminProducts.rental.available")}
          value={
            r?.is_available
              ? t("dashboard.adminProducts.yes")
              : t("dashboard.adminProducts.no")
          }
        />
        <InfoRow
          label={t("dashboard.adminProducts.rental.offersDelivery")}
          value={
            r?.offers_delivery
              ? t("dashboard.adminProducts.yes")
              : t("dashboard.adminProducts.no")
          }
        />
        <InfoRow
          label={t("dashboard.adminProducts.rental.deliveryMode")}
          value={deliveryMode}
        />
        <InfoRow
          label={t("dashboard.adminProducts.rental.baseDeliveryFee")}
          value={
            r?.base_delivery_fee != null
              ? `${USD_SYMBOL}${formatUsd(r.base_delivery_fee)}`
              : "—"
          }
        />
        <InfoRow
          label={t("dashboard.adminProducts.rental.feePerKm")}
          value={
            r?.fee_per_km != null
              ? `${USD_SYMBOL}${formatUsd(r.fee_per_km)}`
              : "—"
          }
        />
        <InfoRow
          label={t("dashboard.adminProducts.rental.coverageAllCountry")}
          value={
            r?.coverage_all_country
              ? t("dashboard.adminProducts.yes")
              : t("dashboard.adminProducts.no")
          }
        />
        <InfoRow
          label={t("dashboard.adminProducts.rental.coverageDepartments")}
          value={r?.coverage_departments?.join(", ") || "—"}
        />
        <InfoRow
          label={t("dashboard.adminProducts.rental.deposit")}
          value={
            r?.has_deposit
              ? `${USD_SYMBOL}${formatUsd(r.deposit_amount)}`
              : t("dashboard.adminProducts.no")
          }
        />
        <InfoRow
          label={t("dashboard.adminProducts.rental.gps")}
          value={
            r?.has_gps
              ? t("dashboard.adminProducts.yes")
              : t("dashboard.adminProducts.no")
          }
        />
        <InfoRow label={t("dashboard.adminProducts.rental.plate")} value={r?.plate || "—"} />
        <InfoRow label={t("dashboard.adminProducts.rental.vin")} value={r?.vin || "—"} />
      </div>
    </Section>
  );
}
