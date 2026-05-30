"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle,
  Eraser,
  CheckCircle2,
  ArrowRight,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import type { ChecklistType, CreateChecklistPayload } from "@/types/contract";
import { useCreateChecklistMutation } from "@/redux/slices/contract/contract-slice";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n-context";

/* ------------------------------------------------------------------ */
/*  Checklist field metadata                                           */
/* ------------------------------------------------------------------ */
interface ChecklistFieldMeta {
  key: keyof Omit<
    CreateChecklistPayload,
    | "contract_id"
    | "type"
    | "fuel_percentage"
    | "observations"
    | "inspector_signature"
    | "driver_signature"
  >;
  label: string;
}

const DEFAULT_TRUE_FIELDS: ChecklistFieldMeta["key"][] = [
  "good_condition_tires",
  "spare_tire",
  "car_jack",
  "safety_cone",
  "fire_extinguisher",
  "mirrors_and_rearview",
  "headlights_and_stops",
  "carplay_screen_and_speakers",
  "good_condition_windows",
  "diesel_caps",
  "dashboard_lights",
  "air_conditioning",
  "safety_hubs",
  "original_registration_card",
  "mud_flaps",
  "roof_racks_and_ladder",
];

const SEAT_STAINS_KEY: ChecklistFieldMeta["key"] = "seat_stains";

const CHECKLIST_FIELDS: ChecklistFieldMeta[] = [
  ...DEFAULT_TRUE_FIELDS.map((k) => ({ key: k, label: "" })),
  { key: SEAT_STAINS_KEY, label: "" },
];

const FUEL_OPTIONS = ["Vacío", "1/4", "1/2", "3/4", "Full"] as const;

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */
function getDefaultFields(): Record<ChecklistFieldMeta["key"], boolean> {
  const acc: Record<string, boolean> = {};
  for (const k of DEFAULT_TRUE_FIELDS) acc[k] = true;
  acc[SEAT_STAINS_KEY] = false;
  return acc as Record<ChecklistFieldMeta["key"], boolean>;
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface ContractChecklistDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  type: ChecklistType;
}

