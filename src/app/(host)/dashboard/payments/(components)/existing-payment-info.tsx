"use client";

import { motion } from "framer-motion";
import { Building, Edit, User, Mail, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ExistingPaymentData } from "@/types/payment-types";
import { getPaymentMethodIcon, getPaymentMethodName } from "@/utils";

interface ExistingPaymentInfoProps {
  data: ExistingPaymentData;
  onUpdate: () => void;
}

export function ExistingPaymentInfo({
  data,
  onUpdate,
}: ExistingPaymentInfoProps) {
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
        </CardContent>
        <CardFooter className="flex justify-end space-y-3">
          <Button
            variant="outline"
            className="border-gray-200 dark:border-gray-800"
            onClick={onUpdate}
          >
            <Edit className="h-4 w-4 mr-2" />
            Actualizar información
          </Button>
        </CardFooter>

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
