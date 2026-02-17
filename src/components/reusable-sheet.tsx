"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { useLanguage } from "@/lib/i18n-context";

export function ReviewSheet({
  triggerText,
  children,
}: {
  triggerText: string;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <Sheet>
      <SheetTrigger>
        <small className="underline hover:cursor-pointer">
          {triggerText}
        </small>
      </SheetTrigger>
      <SheetContent side={"left"} className="w-full sm:max-w-[450px]">
        <SheetHeader>
          <SheetTitle>{t("home.reviews.sheetTitle")}</SheetTitle>
          <SheetDescription>
            {t("home.reviews.sheetDescription")}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="mt-4 h-[80vh] pr-4">{children}</ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
