"use client";

import { motion } from "framer-motion";
import { Building, Zap } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { PaymentMethod } from "@/types/payment-types";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onMethodSelect: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({
  selectedMethod,
  onMethodSelect,
}: PaymentMethodSelectorProps) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-3"
    >
      <RadioGroup
        value={selectedMethod || ""}
        onValueChange={(value: string) =>
          onMethodSelect(value as PaymentMethod)
        }
        className="space-y-3"
      >
        <div
          className={`border rounded-md p-3 transition-all ${
            selectedMethod === "bank"
              ? "border-black dark:border-white"
              : "border-gray-200 dark:border-gray-800"
          }`}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bank" id="bank" />
            <Label htmlFor="bank" className="flex items-center cursor-pointer">
              <Building className="h-4 w-4 mr-2" />
              <span>Transferencia bancaria</span>
            </Label>
          </div>
          {selectedMethod === "bank" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2 pl-6 text-xs text-gray-500 dark:text-gray-400"
            >
              <ul className="list-disc pl-4 space-y-1">
                <li>De 1 a 3 días hábiles</li>
                <li>Es posible que se te cobre alguna tarifa</li>
              </ul>
            </motion.div>
          )}
        </div>

        <div
          className={`border rounded-md p-3 transition-all ${
            selectedMethod === "blink"
              ? "border-black dark:border-white"
              : "border-gray-200 dark:border-gray-800"
          }`}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="blink" id="blink" />
            <Label htmlFor="blink" className="flex items-center cursor-pointer">
              <Zap className="h-4 w-4 mr-2" />
              <span>Blink (Bitcoin / Lightning)</span>
            </Label>
          </div>
          {selectedMethod === "blink" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2 pl-6 text-xs text-gray-500 dark:text-gray-400"
            >
              <ul className="list-disc pl-4 space-y-1">
                <li>Recibe en Bitcoin o USD (Stablesats) al instante</li>
                <li>Sin comisión entre usuarios Blink; tarifas muy bajas</li>
              </ul>
            </motion.div>
          )}
        </div>
      </RadioGroup>
    </motion.div>
  );
}
