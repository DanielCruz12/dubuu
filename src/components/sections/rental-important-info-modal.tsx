"use client";

import { useState, type MouseEvent } from "react";
import {
  Info,
  IdCard,
  FileCheck,
  CreditCard,
  CircleDollarSign,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/lib/i18n-context";
import { cn } from "@/lib/utils";

type RentalImportantInfoModalProps = {
  trigger?: "text" | "button";
  className?: string;
};

function SectionCard({
  icon: Icon,
  color,
  children,
}: {
  icon: React.ElementType;
  color: "amber" | "blue" | "green" | "red" | "purple";
  children: React.ReactNode;
}) {
  const borderMap = {
    amber: "border-l-amber-500",
    blue: "border-l-blue-500",
    green: "border-l-emerald-500",
    red: "border-l-red-500",
    purple: "border-l-purple-500",
  };
  const bgMap = {
    amber: "bg-amber-50 dark:bg-amber-950/30",
    blue: "bg-blue-50 dark:bg-blue-950/30",
    green: "bg-emerald-50 dark:bg-emerald-950/30",
    red: "bg-red-50 dark:bg-red-950/30",
    purple: "bg-purple-50 dark:bg-purple-950/30",
  };
  const iconColorMap = {
    amber: "text-amber-600 dark:text-amber-400",
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-emerald-600 dark:text-emerald-400",
    red: "text-red-600 dark:text-red-400",
    purple: "text-purple-600 dark:text-purple-400",
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 p-4 border-l-4",
        borderMap[color],
        bgMap[color],
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background/80",
            iconColorMap[color],
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0 space-y-2 text-sm">{children}</div>
      </div>
    </div>
  );
}

export default function RentalImportantInfoModal({
  trigger = "text",
  className,
}: RentalImportantInfoModalProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const openModal = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(true);
  };

  return (
    <>
      {trigger === "text" ? (
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 hover:border-primary/50 transition-colors",
            className,
          )}
          onClick={openModal}
        >
          <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {t("home.rentalImportant.link")}
        </button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "w-full justify-center gap-2 font-semibold border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50",
            className,
          )}
          onClick={openModal}
        >
          <Info className="h-4 w-4 shrink-0" aria-hidden />
          {t("home.rentalImportant.link")}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[min(640px,90vh)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="shrink-0 space-y-1.5 border-b px-6 py-5 text-left">
            <DialogTitle className="text-lg leading-snug">
              {t("home.rentalImportant.title")}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t("home.rentalImportant.intro")}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="space-y-4 px-6 py-5">
              {/* 1. Documentación necesaria */}
              <SectionCard icon={IdCard} color="blue">
                <h3 className="text-sm font-semibold text-foreground">
                  {t("home.rentalImportant.docsTitle")}
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2.5">
                    <FileCheck className="h-4 w-4 shrink-0 text-blue-500" />
                    <span>{t("home.rentalImportant.docsItem1")}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <IdCard className="h-4 w-4 shrink-0 text-blue-500" />
                    <span>{t("home.rentalImportant.docsItem2")}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CreditCard className="h-4 w-4 shrink-0 text-blue-500" />
                    <span>{t("home.rentalImportant.docsItem3")}</span>
                  </li>
                </ul>
              </SectionCard>

              {/* 2. Depósito de seguridad */}
              <SectionCard icon={CircleDollarSign} color="amber">
                <h3 className="text-sm font-semibold text-foreground">
                  {t("home.rentalImportant.depositTitle")}
                </h3>
                <p className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
                  $200.00
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {t("home.rentalImportant.depositBody")}
                </p>
              </SectionCard>

              {/* 3. Contrato */}
              <SectionCard icon={FileText} color="purple">
                <h3 className="text-sm font-semibold text-foreground">
                  {t("home.rentalImportant.contractTitle")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("home.rentalImportant.contractBody")}
                </p>
              </SectionCard>

              {/* 4. Tarjetas aceptadas */}
              <SectionCard icon={CreditCard} color="green">
                <h3 className="text-sm font-semibold text-foreground">
                  {t("home.rentalImportant.cardsTitle")}
                </h3>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {["MasterCard", "Visa", "American Express", "Diners Club"].map(
                    (card) => (
                      <span
                        key={card}
                        className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground/80"
                      >
                        {card}
                      </span>
                    ),
                  )}
                </div>
              </SectionCard>
            </div>
          </ScrollArea>

          <DialogFooter className="shrink-0 border-t px-6 py-3.5">
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setOpen(false)}
            >
              {t("home.rentalImportant.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
