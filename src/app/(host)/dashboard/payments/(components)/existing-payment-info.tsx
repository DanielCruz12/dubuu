"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building, Edit, User, Mail, ShieldCheck, Zap, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ExistingPaymentData } from "@/types/payment-types";
import { getPaymentMethodIcon, getPaymentMethodName } from "@/utils";
import { useDeletePaymentAccountMutation } from "@/redux/slices/payment/payment-account";
import { toast } from "sonner";
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

interface ExistingPaymentInfoProps {
  data: ExistingPaymentData;
  onUpdate: () => void;
  userId: string;
  accountId: string;
}

export function ExistingPaymentInfo({
  data,
  onUpdate,
  userId,
  accountId,
}: ExistingPaymentInfoProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletePaymentAccount, { isLoading: isDeleting }] =
    useDeletePaymentAccountMutation();

  const handleDelete = async () => {
    try {
      await deletePaymentAccount({ userId, accountId }).unwrap();
      toast.success("Método de pago eliminado correctamente");
      setConfirmOpen(false);
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        "No se pudo eliminar el método de pago";
      toast.error(message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 p-3 rounded-md">
            {getPaymentMethodIcon(data.paymentMethod)}
            <span className="font-medium">
              {getPaymentMethodName(data.paymentMethod)}
            </span>
          </div>

          {data.paymentMethod === "bank" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-3 rounded-md border border-border bg-muted/30">
                <Building className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium">{data.bankData.bankName}</p>
                  <p className="text-sm text-muted-foreground">
                    {data.bankData.accountType === "ahorro"
                      ? "Cuenta de Ahorro"
                      : data.bankData.accountType === "corriente"
                        ? "Cuenta Corriente"
                        : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cuenta: •••• {data.bankData.accountNumber?.slice(-4)}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-md border border-border bg-muted/30">
                <User className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium">{data.bankData.holderName}</p>
                  <p className="text-sm text-muted-foreground">Titular</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-md border border-border bg-muted/30">
                <Mail className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium">{data.bankData.email}</p>
                  <p className="text-sm text-muted-foreground">Correo de contacto</p>
                </div>
              </div>
            </div>
          )}

          {data.paymentMethod === "blink" && data.blinkData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-3 rounded-md border border-border bg-muted/30">
                <Zap className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium">Dirección Blink / Lightning</p>
                  <p className="text-sm text-muted-foreground break-all">
                    {data.blinkData.walletAddress}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-md border border-border bg-muted/30">
                <Mail className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium">{data.blinkData.email}</p>
                  <p className="text-sm text-muted-foreground">Correo de contacto</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            className="border-gray-200 dark:border-gray-800"
            onClick={onUpdate}
          >
            <Edit className="h-4 w-4 mr-2" />
            Actualizar información
          </Button>
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
            onClick={() => setConfirmOpen(true)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar método de pago
          </Button>
        </CardFooter>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar método de pago?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Dejarás de recibir pagos en esta
                cuenta hasta que agregues un nuevo método de pago.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete();
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex justify-center pb-4">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Conexión segura
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