/* ================================================================== */
/*  Responsive helper                                                   */
/* ================================================================== */
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */
export function ContractChecklistDrawer({
  open,
  onOpenChange,
  contractId,
  type,
}: ContractChecklistDrawerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  /* ---- form state ---- */
  const [fields, setFields] =
    useState<Record<ChecklistFieldMeta["key"], boolean>>(getDefaultFields);
  const [fuelPercentage, setFuelPercentage] = useState<string>("Full");
  const [observations, setObservations] = useState<Record<string, string>>({});
  const [inspectorSignature, setInspectorSignature] = useState<string | null>(
    null,
  );
  const [driverSignature, setDriverSignature] = useState<string | null>(null);

  /* ---- observation modal state ---- */
  const [obsOpen, setObsOpen] = useState(false);
  const [obsField, setObsField] = useState<ChecklistFieldMeta["key"] | null>(
    null,
  );
  const [obsDraft, setObsDraft] = useState("");

  /* ---- signature dialog state ---- */
  const [inspectorDialogOpen, setInspectorDialogOpen] = useState(false);
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);

  /* ---- signature refs ---- */
  const inspectorRef = useRef<SignatureCanvas>(null);
  const driverRef = useRef<SignatureCanvas>(null);

  /* ---- mutation ---- */
  const [createChecklist, { isLoading: isSaving }] =
    useCreateChecklistMutation();

  /* ---- Reset form when drawer opens with new type ---- */
  const resetForm = useCallback(() => {
    setFields(getDefaultFields());
    setFuelPercentage("Full");
    setObservations({});
    setInspectorSignature(null);
    setDriverSignature(null);
  }, []);

  /* ---- mark all OK ---- */
  const handleMarkAllOk = () => {
    const next: Record<string, boolean> = {};
    for (const k of DEFAULT_TRUE_FIELDS) next[k] = true;
    next[SEAT_STAINS_KEY] = false;
    setFields(next as Record<ChecklistFieldMeta["key"], boolean>);
    if (!fuelPercentage) setFuelPercentage("Full");
  };

  /* ---- toggle field ---- */
  const toggleField = (key: ChecklistFieldMeta["key"]) => {
    setFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /* ---- observation ---- */
  const openObservation = (key: ChecklistFieldMeta["key"]) => {
    setObsField(key);
    setObsDraft(observations[key] || "");
    setObsOpen(true);
  };

  const saveObservation = () => {
    if (!obsField) return;
    setObservations((prev) => ({ ...prev, [obsField]: obsDraft }));
    setObsOpen(false);
  };

  /* ---- step 1 → step 2: open inspector signature modal ---- */
  const handleContinue = () => {
    if (!fuelPercentage) {
      toast(t("dashboard.contractChecklist.fuelPending"), {
        description: t("dashboard.contractChecklist.fuelPendingDesc"),
      });
      return;
    }
    setInspectorDialogOpen(true);
  };

  /* ---- step 2 → step 3: save inspector signature, open driver modal ---- */
  const handleSaveInspector = () => {
    if (!inspectorSignature) {
      toast(t("dashboard.contractChecklist.signaturePending"), {
        description: t("dashboard.contractChecklist.inspectorSignatureRequired"),
      });
      return;
    }
    setInspectorDialogOpen(false);
    setDriverDialogOpen(true);
  };

  /* ---- step 3 → final: save driver signature and submit ---- */
  const handleSaveDriver = async () => {
    if (!driverSignature) {
      toast(t("dashboard.contractChecklist.signaturePending"), {
        description: t("dashboard.contractChecklist.driverSignatureRequired"),
      });
      return;
    }

    const payload: CreateChecklistPayload = {
      contract_id: contractId,
      type,
      ...fields,
      fuel_percentage: fuelPercentage,
      observations,
      inspector_signature: inspectorSignature!,
      driver_signature: driverSignature,
    };

    try {
      await createChecklist(payload).unwrap();
      toast(t("dashboard.contractChecklist.checklistSaved"), {
        description:
          type === "OUT"
            ? t("dashboard.contractChecklist.contractActive")
            : t("dashboard.contractChecklist.contractCompleted"),
      });
      resetForm();
      setDriverDialogOpen(false);
      onOpenChange(false);
    } catch {
      toast(t("dashboard.contractChecklist.saveError"), {
        description: t("dashboard.contractChecklist.saveErrorDesc"),
      });
    }
  };

  /* ---- clear signature in modal ---- */
  const clearSignature = (role: "inspector" | "driver") => {
    const ref = role === "inspector" ? inspectorRef : driverRef;
    ref.current?.clear();
    if (role === "inspector") setInspectorSignature(null);
    else setDriverSignature(null);
  };

  const title =
    type === "OUT"
      ? t("dashboard.contractChecklist.outTitle")
      : t("dashboard.contractChecklist.inTitle");

  const description =
    type === "OUT"
      ? t("dashboard.contractChecklist.outDescription")
      : t("dashboard.contractChecklist.inDescription");

  const fieldLabel = (key: string) =>
    t(`dashboard.contractChecklist.fields.${key}`);

  /* ---- shared cancel button ---- */
  const cancelButton = isDesktop ? (
    <SheetClose asChild>
      <Button variant="outline" className="w-full">
        {t("dashboard.contractChecklist.cancel")}
      </Button>
    </SheetClose>
  ) : (
    <DrawerClose asChild>
      <Button variant="outline" className="w-full">
        {t("dashboard.contractChecklist.cancel")}
      </Button>
    </DrawerClose>
  );

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  const header = isDesktop ? (
    <SheetHeader className="text-left p-3">
      <SheetTitle>{title}</SheetTitle>
      <SheetDescription>{description}</SheetDescription>
    </SheetHeader>
  ) : (
    <DrawerHeader className="text-left p-3">
      <DrawerTitle>{title}</DrawerTitle>
      <DrawerDescription>{description}</DrawerDescription>
    </DrawerHeader>
  );

  return (
    <>
      {/* ============================================================== */}
      {/*  STEP 1 – Checklist Drawer / Sheet                              */}
      {/* ============================================================== */}
      {isDesktop ? (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent
            side="right"
            className="flex w-[90vw] max-w-lg flex-col sm:max-w-lg p-0 gap-0"
          >
            {header}
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 pb-6 pt-2">
                {/* Mark All OK */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleMarkAllOk}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                  {t("dashboard.contractChecklist.markAllOk")}
                </Button>

                <Separator />

                {/* Fuel Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("dashboard.contractChecklist.fuelLevel")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FUEL_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFuelPercentage(opt)}
                        className={cn(
                          "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                          fuelPercentage === opt
                            ? "bg-primary text-primary-foreground"
                            : "border bg-background text-muted-foreground hover:bg-muted",
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Checklist Items */}
                <div className="space-y-1">
                  {CHECKLIST_FIELDS.map(({ key }) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
                    >
                      <button
                        type="button"
                        onClick={() => toggleField(key)}
                        className="flex flex-1 items-center gap-3 text-left"
                      >
                        <span className="text-sm font-medium">
                          {fieldLabel(key)}
                        </span>
                      </button>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setFields((p) => ({ ...p, [key]: true }))
                          }
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                            fields[key]
                              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          SI
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFields((p) => ({ ...p, [key]: false }))
                          }
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                            !fields[key]
                              ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          NO
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openObservation(key);
                          }}
                          className={cn(
                            "ml-1 rounded p-1 transition-colors hover:bg-muted",
                            observations[key]
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                          title={t("dashboard.contractChecklist.addObservation")}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>

            <div className="mt-auto flex flex-col gap-2 border-t p-4">
              <Button onClick={handleContinue} className="w-full" size="lg">
                <ArrowRight className="mr-2 h-4 w-4" />
                {t("dashboard.contractChecklist.continue")}
              </Button>
              {cancelButton}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground>
          <DrawerContent className="max-h-[92dvh]">
            {header}
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 pb-6 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleMarkAllOk}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                  {t("dashboard.contractChecklist.markAllOk")}
                </Button>

                <Separator />

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("dashboard.contractChecklist.fuelLevel")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FUEL_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFuelPercentage(opt)}
                        className={cn(
                          "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                          fuelPercentage === opt
                            ? "bg-primary text-primary-foreground"
                            : "border bg-background text-muted-foreground hover:bg-muted",
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-1">
                  {CHECKLIST_FIELDS.map(({ key }) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
                    >
                      <button
                        type="button"
                        onClick={() => toggleField(key)}
                        className="flex flex-1 items-center gap-3 text-left"
                      >
                        <span className="text-sm font-medium">
                          {fieldLabel(key)}
                        </span>
                      </button>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setFields((p) => ({ ...p, [key]: true }))
                          }
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                            fields[key]
                              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          SI
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFields((p) => ({ ...p, [key]: false }))
                          }
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                            !fields[key]
                              ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          NO
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openObservation(key);
                          }}
                          className={cn(
                            "ml-1 rounded p-1 transition-colors hover:bg-muted",
                            observations[key]
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                          title={t("dashboard.contractChecklist.addObservation")}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>

            <div className="mt-auto flex flex-col gap-2 border-t p-4">
              <Button onClick={handleContinue} className="w-full" size="lg">
                <ArrowRight className="mr-2 h-4 w-4" />
                {t("dashboard.contractChecklist.continue")}
              </Button>
              {cancelButton}
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* ============================================================== */}
      {/*  STEP 2 – Inspector Signature Modal                             */}
      {/* ============================================================== */}
      <Dialog open={inspectorDialogOpen} onOpenChange={setInspectorDialogOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle>{t("dashboard.contractChecklist.inspectorSignature")}</DialogTitle>
            <DialogDescription className="sr-only">
              {t("dashboard.contractChecklist.inspectorSignatureDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden rounded-lg border bg-white">
            {mounted ? (
              <SignatureCanvas
                ref={inspectorRef}
                penColor="black"
                canvasProps={{
                  className: "w-full",
                  style: { height: "150px", width: "100%" },
                }}
                onEnd={() => {
                  const d = inspectorRef.current?.toDataURL("image/png");
                  if (d) setInspectorSignature(d);
                }}
              />
            ) : (
              <div className="flex h-[150px] items-center justify-center bg-muted/30 text-sm text-muted-foreground">
                {t("dashboard.contractChecklist.loading")}
              </div>
            )}
          </div>
          <DialogFooter className="flex-row justify-between sm:justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearSignature("inspector")}
            >
              <Eraser className="mr-1.5 h-3.5 w-3.5" />
              {t("dashboard.contractChecklist.clear")}
            </Button>
            <Button
              onClick={handleSaveInspector}
              disabled={!inspectorSignature}
            >
              <Save className="mr-2 h-4 w-4" />
              {t("dashboard.contractChecklist.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/*  STEP 3 – Driver Signature Modal                                */}
      {/* ============================================================== */}
      <Dialog open={driverDialogOpen} onOpenChange={setDriverDialogOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle>{t("dashboard.contractChecklist.driverSignature")}</DialogTitle>
            <DialogDescription className="sr-only">
              {t("dashboard.contractChecklist.driverSignatureDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden rounded-lg border bg-white">
            {mounted ? (
              <SignatureCanvas
                ref={driverRef}
                penColor="black"
                canvasProps={{
                  className: "w-full",
                  style: { height: "150px", width: "100%" },
                }}
                onEnd={() => {
                  const d = driverRef.current?.toDataURL("image/png");
                  if (d) setDriverSignature(d);
                }}
              />
            ) : (
              <div className="flex h-[150px] items-center justify-center bg-muted/30 text-sm text-muted-foreground">
                {t("dashboard.contractChecklist.loading")}
              </div>
            )}
          </div>
          <DialogFooter className="flex-row justify-between sm:justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearSignature("driver")}
            >
              <Eraser className="mr-1.5 h-3.5 w-3.5" />
              {t("dashboard.contractChecklist.clear")}
            </Button>
            <Button
              onClick={handleSaveDriver}
              disabled={!driverSignature || isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving
                ? t("dashboard.contractChecklist.saving")
                : t("dashboard.contractChecklist.saveAndFinish")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================== */}
      {/*  Observation Modal                                              */}
      {/* ============================================================== */}
      <Dialog open={obsOpen} onOpenChange={setObsOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-base">
              {obsField
                ? `${t("dashboard.contractChecklist.observation")}: ${fieldLabel(obsField)}`
                : t("dashboard.contractChecklist.observation")}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {t("dashboard.contractChecklist.observationDesc")}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={t("dashboard.contractChecklist.observationPlaceholder")}
            value={obsDraft}
            onChange={(e) => setObsDraft(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setObsOpen(false)}>
              {t("dashboard.contractChecklist.cancel")}
            </Button>
            <Button onClick={saveObservation}>
              {t("dashboard.contractChecklist.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
