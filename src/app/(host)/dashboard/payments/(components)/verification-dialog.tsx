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
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-[90%] sm:max-w-md mx-auto rounded-lg p-4 sm:p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-700 dark:text-red-400 text-sm sm:text-base">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
            Verificación de datos bancarios
          </AlertDialogTitle>
          <AlertDialogDescription asChild className="text-red-600 dark:text-red-300 space-y-2 text-sm sm:text-base mt-2">
            <div>
              <span className="block font-normal">
                Los datos bancarios que proporcionas serán utilizados para
                transferir el dinero de todas tus reservaciones.
              </span>
              <span className="block text-xs sm:text-sm mt-2">
                Una vez procesados los pagos, será difícil recuperar fondos
                enviados a cuentas incorrectas.
              </span>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <AlertDialogCancel className="text-sm border-gray-200 dark:border-gray-800 mt-2 sm:mt-0">
            Revisar datos
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-600 text-sm"
          >
            Confirmo que son correctos
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
