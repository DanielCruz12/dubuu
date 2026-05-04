"use client";

import { useState, type MouseEvent } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/lib/i18n-context";
import { cn } from "@/lib/utils";

type RentalImportantInfoModalProps = {
  /** Compact text link (cards) vs button style (sidebar) */
  trigger?: "text" | "button";
  className?: string;
};

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
            "inline-flex items-center gap-1 text-left text-xs font-medium text-primary hover:underline underline-offset-4",
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
          className={cn("w-full justify-center gap-2", className)}
          onClick={openModal}
        >
          <Info className="h-4 w-4 shrink-0" aria-hidden />
          {t("home.rentalImportant.link")}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[min(560px,88vh)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="shrink-0 space-y-1 border-b px-6 py-4 text-left">
            <DialogTitle className="text-lg leading-snug">
              {t("home.rentalImportant.title")}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[min(420px,calc(88vh-10rem))] px-6">
            <div className="space-y-5 py-4 pr-3 text-sm leading-relaxed text-muted-foreground">
              <p className="text-foreground/90">{t("home.rentalImportant.intro")}</p>

              <section>
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  {t("home.rentalImportant.docsTitle")}
                </h3>
                <p className="whitespace-pre-line">{t("home.rentalImportant.docsBody")}</p>
              </section>

              <section>
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  {t("home.rentalImportant.processTitle")}
                </h3>
                <p className="whitespace-pre-line">{t("home.rentalImportant.processBody")}</p>
              </section>

              <section>
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  {t("home.rentalImportant.paymentTitle")}
                </h3>
                <p className="whitespace-pre-line">{t("home.rentalImportant.paymentBody")}</p>
              </section>
            </div>
          </ScrollArea>
          <DialogFooter className="shrink-0 border-t px-6 py-3">
            <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => setOpen(false)}>
              {t("home.rentalImportant.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
