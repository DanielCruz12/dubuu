/* eslint-disable @next/next/no-img-element */
"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addDays,
  addYears,
  format,
  parseISO,
  startOfDay,
} from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { createPortal } from "react-dom";
import {
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  Clock,
  MapPin,
  Upload,
  X,
  FileText,
} from "lucide-react";
import type { IRentalProduct } from "@/types/rental";
import type { RentalBookingData } from "@/types/booking";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TimePicker } from "@/components/ui/time-picker";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { formatUsd, USD_SYMBOL } from "@/utils/currency";
import { useLanguage } from "@/lib/i18n-context";
import LocationPicker from "@/components/location-picker";

const DEFAULT_AIRPORT = {
  address: "Aeropuerto Internacional de El Salvador, San Luis Talpa",
  lat: 13.4447,
  lng: -89.0557,
};

function parseBoundary(s?: string): Date | undefined {
  if (!s?.trim()) return undefined;
  try {
    const d = parseISO(s);
    return Number.isFinite(d.getTime()) ? startOfDay(d) : undefined;
  } catch {
    return undefined;
  }
}

function dateKey(d: Date): string {
  return format(startOfDay(d), "yyyy-MM-dd");
}

function toLocalISOString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  const tzOffset = -d.getTimezoneOffset();
  const sign = tzOffset >= 0 ? "+" : "-";
  const offH = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, "0");
  const offM = String(Math.abs(tzOffset) % 60).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offH}:${offM}`;
}

function googleMapsLink(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function expandBookedDaysFromRental(
  rental: IRentalProduct["rental"],
): Set<string> {
  const set = new Set<string>();
  if (rental.unavailable_dates?.length) {
    for (const raw of rental.unavailable_dates) {
      const s = String(raw).trim().slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) set.add(s);
    }
  }
  if (rental.booked_ranges?.length) {
    for (const br of rental.booked_ranges) {
      const a = parseBoundary(br.pickup_date);
      const b = parseBoundary(br.return_date);
      if (!a || !b) continue;
      const from = a <= b ? a : b;
      const to = a <= b ? b : a;
      let cur = from;
      while (cur <= to) {
        set.add(dateKey(cur));
        cur = addDays(cur, 1);
      }
    }
  }
  return set;
}

function calculateRentalPricing(
  pickupDate: Date,
  dropoffDate: Date,
  pickupTime: string,
  returnTime: string,
  pricePerDay: number,
): { fullDays: number; extraHours: number; total: number } {
  const [ph, pm] = pickupTime.split(":").map(Number);
  const [rh, rm] = returnTime.split(":").map(Number);
  const start = new Date(pickupDate);
  start.setHours(ph, pm, 0, 0);
  const end = new Date(dropoffDate);
  end.setHours(rh, rm, 0, 0);

  const totalHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  const fullDays = Math.floor(totalHours / 24);
  const extraHours = Math.ceil(totalHours % 24);
  const pricePerHour = pricePerDay / 24;
  const total = fullDays * pricePerDay + extraHours * pricePerHour;

  return {
    fullDays,
    extraHours,
    total: parseFloat(total.toFixed(2)),
  };
}

function useIsDesktopMd(): boolean {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setWide(mq.matches);
    const onChange = () => setWide(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return wide;
}

export default function RentalBookingForm({
  product,
  setShowPaymentStep,
  setBookingData,
  showPaymentStep,
  extraActionBelowBookNow,
}: {
  product: IRentalProduct;
  setShowPaymentStep: () => void;
  setBookingData: (data: RentalBookingData) => void;
  showPaymentStep: boolean;
  extraActionBelowBookNow?: ReactNode;
}) {
  const { t, language } = useLanguage();
  const { user } = useUser();
  const locale = language === "es" ? es : enUS;
  const convert = formatUsd;
  const symbol = USD_SYMBOL;
  const isDesktop = useIsDesktopMd();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [range, setRange] = useState<DateRange | undefined>(() => {
    const tomorrowStart = startOfDay(addDays(new Date(), 1));
    const booked = expandBookedDaysFromRental(product.rental);

    const findNextFree = (d: Date): Date => {
      let cur = startOfDay(d);
      for (let i = 0; i < 365; i++) {
        if (!booked.has(dateKey(cur))) return cur;
        cur = addDays(cur, 1);
      }
      return d;
    };

    const from = findNextFree(tomorrowStart);
    let to = findNextFree(addDays(from, 1));
    if (dateKey(to) === dateKey(from)) to = addDays(from, 1);

    return { from, to };
  });
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("10:00");
  const [rangePickerOpen, setRangePickerOpen] = useState(false);

  // Location state
  const [useDefaultPickup, setUseDefaultPickup] = useState(true);
  const [pickupAddress, setPickupAddress] = useState(DEFAULT_AIRPORT.address);
  const [sameDropoff, setSameDropoff] = useState(true);
  const [dropoffAddress, setDropoffAddress] = useState(DEFAULT_AIRPORT.address);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [activeMapMode, setActiveMapMode] = useState<
    "pickup" | "dropoff" | null
  >(null);

  // Document upload modal
  const [showDocsModal, setShowDocsModal] = useState(false);

  // Document upload state
  const MAX_DOC_MB = 5;
  const [duiFiles, setDuiFiles] = useState<(File | null)[]>([null, null]);
  const [duiPreviews, setDuiPreviews] = useState<(string | null)[]>([
    null,
    null,
  ]);
  const [licenseFiles, setLicenseFiles] = useState<(File | null)[]>([
    null,
    null,
  ]);
  const [licensePreviews, setLicensePreviews] = useState<(string | null)[]>([
    null,
    null,
  ]);
  const [docNotes, setDocNotes] = useState("");
  const duiInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);
  const [isUploading] = useState(false);

  const handleDocUpload = (
    fileList: FileList | null,
    setFiles: React.Dispatch<React.SetStateAction<(File | null)[]>>,
    setPreviews: React.Dispatch<React.SetStateAction<(string | null)[]>>,
  ) => {
    if (!fileList || fileList.length === 0) return;
    const incoming = Array.from(fileList).slice(0, 2);
    const newFiles: (File | null)[] = [null, null];
    let processed = 0;
    for (const file of incoming) {
      if (file.size > MAX_DOC_MB * 1024 * 1024) {
        toast.error(
          t("home.rentalBooking.docSizeError").replace(
            "{{max}}",
            String(MAX_DOC_MB),
          ),
        );
        continue;
      }
      newFiles[processed] = file;
      const reader = new FileReader();
      const idx = processed;
      reader.onload = () => {
        setPreviews((prev) => {
          const next = [...prev];
          next[idx] = reader.result as string;
          return next;
        });
      };
      reader.readAsDataURL(file);
      processed++;
    }
    setFiles(newFiles);
  };

  const removeDoc = (
    index: number,
    setFiles: React.Dispatch<React.SetStateAction<(File | null)[]>>,
    setPreviews: React.Dispatch<React.SetStateAction<(string | null)[]>>,
    inputRef: React.RefObject<HTMLInputElement>,
  ) => {
    setFiles((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setPreviews((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    if (inputRef.current) inputRef.current.value = "";
  };

  const r = product.rental;
  const pricePerDay = Number.parseFloat(String(r.price_per_day ?? "0"));
  const validPrice = Number.isFinite(pricePerDay) && pricePerDay > 0;

  const today = useMemo(() => startOfDay(new Date()), []);
  const tomorrow = useMemo(() => addDays(today, 1), [today]);

  const minDate = useMemo(() => {
    const from = parseBoundary(r.available_from);
    if (!from) return tomorrow;
    return from > tomorrow ? from : tomorrow;
  }, [r.available_from, tomorrow]);

  const maxNavDate = useMemo(() => {
    const cap = startOfDay(addYears(today, 1));
    const host = parseBoundary(r.available_until);
    if (host && host < cap) return host;
    return cap;
  }, [r.available_until, today]);

  const bookedSet = useMemo(() => expandBookedDaysFromRental(r), [r]);

  const isBookedDay = useCallback(
    (date: Date) => {
      const d = startOfDay(date);
      if (d < minDate || d > maxNavDate) return false;
      return bookedSet.has(dateKey(d));
    },
    [minDate, maxNavDate, bookedSet],
  );

  const handleRangeSelect = useCallback(
    (selected: DateRange | undefined) => {
      if (!selected) {
        setRange(undefined);
        return;
      }
      const { from, to } = selected;
      if (!from) {
        setRange(undefined);
        return;
      }
      // Don't allow selecting a booked day as start
      if (bookedSet.has(dateKey(from))) return;

      if (!to) {
        // First click — set from only
        setRange({ from, to: undefined });
        return;
      }

      // Scan for booked dates between from and to
      let firstBlocked: Date | null = null;
      let d = startOfDay(from);
      const end = startOfDay(to);
      while (d <= end) {
        if (bookedSet.has(dateKey(d))) {
          firstBlocked = d;
          break;
        }
        d = addDays(d, 1);
      }

      if (firstBlocked) {
        const snappedTo = addDays(firstBlocked, -1);
        if (snappedTo <= from) {
          // The very next day is booked — no valid end date
          setRange({ from, to: undefined });
        } else {
          setRange({ from, to: snappedTo });
        }
        toast.warning(t("home.rentalBooking.rangeAdjustedWarning"));
      } else {
        setRange({ from, to });
      }
    },
    [bookedSet, t],
  );

  const pickup = range?.from;
  const dropoff = range?.to;

  const pricing = useMemo(() => {
    if (!pickup || !dropoff || dropoff < pickup || !validPrice) {
      return { fullDays: 0, extraHours: 0, total: 0 };
    }
    return calculateRentalPricing(pickup, dropoff, pickupTime, returnTime, pricePerDay);
  }, [pickup, dropoff, pickupTime, returnTime, pricePerDay, validPrice]);

  const days = pricing.fullDays;
  const extraHours = pricing.extraHours;
  const estimatedTotal = pricing.total;

  const insufficientHours = useMemo(() => {
    if (!pickup || !dropoff) return false;
    const [ph, pm] = pickupTime.split(":").map(Number);
    const [rh, rm] = returnTime.split(":").map(Number);
    const start = new Date(pickup);
    start.setHours(ph, pm, 0, 0);
    const end = new Date(dropoff);
    end.setHours(rh, rm, 0, 0);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60) < 24;
  }, [pickup, dropoff, pickupTime, returnTime]);

  const rangeSummary = useMemo(() => {
    if (!pickup) return null;
    const a = format(pickup, "d MMM yyyy", { locale });
    if (!dropoff || dropoff < pickup) return a;
    const b = format(dropoff, "d MMM yyyy", { locale });
    return `${a} — ${b}`;
  }, [pickup, dropoff, locale]);

  const formatTime12h = (t24: string) => {
    const [h, m] = t24.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
  };

  const rangeButtonMain =
    pickup && dropoff && dropoff >= pickup && rangeSummary
      ? `${rangeSummary} · ${formatTime12h(pickupTime)} – ${formatTime12h(returnTime)}`
      : t("home.rentalBooking.selectDateRange");

  const canReserve = useMemo(() => {
    if (!user) return false;
    if (!pickup || !dropoff || dropoff < pickup) return false;
    return true;
  }, [user, pickup, dropoff]);

  const reserveBlockedReason = useMemo(() => {
    if (!user) return "login";
    if (!pickup || !dropoff || dropoff < pickup) return "range";
    return null;
  }, [user, pickup, dropoff]);

  const hasAllDocs = duiFiles.some(Boolean) && licenseFiles.some(Boolean);

  const pickupAddressSummary = useDefaultPickup
    ? t("home.rentalBooking.defaultPickupLabel")
    : pickupAddress;

  const locationSummary = sameDropoff
    ? pickupAddressSummary
    : `${pickupAddressSummary} → ${dropoffAddress}`;

  // Pass File objects directly — upload happens during booking creation (single multipart request)
  const handleReserveClick = () => {
    if (!canReserve || !user?.id) return;

    const pickupDt = pickup ? new Date(pickup) : new Date();
    const [ph, pm] = pickupTime.split(":").map(Number);
    pickupDt.setHours(ph, pm, 0, 0);

    const dropoffDt = dropoff ? new Date(dropoff) : new Date();
    const [rh, rm] = returnTime.split(":").map(Number);
    dropoffDt.setHours(rh, rm, 0, 0);

    const finalPickupLocation = useDefaultPickup
      ? DEFAULT_AIRPORT.address
      : pickupAddress;
    const finalDropoffLocation = sameDropoff
      ? finalPickupLocation
      : dropoffAddress;

    const displayFmt = "d MMM yyyy 'a las' h:mm a";

    setBookingData({
      kind: "rental",
      pickup_time: toLocalISOString(pickupDt),
      dropoff_time: toLocalISOString(dropoffDt),
      pickup_location: finalPickupLocation,
      dropoff_location: finalDropoffLocation,
      total: estimatedTotal,
      user_id: user.id,
      product_id: product.id,
      duiFrontFile: duiFiles[0] ?? null,
      duiBackFile: duiFiles[1] ?? null,
      licenseFrontFile: licenseFiles[0] ?? null,
      licenseBackFile: licenseFiles[1] ?? null,
      start_date_display: format(pickupDt, displayFmt, { locale }),
      end_date_display: format(dropoffDt, displayFmt, { locale }),
      maps_link: googleMapsLink(finalPickupLocation),
      vehicle_model: product.name,
      pickup_notes: docNotes.trim() || undefined,
    });

    setShowDocsModal(false);
    setShowPaymentStep();
  };

  // === DATE RANGE PICKER BODY ===
  const rangePickerBody = (
    <div className="w-full min-w-0 space-y-3">
      <p className="text-xs text-muted-foreground leading-snug">
        {t("home.rentalBooking.rangeHint")}
      </p>
      <div className="w-full min-w-0 rounded-lg border border-border/50 bg-muted/15 p-2">
        <Calendar
          fullWidth
          mode="range"
          selected={range}
          onSelect={handleRangeSelect}
          locale={locale}
          defaultMonth={range?.from || minDate}
          fromDate={minDate}
          toDate={maxNavDate}
          disabled={isBookedDay}
          modifiers={{ booked: isBookedDay }}
          modifiersClassNames={{
            booked:
              "relative !text-red-500/80 !line-through !opacity-100 dark:!text-red-400/80 after:absolute after:inset-x-0.5 after:top-1/2 after:h-px after:bg-red-400/60 after:rotate-[-12deg] dark:after:bg-red-400/50",
          }}
          numberOfMonths={1}
          className="w-full max-w-none p-1 sm:p-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 opacity-70" aria-hidden />
            {t("home.rentalBooking.pickupTime")}
          </Label>
          <TimePicker value={pickupTime} onChange={setPickupTime} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 opacity-70" aria-hidden />
            {t("home.rentalBooking.returnTime")}
          </Label>
          <TimePicker value={returnTime} onChange={setReturnTime} />
        </div>
      </div>
      {insufficientHours && (
        <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
          {t("home.rentalBooking.minHoursWarning")}
        </p>
      )}
      <Button
        type="button"
        className="w-full rounded-full"
        onClick={() => setRangePickerOpen(false)}
      >
        {t("home.rentalBooking.rangePickerDone")}
      </Button>
    </div>
  );

  // === LOCATION MODAL BODY ===
  const locationModalBody = (
    <div className="space-y-4">
      {/* Pickup location */}
      <div className="space-y-2.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("home.rentalBooking.pickupLocation")}
        </Label>

        <div className="rounded-xl border p-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{pickupAddress}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 h-8 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setActiveMapMode("pickup")}
            >
              {t("home.rentalBooking.changeLocation")}
            </Button>
          </div>
        </div>
      </div>

      {/* Same dropoff toggle */}
      <div className="border-t border-border/60 pt-3 space-y-2.5">
        <div className="flex items-center gap-2.5 rounded-xl border p-2.5">
          <input
            type="checkbox"
            id="sameDropoff"
            checked={sameDropoff}
            onChange={(e) => setSameDropoff(e.target.checked)}
            className="h-4 w-4 shrink-0 accent-primary"
          />
          <label
            htmlFor="sameDropoff"
            className="text-sm font-medium cursor-pointer"
          >
            {t("home.rentalBooking.sameDropoff")}
          </label>
        </div>

        {!sameDropoff && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("home.rentalBooking.dropoffLocation")}
            </Label>
            <button
              type="button"
              className="w-full flex items-center gap-2.5 rounded-xl border p-2.5 text-left hover:bg-muted/20 transition-colors"
              onClick={() => setActiveMapMode("dropoff")}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {t("home.rentalBooking.dropoffLocation")}
                </span>
                <p className="text-sm truncate mt-0.5">{dropoffAddress}</p>
              </div>
            </button>
          </div>
        )}
      </div>

      <Button
        type="button"
        className="w-full rounded-full"
        onClick={() => setLocationModalOpen(false)}
      >
        {t("home.rentalBooking.rangePickerDone")}
      </Button>
    </div>
  );

  // === DOCUMENT UPLOAD SLOT ===
  const docUploadSlot = (
    label: string,
    files: (File | null)[],
    previews: (string | null)[],
    setFiles: React.Dispatch<React.SetStateAction<(File | null)[]>>,
    setPreviews: React.Dispatch<React.SetStateAction<(string | null)[]>>,
    inputRef: React.RefObject<HTMLInputElement>,
    frontLabel: string,
    backLabel: string,
  ) => (
    <div className="space-y-2.5">
      <Label className="text-xs font-semibold">{label}</Label>
      {files.some(Boolean) ? (
        <div className="grid grid-cols-2 gap-3">
          {files.map((file, i) => (
            <div key={i} className="space-y-1.5">
              <Label className="text-[11px] font-medium text-muted-foreground">
                {i === 0 ? frontLabel : backLabel}
              </Label>
              {file && previews[i] ? (
                <div className="relative rounded-xl border border-border/60 overflow-hidden bg-muted/10">
                  <img
                    src={previews[i]!}
                    alt={i === 0 ? "Front" : "Back"}
                    className="w-full h-28 object-contain"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() =>
                      removeDoc(i, setFiles, setPreviews, inputRef)
                    }
                    className="absolute top-1.5 right-1.5 h-6 w-6 p-0 rounded-full shadow-sm"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">
                      {t("home.rentalBooking.removeFile")}
                    </span>
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border/40 rounded-xl h-28 flex items-center justify-center bg-muted/5">
                  <span className="text-[10px] text-muted-foreground/50">
                    {t("home.rentalBooking.docClick")}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-border/60 rounded-xl p-4 text-center cursor-pointer hover:bg-muted/20 hover:border-primary/40 transition-all"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-6 w-6 mx-auto mb-1.5 text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground">
            {t("home.rentalBooking.docClick")}
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
            {t("home.rentalBooking.docSizeHint").replace(
              "{{max}}",
              String(MAX_DOC_MB),
            )}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) =>
              handleDocUpload(e.target.files, setFiles, setPreviews)
            }
          />
        </div>
      )}
    </div>
  );

  const docsModalBody = (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground leading-relaxed">
        {t("home.rentalBooking.documentsModalDescription")}
      </p>

      {docUploadSlot(
        t("home.rentalBooking.duiLabel"),
        duiFiles,
        duiPreviews,
        setDuiFiles,
        setDuiPreviews,
        duiInputRef,
        t("home.rentalBooking.duiFrontLabel"),
        t("home.rentalBooking.duiBackLabel"),
      )}

      {docUploadSlot(
        t("home.rentalBooking.licenseLabel"),
        licenseFiles,
        licensePreviews,
        setLicenseFiles,
        setLicensePreviews,
        licenseInputRef,
        t("home.rentalBooking.licenseFrontLabel"),
        t("home.rentalBooking.licenseBackLabel"),
      )}

      {/* Optional notes */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">
          {t("home.rentalBooking.docNotesLabel")}
        </Label>
        <textarea
          className="w-full min-h-[80px] rounded-xl border border-border/60 bg-muted/10 px-3 py-2 text-sm resize-none placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
          placeholder={t("home.rentalBooking.docNotesPlaceholder")}
          value={docNotes}
          onChange={(e) => setDocNotes(e.target.value)}
          maxLength={500}
        />
        <p className="text-[10px] text-muted-foreground/60 text-right">
          {docNotes.length}/500
        </p>
      </div>

      <Button
        type="button"
        className="w-full gap-2 rounded-full"
        onClick={handleReserveClick}
        disabled={!hasAllDocs || isUploading}
      >
        {isUploading ? (
          t("home.rentalBooking.uploading")
        ) : (
          <>
            <CalendarCheck className="h-4 w-4" />
            {t("home.rentalBooking.confirmReserve")}
          </>
        )}
      </Button>

      {/*  {!hasAllDocs && (
        <p className="text-[11px] text-muted-foreground text-center">
          {t("home.rentalBooking.documentsHint")}
        </p>
      )} */}
    </div>
  );

  return (
    <>
      <div className="sticky top-4 rounded-lg px-1 max-w-md mx-auto">
        <h2 className="text-base font-semibold mb-1 hidden md:block">
          {t("home.rentalBooking.title")} {product.name}
        </h2>
        <p className="text-xs text-muted-foreground mb-4 hidden md:block">
          {t("home.rentalBooking.subtitle")}
        </p>

        <div className="space-y-2">
          {/* DATE RANGE */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">
              {t("home.rentalBooking.dateRangeLabel")}
            </Label>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRangePickerOpen(true)}
              className="w-full h-auto min-h-[3.25rem] justify-between gap-3 px-4 py-3 text-left font-normal border-2 rounded-xl"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                  <CalendarDays
                    className="h-5 w-5 text-muted-foreground"
                    aria-hidden
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5 text-left">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t("home.rentalBooking.dateRangeTriggerHint")}
                  </span>
                  <span className="truncate text-sm font-semibold text-foreground">
                    {rangeButtonMain}
                  </span>
                </div>
              </div>
              <ChevronDown
                className="h-5 w-5 shrink-0 text-muted-foreground"
                aria-hidden
              />
            </Button>

            {isDesktop ? (
              <Dialog
                open={rangePickerOpen}
                onOpenChange={setRangePickerOpen}
                modal={false}
              >
                <DialogContent className="w-full min-w-0 max-w-[calc(100vw-1.5rem)] gap-0 overflow-visible p-0 pt-5 sm:max-w-lg sm:pt-6">
                  <DialogHeader className="px-6 pb-1.5 text-left">
                    <DialogTitle>
                      {t("home.rentalBooking.rangePickerTitle")}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                      {t("home.rentalBooking.rangePickerTitle")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="w-full min-w-0 px-6 pb-5 sm:pb-6">
                    {rangePickerBody}
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Sheet open={rangePickerOpen} onOpenChange={setRangePickerOpen} modal={false}>
                <SheetContent
                  side="bottom"
                  className="rounded-t-[1.25rem] max-h-[min(92dvh,680px)] w-full px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 overflow-y-auto"
                >
                  <SheetHeader className="pb-3 text-left space-y-1">
                    <SheetTitle className="text-lg">
                      {t("home.rentalBooking.rangePickerTitle")}
                    </SheetTitle>
                  </SheetHeader>
                  {rangePickerBody}
                </SheetContent>
              </Sheet>
            )}
          </div>

          {/* PICKUP / DROPOFF LOCATION — Trigger button */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">
              {t("home.rentalBooking.locationLabel")}
            </Label>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocationModalOpen(true)}
              className="w-full h-auto min-h-[3.25rem] justify-between gap-3 px-4 py-3 text-left font-normal border-2 rounded-xl"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                  <MapPin
                    className="h-5 w-5 text-muted-foreground"
                    aria-hidden
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5 text-left">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t("home.rentalBooking.dateRangeTriggerHint")}
                  </span>
                  <span className="truncate text-sm font-semibold text-foreground">
                    {locationSummary}
                  </span>
                </div>
              </div>
              <ChevronDown
                className="h-5 w-5 shrink-0 text-muted-foreground"
                aria-hidden
              />
            </Button>

            {isDesktop ? (
              <Dialog
                open={locationModalOpen}
                onOpenChange={setLocationModalOpen}
                modal={false}
              >
                <DialogContent className="w-full min-w-0 max-w-[calc(100vw-1.5rem)] gap-0 overflow-visible p-0 pt-4 sm:max-w-lg sm:pt-5">
                  <DialogHeader className="px-5 pb-1 text-left space-y-1">
                    <DialogTitle>
                      {t("home.rentalBooking.locationModalTitle")}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      {t("home.rentalBooking.locationModalDescription")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="w-full min-w-0 px-5 pb-4 sm:pb-5">
                    {locationModalBody}
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Sheet
                open={locationModalOpen}
                onOpenChange={setLocationModalOpen}
                modal={false}
              >
                <SheetContent
                  side="bottom"
                  className="rounded-t-[1.25rem] max-h-[min(92dvh,680px)] w-full px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 overflow-y-auto"
                >
                  <SheetHeader className="pb-2 text-left space-y-1">
                    <SheetTitle className="text-lg">
                      {t("home.rentalBooking.locationModalTitle")}
                    </SheetTitle>
                    <p className="text-xs text-muted-foreground">
                      {t("home.rentalBooking.locationModalDescription")}
                    </p>
                  </SheetHeader>
                  {locationModalBody}
                </SheetContent>
              </Sheet>
            )}
          </div>

          {/* TOTAL */}
          <div className="rounded-lg bg-background/80 px-3 py-2.5">
            <div className="flex justify-between gap-2 text-base">
              <span className="text-muted-foreground">
                {t("home.rentalBooking.days")}
              </span>
              <span className="font-semibold tabular-nums">
                {pickup && dropoff && dropoff >= pickup
                  ? `${days}${extraHours > 0 ? ` + ${extraHours}h` : ""}`
                  : "—"}
              </span>
            </div>
            <div className="pt-3 border-t border-border dark:border-muted">
              <div className="flex items-center justify-between rounded px-2 py-2 font-semibold">
                <span className="text-lg md:text-2xl">
                  {t("home.bookingForm.total")}
                </span>
                <span className="text-lg md:text-2xl tabular-nums">
                  {symbol}
                  {estimatedTotal > 0 ? convert(estimatedTotal) : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* RESERVE BUTTON — Desktop */}
          {!showPaymentStep && (
            <div className="space-y-1.5 hidden md:block">
              <Button
                type="button"
                className="w-full gap-2 rounded-full"
                onClick={() => setShowDocsModal(true)}
                disabled={!canReserve}
              >
                <CalendarCheck className="h-4 w-4" />
                {t("home.rentalBooking.reserve")}
              </Button>
              {reserveBlockedReason && (
                <p className="text-[11px] text-muted-foreground text-center">
                  {reserveBlockedReason === "login" &&
                    t("home.bookingForm.toast.loginRequired")}
                  {reserveBlockedReason === "range" &&
                    t("home.rentalBooking.selectRangeError")}
                </p>
              )}
            </div>
          )}

          {extraActionBelowBookNow ? (
            <div className="pt-1">{extraActionBelowBookNow}</div>
          ) : null}
        </div>
      </div>

      {/* DOCUMENTS MODAL */}
      {isDesktop ? (
        <Dialog open={showDocsModal} onOpenChange={setShowDocsModal}>
          <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                {t("home.rentalBooking.documentsModalTitle")}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {t("home.rentalBooking.documentsModalTitle")}
              </DialogDescription>
            </DialogHeader>
            {docsModalBody}
          </DialogContent>
        </Dialog>
      ) : (
        <Sheet open={showDocsModal} onOpenChange={setShowDocsModal}>
          <SheetContent
            side="bottom"
            className="rounded-t-[1.25rem] max-h-[min(92dvh,680px)] w-full px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 overflow-y-auto"
          >
            <SheetHeader className="pb-3 text-left space-y-1">
              <SheetTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                {t("home.rentalBooking.documentsModalTitle")}
              </SheetTitle>
            </SheetHeader>
            {docsModalBody}
          </SheetContent>
        </Sheet>
      )}

      {/* MAP PICKER DIALOG (shared for pickup + dropoff) */}
      <Dialog
        open={activeMapMode !== null}
        onOpenChange={(open) => {
          if (!open) setActiveMapMode(null);
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {activeMapMode === "dropoff"
                ? t("home.rentalBooking.selectDropoffLocation")
                : t("home.rentalBooking.selectPickupLocation")}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {activeMapMode === "dropoff"
                ? t("home.rentalBooking.selectDropoffLocation")
                : t("home.rentalBooking.selectPickupLocation")}
            </DialogDescription>
          </DialogHeader>
          <LocationPicker
            quickLocations={[
              {
                lat: DEFAULT_AIRPORT.lat,
                lng: DEFAULT_AIRPORT.lng,
                label: t("home.rentalBooking.defaultPickupLabel"),
                address: DEFAULT_AIRPORT.address,
              },
            ]}
            onLocationSelect={(loc) => {
              if (activeMapMode === "dropoff") {
                setDropoffAddress(loc.address);
              } else {
                setPickupAddress(loc.address);
                setUseDefaultPickup(false);
              }
              setActiveMapMode(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* FLOATING MOBILE RESERVE BUTTON */}
      {mounted &&
        typeof document !== "undefined" &&
        !showPaymentStep &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[9999] md:hidden print:hidden">
            <div className="pointer-events-auto px-3 pb-[max(0.65rem,env(safe-area-inset-bottom,0px))] pt-2">
              <div className="isolate mx-auto flex max-w-lg items-stretch gap-3 rounded-2xl border border-white/20 bg-gradient-to-tr from-black/30 to-gray-800/30 p-3 text-white shadow-lg backdrop-blur-md ring-1 ring-white/10">
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
                    {t("home.bookingForm.total")}
                  </span>
                  <span className="text-xl font-bold tabular-nums leading-none tracking-tight text-white">
                    {symbol}
                    {estimatedTotal > 0 ? convert(estimatedTotal) : "—"}
                  </span>
                  <span className="truncate text-[11px] text-white/65">
                    {days > 0
                      ? `${days} ${t("home.rentalBooking.days").toLowerCase()}${extraHours > 0 ? ` + ${extraHours}h` : ""}`
                      : ""}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="default"
                  onClick={() => setShowDocsModal(true)}
                  disabled={!canReserve}
                  className="h-auto min-h-[3.25rem] min-w-0 shrink-0 rounded-xl !bg-white !text-gray-900 shadow-md transition-transform hover:!bg-white/90 active:scale-[0.98] sm:px-5 [&_svg]:!text-gray-900"
                >
                  <span className="flex min-w-0 items-center gap-2 px-1 sm:px-0">
                    <CalendarCheck className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="text-left leading-tight whitespace-nowrap">
                      {t("home.rentalBooking.reserve")}
                    </span>
                  </span>
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
