"use client";

import { useState, useMemo } from "react";
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
import { useLanguage } from "@/lib/i18n-context";

function getBlinkSchema(t: (key: string) => string) {
  return z.object({
    walletAddress: z
      .string()
      .min(3, { message: t("dashboard.payments.blinkForm.validation.walletRequired") }),
    email: z.string().email({ message: t("dashboard.payments.blinkForm.validation.emailInvalid") }),
  });
}

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
  const { t } = useLanguage();
  const blinkSchema = useMemo(() => getBlinkSchema(t), [t]);
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
                  <FormLabel>{t("dashboard.payments.blinkForm.walletAddress")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("dashboard.payments.blinkForm.walletAddressPlaceholder")}
                      className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.payments.blinkForm.walletAddressHelp")}
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>{t("dashboard.payments.blinkForm.email")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder={t("dashboard.payments.blinkForm.emailPlaceholder")}
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
              {t("dashboard.payments.blinkForm.back")}
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
                  {t("dashboard.payments.blinkForm.processing")}
                </span>
              ) : isUpdating ? (
                t("dashboard.payments.blinkForm.updating")
              ) : (
                t("dashboard.payments.blinkForm.submit")
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
