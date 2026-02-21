"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VerificationDialog } from "../(components)/verification-dialog";
import type { BlinkFormValues } from "@/types/payment-types";

const blinkSchema = z.object({
  walletAddress: z
    .string()
    .min(3, { message: "La dirección o Lightning address es requerida" }),
  email: z.string().email({ message: "Ingrese un correo electrónico válido" }),
});

interface BlinkFormProps {
  defaultValues: BlinkFormValues;
  onSubmit: (data: BlinkFormValues) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  isUpdating: boolean;
}

export function BlinkForm({
  defaultValues,
  onSubmit,
  onBack,
  isLoading,
  isUpdating,
}: BlinkFormProps) {
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [formData, setFormData] = useState<BlinkFormValues | null>(null);

  const form = useForm<BlinkFormValues>({
    resolver: zodResolver(blinkSchema),
    defaultValues,
  });

  const handleFormSubmit = (data: BlinkFormValues) => {
    setFormData(data);
    setShowVerificationDialog(true);
  };

  const handleConfirmVerification = () => {
    if (formData) {
      onSubmit(formData);
      setShowVerificationDialog(false);
    }
  };

  const handleCancelVerification = () => {
    setShowVerificationDialog(false);
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="walletAddress"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Dirección Blink / Lightning</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="ej: usuario@blink.sv o tu wallet ID"
                      className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Indica dónde quieres recibir los pagos (Lightning address o
                    identificador de tu wallet Blink).
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Correo electrónico de contacto</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="ejemplo@correo.com"
                      className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="border-gray-200 dark:border-gray-800 hover:bg-transparent hover:text-black dark:hover:text-white mr-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Atrás
            </Button>
            <Button
              type="submit"
              className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Procesando...
                </span>
              ) : isUpdating ? (
                "Actualizar información"
              ) : (
                "Enviar información"
              )}
            </Button>
          </div>
        </form>
      </Form>

      <VerificationDialog
        isOpen={showVerificationDialog}
        onConfirm={handleConfirmVerification}
        onCancel={handleCancelVerification}
      />
    </>
  );
}
