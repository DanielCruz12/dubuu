"use client";

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
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";

interface VerificationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function VerificationDialog({
  isOpen,
  onConfirm,
  onCancel,
}: VerificationDialogProps) {
  const { t } = useLanguage();

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-[90%] sm:max-w-md mx-auto rounded-lg p-4 sm:p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-700 dark:text-red-400 text-sm sm:text-base">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
            {t("dashboard.payments.verification.title")}
          </AlertDialogTitle>
          <AlertDialogDescription asChild className="text-red-600 dark:text-red-300 space-y-2 text-sm sm:text-base mt-2">
            <div>
              <span className="block font-normal">
                {t("dashboard.payments.verification.description1")}
              </span>
              <span className="block text-xs sm:text-sm mt-2">
                {t("dashboard.payments.verification.description2")}
              </span>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <AlertDialogCancel className="text-sm border-gray-200 dark:border-gray-800 mt-2 sm:mt-0">
            {t("dashboard.payments.verification.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-600 text-sm"
          >
            {t("dashboard.payments.verification.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
