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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VerificationDialog } from "../(components)/verification-dialog";
import type { BankFormValues } from "@/types/payment-types";
import { useLanguage } from "@/lib/i18n-context";

function getBankSchema(t: (key: string) => string) {
  return z.object({
    bankName: z.string().min(2, { message: t("dashboard.payments.bankForm.validation.bankNameRequired") }),
    accountType: z.string().min(1, { message: t("dashboard.payments.bankForm.validation.accountTypeRequired") }),
    accountNumber: z
      .string()
      .min(5, { message: t("dashboard.payments.bankForm.validation.accountNumberMin") })
      .regex(/^\d+$/, {
        message: t("dashboard.payments.bankForm.validation.accountNumberNumeric"),
      }),
    holderName: z
      .string()
      .min(3, { message: t("dashboard.payments.bankForm.validation.holderNameRequired") }),
    email: z.string().email({ message: t("dashboard.payments.bankForm.validation.emailInvalid") }),
  });
}

interface BankFormProps {
  defaultValues: BankFormValues;
  onSubmit: (data: BankFormValues) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  isUpdating: boolean;
}

export function BankForm({
  defaultValues,
  onSubmit,
  onBack,
  isLoading,
  isUpdating,
}: BankFormProps) {
  const { t } = useLanguage();
  const bankSchema = useMemo(() => getBankSchema(t), [t]);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [formData, setFormData] = useState<BankFormValues | null>(null);

  const form = useForm<BankFormValues>({
    resolver: zodResolver(bankSchema),
    defaultValues,
  });

  const handleFormSubmit = (data: BankFormValues) => {
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
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dashboard.payments.bankForm.bankName")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("dashboard.payments.bankForm.bankNamePlaceholder")}
                      className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dashboard.payments.bankForm.accountType")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white">
                        <SelectValue placeholder={t("dashboard.payments.bankForm.accountTypePlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ahorro">{t("dashboard.payments.bankForm.accountTypeAhorro")}</SelectItem>
                      <SelectItem value="corriente">
                        {t("dashboard.payments.bankForm.accountTypeCorriente")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dashboard.payments.bankForm.accountNumber")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("dashboard.payments.bankForm.accountNumberPlaceholder")}
                      className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="holderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dashboard.payments.bankForm.holderName")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("dashboard.payments.bankForm.holderNamePlaceholder")}
                      className="border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-black dark:focus:border-white"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>{t("dashboard.payments.bankForm.email")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder={t("dashboard.payments.bankForm.emailPlaceholder")}
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
              {t("dashboard.payments.bankForm.back")}
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
                  {t("dashboard.payments.bankForm.processing")}
                </span>
              ) : isUpdating ? (
                t("dashboard.payments.bankForm.updating")
              ) : (
                t("dashboard.payments.bankForm.submit")
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
