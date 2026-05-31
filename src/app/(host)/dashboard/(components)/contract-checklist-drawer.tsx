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
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle,
  Eraser,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  X,
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

  /* ---- form state ---- */
  const [fields, setFields] =
    useState<Record<ChecklistFieldMeta["key"], boolean>>(getDefaultFields);
  const [fuelPercentage, setFuelPercentage] = useState<string>("Full");
  const [observations, setObservations] = useState<Record<string, string>>({});
  const [inspectorSignature, setInspectorSignature] = useState<string | null>(null);
  const [driverSignature, setDriverSignature] = useState<string | null>(null);
console.log(driverSignature)
  /* ---- view: "checklist" | "inspector" | "driver" ---- */
  const [view, setView] = useState<"checklist" | "inspector" | "driver">("checklist");

  /* ---- observation: which field's note is being edited (null = closed) ---- */
  const [obsField, setObsField] = useState<ChecklistFieldMeta["key"] | null>(null);
  const [obsDraft, setObsDraft] = useState("");

  /* ---- signature ref (reused for both inspector and driver) ---- */
  const sigRef = useRef<SignatureCanvas>(null);
  const [sigDirty, setSigDirty] = useState(false);

  /* ---- mutation ---- */
  const [createChecklist, { isLoading: isSaving }] = useCreateChecklistMutation();

  /* ---- Reset form ---- */
  const resetForm = useCallback(() => {
    setFields(getDefaultFields());
    setFuelPercentage("Full");
    setObservations({});
    setInspectorSignature(null);
    setDriverSignature(null);
    setView("checklist");
    setObsField(null);
    setObsDraft("");
    setSigDirty(false);
  }, []);

  /* ---- When drawer opens with new type, reset ---- */
  useEffect(() => {
    if (open) resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, type]);

  /* ---- when entering a signature view, reset the canvas ---- */
  useEffect(() => {
    if (view !== "checklist") {
      setSigDirty(false);
      // Small delay to ensure canvas is mounted before clearing
      const t = setTimeout(() => sigRef.current?.clear(), 50);
      return () => clearTimeout(t);
    }
  }, [view]);

  /* ---- helpers ---- */
  const readSignature = (): string | null => {
    return sigRef.current?.toDataURL("image/png") ?? null;
  };

  const clearSig = () => {
    sigRef.current?.clear();
    setSigDirty(false);
  };

  /* ---- checklist actions ---- */
  const handleMarkAllOk = () => {
    const next: Record<string, boolean> = {};
    for (const k of DEFAULT_TRUE_FIELDS) next[k] = true;
    next[SEAT_STAINS_KEY] = false;
    setFields(next as Record<ChecklistFieldMeta["key"], boolean>);
    if (!fuelPercentage) setFuelPercentage("Full");
  };

  const toggleField = (key: ChecklistFieldMeta["key"]) => {
    setFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /* ---- step transitions ---- */
  const handleContinue = () => {
    if (!fuelPercentage) {
      toast(t("dashboard.contractChecklist.fuelPending"), {
        description: t("dashboard.contractChecklist.fuelPendingDesc"),
      });
      return;
    }
    setView("inspector");
  };

  const handleSaveInspector = () => {
    const sig = readSignature();
    if (!sig) {
      toast(t("dashboard.contractChecklist.signaturePending"), {
        description: t("dashboard.contractChecklist.inspectorSignatureRequired"),
      });
      return;
    }
    setInspectorSignature(sig);
    setView("driver");
  };

  const handleSaveDriver = async () => {
    const sig = readSignature();
    if (!sig) {
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
      driver_signature: sig,
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
      onOpenChange(false);
    } catch {
      toast(t("dashboard.contractChecklist.saveError"), {
        description: t("dashboard.contractChecklist.saveErrorDesc"),
      });
    }
  };

  /* ---- observation ---- */
  const openObservation = (key: ChecklistFieldMeta["key"]) => {
    setObsField(key);
    setObsDraft(observations[key] || "");
  };

  const saveObservation = () => {
    if (!obsField) return;
    setObservations((prev) => ({ ...prev, [obsField]: obsDraft }));
    setObsField(null);
    setObsDraft("");
  };

  /* ---- labels ---- */
  const titleLabel =
    type === "OUT"
      ? t("dashboard.contractChecklist.outTitle")
      : t("dashboard.contractChecklist.inTitle");

  const descLabel =
    type === "OUT"
      ? t("dashboard.contractChecklist.outDescription")
      : t("dashboard.contractChecklist.inDescription");

  const fieldLabel = (key: string) =>
    t(`dashboard.contractChecklist.fields.${key}`);

  /* ================================================================ */
  /*  SUB-VIEWS                                                        */
  /* ================================================================ */

  const sigTitle =
    view === "inspector"
      ? t("dashboard.contractChecklist.inspectorSignature")
      : t("dashboard.contractChecklist.driverSignature");

  const sigSaveLabel =
    view === "inspector"
      ? t("dashboard.contractChecklist.save")
      : isSaving
        ? t("dashboard.contractChecklist.saving")
        : t("dashboard.contractChecklist.saveAndFinish");

  const sigOnSave =
    view === "inspector" ? handleSaveInspector : handleSaveDriver;

  const sigOnBack =
    view === "inspector"
      ? () => setView("checklist")
      : () => setView("inspector");

  /* ---- cancel button reusable ---- */
  const cancelBtn = isDesktop ? (
    <SheetClose asChild>
      <Button variant="outline" className="w-full">{t("dashboard.contractChecklist.cancel")}</Button>
    </SheetClose>
  ) : (
    <DrawerClose asChild>
      <Button variant="outline" className="w-full">{t("dashboard.contractChecklist.cancel")}</Button>
    </DrawerClose>
  );

  /* ---- header ---- */
  const headerEl = isDesktop ? (
    <SheetHeader className="text-left p-3">
      <SheetTitle>{titleLabel}</SheetTitle>
      <SheetDescription>{descLabel}</SheetDescription>
    </SheetHeader>
  ) : (
    <DrawerHeader className="text-left p-3">
      <DrawerTitle>{titleLabel}</DrawerTitle>
      <DrawerDescription>{descLabel}</DrawerDescription>
    </DrawerHeader>
  );

  /* ---- checklist body (shared between desktop & mobile) ---- */
  const checklistBody = (
    <div className="space-y-4 pb-6 pt-2">
      <Button variant="outline" size="sm" className="w-full" onClick={handleMarkAllOk}>
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
              <span className="text-sm font-medium">{fieldLabel(key)}</span>
            </button>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setFields((p) => ({ ...p, [key]: true }))}
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
                onClick={() => setFields((p) => ({ ...p, [key]: false }))}
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
                onClick={(e) => { e.stopPropagation(); openObservation(key); }}
                className={cn(
                  "ml-1 rounded p-1 transition-colors hover:bg-muted",
                  observations[key] ? "text-primary" : "text-muted-foreground",
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
  );

  /* ---- signature view (shared between desktop & mobile) ---- */
  const signatureView = (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center gap-2 px-6 py-3 border-b">
        <Button variant="ghost" size="sm" onClick={sigOnBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t("dashboard.contractChecklist.cancel")}
        </Button>
        <span className="text-sm font-medium">{sigTitle}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div
          className="overflow-hidden rounded-lg border bg-white"
          style={{ touchAction: "none" }}
        >
          <SignatureCanvas
            ref={sigRef}
            penColor="black"
            canvasProps={{
              className: "w-full",
              style: { height: "200px", width: "100%" },
            }}
            onEnd={() => setSigDirty(true)}
          />
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-between gap-2 border-t p-4">
        <Button variant="ghost" size="sm" onClick={clearSig}>
          <Eraser className="mr-1.5 h-3.5 w-3.5" />
          {t("dashboard.contractChecklist.clear")}
        </Button>
        <Button onClick={sigOnSave} disabled={!sigDirty || (view === "driver" && isSaving)}>
          <Save className="mr-2 h-4 w-4" />
          {sigSaveLabel}
        </Button>
      </div>
    </div>
  );

  /* ---- observation overlay ---- */
  const observationOverlay = obsField ? (
    <div className="absolute inset-0 z-10 flex flex-col bg-background">
      <div className="flex items-center gap-2 px-6 py-3 border-b">
        <Button variant="ghost" size="sm" onClick={() => setObsField(null)}>
          <X className="h-4 w-4 mr-1" />
          {t("dashboard.contractChecklist.cancel")}
        </Button>
        <span className="text-sm font-medium truncate">
          {t("dashboard.contractChecklist.observation")}: {fieldLabel(obsField)}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <Textarea
          placeholder={t("dashboard.contractChecklist.observationPlaceholder")}
          value={obsDraft}
          onChange={(e) => setObsDraft(e.target.value)}
          className="min-h-[120px] resize-none"
        />
      </div>
      <div className="shrink-0 flex justify-end gap-2 border-t p-4">
        <Button variant="outline" onClick={() => setObsField(null)}>
          {t("dashboard.contractChecklist.cancel")}
        </Button>
        <Button onClick={saveObservation}>
          {t("dashboard.contractChecklist.save")}
        </Button>
      </div>
    </div>
  ) : null;

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  /* ---- Determine what to render inside the Drawer/Sheet ---- */
  const renderBody = () => {
    // Observation overlay always covers the checklist
    if (obsField && view === "checklist") {
      return (
        <div className="relative flex flex-col flex-1 min-h-0">
          {headerEl}
          <div className="flex-1 min-h-0 overflow-y-auto px-6">{checklistBody}</div>
          <div className="shrink-0 flex flex-col gap-2 border-t p-4">
            <Button onClick={handleContinue} className="w-full" size="lg">
              <ArrowRight className="mr-2 h-4 w-4" />
              {t("dashboard.contractChecklist.continue")}
            </Button>
            {cancelBtn}
          </div>
          {observationOverlay}
        </div>
      );
    }

    // Signature views
    if (view === "inspector" || view === "driver") {
      return (
        <>
          {headerEl}
          {signatureView}
        </>
      );
    }

    // Checklist view
    if (isDesktop) {
      return (
        <>
          {headerEl}
          <ScrollArea className="flex-1 px-6">{checklistBody}</ScrollArea>
          <div className="mt-auto flex flex-col gap-2 border-t p-4">
            <Button onClick={handleContinue} className="w-full" size="lg">
              <ArrowRight className="mr-2 h-4 w-4" />
              {t("dashboard.contractChecklist.continue")}
            </Button>
            {cancelBtn}
          </div>
        </>
      );
    }

    return (
      <>
        {headerEl}
        <div className="flex-1 min-h-0 overflow-y-auto px-6">{checklistBody}</div>
        <div className="shrink-0 flex flex-col gap-2 border-t p-4">
          <Button onClick={handleContinue} className="w-full" size="lg">
            <ArrowRight className="mr-2 h-4 w-4" />
            {t("dashboard.contractChecklist.continue")}
          </Button>
          {cancelBtn}
        </div>
      </>
    );
  };

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="flex w-[90vw] max-w-lg flex-col sm:max-w-lg p-0 gap-0"
        >
          {renderBody()}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground>
      <DrawerContent className="max-h-[92dvh] flex flex-col">
        {renderBody()}
      </DrawerContent>
    </Drawer>
  );
}
