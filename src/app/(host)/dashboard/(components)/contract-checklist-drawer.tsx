"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
  Drawer,
  DrawerContent,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

type View = "checklist" | "observation";
type SigStep = "inspector" | "driver";

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

  /* ---- view state ---- */
  const [view, setView] = useState<View>("checklist");
  const [sigStep, setSigStep] = useState<SigStep | null>(null);
  const [pendingSigStep, setPendingSigStep] = useState<SigStep | null>(null);
  const [pendingOpenDrawer, setPendingOpenDrawer] = useState(false);

  /* ---- observation state ---- */
  const [obsField, setObsField] = useState<ChecklistFieldMeta["key"] | null>(null);
  const [obsDraft, setObsDraft] = useState("");

  /* ---- signature ref ---- */
  const sigRef = useRef<SignatureCanvas>(null);
  const [sigDirty, setSigDirty] = useState(false);
  const isReturningFromSignature = useRef(false);

  /* ---- mutation ---- */
  const [createChecklist, { isLoading: isSaving }] = useCreateChecklistMutation();

  /* ---- Reset form ---- */
  const resetForm = useCallback(() => {
    setFields(getDefaultFields());
    setFuelPercentage("Full");
    setObservations({});
    setInspectorSignature(null);
    setView("checklist");
    setSigStep(null);
    setObsField(null);
    setObsDraft("");
    setSigDirty(false);
    setPendingSigStep(null);
    setPendingOpenDrawer(false);
  }, []);

  useEffect(() => {
    if (open) {
      if (isReturningFromSignature.current) {
        isReturningFromSignature.current = false;
      } else {
        resetForm();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, type]);

  // Open the signature dialog after the drawer closes
  useEffect(() => {
    if (!open && pendingSigStep !== null) {
      setSigStep(pendingSigStep);
      setPendingSigStep(null);
    }
  }, [open, pendingSigStep]);

  // Re-open the drawer after the signature dialog closes
  useEffect(() => {
    if (sigStep === null && pendingOpenDrawer) {
      onOpenChange(true);
      setPendingOpenDrawer(false);
    }
  }, [sigStep, pendingOpenDrawer, onOpenChange]);

  /* ---- when entering a signature step, reset the canvas ---- */
  useEffect(() => {
    if (sigStep !== null) {
      setSigDirty(false);
      const t = setTimeout(() => sigRef.current?.clear(), 50);
      return () => clearTimeout(t);
    }
  }, [sigStep]);

  /* ---- helpers ---- */
  const readSignature = (): string | null => {
    return sigRef.current?.toDataURL("image/png") ?? null;
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
    isReturningFromSignature.current = true;
    onOpenChange(false);
    setPendingSigStep("inspector");
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
    setSigStep("driver");
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
    setView("observation");
  };

  const saveObservation = () => {
    if (!obsField) return;
    setObservations((prev) => ({ ...prev, [obsField]: obsDraft }));
    setView("checklist");
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

  /* ---- cancel button ---- */
  const cancelBtn = isDesktop ? (
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

  /* ---- header ---- */
  const headerEl = (
    <div className="text-left p-3 border-b">
      <h2 className="text-lg font-semibold leading-none tracking-tight">{titleLabel}</h2>
      <p className="text-sm text-muted-foreground mt-1">{descLabel}</p>
    </div>
  );

  /* ================================================================== */
  /*  CHECKLIST BODY  (shared)                                           */
  /* ================================================================== */
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

  /* ================================================================== */
  /*  CHECKLIST VIEW                                                     */
  /* ================================================================== */
  const checklistView = (
    <>
      {headerEl}
      {isDesktop ? (
        <ScrollArea className="flex-1 px-6">{checklistBody}</ScrollArea>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto px-6">{checklistBody}</div>
      )}
      <div className="shrink-0 flex flex-col gap-2 border-t p-4">
        <Button onClick={handleContinue} className="w-full" size="lg">
          <ArrowRight className="mr-2 h-4 w-4" />
          {t("dashboard.contractChecklist.continue")}
        </Button>
        {cancelBtn}
      </div>
    </>
  );

  /* ================================================================== */
  /*  OBSERVATION VIEW  (inline)                                         */
  /* ================================================================== */
  const observationView = (
    <>
      <div className="text-left p-3 border-b flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setView("checklist")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <h2 className="text-base font-semibold truncate">
            {obsField ? fieldLabel(obsField) : t("dashboard.contractChecklist.observation")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("dashboard.contractChecklist.observation")}
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <Textarea
          placeholder={t("dashboard.contractChecklist.observationPlaceholder")}
          value={obsDraft}
          onChange={(e) => setObsDraft(e.target.value)}
          className="min-h-[120px] resize-none"
        />
      </div>

      <div className="shrink-0 flex gap-2 border-t p-4">
        <Button variant="outline" className="flex-1" onClick={() => setView("checklist")}>
          {t("dashboard.contractChecklist.cancel")}
        </Button>
        <Button className="flex-1" onClick={saveObservation}>
          <Save className="mr-2 h-4 w-4" />
          {t("dashboard.contractChecklist.save")}
        </Button>
      </div>
    </>
  );

  /* ================================================================== */
  /*  DRAWER / SHEET CONTENT                                             */
  /* ================================================================== */
  const currentView = view === "observation" ? observationView : checklistView;

  /* ================================================================== */
  /*  SIGNATURE — Dialog  (rendered OUTSIDE Drawer/Sheet)                 */
  /* ================================================================== */
  const sigTitle =
    sigStep === "inspector"
      ? t("dashboard.contractChecklist.inspectorSignature")
      : t("dashboard.contractChecklist.driverSignature");

  const sigSaveLabel =
    sigStep === "inspector"
      ? t("dashboard.contractChecklist.save")
      : isSaving
        ? t("dashboard.contractChecklist.saving")
        : t("dashboard.contractChecklist.saveAndFinish");

  const sigOnSave =
    sigStep === "inspector" ? handleSaveInspector : handleSaveDriver;

  const sigDialogOpen = sigStep !== null;

  return (
    <>
      {/* ================================================================ */}
      {/*  DRAWER / SHEET  (checklist + observation)                         */}
      {/* ================================================================ */}
      {isDesktop ? (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent
            side="right"
            className="flex w-[90vw] max-w-lg flex-col sm:max-w-lg p-0 gap-0"
          >
            {currentView}
          </SheetContent>
        </Sheet>
      ) : (
        <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground>
          <DrawerContent className="max-h-[92dvh] flex flex-col">
            {currentView}
          </DrawerContent>
        </Drawer>
      )}

      {/* ================================================================ */}
      {/*  SIGNATURE — Dialog                                               */}
      {/* ================================================================ */}
      <Dialog
        open={sigDialogOpen}
        onOpenChange={(v) => {
          if (!v) {
            if (sigStep === "inspector") {
              setSigStep(null);
              setPendingOpenDrawer(true);
            } else if (sigStep === "driver") {
              setSigStep("inspector");
            }
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md p-6"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{sigTitle}</DialogTitle>
          </DialogHeader>

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

          <DialogFooter className="flex-row justify-between sm:justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                sigRef.current?.clear();
                setSigDirty(false);
              }}
            >
              <Eraser className="mr-1.5 h-3.5 w-3.5" />
              {t("dashboard.contractChecklist.clear")}
            </Button>
            <Button
              onClick={sigOnSave}
              disabled={!sigDirty || (sigStep === "driver" && isSaving)}
            >
              <Save className="mr-2 h-4 w-4" />
              {sigSaveLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
