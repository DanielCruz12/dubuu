"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addDays,
  addYears,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfDay,
} from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { CalendarDays, ChevronDown, Clock, MessageCircle, Upload, X } from "lucide-react";
import type { IRentalProduct } from "@/types/rental";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { formatUsd, USD_SYMBOL } from "@/utils/currency";
import { useLanguage } from "@/lib/i18n-context";
import { useCreateRentalApplicationMutation } from "@/redux/slices/rental-application/rental-application-slice";

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

function expandBookedDaysFromRental(rental: IRentalProduct["rental"]): Set<string> {
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

function rentalDaysInclusive(from: Date, to: Date): number {
  const a = startOfDay(from);
  const b = startOfDay(to);
  return Math.max(1, differenceInCalendarDays(b, a) + 1);
}

function getRentalHours(
  pickup: Date,
  dropoff: Date,
  pickupTime: string,
  returnTime: string,
): number {
  const [ph, pm] = pickupTime.split(":").map(Number);
  const [rh, rm] = returnTime.split(":").map(Number);
  const start = new Date(pickup);
  start.setHours(ph, pm, 0, 0);
  const end = new Date(dropoff);
  end.setHours(rh, rm, 0, 0);
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
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
  extraActionBelowBookNow,
}: {
  product: IRentalProduct;
  extraActionBelowBookNow?: ReactNode;
}) {
  const { t, language } = useLanguage();
  const { user } = useUser();
  const locale = language === "es" ? es : enUS;
  const convert = formatUsd;
  const symbol = USD_SYMBOL;
  const isDesktop = useIsDesktopMd();

  const [range, setRange] = useState<DateRange | undefined>(() => {
    const todayStart = startOfDay(new Date());
    return { from: todayStart, to: addDays(todayStart, 1) };
  });
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("10:00");
  const [rangePickerOpen, setRangePickerOpen] = useState(false);
  const [consultOpen, setConsultOpen] = useState(false);
  const [message, setMessage] = useState("");

  const MAX_DOC_MB = 5;

  const [duiFiles, setDuiFiles] = useState<(File | null)[]>([null, null]);
  const [duiPreviews, setDuiPreviews] = useState<(string | null)[]>([null, null]);
  const [licenseFiles, setLicenseFiles] = useState<(File | null)[]>([null, null]);
  const [licensePreviews, setLicensePreviews] = useState<(string | null)[]>([null, null]);

  const duiInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

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
        toast.error(t("home.rentalBooking.docSizeError").replace("{{max}}", String(MAX_DOC_MB)));
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
    inputRef: React.RefObject<HTMLInputElement | null>,
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

  const minDate = useMemo(() => {
    const from = parseBoundary(r.available_from);
    if (!from) return today;
    return from > today ? from : today;
  }, [r.available_from, today]);

  const maxNavDate = useMemo(() => {
    const cap = startOfDay(addYears(today, 1));
    const host = parseBoundary(r.available_until);
    if (host && host < cap) return host;
    return cap;
  }, [r.available_until, today]);

  const bookedSet = useMemo(() => expandBookedDaysFromRental(r), [r]);

  const isDisabledDay = useCallback(
    (date: Date) => {
      const d = startOfDay(date);
      if (d < minDate || d > maxNavDate) return true;
      return bookedSet.has(dateKey(d));
    },
    [minDate, maxNavDate, bookedSet],
  );

  const pickup = range?.from;
  const dropoff = range?.to;

  const days = useMemo(() => {
    if (!pickup || !dropoff) return 0;
    if (dropoff < pickup) return 0;
    return rentalDaysInclusive(pickup, dropoff);
  }, [pickup, dropoff]);

  const estimatedTotal = validPrice && days > 0 ? pricePerDay * days : 0;

  const insufficientHours = useMemo(() => {
    if (!pickup || !dropoff) return false;
    return getRentalHours(pickup, dropoff, pickupTime, returnTime) < 24;
  }, [pickup, dropoff, pickupTime, returnTime]);

  const rangeSummary = useMemo(() => {
    if (!pickup) return null;
    const a = format(pickup, "d MMM yyyy", { locale });
    if (!dropoff || dropoff < pickup) return a;
    const b = format(dropoff, "d MMM yyyy", { locale });
    return `${a} — ${b}`;
  }, [pickup, dropoff, locale]);

  const rangeButtonMain =
    pickup && dropoff && dropoff >= pickup && rangeSummary
      ? `${rangeSummary} · ${pickupTime} – ${returnTime}`
      : t("home.rentalBooking.selectDateRange");

  const rangePickerBody = (
    <div className="w-full min-w-0 space-y-3">
      <p className="text-xs text-muted-foreground leading-snug">{t("home.rentalBooking.rangeHint")}</p>
      <div className="w-full min-w-0 rounded-lg border border-border/50 bg-muted/15 p-2">
        <Calendar
          fullWidth
          mode="range"
          selected={range}
          onSelect={setRange}
          locale={locale}
          defaultMonth={minDate}
          fromDate={minDate}
          toDate={maxNavDate}
          disabled={isDisabledDay}
          numberOfMonths={1}
          className="w-full max-w-none p-1 sm:p-2"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
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
      <Button type="button" className="w-full rounded-full" onClick={() => setRangePickerOpen(false)}>
        {t("home.rentalBooking.rangePickerDone")}
      </Button>
    </div>
  );

  const consultBlockedReason = useMemo(() => {
    if (!user) return "login";
    if (!pickup || !dropoff || dropoff < pickup) return "range";
    if (insufficientHours) return "hours";
    return null;
  }, [user, pickup, dropoff, insufficientHours]);

  const canConsult = consultBlockedReason === null;

  const handleConsultClick = () => {
    if (!canConsult) return;
    setConsultOpen(true);
  };

  const [createApplication, { isLoading: isSubmitting }] =
    useCreateRentalApplicationMutation();

  const handleConsultSubmit = async () => {
    if (!user?.id) return;

    const formData = new FormData();
    formData.append("productId", product.id);
    formData.append("userId", user.id);
    formData.append("productName", product.name);
    formData.append("pickup", pickup ? format(pickup, "yyyy-MM-dd") : "");
    formData.append("dropoff", dropoff ? format(dropoff, "yyyy-MM-dd") : "");
    formData.append("pickupTime", pickupTime);
    formData.append("returnTime", returnTime);
    formData.append("days", String(days));
    formData.append("pricePerDay", String(pricePerDay));
    formData.append("estimatedTotal", String(estimatedTotal));
    formData.append("message", message.trim());

    for (const file of duiFiles) {
      if (file) formData.append("dui_files", file);
    }
    for (const file of licenseFiles) {
      if (file) formData.append("license_files", file);
    }

    try {
      await createApplication(formData).unwrap();

      setConsultOpen(false);
      setMessage("");
      setDuiFiles([null, null]);
      setDuiPreviews([null, null]);
      setLicenseFiles([null, null]);
      setLicensePreviews([null, null]);
      if (duiInputRef.current) duiInputRef.current.value = "";
      if (licenseInputRef.current) licenseInputRef.current.value = "";
      toast.success(t("home.rentalBooking.sentToast"));
    } catch {
      toast.error(t("home.rentalBooking.sendError"));
    }
  };

  return (
    <>
      <div className="sticky top-4 rounded-lg px-1 max-w-md mx-auto">
        <h2 className="text-base font-semibold mb-1 hidden md:block">
          {t("home.rentalBooking.title")} {product.name}
        </h2>
        <p className="text-xs text-muted-foreground mb-4 hidden md:block">
          {t("home.rentalBooking.subtitle")}
        </p>

        <div className="space-y-5">
          <div className="flex items-baseline justify-between gap-2 border-b border-border/60 pb-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("home.rentalBooking.pricePerDay")}
              </p>
              <p className="text-2xl font-bold tabular-nums">
                {symbol}
                {validPrice ? convert(pricePerDay) : "—"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">{t("home.rentalBooking.dateRangeLabel")}</Label>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRangePickerOpen(true)}
              className="w-full h-auto min-h-[3.25rem] justify-between gap-3 px-4 py-3 text-left font-normal border-2 rounded-xl"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" aria-hidden />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5 text-left">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t("home.rentalBooking.dateRangeTriggerHint")}
                  </span>
                  <span className="truncate text-sm font-semibold text-foreground">{rangeButtonMain}</span>
                </div>
              </div>
              <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            </Button>

            {isDesktop ? (
              <Dialog open={rangePickerOpen} onOpenChange={setRangePickerOpen}>
                <DialogContent className="w-full min-w-0 max-w-[calc(100vw-1.5rem)] gap-0 overflow-visible p-0 pt-5 sm:max-w-lg sm:pt-6">
                  <DialogHeader className="px-6 pb-1.5 text-left">
                    <DialogTitle>{t("home.rentalBooking.rangePickerTitle")}</DialogTitle>
                  </DialogHeader>
                  <div className="w-full min-w-0 px-6 pb-5 sm:pb-6">{rangePickerBody}</div>
                </DialogContent>
              </Dialog>
            ) : (
              <Sheet open={rangePickerOpen} onOpenChange={setRangePickerOpen}>
                <SheetContent
                  side="bottom"
                  className="rounded-t-[1.25rem] max-h-[min(92dvh,680px)] w-full px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 overflow-y-auto"
                >
                  <SheetHeader className="pb-3 text-left space-y-1">
                    <SheetTitle className="text-lg">{t("home.rentalBooking.rangePickerTitle")}</SheetTitle>
                  </SheetHeader>
                  {rangePickerBody}
                </SheetContent>
              </Sheet>
            )}
          </div>

          <div className="rounded-lg bg-background/80 px-3 py-2.5">
            <div className="flex justify-between gap-2 text-sm">
              <span className="text-muted-foreground">{t("home.rentalBooking.days")}</span>
              <span className="font-medium tabular-nums">{days > 0 ? days : "—"}</span>
            </div>
            <div className="pt-3 border-t border-border dark:border-muted">
              <div className="flex items-center justify-between rounded px-2 py-2 font-semibold">
                <span className="text-lg md:text-2xl">{t("home.bookingForm.total")}</span>
                <span className="text-lg md:text-2xl tabular-nums">
                  {symbol}
                  {estimatedTotal > 0 ? convert(estimatedTotal) : "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Button
              type="button"
              className="w-full gap-2 rounded-full"
              onClick={handleConsultClick}
              disabled={!canConsult}
            >
              <MessageCircle className="h-4 w-4" />
              {t("home.rentalBooking.consult")}
            </Button>
            {consultBlockedReason && (
              <p className="text-[11px] text-muted-foreground text-center">
                {consultBlockedReason === "login" && t("home.bookingForm.toast.loginRequired")}
                {consultBlockedReason === "range" && t("home.rentalBooking.selectRangeError")}
                {consultBlockedReason === "hours" && t("home.rentalBooking.minHoursError")}
              </p>
            )}
          </div>

          {extraActionBelowBookNow ? (
            <div className="pt-1">{extraActionBelowBookNow}</div>
          ) : null}
        </div>
      </div>

      <Dialog open={consultOpen} onOpenChange={setConsultOpen}>
        <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("home.rentalBooking.modalTitle")}</DialogTitle>
            <DialogDescription>{t("home.rentalBooking.modalDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <Label htmlFor="rental-inquiry-msg">{t("home.rentalBooking.messageLabel")}</Label>
              <Textarea
                id="rental-inquiry-msg"
                rows={2}
                placeholder={t("home.rentalBooking.messagePlaceholder")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none"
              />
            </div>

            <div className="border-t border-border/60 pt-3">
             

              {/* DUI */}
              <div className="space-y-2 mb-4">
                <Label className="text-xs font-medium">{t("home.rentalBooking.duiLabel")}</Label>
                {duiFiles.some(Boolean) && (
                  <div className="grid grid-cols-2 gap-2">
                    {duiFiles.map((file, i) => (
                      <div key={i} className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">
                          {i === 0 ? t("home.rentalBooking.duiFrontLabel") : t("home.rentalBooking.duiBackLabel")}
                        </Label>
                        {file && duiPreviews[i] ? (
                          <div className="relative rounded-lg border border-border/60 overflow-hidden">
                            <Image
                              src={duiPreviews[i]}
                              alt={i === 0 ? "DUI front" : "DUI back"}
                              className="w-full h-24 object-contain bg-muted/20"
                              width={400}
                              height={96}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => removeDoc(i, setDuiFiles, setDuiPreviews, duiInputRef)}
                              className="absolute top-1 right-1 h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">{t("home.rentalBooking.removeFile")}</span>
                            </Button>
                          </div>
                        ) : (
                          <div className="border border-dashed border-border/40 rounded-lg h-24 flex items-center justify-center">
                            <span className="text-[10px] text-muted-foreground/50">{t("home.rentalBooking.docClick")}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {!duiFiles.every(Boolean) && (
                  <div
                    className="border-2 border-dashed border-border/60 rounded-lg p-3 text-center cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={() => duiInputRef.current?.click()}
                  >
                    <Upload className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{t("home.rentalBooking.docClick")}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      {t("home.rentalBooking.docSizeHint").replace("{{max}}", String(MAX_DOC_MB))}
                    </p>
                    <input
                      ref={duiInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleDocUpload(e.target.files, setDuiFiles, setDuiPreviews)}
                    />
                  </div>
                )}
              </div>

              {/* Driver's license */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">{t("home.rentalBooking.licenseLabel")}</Label>
                {licenseFiles.some(Boolean) && (
                  <div className="grid grid-cols-2 gap-2">
                    {licenseFiles.map((file, i) => (
                      <div key={i} className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">
                          {i === 0 ? t("home.rentalBooking.licenseFrontLabel") : t("home.rentalBooking.licenseBackLabel")}
                        </Label>
                        {file && licensePreviews[i] ? (
                          <div className="relative rounded-lg border border-border/60 overflow-hidden">
                            <Image
                              src={licensePreviews[i]}
                              alt={i === 0 ? "License front" : "License back"}
                              className="w-full h-24 object-contain bg-muted/20"
                              width={400}
                              height={96}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => removeDoc(i, setLicenseFiles, setLicensePreviews, licenseInputRef)}
                              className="absolute top-1 right-1 h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">{t("home.rentalBooking.removeFile")}</span>
                            </Button>
                          </div>
                        ) : (
                          <div className="border border-dashed border-border/40 rounded-lg h-24 flex items-center justify-center">
                            <span className="text-[10px] text-muted-foreground/50">{t("home.rentalBooking.docClick")}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {!licenseFiles.every(Boolean) && (
                  <div
                    className="border-2 border-dashed border-border/60 rounded-lg p-3 text-center cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={() => licenseInputRef.current?.click()}
                  >
                    <Upload className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {t("home.rentalBooking.docClick")}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      {t("home.rentalBooking.docSizeHint").replace("{{max}}", String(MAX_DOC_MB))}
                    </p>
                    <input
                      ref={licenseInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleDocUpload(e.target.files, setLicenseFiles, setLicensePreviews)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setConsultOpen(false)}>
              {t("home.rentalBooking.cancel")}
            </Button>
            <Button type="button" onClick={handleConsultSubmit} disabled={isSubmitting}>
              {isSubmitting ? "..." : t("home.rentalBooking.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
